import React, { useContext } from "react";
import { Container, Grid, Icon, Message } from "semantic-ui-react";
import { Context } from "./Context";
import Header from "./Header";
import SideNav from "./Sidenav";

interface Props {
  children?: React.ReactNode;
}

const Layout = (props: Props) => {
  
  const { web3Status } = useContext(Context);

  return (
    <Container>
      <Header />
      <Grid>
        <Grid.Row columns={2}>
          <Grid.Column width={4}>
            <SideNav />
          </Grid.Column>
          <Grid.Column width={12}>
            {web3Status.type === 'disabled' && (
              <Message icon warning>
                <Icon name="ethereum" />
                <span>
                  <Message.Header>Ethereum Plugin / Extension Required</Message.Header>
                  To use this page, please install{" "}
                  <a href="https://metamask.io/download/">MetaMask</a>, or any
                  other EIP-1193 compatiable Ethereum provider.
                </span>
              </Message>
            )}
            {props.children}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default Layout;
