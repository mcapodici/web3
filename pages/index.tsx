import type { NextPage } from 'next'
import Layout from '../components/Layout'
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <Layout>
      <h1>Welcome</h1>
      <span>Welcome to <strong>web3</strong> home, click the examples on the left to try out web 3 examples. Or, try the </span>
      <Link href='/bankaccount'>bank acccout</Link> example to get started.
    </Layout>
  )
}

export default Home
