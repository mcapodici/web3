import React from "react";
import { Button, Modal } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import * as Contract from "ethereum/contracts/PredictionMarket";
import useWeb3Action from "sitewide/hooks/useWeb3Action";

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
  const web3Action = useWeb3Action();

  const resolve = async (isYes: boolean) => {
    onClose();
    await web3Action(
      "Your market is being resolved. Please follow the steps shown by your Ethereum provider.",
      "Resolving Market",
      () =>
        Contract.resolve(
          web3Ref.current,
          firstAccount,
          marketIndex,
          isYes ? 1 : 0
        )
    );
  };

  return (
    <Modal size={"mini"} open={true} onClose={() => onClose()} closeIcon>
      <Modal.Header>Resolve This Market</Modal.Header>
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
