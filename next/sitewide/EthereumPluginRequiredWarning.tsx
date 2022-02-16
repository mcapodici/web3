import React from "react";
import { Icon, Message } from "semantic-ui-react";

export default () => (
  <Message icon warning>
    <Icon name="ethereum" />
    <span>
      <Message.Header>
        Ethereum Plugin Not Installed Or Configured
      </Message.Header>
      <p>To view and use this application, follow these steps:</p>
      <ul>
        <li>
         Install a EIP-1193
          compatiable Ethereum provider (e.g.{" "}
          <a href="https://metamask.io/download/">MetaMask</a>){" "}
        </li>
        <li>
          Make sure you are logged in and have
          connected this app to an account, and have that account selected.
        </li>
        <li>
          Click here to try connecting again.
        </li>
      </ul>
    </span>
  </Message>
);
