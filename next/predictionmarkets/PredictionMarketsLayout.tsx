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

  return <Layout additionalSegments={[fundsSegment]}>{children}</Layout>;
};
