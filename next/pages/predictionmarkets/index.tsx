import React, { useEffect, useState } from "react";
import Layout from "sitewide/Layout";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "predictionmarkets/Description";
import siteWideData from "sitewide/SiteWideData.json";
import {
  getUserInfo,
  UserInfo,
  getMarkets,
} from "ethereum/contracts/PredictionMarket";
import {
  Button,
  Divider,
  Form,
} from "semantic-ui-react";
import { RegisterModal } from "predictionmarkets/RegisterModal";
import { CreateMarket } from "predictionmarkets/CreateMarket";
import { Markets } from "predictionmarkets/Markets";
import { BNToken } from "util/BN";
import type { NextPage } from "next";
import { RequireWeb3Wrapper } from "sitewide/RequireWeb3Wrapper";
interface GetMarketOptions {
  showClosed: boolean;
  showResolved: boolean;
}

const App = ({ web3Ref, firstAccount }: Web3Props) => {
  const web3 = web3Ref.current;
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [markets, setMarkets] = useState<any[]>([]);
  const [marketOptions, setMarketOptions] = useState<GetMarketOptions>({
    showClosed: false,
    showResolved: false,
  });

  const init = async () => {
    getUserInfo(web3, firstAccount).then(setUserInfo);
    getMarkets(web3).then(setMarkets);
  };

  useEffect(() => {
    init();
  }, [firstAccount]);

  const funds = userInfo?.balance || BNToken.fromNumTokens("0");
  const isRegistered = !!userInfo?.username;

  return (
    <Layout>
      <p style={{ float: "right" }}>
        Funds: <strong>P${funds.toNumTokens(0)}</strong>
      </p>
      <Description />
      <Divider />
      {isRegistered && (
        <>
          <h1>Welcome, {userInfo?.username}!</h1>
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
      <Form>
    <Form.Group>
        <Form.Field>
          <Form.Checkbox
            label="Include Closed"
            checked={marketOptions.showClosed}
            onChange={(e, data) =>
              setMarketOptions((mo) => ({
                ...mo,
                showClosed: data.checked || false,
              }))
            }
          /></Form.Field>
                 <Form.Field>
 
          <Form.Checkbox
            label="Include Resolved"
            checked={marketOptions.showResolved}
            onChange={(e, data) =>
              setMarketOptions((mo) => ({
                ...mo,
                showResolved: data.checked || false,
              }))
            }
          />
        </Form.Field>
        </Form.Group>
        <Markets
          markets={markets.filter(
            (m) =>
              (marketOptions.showResolved || !m.resolved) &&
              (marketOptions.showClosed || !m.closed)
          )}
        />
      </Form>
      {showRegisterModal && (
        <RegisterModal
          web3Ref={web3Ref}
          firstAccount={firstAccount}
          onClose={() => setShowRegisterModal(false)}
        />
      )}

      <Divider />
      <p>
        Note that this is using the contract deployed to{" "}
        <ShortAddressWithLink
          address={
            siteWideData.deployedContractAddresses.predictionMarketsAddress
          }
        />
      </p>
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

const Home: NextPage = RequireWeb3Wrapper(App, Description);
export default Home;
