import React, { useContext } from "react";
import { Container } from "semantic-ui-react";
import { AlertPanel } from "./alerts/AlertPanel";
import { Context } from "./Context";
import Header from "./Header";
import Bar from "./Bar";

interface Props {
  children?: React.ReactNode;
  additionalSegments?:  React.ReactNode[]
}

const Layout = (props: Props) => {
  const { alerts, dismissAlert } = useContext(Context);
  return (
    <Container>
      <Header />
      <Bar additionalSegments={props.additionalSegments} />
      <AlertPanel alerts={alerts} onDismiss={dismissAlert} />
      {props.children}
    </Container>
  );
};

export default Layout;
