import { useContext, useState } from "react";
import { Button, Form, Input, Message } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import BN from "bn.js";
import * as Contract from "ethereum/contracts/PredictionMarket";
import { Context } from "sitewide/Context";
import { AlertType } from "sitewide/alerts/AlertPanel";

export interface CreateMarketProps extends Web3Props {
  funds: BN;
}

export const CreateMarket = ({
  web3Ref,
  firstAccount,
  funds,
}: CreateMarketProps) => {
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [prob, setProb] = useState("50");
  const [ante, setAnte] = useState("10");
  const [creatingMarket, setCreatingMarket] = useState(false);
  const { addAlert } = useContext(Context);

  const intPattern = /^[0-9]+$/

  const probError = !intPattern.test(prob) || Number(prob) < 1 || Number(prob) > 99;
  const anteBN = new BN(ante);
  const anteError = !intPattern.test(ante) || anteBN.lt(new BN(10)) || anteBN.gt(funds);

  const errorMessage = probError
    ? "Initial probability must be a whole number between 1 and 99 inclusive."
    : anteError
    ? "Market ante must be a whole number between 10 and your current available funds."
    : undefined;

  const createMarket = async () => {
    setCreatingMarket(true);
    try {
      await Contract.createMarket(
        web3Ref.current,
        firstAccount,
        question,
        description,
        Number(prob),
        new BN(ante).mul(new BN("1000000000000000000"))
      );
      addAlert({
        content: `Your market has been created.`,
        header: "Market Created",
        type: AlertType.Positive,
        uniqueId: "predictionmarket.createmarket.success",
      });
    } catch (ex: any) {
      addAlert({
        content: "Details from provider: " + ex.message,
        header: "Error occurred during account creation",
        type: AlertType.Negative,
        uniqueId: "predictionmarket.createmarket.error",
      });
    }
    setCreatingMarket(false);
  };

  return (
    <>
      <Form error={!!errorMessage}>
        <Form.Field>
          <label>Ask a question...</label>
          <Form.Input
            type="text"
            placeholder="e.g. Will any cryptocurrency eclipse Bitcoin by market cap this year?"
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
            }}
          />
        </Form.Field>
        {question && (
          <>
            <Form.Field>
              <label>Description</label>
              <Form.TextArea
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                }}
              />
            </Form.Field>
            <Form.Field error={probError}>
              <label>Initial Probability</label>
              <Input
                type="number"
                label="%"
                labelPosition="right"
                value={prob}
                onChange={(event) => {
                  setProb(event.target.value);
                }}
              />
            </Form.Field>
            <Form.Field error={anteError}>
              <label>Market Ante</label>
              <Input
                label="P$"
                labelPosition="left"
                type="number"
                value={ante}
                onChange={(event) => {
                  setAnte(event.target.value);
                }}
              />
            </Form.Field>
            <Message
              error
              header="Please check the following"
              content={errorMessage}
            />
            <Button
              loading={creatingMarket}
              primary
              disabled={!!errorMessage && !!description}
              onClick={() => {
                createMarket();
              }}
            >
              Create This Market
            </Button>
          </>
        )}
      </Form>
    </>
  );
};
