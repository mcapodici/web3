import "semantic-ui-css/semantic.min.css";
import type { AppProps } from "next/app";
import { useRef, useEffect, useState, MutableRefObject } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import { Context, Web3Status } from "sitewide/Context";
import { getWeb3WithAccounts } from "ethereum/web3";
import Web3 from "web3";
import { Alert } from "sitewide/alerts/AlertPanel";

interface MyAppProps {}

function MyApp({ Component, pageProps }: AppProps<MyAppProps>) {
  const web3Ref = useRef<Web3>();
  const [firstAccount, setFirstAccount] = useState("");
  const [web3Enabled, setWeb3Enabled] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function web3init() {
    const { web3, accounts } = await getWeb3WithAccounts();
    if (web3 && accounts.length) {
      web3Ref.current = web3;
      setFirstAccount(accounts[0]);
      setWeb3Enabled(true);
    } else {
      web3Ref.current = undefined;
      setFirstAccount("");
      setWeb3Enabled(false);
    }
  }

  useEffect(() => {
    web3init();
  }, []);

  const web3Status: Web3Status = web3Enabled
    ? {
        type: "enabled",
        web3Ref: web3Ref as MutableRefObject<Web3>,
        firstAccount,
      }
    : { type: "disabled" };

  const providerValue = {
    web3Status,
    alerts,
    addAlert: (alert: Alert) => {
      // Replace alert if id exists too. Useful for error messages (to avoid them stacking in the UI)
      setAlerts((als) => [...(als.filter((al) => al.uniqueId !== alert.uniqueId)), alert]);
      window.scrollTo(0, 0);
    },
    dismissAlert: (uniqueId: string) => {
      setAlerts((als) => als.filter((al) => al.uniqueId !== uniqueId));
    },
  };

  return (
    <Context.Provider value={providerValue}>
      <Component {...pageProps} />
    </Context.Provider>
  );
}

export default MyApp;
