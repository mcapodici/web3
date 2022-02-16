import React, { ComponentType, MutableRefObject, useContext } from "react";
import Web3 from "web3";
import { Context } from "./Context";
import Layout from "./Layout";

export interface Web3Props {
  web3Ref: MutableRefObject<Web3>;
  firstAccount: string;
}

const RequireWeb3Wrapper =(Wrappee:ComponentType<Web3Props>) => () => {
  const { web3Status } = useContext(Context);
  switch (web3Status.type) {
    case "disabled":
      return <Layout>
      <div>This requires web3 blah blah</div>
      </Layout>

    case "enabled":
      return <Wrappee web3Ref={web3Status.web3Ref} firstAccount={web3Status.firstAccount}/>
  }
};

export { RequireWeb3Wrapper };