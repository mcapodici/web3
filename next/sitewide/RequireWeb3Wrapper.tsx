import React, { ComponentType, MutableRefObject, useContext } from "react";
import Web3 from "web3";
import { Context } from "./Context";
import EthereumPluginRequiredWarning from "./EthereumPluginRequiredWarning";
import Layout from "./Layout";

export interface Web3Props {
  web3Ref: MutableRefObject<Web3>;
  firstAccount: string;
}

const RequireWeb3Wrapper =
  (IfWeb3: ComponentType<Web3Props>, IfNoWeb3: ComponentType<{}>) => () => {
    const { web3Status } = useContext(Context);
    switch (web3Status.type) {
      case "disabled":
        return (
          <Layout>
            <IfNoWeb3 />
            <EthereumPluginRequiredWarning />
          </Layout>
        );

      case "enabled":
        return (
          <IfWeb3
            web3Ref={web3Status.web3Ref}
            firstAccount={web3Status.firstAccount}
          />
        );
    }
  };

export { RequireWeb3Wrapper };