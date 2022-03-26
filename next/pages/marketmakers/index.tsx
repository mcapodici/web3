import { useState } from "react";
import {
  Button,
  Divider,
  Dropdown,
  Form,
  Grid,
  Input,
  InputOnChangeData,
} from "semantic-ui-react";
import Layout from "sitewide/Layout";

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
  const [newOutcomeName, setNewOutcomeName] = useState("");
  const [newOutcomeProbabilityPercent, setNewOutcomeProbabilityPercent] =
    useState("");
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [showOutcomeErrors, setShowOutcomeErrors] = useState(false);

  const newOutcomeProbabilityPercentAsNumber = Number(
    newOutcomeProbabilityPercent
  );
  const newOutcomeProbabilityPercentNumberInvalidReason = !Number.isFinite(
    newOutcomeProbabilityPercentAsNumber
  )
    ? "Probability is not a valid number"
    : newOutcomeProbabilityPercentAsNumber < 0 ||
      newOutcomeProbabilityPercentAsNumber > 100
    ? "Probability must be between 0 and 100 inclusive"
    : undefined;

  const newOutcomeNameInvalidReason = !newOutcomeName
    ? "Outcome name is required"
    : outcomes.find((x) => x.name === newOutcomeName)
    ? "Outcome name has been used already"
    : undefined;

  const newOutcomeFormHasErrors =
    !!newOutcomeNameInvalidReason ||
    !!newOutcomeProbabilityPercentNumberInvalidReason;

  const addOutcome = () => {
    if (!newOutcomeFormHasErrors) return;
    setOutcomes((os) => [
      ...os,
      {
        name: newOutcomeName,
        probability: newOutcomeProbabilityPercentAsNumber / 100,
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
      <Form >
        <Form.Group widths="equal">
          <Form.Field
          label="Outcome Name"
            error={
              newOutcomeNameInvalidReason && showOutcomeErrors
                ? { content: newOutcomeNameInvalidReason, pointing: "above" }
                : undefined
            }
            maxLength={50}
            placeholder="Outcome Name"
            value={newOutcomeName}
            onChange={(_: any, data: InputOnChangeData) => {
              setNewOutcomeName(data.value);
            }}
            control={Input}
          >
           
          </Form.Field>
          <Form.Field error={
              newOutcomeNameInvalidReason && showOutcomeErrors
                ? { content: newOutcomeNameInvalidReason, pointing: "above" }
                : undefined
            }>
            <label>Probability</label>
            <Input
              maxLength={10}
              labelPosition="right"
              label="%"
              placeholder="e.g. 20"
              value={newOutcomeProbabilityPercent}
              onChange={(event, data) => {
                setNewOutcomeProbabilityPercent(data.value);
              }}
            />
          </Form.Field>
        </Form.Group>
        <Button
          primary
          onClick={() => {
            setShowOutcomeErrors(true);
            if (!newOutcomeFormHasErrors) addOutcome();
          }}
        >
          Add outcome
        </Button>
      </Form>
      {JSON.stringify(outcomes)}
    </Layout>
  );
};

export default Page;
