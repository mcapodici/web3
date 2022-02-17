import React, { useState } from "react";
import { Button, Form, Icon, Input, Modal } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import * as BankAccountFactory from "ethereum/contracts/BankAccountFactory";

export interface DepositWithdrawModalProps extends Web3Props {
  bankAccountContractAddress: string;
  onClose: (waitForCompletion: Promise<boolean>) => void;
  isDeposit: boolean;
}

const DepositWithdrawModal = ({
  bankAccountContractAddress,
  web3Ref,
  firstAccount,
  onClose,
  isDeposit,
}: DepositWithdrawModalProps) => {
  const [amountEther, setAmountEther] = useState("");

  const sendMoney = () => {
    const promise = isDeposit
      ? BankAccountFactory.deposit(
          web3Ref.current,
          bankAccountContractAddress,
          amountEther,
          firstAccount
        )
      : BankAccountFactory.withdraw(
          web3Ref.current,
          bankAccountContractAddress,
          amountEther,
          firstAccount
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
      <Modal.Header>
        {isDeposit ? "Despoit funds" : "Withdraw funds"}
      </Modal.Header>
      <Modal.Content>
        <p>
          {isDeposit ? "To" : "From"} bank account contract{" "}
          <ShortAddressWithLink address={bankAccountContractAddress} />
        </p>
        <Form>
          <Form.Field>
            <label>Amount (Ether)</label>
            <Input
              type="number"
              value={amountEther}
              onChange={(event) => {
                setAmountEther(event.target.value);
              }}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color="red" onClick={() => onClose(Promise.resolve(false))}>
          <Icon name="remove" /> No
        </Button>
        <Button
          disabled={!/(^-?[0-9.]+)$/.test(amountEther)}
          color="green"
          onClick={sendMoney}
        >
          <Icon name="checkmark" /> Yes
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export { DepositWithdrawModal };
