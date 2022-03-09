import React from "react";
import { Menu } from "semantic-ui-react";
import Link from "next/link";

const Header = () => {
  return (
    <Menu>
      <Menu.Item>
        <Link href="/"><><img src="/web3logo.png" alt="web3 examples" />&nbsp; examples</></Link>
      </Menu.Item>
      <Menu.Menu position="right">
        <Menu.Item>
          <Link href="/">Examples</Link>
        </Menu.Item>
        <Menu.Item>
          <Link href="/">About</Link>
        </Menu.Item>
      </Menu.Menu>
    </Menu>
  );
};

export default Header;
