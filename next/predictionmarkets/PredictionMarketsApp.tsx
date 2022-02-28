import React, {  } from "react";
import Layout from "sitewide/Layout";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "./Description";
import siteWideData from "sitewide/SiteWideData.json";

const PredictionMarketsApp = ({ web3Ref, firstAccount }: Web3Props) => {
  return (
    <Layout>
      <Description />
      <p>
        Note that this is using the contract deployed to{" "}
        <ShortAddressWithLink address={siteWideData.deployedContractAddresses.predictionMarketsAddress} />
      </p>
    </Layout>
  );
};

export default PredictionMarketsApp;