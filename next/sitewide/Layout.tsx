import React, { useContext } from "react";
import { Container, Grid, Icon, Message } from "semantic-ui-react";
import { AlertPanel } from "./alerts/AlertPanel";
import { Context } from "./Context";
import Header from "./Header";
import SideNav from "./Sidenav";

interface Props {
  children?: React.ReactNode;
}

const Layout = (props: Props) => {  

  const {alerts, dismissAlert} = useContext(Context);
  return (
    <Container>
      <Header />
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column width={4}>
            <SideNav />
          </Grid.Column>
          <Grid.Column width={12}>
            <AlertPanel alerts={alerts} onDismiss={dismissAlert} />
            {props.children}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default Layout;
