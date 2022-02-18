import React from "react";
import { Icon, Message } from "semantic-ui-react";
import Image from "next/image";
import NotConnectedReason from "./NotConnectedReason";

interface Props {
  notConnectedReason: NotConnectedReason;
}

export default ({ notConnectedReason }: Props) => {
  function headerMessage() {
    switch (notConnectedReason) {
      case NotConnectedReason.NotChecked:
        return "Checking Provider...";
      case NotConnectedReason.NoProvider:
        return "Ethereum Plugin Required";
      case NotConnectedReason.NotConnected:
        return "Ethereum Plugin Not Connected";
      case NotConnectedReason.WrongNetwork:
        return "Please Use Rinkby Testnet";
    }
  }

  function body() {
    switch (notConnectedReason) {
      case NotConnectedReason.NotChecked:
        return <p>Please wait while we check your Ethereum provider.</p>;
      case NotConnectedReason.NoProvider:
        return (
          <p>
            To view and use this application, install a EIP-1193 compatiable
            Ethereum provider (e.g.{" "}
            <a target="_blank" href="https://metamask.io/download/">
              MetaMask
            </a>
            ){" "}
          </p>
        );
      case NotConnectedReason.NotConnected:
        return (
          <p>
            To view and use this application, Make sure you are logged in and
            have connected this app to an account, and have that account
            selected.
          </p>
        );
      case NotConnectedReason.WrongNetwork:
        return (
          <>
            <p>
              To view and use this application, change to the Rinkby Testnet:
            </p>
            <p>
              {" "}
              If you are using MetaMask, open the extension and go to Settings, Advanced, Show
              test networks and turn this option on. Then from the networks list
              now shown, choose Rinkby Test Network.
            </p>
            <p>You can get free test Ether from <a href="https://www.rinkebyfaucet.com/">https://www.rinkebyfaucet.com</a></p>
          </>
        );
    }
  }

  return (
    <Message icon warning>
      <Icon name="warning circle" />
      <span>
        <Message.Header>{headerMessage()}</Message.Header>
        {body()}
      </span>
    </Message>
  );
};
