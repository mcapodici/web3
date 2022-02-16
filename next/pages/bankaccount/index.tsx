import type { NextPage } from "next";
import BankAccountApp from "bankaccount/BankAccountApp";
import { RequireWeb3Wrapper } from "sitewide/RequireWeb3Wrapper";

const Home: NextPage = RequireWeb3Wrapper(BankAccountApp);
export default Home;
