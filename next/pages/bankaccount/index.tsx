import type { NextPage } from "next";
import BankAccountApp from "bankaccount/BankAccountApp";
import { RequireWeb3Wrapper } from "sitewide/RequireWeb3Wrapper";
import Description from "bankaccount/Description";

const Home: NextPage = RequireWeb3Wrapper(BankAccountApp, Description);
export default Home;
