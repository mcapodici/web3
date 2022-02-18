import "semantic-ui-css/semantic.min.css";
import type { AppProps } from "next/app";
import { useRef, useEffect, useState, MutableRefObject } from "react";
import { Context, Web3Status } from "sitewide/Context";
import { getWeb3WithAccounts } from "ethereum/web3";
import Web3 from "web3";
import { Alert } from "sitewide/alerts/AlertPanel";

interface MyAppProps {}

function MyApp({ Component, pageProps }: AppProps<MyAppProps>) {
  const web3Ref = useRef<Web3>();
  const [firstAccount, setFirstAccount] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function web3init() {
    const { web3, accounts } = await getWeb3WithAccounts();

    if (web3) {
      const provider = web3.currentProvider as any; // Any case because there are numerous providers with a union of types provided by web3.
      if (provider.on) {
          provider.on('accountsChanged', function (accounts: string[]) {
            setFirstAccount(accounts[0]);
          });
      } else {
        // Resort to polling
        setInterval(async function() {
          const accounts = await web3.eth.getAccounts();
          if (accounts[0] !== firstAccount) {
            setFirstAccount(accounts[0]);
          }
        }, 100);
      }
    }

    if (web3 && accounts.length) {
      web3Ref.current = web3;
      setFirstAccount(accounts[0]);
    } else {
      web3Ref.current = undefined;
      setFirstAccount("");
    }
  }

  useEffect(() => {
    web3init();    
  }, []);

  const web3Status: Web3Status = firstAccount
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
