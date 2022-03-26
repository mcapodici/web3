import React, { ComponentType, MutableRefObject, useContext } from "react";
import Web3 from "web3";
import { Context } from "./Context";
import EthereumPluginRequiredWarning from "./EthereumPluginRequiredWarning";
import Layout from "./Layout";

export interface Web3Props {
  web3Ref: MutableRefObject<Web3>;
  firstAccount: string;
}

const RequireWeb3Wrapper = (
  IfWeb3: ComponentType<Web3Props>,
  IfNoWeb3: ComponentType<{}>
) => {
  const Component = () => {
    const { web3Status } = useContext(Context);
    switch (web3Status.type) {
      case "disabled":
        return (
          <Layout>
            <EthereumPluginRequiredWarning
              notConnectedReason={web3Status.notConnectedReason}
            />
            <IfNoWeb3 />
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
  return Component;
};

export { RequireWeb3Wrapper };
