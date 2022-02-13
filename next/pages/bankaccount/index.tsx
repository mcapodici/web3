import type { NextPage } from "next";
import Layout from "components/Layout";
import { Form, Input, Button, Table, Message } from "semantic-ui-react";
import {
  HasEthereumProviderProps,
  EthereumProviderStatus,
} from "ethereum/ethereumProvider";
import { getWeb3WithAccounts } from "ethereum/web3";
import { deployContract } from "ethereum/contracts/BankAccount";
import { useState } from "react";

const Home: NextPage<HasEthereumProviderProps> = ({
  ethereumProviderStatus,
}) => {
  const [creatingBankAccount, setCreatingBankAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  async function createBankAccount() {
    setCreatingBankAccount(true);
    setErrorMessage(undefined);
    try {
      const { web3, accounts } = await getWeb3WithAccounts();
      if (web3) {
        console.log(accounts);
        const contract = await deployContract(web3, accounts[0]);
        alert("Contract deployed to: " + contract.options.address);
        // TODO - instead of alert, show nice UI element saying it is deployed. We also
        // need to update the your bank accounts list.
      }
    } catch (ex) {
      setErrorMessage("Details from provider: " + ex.message);
      // TODO show exception to user.
    }
    setCreatingBankAccount(false);
  }

  const interactionAllowed =
    ethereumProviderStatus === EthereumProviderStatus.Yes;
  return (
    <Layout ethereumProviderStatus={ethereumProviderStatus}>
      <h1>Bank Account</h1>
      <p>
        The bank account example is a simple smart contract to which you can
        deposit and withdraw Ether. A contract is deployed per bank account, and
        that bank account will only allow withdrawals to the creator of the
        contract. Anyone can deposit Ether.
      </p>
      <h2>Your bank accounts</h2>
      <p>
        Here is a list of bank accounts connected to your current metamask
        address "XYZ"
      </p>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Cell>Contract Address</Table.Cell>
            <Table.Cell>Balance (Ether)</Table.Cell>
            <Table.Cell>Actions</Table.Cell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>0x0883</Table.Cell>
            <Table.Cell>0.01</Table.Cell>
            <Table.Cell>
              <Button disabled={!interactionAllowed} primary>
                Deposit
              </Button>
              <Button disabled={!interactionAllowed} primary>
                Withdraw
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <h2>Create bank accounts</h2>
      <p>
        You can create a bank account here. The initial deposit can be zero, if
        you like.
      </p>
      <Form error={!!errorMessage}>
        <Form.Field>
          <label>Initial Deposit (Ether)</label>
          <Input type="number" />
        </Form.Field>
        <Button
          primary
          loading={creatingBankAccount}
          onClick={createBankAccount}
          disabled={!interactionAllowed}
        >
          Create Account
        </Button>
        <Message
          header="Error occured during account creation"
          content={errorMessage}
          error
        />
      </Form>
    </Layout>
  );
};

export default Home;
