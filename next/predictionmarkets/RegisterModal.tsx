import React, { useState } from "react";
import { Button, Form, Icon, Input, Modal, TextArea } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import * as Contract from "ethereum/contracts/PredictionMarket";
import Web3 from "web3";
import { Alert, AlertPanel, AlertType } from "sitewide/alerts/AlertPanel";

export interface RegisterModalProps extends Web3Props {
  onClose: () => void;
}

// TODO validate text field

const RegisterModal = ({
  web3Ref,
  firstAccount,
  onClose,
}: RegisterModalProps) => {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");

  const register = async () => {
    setError("");
    try {
      const existing = await Contract.getAccountForUsername(
        web3Ref.current,
        username
      );
      console.log(existing);
      if (existing) {
        setError("That username is already in use.");
        return;
      }
      await Contract.register(web3Ref.current, firstAccount, username, bio);
    } catch (ex: any) {
      let userMessage = "";
      if (ex.name === "IPFSError") {
        userMessage =
          "IPFS Error. Try again later, or register without an about you for now and try again. Message: " +
          ex.message;
      } else {
        userMessage = "Details from provider: " + ex.message;
      }
      setError(userMessage);
      return; // Keep modal open so message can be seen.
    }
    onClose();
  };

  const alerts: Alert[] =
    error === ""
      ? []
      : [
          {
            content: error,
            header: "Error occured during registraion",
            type: AlertType.Negative,
            uniqueId: "predictionmarket.registermodal.error",
          },
        ];

  return (
    <Modal size={"mini"} open={true} onClose={() => onClose()} closeIcon>
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
            <label>About You</label>
            <TextArea
              value={bio}
              onChange={(event) => {
                setBio(event.target.value);
              }}
            />
          </Form.Field>
        </Form>
        <AlertPanel alerts={alerts} onDismiss={() => setError("")} />
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
