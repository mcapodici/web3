import React from "react";
import { Menu } from "semantic-ui-react";
import Link from "next/link";

const SideNav = () => {
  return (
    <Menu vertical>
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
