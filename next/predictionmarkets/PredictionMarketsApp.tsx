import React, {  } from "react";
import Layout from "sitewide/Layout";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "./Description";

interface IBankAccountDetails {
  contractAddress: string;
  balanceEther: string;
}

interface IShowDespoitWithdrawalModalInfo {
  contractAddress: string;
  isDeposit: boolean;
}

const PredictionMarketsApp = ({ web3Ref, firstAccount }: Web3Props) => {
  return (
    <Layout>
      <Description />
    </Layout>
  );
};

export default PredictionMarketsApp;
