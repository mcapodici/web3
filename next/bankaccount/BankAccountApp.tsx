import React, { useEffect, useState } from "react";
import siteWideData from "sitewide/SiteWideData.json";
import {
  createAccount,
  getExistingAccounts,
} from "ethereum/contracts/BankAccountFactory";
import { Table, Form, Button, Input, Message } from "semantic-ui-react";
import Layout from "sitewide/Layout";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "./Description";
import { DepositWithdrawModal } from "./DepositWithdrawModal";

interface IBankAccountDetails {
  contractAddress: string;
  balanceEther: string;
}

interface IShowDespoitWithdrawalModalInfo {
  contractAddress: string;
  isDeposit: boolean;
}

const BankAccountApp = ({ web3Ref, firstAccount }: Web3Props) => {
  const [showDespoitWithdrawalModalInfo, setShowDespoitWithDrawalModalInfo] =
    useState<IShowDespoitWithdrawalModalInfo | undefined>();
  const [initialDespoitEther, setInitialDespoitEther] = useState("");
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

  const web3 = web3Ref.current;
  const { deployedContractAddresses } = siteWideData;
  const bankAccountFactoryAddress =
    deployedContractAddresses.bankAccountFactoryAddress;

  const createBankAccount = async () => {
    setCreatingBankAccount(true);
    setCreatedAccountAddress(undefined);
    setErrorMessage(undefined);
    try {
      const accountAddress = await createAccount(
        web3,
        bankAccountFactoryAddress,
        firstAccount,
        initialDespoitEther
      );
      setCreatedAccountAddress(accountAddress);
    } catch (ex) {
      setErrorMessage("Details from provider: " + ex.message);
    }
    setCreatingBankAccount(false);
    getExistingAccountsAndUpdate();
  };

  const getExistingAccountsAndUpdate = async () => {
    try {
      const events = await getExistingAccounts(
        web3,
        bankAccountFactoryAddress,
        firstAccount
      );
      setBankAccountsDetails(
        events.map((ev) => ({
          contractAddress: ev.returnValues.account,
          balanceEther: "",
        }))
      );
    } catch (err) {
      // TODO report error
      console.error(err);
    }
  };

  const startBlockListener = () => {
    web3.eth.subscribe("newBlockHeaders", (err, result) => {
      if (!err) getLatestBalances();
      // TODO report error
    });
  };

  const getLatestBalances = () => {
    setBankAccountsDetails((details) => {
      for (const bankAccountDetails of details) {
        const address = bankAccountDetails.contractAddress;
        web3.eth.getBalance(address).then((bal) => {
          setBankAccountsDetails((details) =>
            details.map((detail) =>
              detail.contractAddress === address
                ? {
                    ...detail,
                    balanceEther: web3.utils.fromWei(bal, "ether"),
                  }
                : detail
            )
          );
        });
      }
      return details;
    });
  };

  const init = async () => {
    getExistingAccountsAndUpdate();
    getLatestBalances();
    startBlockListener();
  };

  useEffect(() => {
    init();
  }, []);

  const bankAccountsTables = bankAccountsDetails.map((account) => (
    <Table.Row key={account.contractAddress}>
      <Table.Cell>
        <ShortAddressWithLink address={account.contractAddress} />
      </Table.Cell>
      <Table.Cell>
        {account.balanceEther ? (
          account.balanceEther
        ) : (
          <div className="ui active inline loader"></div>
        )}
      </Table.Cell>
      <Table.Cell>
        <Button
          primary
          onClick={() =>
            setShowDespoitWithDrawalModalInfo({
              contractAddress: account.contractAddress,
              isDeposit: true,
            })
          }
        >
          Deposit
        </Button>
        <Button
          primary
          onClick={() =>
            setShowDespoitWithDrawalModalInfo({
              contractAddress: account.contractAddress,
              isDeposit: false,
            })
          }
        >
          Withdraw
        </Button>
      </Table.Cell>
    </Table.Row>
  ));

  return (
    <Layout>
      <Description />
      <p>
        Note that this is using the contract factory deployed to{" "}
        <ShortAddressWithLink address={bankAccountFactoryAddress} />
      </p>
      <h2>Your bank accounts</h2>
      <p>
        Here is a list of bank accounts connected to your current address{" "}
        <ShortAddressWithLink address={firstAccount} />
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
      <h2>Create bank account</h2>
      <p>
        You can create a bank account here. The initial deposit can be zero, if
        you like.
      </p>
      <Form error={!!errorMessage}>
        <Form.Field>
          <label>Initial Deposit (Ether)</label>
          <Input
            type="number"
            value={initialDespoitEther}
            onChange={(event) => {
              setInitialDespoitEther(event.target.value);
            }}
          />
        </Form.Field>
        <Button
          primary
          loading={creatingBankAccount}
          onClick={createBankAccount}
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
      {showDespoitWithdrawalModalInfo && (
        <DepositWithdrawModal
          isDeposit={showDespoitWithdrawalModalInfo.isDeposit}
          bankAccountContractAddress={
            showDespoitWithdrawalModalInfo.contractAddress
          }
          web3Ref={web3Ref}
          firstAccount={firstAccount}
          onClose={(promise: Promise<boolean>) => {
            setShowDespoitWithDrawalModalInfo(undefined);
          }}
        />
      )}
    </Layout>
  );
};

export default BankAccountApp;
