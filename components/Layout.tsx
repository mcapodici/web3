import React from 'react';

type Props = {
  children?: React.ReactNode;};

const Layout = (props: Props) => {
  return (<div>
    <h1>Header</h1>
    {props.children}
  </div>);
};

export default Layout;