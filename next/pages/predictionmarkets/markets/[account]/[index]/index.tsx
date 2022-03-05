import type { NextPage } from "next";
import { RequireWeb3Wrapper, Web3Props } from "sitewide/RequireWeb3Wrapper";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getMarket,
  getUserInfo,
  UserInfo,
} from "ethereum/contracts/PredictionMarket";
import Layout from "sitewide/Layout";
import { formatDistance } from "date-fns";
import { Button, Card, Form, Icon, Image, Input } from "semantic-ui-react";
import { toNumberOfTokens } from "util/BN";
import siteWideData from "sitewide/SiteWideData.json";
import BN from "bn.js";

const Index: NextPage<Web3Props> = ({ web3Ref, firstAccount }: Web3Props) => {
  const [market, setMarket] = useState<any>();
  const [betAmount, setBetAmount] = useState("1");
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const r = useRouter();
  const betFormErrorMessage = false;

  const intPattern = /^[0-9]+$/;

  const web3 = web3Ref.current;
  const betAmountBN = new BN(betAmount);
  const funds = userInfo?.balance || new BN("0");
  const isRegistered = !!userInfo?.username;
  const betAmountError =
    !intPattern.test(betAmount) ||
    betAmountBN.lt(new BN(1)) ||
    betAmountBN.gt(new BN(funds));

  const loadMarket = async () => {
    const { account, index } = r.query;
    const m = await getMarket(web3, account as string, index as string);
    setMarket(m);
  };

  const placeBet = async(yes: boolean) => {
    
  };

  useEffect(() => {
    loadMarket();
    getUserInfo(web3, firstAccount).then(setUserInfo);
  }, []);

  const innards = market ? (
    <div>
      <h1>Market</h1>
      <Card.Group itemsPerRow={1}>
        <Card>
          <Card.Content>
            <Card.Header>
              <Image
                floated="left"
                size="small"
                src={siteWideData.imageHashTemplate.replace(
                  "{0}",
                  `${market.username}_${market.index}`
                )}
                ui={true}
                circular={true}
              />
              {market.title || "Untitled"}
            </Card.Header>
            <div>
              <Card.Meta>
                <span className="date">By {market.username}</span>
              </Card.Meta>
              <Card.Description>{market.description}</Card.Description>
            </div>
          </Card.Content>
          <Card.Content extra>
            <a
              title="Money bet on market, including market maker"
              style={{ marginRight: "10px" }}
            >
              <Icon name="money" color="yellow" />
              {toNumberOfTokens(market.poolsize).toString()}
            </a>
            <a title="Number of bettors, including market maker">
              <Icon name="user" color="brown" />
              {market.bets.length + 1}
            </a>
          </Card.Content>
          <Card.Content extra>
            <a
              title={
                "Created at " +
                market.timestamp.toLocaleString() +
                " (your local time)"
              }
              style={{ marginRight: "10px" }}
            >
              <Icon name="clock" color="green" />
              Created{" "}
              {formatDistance(new Date(market.timestamp), new Date(), {
                addSuffix: true,
              })}
            </a>
            &nbsp; &nbsp;
            <a
              title={
                "Closes at " +
                market.closesAt.toLocaleString() +
                " (your local time)"
              }
            >
              <Icon name="clock" color="black" />
              Closes{" "}
              {formatDistance(new Date(market.closesAt), new Date(), {
                addSuffix: true,
              })}
            </a>
          </Card.Content>
        </Card>
      </Card.Group>
      <h2>Bets</h2>
      {!market.bets.length && (
        <p>
          <strong>No Bets!</strong> Other than the ante, there are no bets yet
          on this market. Maybe you make the first one?
        </p>
      )}

      <h2>Place your bet</h2>
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
                  <Button 
                  color="pink"
                  onClick={() => placeBet(false)}>Bet NO</Button>
                </>
              }
            ></Input>
          </Form.Field>
        </Form>
      ) : (
        <p>Register to bet</p>
      )}
    </div>
  ) : (
    <p>Loading...</p>
  );

  return <Layout>{innards}</Layout>;
};
export default RequireWeb3Wrapper(Index, () => <></>);
