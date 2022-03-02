import React, { useEffect, useState } from "react";
import Layout from "sitewide/Layout";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";
import { Web3Props } from "sitewide/RequireWeb3Wrapper";
import Description from "./Description";
import siteWideData from "sitewide/SiteWideData.json";
import { getUserInfo, UserInfo } from "ethereum/contracts/PredictionMarket";
import { asciiBytes32ToString } from "util/Bytes";
import { Header, Icon, Message } from "semantic-ui-react";

const PredictionMarketsApp = ({ web3Ref, firstAccount }: Web3Props) => {

  const web3 = web3Ref.current;
  const [userInfo, setUserInfo] = useState<UserInfo | undefined>();

  const init = async () => {
    const usr = await getUserInfo(web3, firstAccount);
    console.log('x' + asciiBytes32ToString(usr.username) + 'x');
    setUserInfo(usr);
  };

  useEffect(() => {
    init();
  }, [firstAccount]);

  const decodedUserName = userInfo ? asciiBytes32ToString(userInfo.username) : '';
  const isRegistered = decodedUserName != '';

  return (
    <Layout>
      <Message info icon header="Register To Play!"
      content={<p>Click here to</p>}
      >
          <Icon name="info circle" />
          <div>
            <Header>Register To Play</Header>
            <p>
            <a href="/predictionmarkets/register">Click here</a> to register as a user and bet on prediction markets and
            create your own markets.
            </p>
          </div>
      </Message>
      <Description />
      <p>
        Note that this is using the contract deployed to{" "}
        <ShortAddressWithLink address={siteWideData.deployedContractAddresses.predictionMarketsAddress} />
      </p>
    </Layout>
  );
};

export default PredictionMarketsApp;