import { useState } from "react";
import { Button, Form, Input, Message } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";

export const CreateMarket = ({ web3Ref, firstAccount }: Web3Props) => {
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [prob, setProb] = useState("50");
  const [ante, setAnte] = useState("10");

  const probError = !/^[1-9][0-9]?$/.test(prob);
  const anteError = !/^[1-9][0-9]+?$/.test(ante);

  const errorMessage = probError
    ? "Initial probability must be a whole number between 1 and 99 inclusive."
    : anteError
    ? "Market ante must be a whole number and at least 10"
    : undefined;

  const createMarket = async () => {};

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
            <Button primary disabled={!!errorMessage}
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
