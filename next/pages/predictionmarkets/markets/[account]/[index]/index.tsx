import type { NextPage } from "next";
import { RequireWeb3Wrapper, Web3Props } from "sitewide/RequireWeb3Wrapper";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  calculateNumbeOfSharesForMarket,
  getMarket,
  getUserInfo,
  IMarketInfo,
  makeBet,
  UserInfo,
} from "ethereum/contracts/PredictionMarket";
import Layout from "sitewide/Layout";
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
import BN from "bn.js";

const Index: NextPage<Web3Props> = ({ web3Ref, firstAccount }: Web3Props) => {
  const [market, setMarket] = useState<IMarketInfo>();
  const [betAmount, setBetAmount] = useState("1");
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
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
  const betAmountError = betAmountNumber < 1 || betAmountNumber > Number(funds.toNumTokens());

  const loadMarket = async () => {
    const m = await getMarket(web3, marketaddress, marketindex);
    setMarket(m);
  };

  const placeBet = async (yes: boolean) => {

    // Hack - if you bet 1 it is dangerously close to the min bet, and the
    // share calc code could have you betting 0.999. So add a safety 2% so
    // the txn doesn't fail. Can fix when a new version of the contract is out
    const betTokens = BNToken.fromNumTokens(betAmount === '1' ? '1.02' : betAmount);

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

  const innards = market ? (
    <div>
      <h1>Market</h1>
      <Card.Group itemsPerRow={1}>
        <Card>
          <Card.Content>
            <Card.Header>
              <Grid>
                <Grid.Row columns={3}>
                  <Grid.Column width={3}>
                    <Image
                      size="small"
                      src={siteWideData.imageHashTemplate.replace(
                        "{0}",
                        `${market.username}_${market.index}`
                      )}
                      ui={true}
                      circular={true}
                    />
                  </Grid.Column>
                  <Grid.Column width={10}>
                    {market.title || "Untitled"}
                  </Grid.Column>
                  <Grid.Column width={3} textAlign="center">
                    <span style={{ color: "green" }}>
                      <p
                        style={{
                          fontSize: "2em",
                          lineHeight: "1em",
                          margin: "0 0 0.2em 0",
                        }}
                      >
                        {market.impliedProb1.toFixed(0)}%
                      </p>
                      <p
                        style={{
                          fontSize: "1em",
                          lineHeight: "1em",
                          margin: "0",
                        }}
                      >
                        chance
                      </p>
                    </span>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Card.Header>
            <div style={{ marginTop: "1em" }}>
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
              {market.poolsize.toNumTokens(2)}
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
  ) : (
    <p>Loading...</p>
  );

  return (
    <Layout>
      <p style={{ float: "right" }}>
        Funds: <strong>P${funds.toNumTokens(0)}</strong>
      </p>
      {innards}
    </Layout>
  );
};
export default RequireWeb3Wrapper(Index, () => <></>);
