import { useState } from "react";
import { Form, Input, TextArea } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";

export const CreateMarket = ({ web3Ref, firstAccount }: Web3Props) => {
  const [description, setDescription] = useState("");
  const [question, setQuestion] = useState("");
  const [prob, setProb] = useState("");
  const [ante, setAnte] = useState("");

  return (
    <>
      <Form>
        <Form>
          <Form.Field>
            <label>Ask a question...</label>
            <Input
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
                <TextArea
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                  }}
                />
              </Form.Field>
              <Form.Field>
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
              <Form.Field>
                <label>Market Ante</label>
                <Input
                  type="number"
                  label="P$"
                  labelPosition="left"
                  value={ante}
                  onChange={(event) => {
                    setAnte(event.target.value);
                  }}
                />
              </Form.Field>
            </>
          )}
        </Form>
      </Form>
    </>
  );
};
