import React from "react";
import { Button, Modal } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import * as Contract from "ethereum/contracts/PredictionMarket";
import useWeb3Action from "sitewide/hooks/useWeb3Action";

export interface RegisterModalProps extends Web3Props {
  onClose: () => void;
  onResolved: () => void;
  marketIndex: number;
}

const ResolveModal = ({
  web3Ref,
  firstAccount,
  marketIndex,
  onClose,
  onResolved,
}: RegisterModalProps) => {
  const web3Action = useWeb3Action();

  const resolve = async (isYes: boolean) => {
    onClose();
    const success = await web3Action(
      "Your market is being resolved.",
      "Resolving Market",
      () =>
        Contract.resolve(
          web3Ref.current,
          firstAccount,
          marketIndex,
          isYes ? 1 : 0
        )
    );
    if (success)
      onResolved();
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
