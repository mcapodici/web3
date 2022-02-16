import { useEffect, useState, useContext } from "react";
import type { NextPage } from "next";
import Layout from "sitewide/Layout";
import { Form, Input, Button, Table, Message } from "semantic-ui-react";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import {
  createAccount,
  makeFactoryContractObject,
} from "ethereum/contracts/BankAccountFactory";
import siteWideData from "sitewide/SiteWideData.json";
import { Context } from "sitewide/Context";

interface IBankAccountDetails {
  contractAddress: string;
  balanceEther: string;
}

const Home: NextPage = () => {
  const { web3Status } = useContext(Context);
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

  switch (web3Status.type) {
    case "disabled":
      // TODO move away from this hack and figure out neat way to handle 2-modes.
      useEffect(() => {}, [web3Status]); /// HAAAACK
      return <div>This requires web3 blah blah</div>;

    case "enabled":
      const web3 = web3Status.web3Ref.current;
      const firstAccount = web3Status.firstAccount;
      const { deployedContractAddresses } = siteWideData;
      const bankAccountFactoryAddress =
        deployedContractAddresses.bankAccountFactoryAddress;

      const createBankAccount = async () => {
        setCreatingBankAccount(true);
        setCreatedAccountAddress(undefined);
        setErrorMessage(undefined);
        try {
          const initialDespoitWei = web3.utils.toWei(initialDespoit, "ether");
          const accountAddress = await createAccount(
            web3,
            bankAccountFactoryAddress,
            firstAccount,
            initialDespoitWei
          );
          setCreatedAccountAddress(accountAddress);
        } catch (ex) {
          setErrorMessage("Details from provider: " + ex.message);
        }
        setCreatingBankAccount(false);
        getExistingAccounts();
      };

      const getExistingAccounts = async () => {
        try {
          const factoryContract = makeFactoryContractObject(
            web3,
            bankAccountFactoryAddress
          );
          const events = await factoryContract.getPastEvents("AccountCreated", {
            filter: { sender: [firstAccount] },
            fromBlock: 1,
          });

          const result: IBankAccountDetails[] = events.map((ev) => ({
            contractAddress: ev.returnValues.account,
            balanceEther: "",
          }));
          setBankAccountsDetails(result);
        } catch (err) {
          console.error(err);
        }
      };

      const startBlockListener = () => {
        web3.eth.subscribe("newBlockHeaders", (err, result) => {
          if (!err) getLatestBalances();
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
        getExistingAccounts();
        getLatestBalances();
        startBlockListener();
      };

      useEffect(() => {
        if (web3Status.type === "enabled") {
          init();
        }
      }, [web3Status]);

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
            <Button disabled={!interactionAllowed} primary>
              Deposit
            </Button>
            <Button disabled={!interactionAllowed} primary>
              Withdraw
            </Button>
          </Table.Cell>
        </Table.Row>
      ));

      const interactionAllowed = true; // TODO Solve this!
      return (
        <Layout>
          <h1>Bank Account</h1>
          <p>
            The bank account example is a simple smart contract to which you can
            deposit and withdraw Ether. A contract is deployed per bank account,
            and that bank account will only allow withdrawals to the creator of
            the contract. Anyone can deposit Ether.
          </p>
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
            You can create a bank account here. The initial deposit can be zero,
            if you like.
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
  }
};

export default Home;
