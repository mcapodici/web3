import type { NextPage } from "next";
import Layout from "components/Layout";
import { Form, Input, Button, Table } from "semantic-ui-react";
import { HasEthereumProviderProps } from "ethereum/ethereumProvider";

const Home: NextPage<HasEthereumProviderProps> = ({ethereumProviderStatus}) => {
  return (
    <Layout ethereumProviderStatus={ethereumProviderStatus}>
      <h1>Bank Account</h1>
      <p>
        The bank account example is a simple smart contract to which you can
        deposit and withdraw Ether. A contract is deployed per bank account, and
        that bank account will only allow withdrawals to the creator of the
        contract. Anyone can deposit Ether.
      </p>
      <h2>Your bank accounts</h2>
      <p>
        Here is a list of bank accounts connected to your current metamask
        address "XYZ"
      </p>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Cell>Contract Address</Table.Cell>
            <Table.Cell>Balance (Ether)</Table.Cell>
            <Table.Cell>Actions</Table.Cell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>0x0883</Table.Cell>
            <Table.Cell>0.01</Table.Cell>
            <Table.Cell>
              <Button primary>
                Deposit
              </Button>
              <Button primary>
                Withdraw
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <h2>Create bank accounts</h2>
      <p>
        You can create a bank account here. The initial deposit can be zero, if
        you like.
      </p>
      <Form>
        <Form.Field>
          <label>Initial Deposit (Ether)</label>
          <Input type="number" />
        </Form.Field>
        <Button primary>Create Account</Button>
      </Form>
    </Layout>
  );
};

export default Home;
