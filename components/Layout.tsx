import React from "react";
import { Container, Menu } from "semantic-ui-react";
import Header from "./Header";

type Props = {
  children?: React.ReactNode;
};

const Layout = (props: Props) => {
  return (
    <Container>
      <Header/>
      {props.children}
    </Container>
  );
};

export default Layout;
