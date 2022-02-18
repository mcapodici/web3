import React from "react";
import { Message } from "semantic-ui-react";
import Image from 'next/image';

export default () => (
  <Message icon warning>
    <div>
    <a target="_blank" href="https://metamask.io/download/"><Image src='/metamask-fox-wordmark-stacked.svg' alt="metamask logo" width='128px' height='128x' /></a>
    </div>
    <span>
      <Message.Header>
        Ethereum Plugin Not Available <i>or</i> No Account Selected
      </Message.Header>
      <p>To view and use this application, follow these steps:</p>
      <ul>
        <li>
         Install a EIP-1193
          compatiable Ethereum provider (e.g.{" "}
          <a target="_blank" href="https://metamask.io/download/">MetaMask</a>){" "}
        </li>
        <li>
          Make sure you are logged in and have
          connected this app to an account, and have that account selected.
        </li>
        <li>
         Refresh page to attempt to reconnect.
        </li>
      </ul>
    </span>
  </Message>
);
