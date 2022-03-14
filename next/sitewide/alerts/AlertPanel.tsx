import React from "react";
import { Icon, Loader, Message, Transition } from "semantic-ui-react";

export enum AlertType {
  Positive,
  Neutral,
  Negative,
}

export interface Alert {
  type: AlertType;
  uniqueId: string;
  header: string;
  content: React.ReactNode;
  dismissable: boolean;
  loading: boolean;
}

export interface AlertPanelProps {
  alerts: Alert[];
  onDismiss: (uniqueId: string) => void;
}

export const AlertPanel = ({ alerts, onDismiss }: AlertPanelProps) => {
  const alertsComponents = alerts.map(
    ({ type, uniqueId, header, content, dismissable, loading }) => (
      
      <Message
        icon={loading}
        key={uniqueId}
        positive={type === AlertType.Positive}
        negative={type === AlertType.Negative}
        onDismiss={dismissable ? () => onDismiss(uniqueId) : undefined}
      >
        {loading && <Icon name="circle notched" loading />}
        <Message.Content>
          <Message.Header>{header}</Message.Header>
          {content}
        </Message.Content>
      </Message>
    )
  );

  return (
    <>
      {alertsComponents}
    </>
    // Wanted to wrap this in <Transition.Group as={"span"} duration={500}></Transition.Group> but
    // there seems to be a bug where this stops the icon being in the correct position as it overrides
    // the flexbox.
  );
};
