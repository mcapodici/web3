import React, { useContext } from "react";
import type { NextPage } from "next";
import { Context } from "sitewide/Context";
import BankAccountApp from "bankaccount/BankAccountApp";

const Home: NextPage = () => {
  const { web3Status } = useContext(Context);
  switch (web3Status.type) {
    case "disabled":
      return <div>This requires web3 blah blah</div>;

    case "enabled":
      return <BankAccountApp web3Ref={web3Status.web3Ref} firstAccount={web3Status.firstAccount} />     
  }
};

export default Home;
