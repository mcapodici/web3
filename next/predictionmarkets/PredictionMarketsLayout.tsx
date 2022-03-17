import React from "react";
import Layout from "sitewide/Layout";
import { BNToken } from "util/BN";

interface Props {
  children?: React.ReactNode;
  funds: BNToken;
  username: string;
}

export default ({ funds, username, children }: Props) => {
  const fundsSegment = (
    <>
      {username}, <i>you have</i> <strong>P${funds.toNumTokens(0)}</strong>
    </>
  );

  const homeLinkSegment = <a href="/predictionmarkets">View Markets</a>;
  const userLink = <a href={"/predictionmarkets/users/" + username}>Your Profile</a>;

  return <Layout additionalSegments={[fundsSegment, homeLinkSegment, userLink]}>{children}</Layout>;
};
