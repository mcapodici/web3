import React, { useEffect, useState } from "react";
import Layout from "sitewide/Layout";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "./Description";
import siteWideData from "sitewide/SiteWideData.json";
import {
  getUserInfo,
  UserInfo,
  getMarkets
} from "ethereum/contracts/PredictionMarket";
import { asciiBytes32ToString } from "util/Bytes";
import { Header, Icon, Message } from "semantic-ui-react";
import { RegisterModal } from "./RegisterModal";
import { CreateMarket } from "./CreateMarket";
import BN from 'bn.js';
import { Markets } from "./Markets";

const PredictionMarketsApp = ({ web3Ref, firstAccount }: Web3Props) => {
  const web3 = web3Ref.current;
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [markets, setMarkets] = useState<any[]>([]);

  const init = async () => {
    getUserInfo(web3, firstAccount).then(setUserInfo);
    getMarkets(web3).then(setMarkets);
  };

  useEffect(() => {
    init();
  }, [firstAccount]);

  const funds = userInfo?.balance || new BN('0');
  const isRegistered = !!userInfo?.username;

  return (
    <Layout>
      {isRegistered || (
        <Message info icon>
          <Icon name="info circle" />
          <div>
            <Header>Be A Master Predictor!</Header>
            <p>
              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  setShowRegisterModal(true);
                }}
              >
                Click here
              </a>{" "}
              to register as a user and bet on prediction markets and create
              your own markets.
            </p>
          </div>
        </Message>
      )}
      <Description />
      <p>
        Note that this is using the contract deployed to{" "}
        <ShortAddressWithLink
          address={
            siteWideData.deployedContractAddresses.predictionMarketsAddress
          }
        />
      </p>
      {isRegistered && (
        <>
          <h1>Welcome, {userInfo?.username}!</h1>
          <p>Funds: <strong>P${funds.divRound(new BN(1)).toString()}</strong></p>
          <CreateMarket web3Ref={web3Ref} firstAccount={firstAccount} funds={funds} />
          <h2>Markets</h2>
          <Markets markets={markets} />
        </>
      )}
      {showRegisterModal && (
        <RegisterModal
          web3Ref={web3Ref}
          firstAccount={firstAccount}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </Layout>
  );
};

export default PredictionMarketsApp;
