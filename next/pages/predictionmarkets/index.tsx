import type { NextPage } from "next";
import App from "predictionmarkets/PredictionMarketsApp";
import { RequireWeb3Wrapper } from "sitewide/RequireWeb3Wrapper";
import Description from "bankaccount/Description";

const Home: NextPage = RequireWeb3Wrapper(App, Description);
export default Home;
