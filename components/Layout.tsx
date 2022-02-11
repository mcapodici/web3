import React from "react";
import { Container, Grid } from "semantic-ui-react";
import Header from "./Header";
import SideNav from "./Sidenav";

type Props = {
  children?: React.ReactNode;
};

const Layout = (props: Props) => {
  return (
    <Container>
      <Header />
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column width={4}><SideNav/></Grid.Column>
          <Grid.Column width={12}>{props.children}</Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default Layout;
