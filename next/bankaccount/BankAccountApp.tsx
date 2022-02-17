import React, { useEffect, useState } from "react";
import siteWideData from "sitewide/SiteWideData.json";
import {
  createAccount,
  getExistingAccounts,
} from "ethereum/contracts/BankAccountFactory";
import { Form, Button, Input, Message } from "semantic-ui-react";
import Layout from "sitewide/Layout";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "./Description";
import { DepositWithdrawModal } from "./DepositWithdrawModal";
import { BankAccountsTable } from "./BankAccountsTable";
import { CreateBankAccountForm } from "./CreateBankAccountForm";

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

  const createBankAccount = async (initialDespoitEther: string) => {
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
      <BankAccountsTable
        bankAccountsDetails={bankAccountsDetails}
        onDepositClicked={(address) =>
          setShowDespoitWithDrawalModalInfo({
            contractAddress: address,
            isDeposit: true,
          })
        }
        onWithdrawClicked={(address) =>
          setShowDespoitWithDrawalModalInfo({
            contractAddress: address,
            isDeposit: false,
          })
        }
      />
      <h2>Create bank account</h2>
      <p>
        You can create a bank account here. The initial deposit can be zero, if
        you like.
      </p>
      <CreateBankAccountForm 
          errorMessage={errorMessage}
          creatingBankAccount={creatingBankAccount}
          createBankAccount={createBankAccount}
          createdAccountAddress={createdAccountAddress}
      />
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
