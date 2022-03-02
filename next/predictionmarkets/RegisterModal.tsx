import React, { useState } from "react";
import { Button, Form, Icon, Input, Modal, TextArea } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import * as Contract from "ethereum/contracts/PredictionMarket";
import Web3 from "web3";

export interface RegisterModalProps extends Web3Props {
  onClose: (waitForCompletion: Promise<boolean>) => void;
}

// TODO validate text field

const RegisterModal = ({
  web3Ref,
  firstAccount,
  onClose,
}: RegisterModalProps) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const register = () => {
    const promise = Contract.register(
      web3Ref.current,
      firstAccount,
      username,
      bio
    );
    onClose(promise.then(() => true));
  };

  return (
    <Modal
      size={"mini"}
      open={true}
      onClose={() => onClose(Promise.resolve(false))}
      closeIcon
    >
      <Modal.Header>Register for Prediction Markets</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <label>Username</label>
            <Input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
              }}
            />
          </Form.Field>
          <Form.Field>
            <label>Bio</label>
            <TextArea
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
              }}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button disabled={!username} color="green" onClick={register}>
          <Icon name="checkmark" /> Register
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export { RegisterModal };
