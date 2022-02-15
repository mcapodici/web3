import type { NextPage } from "next";
import Layout from "components/Layout";
import { Form, Input, Button, Table, Message } from "semantic-ui-react";
import {
  HasEthereumProviderProps,
  EthereumProviderStatus,
} from "ethereum/ethereumProvider";
import { getWeb3WithAccounts } from "ethereum/web3";
import {
  createAccount,
  makeFactoryContractObject,
} from "ethereum/contracts/BankAccountFactory";
import { useEffect, useState } from "react";
import dotEnv from "dotenv";

interface INextPageProps extends HasEthereumProviderProps {
  bankAccountFactoryAddress: string;
}

interface IBankAccountDetails {
  contractAddress: string;
  balanceEther: string;
}

const Home: NextPage<INextPageProps> = ({
  ethereumProviderStatus,
  bankAccountFactoryAddress,
}) => {
  const [initialDespoit, setInitialDespoit] = useState("");
  const [creatingBankAccount, setCreatingBankAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [createdAccountAddress, setCreatedAccountAddress] = useState<
    string | undefined
  >(undefined);
  const [bankAccountsDetails, setBankAccountsDetails] = useState<
    IBankAccountDetails[]
  >([]);

  async function createBankAccount() {
    setCreatingBankAccount(true);
    setCreatedAccountAddress(undefined);
    setErrorMessage(undefined);
    try {
      const { web3, accounts } = await getWeb3WithAccounts();
      if (web3) {
        const initialDespoitWei = web3.utils.toWei(initialDespoit, "ether");
        const accountAddress = await createAccount(
          web3,
          bankAccountFactoryAddress,
          accounts[0],
          initialDespoitWei
        );
        setCreatedAccountAddress(accountAddress);
      }
    } catch (ex) {
      setErrorMessage("Details from provider: " + ex.message);
    }
    setCreatingBankAccount(false);
    getExistingAccounts();
  }

  async function getExistingAccounts() {
    const { web3, accounts } = await getWeb3WithAccounts();
    if (web3) {
      try {
        const factoryContract = makeFactoryContractObject(
          web3,
          bankAccountFactoryAddress
        );
        const events = await factoryContract.getPastEvents("AccountCreated", {
          filter: { sender: [accounts[0]] },
          fromBlock: 1,
        });

        const bankAccountsDetails: IBankAccountDetails[] = events.map((ev) => ({
          contractAddress: ev.returnValues.account,
          balanceEther: "",
        }));
        setBankAccountsDetails(bankAccountsDetails);
      } catch (err) {
        console.error(err);
      }
    }
  }

  useEffect(() => {
    getExistingAccounts();
  }, [ethereumProviderStatus]);

  const bankAccountsTables = bankAccountsDetails.map((account) => (
    <Table.Row key={account.contractAddress}>
      <Table.Cell>
        <span title={account.contractAddress}>
         {account.contractAddress.substr(0,10)}...{account.contractAddress.substring(34)}
        </span>
      </Table.Cell>
      <Table.Cell>{account.balanceEther}</Table.Cell>
      <Table.Cell>
        <Button disabled={!interactionAllowed} primary>
          Deposit
        </Button>
        <Button disabled={!interactionAllowed} primary>
          Withdraw
        </Button>
      </Table.Cell>
    </Table.Row>
  ));

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
      <p>
        Note that this is using the contract factory deployed to{" "}
        <code>{bankAccountFactoryAddress}</code>
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

        <Table.Body>{bankAccountsTables}</Table.Body>
      </Table>
      <h2>Create bank accounts</h2>
      <p>
        You can create a bank account here. The initial deposit can be zero, if
        you like.
      </p>
      <Form error={!!errorMessage}>
        <Form.Field>
          <label>Initial Deposit (Ether)</label>
          <Input
            type="number"
            value={initialDespoit}
            onChange={(event) => {
              setInitialDespoit(event.target.value);
            }}
          />
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
        {createdAccountAddress && (
          <Message
            positive
            onDismiss={() => {
              setCreatedAccountAddress(undefined);
            }}
            header="Account Created"
            content={`Your bank account has been created. The contract address is ${createdAccountAddress}. It should appear soon in the bank account list above.`}
          />
        )}
      </Form>
    </Layout>
  );
};

export async function getStaticProps(context: any) {
  dotEnv.config();
  const bankAccountFactoryAddress = process.env.BANK_ACCOUNT_FACTORY_ADDRESS;
  return {
    props: { bankAccountFactoryAddress },
  };
}

export default Home;
