import React, { useContext } from "react";
import { Icon, Menu } from "semantic-ui-react";
import Link from "next/link";
import ShortAddressWithLink from "./ShortAddressWithLink";
import { Context } from "./Context";
import NotConnectedReason from "./NotConnectedReason";

const SideNav = () => {
  const { web3Status } = useContext(Context);

  function notConnectedReasonText(notConnectedReason: NotConnectedReason) {
    switch (notConnectedReason) {
      case NotConnectedReason.NotChecked:
        return "Checking provider...";
      case NotConnectedReason.NoProvider:
        return "Ethereum plugin is required";
      case NotConnectedReason.NotConnected:
        return "Ethereum plugin not connected";
      case NotConnectedReason.WrongNetwork:
        return "Please use Rinkby testnet";
    }
  }

  return (
    <Menu vertical>
      <Menu.Item>
        {web3Status.type === "enabled" ? (
          <>
            <h3 style={{ color: "darkgreen" }}>
              <Icon
                name="ethereum"
                size="large"
                style={{ marginTop: "-4px" }}
              />
              Connected
            </h3>
            <p>
              Address:{" "}
              <ShortAddressWithLink address={web3Status.firstAccount} />
            </p>
          </>
        ) : (
          <>
            <h3 style={{ color: "grey" }}>
              <Icon
                name="ethereum"
                size="large"
                style={{ marginTop: "-4px" }}
              />
              Not Connected
            </h3>
            <p>{notConnectedReasonText(web3Status.notConnectedReason)}</p>
          </>
        )}
      </Menu.Item>
      <Menu.Item>
        Basic Examples
        <Menu.Menu>
          <Menu.Item>
            <Link href="/bankaccount">Bank Account</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/">Long Term Deposit</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/">Long Term Deposit With Mutable Recipient</Link>
          </Menu.Item>
        </Menu.Menu>
      </Menu.Item>
      <Menu.Item>
        Tokens
        <Menu.Menu>
          <Menu.Item>
            <Link href="/">ERC 20 Token, with Faucet</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/">NFT sale, with pricing tiers</Link>
          </Menu.Item>
        </Menu.Menu>
      </Menu.Item>
      <Menu.Item>
        Money Games
        <Menu.Menu>
          <Menu.Item>
            <Link href="/">Chicken</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/">Poker</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/">Lottery</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/">Wordle Challenge</Link>
          </Menu.Item>
          <Menu.Item>
            <Link href="/">Sports Book (using Oracle)</Link>
          </Menu.Item>
        </Menu.Menu>
      </Menu.Item>
    </Menu>
  );
};

export default SideNav;
