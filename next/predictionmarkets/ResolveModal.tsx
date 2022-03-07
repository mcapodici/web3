import React, { useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import * as Contract from "ethereum/contracts/PredictionMarket";
import { Alert, AlertPanel, AlertType } from "sitewide/alerts/AlertPanel";

export interface RegisterModalProps extends Web3Props {
  onClose: () => void;
  marketIndex: number;
}

const ResolveModal = ({
  web3Ref,
  firstAccount,
  marketIndex,
  onClose,
}: RegisterModalProps) => {
  const [error, setError] = useState("");

  const resolve = async (isYes: boolean) => {
    setError("");
    try {
      await Contract.resolve(
        web3Ref.current,
        firstAccount,
        marketIndex,
        isYes ? 1 : 0
      );
    } catch (ex: any) {
      const userMessage = "Details from provider: " + ex.message;
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
            header: "Error occurred during registration",
            type: AlertType.Negative,
            uniqueId: "predictionmarket.registermodal.error",
          },
        ];

  return (
    <Modal size={"mini"} open={true} onClose={() => onClose()} closeIcon>
      <Modal.Header>Resolve This Market</Modal.Header>
      <Modal.Content>
        <AlertPanel alerts={alerts} onDismiss={() => setError("")} />
      </Modal.Content>
      <Modal.Actions>
        <Button color="green" onClick={() => resolve(true)}>
          Resolve YES
        </Button>
        <Button color="pink" onClick={() => resolve(false)}>
          Resolve NO
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export { ResolveModal };
