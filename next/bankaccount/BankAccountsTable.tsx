import React, { useState } from "react";
import { Button, Pagination, Table } from "semantic-ui-react";
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

const pageSize = 10;

const BankAccountsTable = ({
  bankAccountsDetails,
  onDepositClicked,
  onWithdrawClicked,
}: BankAccountsTableProps) => {

  const [page, setPage] = useState(0);

  if (bankAccountsDetails.length === 0) {
    return <></>;
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;

  const bankAccountsTables = bankAccountsDetails.slice(startIndex, endIndex) .map((account) => (
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

  const numPages = Math.floor((bankAccountsDetails.length - 1) / pageSize) + 1;

  console.log(numPages);
  return (
    <>
      <Pagination
        boundaryRange={0}
        defaultActivePage={1}
        ellipsisItem={null}
        firstItem={null}
        lastItem={null}
        siblingRange={1}
        totalPages={numPages}
        onPageChange={(_, {activePage}) => {setPage(Number(activePage))}}
      />
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
    </>
  );
};

export { BankAccountsTable };
