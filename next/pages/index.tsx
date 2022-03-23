import type { NextPage } from "next";
import Layout from "sitewide/Layout";
import Link from "next/link";
import { Segment, Header, Icon } from "semantic-ui-react";

const Home: NextPage = () => {
  return (
    <Layout>
      <Segment
        placeholder
        style={{
          backgroundImage: "url('/waves-1817646.jpg')",
          backgroundSize: "cover",
          
        }}
      >
        <Header size="huge" textAlign="center">
          <h1 style={{ fontSize: "4rem" }}>Web3 Examples!</h1>
        </Header>
      </Segment>
      <h1></h1>
      <h2>What is web3?</h2>
      <p>
        web3 apps use decentralized services, like blockchain, IPFS, local
        storage, bittorrent and peer-2-peer networking to create applications
        that rely less on central servers and central owners.
      </p>
      <h2>List of examples</h2>
      <h3>Web3</h3>
      <ul>
        <li>
          <Link href="/bankaccount">Bank Account</Link> - the bank account
          example is a simple smart contract to which you can deposit and
          withdraw Ether.
        </li>
        <li>
          <Link href="/predictionmarkets">Prediction Markets</Link> - Prediction
          Markerts is a game where you create markets about future outcomes, and
          people bet on whether the outcome will happen or not happen. Inspired
          by <a href="https://manifold.markets">Manifold Markets</a>.
        </li>
        <li>
          <em>Coming soon!</em> - Future Dice - roll a dice at a point in the
          future. Provably fair.
        </li>
      </ul>
      <h3>Other</h3>
      <ul>
        <li>
          <em>Coming soon!</em> - Pools &amp; Market Makers - experiment with
          different types of automated markets, like Uniswap, and get an
          intuition for them.
        </li>
      </ul>
    </Layout>
  );
};

export default Home;
