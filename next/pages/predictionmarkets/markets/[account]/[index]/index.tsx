import type { NextPage } from "next";
import { RequireWeb3Wrapper, Web3Props } from "sitewide/RequireWeb3Wrapper";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import {
  calculateNumbeOfSharesForMarket,
  getMarket,
  getUserInfo,
  IMarketInfo,
  makeBet,
  UserInfo,
} from "ethereum/contracts/PredictionMarket";
import PredictionMarketsLayout from "predictionmarkets/PredictionMarketsLayout";
import { formatDistance } from "date-fns";
import {
  Button,
  Card,
  Form,
  Grid,
  Icon,
  Image,
  Input,
  Table,
} from "semantic-ui-react";
import { BNToken } from "util/BN";
import siteWideData from "sitewide/SiteWideData.json";
import { ResolveModal } from "predictionmarkets/ResolveModal";
import useWindowDimensions from "util/Hooks";
import Market from "predictionmarkets/Market";

const Index: NextPage<Web3Props> = ({ web3Ref, firstAccount }: Web3Props) => {
  const windowDimensions = useWindowDimensions();
  const [market, setMarket] = useState<IMarketInfo>();
  const [betAmount, setBetAmount] = useState("2");
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [showResolveModal, setShowResolveModal] = useState(false);

  const r = useRouter();
  const marketaddress = r.query.account as string;
  const marketindex = Number(r.query.index);
  const betFormErrorMessage = false;

  const intPattern = /^[0-9]+$/;

  const web3 = web3Ref.current;
  const betAmountNumber = intPattern.test(betAmount)
    ? new Number(betAmount)
    : 0;
  const funds = userInfo?.balance || BNToken.fromNumTokens("0");
  const isRegistered = !!userInfo?.username;
  const betAmountError =
    betAmountNumber < 2 || betAmountNumber > Number(funds.toNumTokens());

  const loadMarket = async () => {
    const m = await getMarket(web3, marketaddress, marketindex);
    setMarket(m);
  };

  const placeBet = async (yes: boolean) => {
    // Hack - if you bet 1 it is dangerously close to the min bet, and the
    // share calc code could have you betting 0.999. So add a safety 2% so
    // the txn doesn't fail. Can fix when a new version of the contract is out
    const betTokens = BNToken.fromNumTokens(betAmount);

    const numberOfShares = await calculateNumbeOfSharesForMarket(
      web3,
      marketaddress,
      marketindex,
      betTokens,
      yes
    );

    await makeBet(
      web3,
      firstAccount,
      marketaddress,
      marketindex,
      numberOfShares.asSand(),
      yes
    );
  };

  useEffect(() => {
    loadMarket();
    getUserInfo(web3, firstAccount).then(setUserInfo);
  }, []);

  if (!market) {
    return <p>Loading...</p>;
  }

  return (
    <PredictionMarketsLayout
      username={userInfo?.username || "Unregistered Visitor"}
      funds={funds}
    >
      <div>
        <h1>Market</h1>
        <Market
          market={market}
          onResolveClick={() => setShowResolveModal(true)}
          showResolveButton={
            !market.resolved && market.useraddress === firstAccount
          }
          forNarrowWidth={windowDimensions.isNarrow}
        />
        <h2>Bets</h2>
        <Table>
          <Table.Header>
            <Table.HeaderCell>User</Table.HeaderCell>
            <Table.HeaderCell>Outcome</Table.HeaderCell>
            <Table.HeaderCell>Bet Amount</Table.HeaderCell>
            <Table.HeaderCell>Shares</Table.HeaderCell>
            <Table.HeaderCell>Payout</Table.HeaderCell>
          </Table.Header>
          <Table.Row>
            <Table.Cell>{market.username}</Table.Cell>
            <Table.Cell>ANTE - YES</Table.Cell>
            <Table.Cell>{market.ante1.toNumTokens(0)}</Table.Cell>
            <Table.Cell>{market.anteShares1.toNumTokens(4)}</Table.Cell>
            <Table.Cell>{market.antePayout1.toNumTokens(0)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>{market.username}</Table.Cell>
            <Table.Cell>ANTE - NO</Table.Cell>
            <Table.Cell>{market.ante0.toNumTokens(0)}</Table.Cell>
            <Table.Cell>{market.anteShares0.toNumTokens(4)}</Table.Cell>
            <Table.Cell>{market.antePayout0.toNumTokens(0)}</Table.Cell>
          </Table.Row>
          {market.bets.map((b, i) => (
            <Table.Row key={i}>
              <Table.Cell>{b.username}</Table.Cell>
              <Table.Cell>
                {b.outcome.toString() == "1" ? "YES" : "NO"}
              </Table.Cell>
              <Table.Cell>{b.betsize.toNumTokens(0)}</Table.Cell>
              <Table.Cell>{b.numberOfShares.toNumTokens(4)}</Table.Cell>
              <Table.Cell>{b.currentPayoutIfWin.toNumTokens(0)}</Table.Cell>
            </Table.Row>
          ))}
        </Table>

        <h2>Place your bet</h2>
        <p>The minimum bet size is 2</p>
        {isRegistered ? (
          <Form error={!!betFormErrorMessage}>
            <Form.Field error={betAmountError}>
              <Input
                label="P$"
                labelPosition="left"
                value={betAmount}
                onChange={(event) => setBetAmount(event.target.value)}
                action={
                  <>
                    <Button
                      style={{ marginLeft: "5px", marginRight: "5px" }}
                      color="green"
                      onClick={() => placeBet(true)}
                    >
                      Bet YES
                    </Button>
                    <Button color="pink" onClick={() => placeBet(false)}>
                      Bet NO
                    </Button>
                  </>
                }
              ></Input>
            </Form.Field>
          </Form>
        ) : (
          <p>Register to bet</p>
        )}
      </div>

      {showResolveModal && (
        <ResolveModal
          onClose={() => setShowResolveModal(false)}
          marketIndex={marketindex}
          web3Ref={web3Ref}
          firstAccount={firstAccount}
        />
      )}
    </PredictionMarketsLayout>
  );
};
export default RequireWeb3Wrapper(Index, () => <></>);
