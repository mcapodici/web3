import { useState } from "react";
import {
  Button,
  Divider,
  Dropdown,
  Form,
  Grid,
  Input,
  InputOnChangeData,
  Table,
} from "semantic-ui-react";
import { useNumericField } from "sitewide/hooks/fields/UseNumericField";
import { useTextField } from "sitewide/hooks/fields/UseTextField";
import Layout from "sitewide/Layout";
import { sum } from "util/Array";
import { TruncateAndEllipse } from "util/String";

interface Outcome {
  name: string;
  probability: number;
}

const Page = () => {
  const marketMakerSystemOptions = [
    {
      key: 0,
      value: "parimutuel",
      text: "Parimutuel",
      blurb: `Parimutuel betting (from French pari mutuel, "mutual betting") is a betting system in which all bets of a particular type are placed together in a pool; taxes and the "house-take" or "vigorish" are deducted, and payoff odds are calculated by sharing the pool among all winning bets. In some countries it is known as the Tote after the totalisator, which calculates and displays bets already made.`,
    },
  ];

  const [marketMakerSystem, setMarketMakerSystem] = useState("parimutuel");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);

  const newOutcomeTextField = useTextField(
    "Outcome Name",
    true,
    (text) =>
      outcomes.find((x) => x.name === text)
        ? "Outcome name has been used already"
        : undefined,
    "",
    50,
    "e.g. Team A to win"
  );

  const newOutcomeProbabilityField = useNumericField(
    "Probability",
    true,
    (n: number) =>
      n < 0 || n > 100
        ? "Probability must be between 0 and 100 inclusive"
        : undefined,
    "",
    10,
    "e.g. 20"
  );

  const liquidityField = useNumericField(
    "Liquidity",
    true,
    (n: number) => undefined,
    "",
    10,
    "Liquidity"
  );

  const addOutcome = () => {
    const prob = newOutcomeProbabilityField.value;
    const name = newOutcomeTextField.value;
    if (prob === undefined || name === undefined) return;
    setOutcomes((os) => [
      ...os,
      {
        name,
        probability: prob / 100,
      },
    ]);
  };

  const marketMakerSystemInfo = marketMakerSystemOptions.find(
    (x) => x.value === marketMakerSystem
  );

  return (
    <Layout>
      <h1>Market Maker Simulator</h1>
      <h2>What are market makers?</h2>
      <p>
        {`A market maker is an automated algorithm for taking bets. "Bet" is used
        in a broad sense, the bet could be buying a stock, betting on a horse,
        or predicting an outcome. The common features are - money is being
        staked, there are a number of discrete outcomes, one or perhaps more of
        the outcomes can be declared 'winners', and you can place bets.`}
      </p>
      <p>
        {`There is the concept of a 'liquidity provider' - an entity that provides
        the initial money so that when the first person comes and makes their
        bet, there is someone there with money to take the other side of the
        bet. In addition this allows the market maker to handle lots of bets on
        the same outcome, even if no one is betting on a different outcome to balance
        it out.`}
      </p>
      <p>
        {`This simulator allows you to play around with some market makers to get
        feel for how they behave and react to different bets being made with
        them.`}
      </p>
      <Divider />
      <h2>Simulator</h2>
      <h3>Step 1: Choose system and create market</h3>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={4}>
            <Dropdown
              fluid
              selection
              options={marketMakerSystemOptions}
              value={marketMakerSystem}
              onChange={(event, data) => {
                setMarketMakerSystem((data.value || "").toString());
              }}
            ></Dropdown>
          </Grid.Column>
          <Grid.Column width={12}>
            <h3>Description of {marketMakerSystemInfo?.text}</h3>
            <p>{marketMakerSystemInfo?.blurb}</p>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={16}>
            <Button primary>Create this market</Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <h3>Step 2: Set up the initial probabilities and liquidity</h3>
      <Form>
        <Form.Group>
          <Form.Field width={10}>
          <label>Outcome Name</label>
          {newOutcomeTextField.node}
          </Form.Field>
          <Form.Field width={3}>
            <label>Probability (%)</label>
            {newOutcomeProbabilityField.node}
          </Form.Field>
          <Form.Field width={3}>
            <label>&nbsp;</label>
            <Button
              fluid
              primary
              onClick={() => {
                if (newOutcomeTextField.isValid && newOutcomeProbabilityField.isValid) {
                  addOutcome();
                  newOutcomeTextField.reset();
                  newOutcomeProbabilityField.reset();
                } else {
                  newOutcomeTextField.forceValidation();
                  newOutcomeProbabilityField.forceValidation();
                }
              }}
            >
              Add outcome
            </Button>
          </Form.Field>
        </Form.Group>
      </Form>
      <h4>Outcomes</h4>
      {outcomes.length ? (
        <Table unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Outcome</Table.HeaderCell>
              <Table.HeaderCell>Probability (%)</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {outcomes.map((o) => (
              <Table.Row key={o.name}>
                <Table.Cell>{o.name}</Table.Cell>
                <Table.Cell>{(100 * o.probability).toString()}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell width={10}></Table.HeaderCell>
              <Table.HeaderCell>
                Total:{" "}
                {(100 * sum(outcomes.map((x) => x.probability))).toString()}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      ) : (
        <p>No outcomes have been added yet.</p>
      )}
      <h3>Step 3: Provide Liquidity</h3>
      <Form>
        <Form.Group>{liquidityField.node}</Form.Group>
      </Form>
    </Layout>
  );
};

export default Page;
