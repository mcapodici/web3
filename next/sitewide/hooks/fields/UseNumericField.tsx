import { useState } from "react";
import { Form } from "semantic-ui-react";

export function useNumericField(
  fieldNameForDisplay: string,
  isRequired: boolean,
  numericValidation: (n: number) => string | undefined,
  initialText: string,
  maxLength: number,
  placeHolder: string
) {
  const [fieldText, setFieldText] = useState(initialText);
  const [showErrorOnField, setShowErrorOnField] = useState(false);

  const asNumber = Number(fieldText);

  const fieldInvalidReason =
    fieldText === ""
      ? isRequired
        ? `${fieldNameForDisplay} is required`
        : undefined
      : !Number.isFinite(asNumber)
      ? `${fieldNameForDisplay} is not a valid number`
      : numericValidation(asNumber);

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
      onChange={(event, data) => {
        setFieldText(data.value);
        setShowErrorOnField(true);
      }}
    />
  );

  const isValid = !fieldInvalidReason;
  return {
    node,
    asNumber: isValid ? asNumber : undefined,
    isValid,
    reset: () => {
      setFieldText(initialText);
      setShowErrorOnField(false);
    },
  };
}
