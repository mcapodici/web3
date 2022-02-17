import React, { useState } from "react";
import { Form, Input, Button, Message } from "semantic-ui-react";

interface CreateBankAccountFormProps {
  errorMessage: string | undefined;
  creatingBankAccount: boolean;
  createBankAccount: (initialDespoitEther: string) => void;
  createdAccountAddress: string | undefined;
}

const CreateBankAccountForm = ({
  errorMessage,
  creatingBankAccount,
  createBankAccount,
  createdAccountAddress
}: CreateBankAccountFormProps) => {
  const [initialDespoitEther, setInitialDespoitEther] = useState("");

  return (
    <Form error={!!errorMessage}>
      <Form.Field>
        <label>Initial Deposit (Ether)</label>
        <Input
          type="number"
          value={initialDespoitEther}
          onChange={(event) => {
            setInitialDespoitEther(event.target.value);
          }}
        />
      </Form.Field>
      <Button primary loading={creatingBankAccount} onClick={() => createBankAccount(initialDespoitEther)}>
        Create Account
      </Button>
      <Message
        header="Error occured during account creation"
        content={errorMessage}
        error
      />
      {createdAccountAddress && (
        <Message
          positive
          header="Account Created"
          content={`Your bank account has been created. The contract address is ${createdAccountAddress}. It should appear soon in the bank account list above.`}
        />
      )}
    </Form>
  );
};

export { CreateBankAccountForm }