import React, { useState } from "react";
import { Form, Input, Button } from "semantic-ui-react";

interface CreateBankAccountFormProps {
  creatingBankAccount: boolean;
  createBankAccount: (initialDespoitEther: string) => void;
}

const CreateBankAccountForm = ({
  creatingBankAccount,
  createBankAccount,
}: CreateBankAccountFormProps) => {
  const [initialDespoitEther, setInitialDespoitEther] = useState("");

  return (
    <Form>
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
    </Form>
  );
};

export { CreateBankAccountForm }