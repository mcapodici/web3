import { useState } from "react";
import { Form } from "semantic-ui-react";

export function useTextField(
  fieldNameForDisplay: string,
  isRequired: boolean,
  validation: (n: string) => string | undefined,
  initialText: string,
  maxLength: number,
  placeHolder: string
) {
  const [fieldText, setFieldText] = useState(initialText);
  const [showErrorOnField, setShowErrorOnField] = useState(false);

  const fieldInvalidReason =
    fieldText === ""
      ? isRequired
        ? `${fieldNameForDisplay} is required`
        : undefined
      :  validation(fieldText);

  const node = (
    <Form.Input
      error={
        fieldInvalidReason && showErrorOnField
          ? {
              content: fieldInvalidReason,
              pointing: "above",
            }
          : undefined
      }
      maxLength={maxLength}
      placeholder={placeHolder}
      value={fieldText}
      onChange={(_, data) => {
        setFieldText(data.value);
        setShowErrorOnField(true);
      }}
    />
  );

  const isValid = !fieldInvalidReason;
  return {
    node,
    value: fieldText ? fieldText : undefined,
    isValid,
    reset: () => {
      setFieldText(initialText);
      setShowErrorOnField(false);
    },
    forceValidation: () => {
      setShowErrorOnField(true);
    }
  };
}
