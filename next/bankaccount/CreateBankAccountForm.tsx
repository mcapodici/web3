import React, { useState } from "react";
import { Form, Input, Button, Message } from "semantic-ui-react";

interface CreateBankAccountFormProps {
  errorMessage: string | undefined;
  creatingBankAccount: boolean;
  createBankAccount: (initialDespoitEther: string) => void;
}

const CreateBankAccountForm = ({
  errorMessage,
  creatingBankAccount,
  createBankAccount,
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
    </Form>
  );
};

export { CreateBankAccountForm }