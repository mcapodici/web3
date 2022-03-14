import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Message,
} from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import BN from "bn.js";
import * as Contract from "ethereum/contracts/PredictionMarket";
import { BNToken } from "util/BN";
import { add as addDate, isValid, parse as parseDate } from "date-fns";
import { format as formatDate } from "date-fns-tz";
import useWeb3Action from "sitewide/hooks/useWeb3Action";

export interface CreateMarketProps extends Web3Props {
  funds: BNToken;
}

const dateFormat = "yyyy-MM-dd HH:mm:ss";

export const CreateMarket = ({
  web3Ref,
  firstAccount,
  funds,
}: CreateMarketProps) => {
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [prob, setProb] = useState("50");
  const [ante, setAnte] = useState("10");
  const web3Action = useWeb3Action();
  const [closeDateText, setCloseDateText] = useState<string>(
    formatDate(addDate(new Date(), { days: 7 }), dateFormat)
  );

  const intPattern = /^[0-9]+$/;

  const probError =
    !intPattern.test(prob) || Number(prob) < 1 || Number(prob) > 99;
  const anteBN = BNToken.fromNumTokens(intPattern.test(ante) ? ante : "0");
  const anteError =
    Number(anteBN.toNumTokens()) < 10 ||
    Number(anteBN.toNumTokens()) > Number(funds.toNumTokens());

  const closeDate = parseDate(closeDateText, dateFormat, new Date());
  const closeDateError =
    !closeDate || !isValid(closeDate) || closeDate < new Date();

  const errorMessage = probError
    ? "Initial probability must be a whole number between 1 and 99 inclusive."
    : anteError
    ? "Market ante must be a whole number between 10 and your current available funds."
    : closeDateError
    ? `Close date must be in the future and in the format ${dateFormat}.`
    : undefined;

  const createMarket = async () => {
    web3Action(
      "Your market is being created.",
      "Creating Market",
      () =>
        Contract.createMarket(
          web3Ref.current,
          firstAccount,
          question,
          description,
          Number(prob),
          new BN(ante).mul(new BN("1000000000000000000")),
          closeDate!
        )
    );
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
            <Form.Field error={closeDateError}>
              <label>Close Date ({formatDate(new Date(), "z")})</label>
              <Input
                type="text"
                value={closeDateText}
                onChange={(event) => {
                  setCloseDateText(event.target.value);
                }}
              />
            </Form.Field>
            <Message
              error
              header="Please check the following"
              content={errorMessage}
            />
            <Button
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
