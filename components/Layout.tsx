import React from 'react';
import { Container } from 'semantic-ui-react';

type Props = {
  children?: React.ReactNode;};

const Layout = (props: Props) => {
  return (<Container>
    <h1>Header</h1>
    {props.children}
  </Container>);
};

export default Layout;