import React, { useEffect, useState } from "react";
import Layout from "sitewide/Layout";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "./Description";
import siteWideData from "sitewide/SiteWideData.json";
import {
  getUserInfo,
  UserInfo,
  getMarkets,
} from "ethereum/contracts/PredictionMarket";
import { Button, Header, Icon, Message } from "semantic-ui-react";
import { RegisterModal } from "./RegisterModal";
import { CreateMarket } from "./CreateMarket";
import BN from "bn.js";
import { Markets } from "./Markets";
import { BNToken } from "util/BN";

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

  const funds = userInfo?.balance || BNToken.fromNumTokens('0');
  const isRegistered = !!userInfo?.username;

  return (
    <Layout>
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
          <p>
            Funds: <strong>P${funds.toNumTokens(4)}</strong>
          </p>
          <CreateMarket
            web3Ref={web3Ref}
            firstAccount={firstAccount}
            funds={funds}
          />
        </>
      )}
      {isRegistered || (
        <>
          <RegisterInfo
            onClick={(event) => {
              event.preventDefault();
              setShowRegisterModal(true);
            }}
          />
        </>
      )}
      <h2>Markets</h2>
      <Markets markets={markets} />

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

const RegisterInfo = (props: { onClick: (e: any) => void }) => (
  <>
    <h2>Register to create prediciton markets</h2>
    <p>
      Click the buton to register as a user and bet on prediction markets and
      create your own markets. <i>It just takes a second!</i>
    </p>
    <p>
      <Button primary onClick={props.onClick}>
        Register
      </Button>
    </p>
  </>
);

export default PredictionMarketsApp;
