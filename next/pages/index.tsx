import type { NextPage } from "next";
import Layout from "sitewide/Layout";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <Layout>
      <h1>Examples of web3 Apps</h1>
      <h2>What is web3?</h2>
      <p>
        web3 apps use decentralized services, like blockchain, IPFS, local
        storage, bittorrent and peer-2-peer networking to create applications
        that rely less on central servers and central owners.
      </p>
      <h2>List of examples</h2>
      <ul>
        <li>
          <Link href="/bankaccount">Bank Account</Link> - the bank account
          example is a simple smart contract to which you can deposit and
          withdraw Ether.
        </li>
        <li>
          <Link href="/predictionmarkets">Prediction Markets</Link> - Prediction
          Markerts is a game where you create markets about future outcomes, and
          people bet on whether the outcome will happen or not happen.
        </li>
      </ul>
    </Layout>
  );
};

export default Home;
