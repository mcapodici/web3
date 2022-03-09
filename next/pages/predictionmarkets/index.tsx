import React, { useEffect, useState } from "react";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "predictionmarkets/Description";
import siteWideData from "sitewide/SiteWideData.json";
import {
  getUserInfo,
  UserInfo,
  getMarkets,
  IMarketInfo,
} from "ethereum/contracts/PredictionMarket";
import { Button, Divider, Form } from "semantic-ui-react";
import { RegisterModal } from "predictionmarkets/RegisterModal";
import { CreateMarket } from "predictionmarkets/CreateMarket";
import { Markets } from "predictionmarkets/Markets";
import { BNToken } from "util/BN";
import type { NextPage } from "next";
import { RequireWeb3Wrapper } from "sitewide/RequireWeb3Wrapper";
import PredictionMarketsLayout from "predictionmarkets/PredictionMarketsLayout";

enum MarketFilterOption {
  Newest = "Newest",
  Closed = "Closed",
  Resolved = "Resolved",
  ClosingSoon = "Closing Soon",
}

const AllMarketFilterOptions = [
  MarketFilterOption.Newest,
  MarketFilterOption.Closed,
  MarketFilterOption.Resolved,
  MarketFilterOption.ClosingSoon,
];

const App = ({ web3Ref, firstAccount }: Web3Props) => {
  const web3 = web3Ref.current;
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [markets, setMarkets] = useState<IMarketInfo[]>([]);
  const [marketFilterOption, setMarketFilterOption] =
    useState<MarketFilterOption>(MarketFilterOption.Newest);

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
    <PredictionMarketsLayout username={userInfo?.username || 'Unregistered Visitor'} funds={funds}>
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
          <Form.Field>
            <Form.Dropdown
    fluid
    selection
              options={AllMarketFilterOptions.map((o) => ({
                key: o,
                value: o,
                text: o,
              }))}
              onChange={(e, data) =>
                setMarketFilterOption(data.value as MarketFilterOption)
              }
              value={marketFilterOption}
            />
          </Form.Field>
        <Divider />
        <Markets
          markets={markets
            .filter(
              (m) =>
                (marketFilterOption === MarketFilterOption.Closed &&
                  m.closed) ||
                (marketFilterOption === MarketFilterOption.ClosingSoon &&
                  !m.closed &&
                  !m.resolved) ||
                (marketFilterOption === MarketFilterOption.Newest &&
                  !m.closed &&
                  !m.resolved) ||
                (marketFilterOption === MarketFilterOption.Resolved &&
                  m.resolved)
            )
            .sortACopy((m1, m2) => {
              switch (marketFilterOption) {
                case MarketFilterOption.ClosingSoon:
                  return m1.closesAt.getTime() - m2.closesAt.getTime();

                default:
                  return m1.timestamp.getTime() - m2.timestamp.getTime();
              }
            })}
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
    </PredictionMarketsLayout>
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
