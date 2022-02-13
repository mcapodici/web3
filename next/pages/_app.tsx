import "semantic-ui-css/semantic.min.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { EthereumProviderStatus, init } from "../ethereum/ethereumProvider";

interface MyAppProps {
  hasEthereumProvider: boolean;
}

function MyApp({ Component, pageProps }: AppProps<MyAppProps>) {
  const [ethereumProviderStatus, setEthereumProviderStatus] = useState(EthereumProviderStatus.Checking);

  useEffect(() => {
    init().then((result) => setEthereumProviderStatus(result));
  }, []);

  return <Component {...pageProps} ethereumProviderStatus={ethereumProviderStatus} />;
}

export default MyApp;
