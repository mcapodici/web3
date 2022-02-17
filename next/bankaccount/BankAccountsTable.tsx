import React from "react";
import { Button, Table } from "semantic-ui-react";
import ShortAddressWithLink from "sitewide/ShortAddressWithLink";

export interface IBankAccountDetails {
  contractAddress: string;
  balanceEther: string;
}

export interface BankAccountsTableProps {
  bankAccountsDetails: IBankAccountDetails[];
  onDepositClicked: (address: string) => void;
  onWithdrawClicked: (address: string) => void;
}

const BankAccountsTable = ({
  bankAccountsDetails,
  onDepositClicked,
  onWithdrawClicked,
}: BankAccountsTableProps) => {
  const bankAccountsTables = bankAccountsDetails.map((account) => (
    <Table.Row key={account.contractAddress}>
      <Table.Cell>
        <ShortAddressWithLink address={account.contractAddress} />
      </Table.Cell>
      <Table.Cell>
        {account.balanceEther ? (
          account.balanceEther
        ) : (
          <div className="ui active inline loader"></div>
        )}
      </Table.Cell>
      <Table.Cell>
        <Button
          primary
          onClick={() => onDepositClicked(account.contractAddress)}
        >
          Deposit
        </Button>
        <Button
          primary
          onClick={() => onWithdrawClicked(account.contractAddress)}
        >
          Withdraw
        </Button>
      </Table.Cell>
    </Table.Row>
  ));

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.Cell>Contract Address</Table.Cell>
          <Table.Cell>Balance (Ether)</Table.Cell>
          <Table.Cell>Actions</Table.Cell>
        </Table.Row>
      </Table.Header>

      <Table.Body>{bankAccountsTables}</Table.Body>
    </Table>
  );
};

export { BankAccountsTable };
