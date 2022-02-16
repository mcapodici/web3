import "semantic-ui-css/semantic.min.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { EthereumProviderStatus, init } from "../ethereum/ethereumProvider";
import dotEnv from "dotenv";
import { SiteWideContext } from "sitewide/SiteWideContext";
import { StringifyOptions } from "node:querystring";

interface MyAppProps {
  hasEthereumProvider: boolean;
  addressLinkTemplate: string;
}

function MyApp({ Component, pageProps }: AppProps<MyAppProps>) {
  const [ethereumProviderStatus, setEthereumProviderStatus] = useState(
    EthereumProviderStatus.Checking
  );

  useEffect(() => {
    init().then((result) => setEthereumProviderStatus(result));
  }, []);

  return (
    <SiteWideContext.Provider
      value={{ addressLinkTemplate: pageProps.addressLinkTemplate }}
    >
      <Component
        {...pageProps}
        ethereumProviderStatus={ethereumProviderStatus}
      />
    </SiteWideContext.Provider>
  );
}

export async function getStaticProps(context: any) {
  dotEnv.config();
  const addressLinkTemplate = process.env.ADDRESS_LINK_TEMPLATE;
  return {
    props: { addressLinkTemplate },
  };
}

export default MyApp;
