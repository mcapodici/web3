import "semantic-ui-css/semantic.min.css";
import type { AppProps } from "next/app";
import { useState, useEffect } from "react";
import { EthereumProviderStatus, init } from "../ethereum/ethereumProvider";

interface MyAppProps {
}

function MyApp({ Component, pageProps }: AppProps<MyAppProps>) {
  console.log(pageProps)
  const [ethereumProviderStatus, setEthereumProviderStatus] = useState(
    EthereumProviderStatus.Checking
  );

  useEffect(() => {
    init().then((result) => setEthereumProviderStatus(result));
  }, []);


  return (
      <Component
        {...pageProps}
        ethereumProviderStatus={ethereumProviderStatus}
      />
  );
}

export default MyApp;
