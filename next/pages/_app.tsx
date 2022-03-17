import "semantic-ui-css/semantic.min.css";
import "./style.css";
import type { AppProps } from "next/app";
import { useRef, useEffect, useState, MutableRefObject } from "react";
import { Context, Web3Status } from "sitewide/Context";
import { getWeb3WithAccounts } from "ethereum/web3";
import Web3 from "web3";
import { Alert } from "sitewide/alerts/AlertPanel";
import NotConnectedReason from "sitewide/NotConnectedReason";
import NetworkIds from "ethereum/NetworkIds";

interface MyAppProps {}

function MyApp({ Component, pageProps }: AppProps<MyAppProps>) {
  const web3Ref = useRef<Web3>();
  const subscriptionsRef = useRef<any[]>([]);
  const [firstAccount, setFirstAccount] = useState("");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notConnectedReason, setNotConnectedReason] = useState<
    NotConnectedReason | undefined
  >(NotConnectedReason.NotChecked);

  async function web3init(withListeners: boolean) {
    const { web3, accounts } = await getWeb3WithAccounts();

    if (!web3) {
      setNotConnectedReason(NotConnectedReason.NoProvider);
      web3Ref.current = undefined;
      setFirstAccount("");
      return;
    }

    const currentNetworkId = await web3.eth.net.getId();

    if (currentNetworkId !== NetworkIds.Rinkeby) {
      setNotConnectedReason(NotConnectedReason.WrongNetwork);
      web3Ref.current = web3;
      setFirstAccount("");
      return;
    }

    if (withListeners) {
      const provider = web3.currentProvider as any; // Any case because there are numerous providers with a union of types provided by web3.
      if (provider.on) {
        subscriptionsRef.current.push(
          provider.on("accountsChanged", function (accounts: string[]) {
            web3init(false);
          })
        );
        subscriptionsRef.current.push(
          provider.on("networkChanged", function (networkId: number) {
            web3init(false);
          })
        );
      } else {
        // Resort to polling
        setInterval(async function () {
          const accounts = await web3.eth.getAccounts();
          if (accounts[0] !== firstAccount) {
            web3init(false);
          }
        }, 100);
      }
    }

    if (accounts.length) {
      setNotConnectedReason(undefined);
      web3Ref.current = web3;
      setFirstAccount(accounts[0]);
    } else {
      setNotConnectedReason(NotConnectedReason.NotConnected);
      web3Ref.current = undefined;
      setFirstAccount("");
    }
  }

  useEffect(() => {
    web3init(true);
  });

  const web3Status: Web3Status = firstAccount
    ? {
        type: "enabled",
        web3Ref: web3Ref as MutableRefObject<Web3>,
        firstAccount,
      }
    : {
        type: "disabled",
        notConnectedReason: notConnectedReason || NotConnectedReason.NotChecked,
      };

  const providerValue = {
    web3Status,
    alerts,
    addAlert: (alert: Alert) => {
      // Replace alert if id exists too. Useful for error messages (to avoid them stacking in the UI)
      setAlerts((als) => [
        ...als.filter((al) => al.uniqueId !== alert.uniqueId),
        alert,
      ]);
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
