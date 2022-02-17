import React from "react";
import { Message, Transition } from "semantic-ui-react";

export enum AlertType {
  Positive,
  Neutral,
  Negative,
}

export interface Alert {
  type: AlertType;
  uniqueId: string;
  header: string;
  content: string;
}

export interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (uniqueId: string) => void;
}

export const AlertPanel = ({ alerts, onDismiss }: AlertPanelProps) => {
  const alertsComponents = alerts.map(({ type, uniqueId, header, content }) => (
      <Message
        positive={type === AlertType.Positive}
        negative={type === AlertType.Negative}
        header={header}
        content={content}
        onDismiss={() => onDismiss(uniqueId)}
      />
  ));

  return (
      <Transition.Group
        as={"div"}
        duration={500}
      >
        {alertsComponents}
      </Transition.Group>
  );
};
