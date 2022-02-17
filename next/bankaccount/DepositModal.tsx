import React, { useState } from "react";
import { Button, Form, Icon, Input, Modal } from "semantic-ui-react";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import * as BankAccountFactory from 'ethereum/contracts/BankAccountFactory';

export interface DepositModelProps extends Web3Props {
  bankAccountContractAddress: string;
  onClose: (waitForCompletion: Promise<boolean>) => void ;
}

const DepositModal = ({
  bankAccountContractAddress,
  web3Ref,
  firstAccount,
  onClose,
}: DepositModelProps) => {
  const [depositEther, setDespoitEther] = useState("");

  const sendDeposit = () => {
    const promise = BankAccountFactory.deposit(web3Ref.current,bankAccountContractAddress, depositEther, firstAccount );
    onClose(promise.then(()=>true));
  };

  return (
    <Modal size={'mini'} open={true} onClose={() => onClose(Promise.resolve(false))} closeIcon>
      <Modal.Header>
        Despoit funds
      </Modal.Header>
      <Modal.Content>
        <p>Funds will despoit to bank account contract <ShortAddressWithLink address={bankAccountContractAddress} />
        </p>
        <Form>
          <Form.Field>
            <label>Deposit (Ether)</label>
            <Input
              type="number"
              value={depositEther}
              onChange={(event) => {
                setDespoitEther(event.target.value);
              }}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button color="red" onClick={() => onClose(Promise.resolve(false))}>
          <Icon name="remove" /> No
        </Button>
        <Button disabled={!(/(^-?[0-9.]+)$/).test(depositEther)} color="green" onClick={sendDeposit}>
          <Icon name="checkmark" /> Yes
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export { DepositModal };
