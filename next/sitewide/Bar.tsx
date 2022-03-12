import React, { useContext } from "react";
import { Grid, Icon, Menu, Segment } from "semantic-ui-react";
import ShortAddressWithLink from "./ShortAddressWithLink";
import { Context } from "./Context";
import NotConnectedReason from "./NotConnectedReason";

export interface BarProps {
  additionalSegments?: React.ReactNode[];
}

const Bar = ({ additionalSegments }: BarProps) => {
  const { web3Status } = useContext(Context);

  function notConnectedReasonText(notConnectedReason: NotConnectedReason) {
    switch (notConnectedReason) {
      case NotConnectedReason.NotChecked:
        return "Checking provider...";
      case NotConnectedReason.NoProvider:
        return "Ethereum plugin is required";
      case NotConnectedReason.NotConnected:
        return "Ethereum plugin not connected";
      case NotConnectedReason.WrongNetwork:
        return "Please use Rinkby testnet";
    }
  }

  const enabled = web3Status.type === "enabled";
  const color = enabled ? "darkgreen" : "grey";
  const info =
    web3Status.type === "enabled" ? (
      <>
        <ShortAddressWithLink address={web3Status.firstAccount} />
      </>
    ) : (
      <>{notConnectedReasonText(web3Status.notConnectedReason)}</>
    );

  return (
    <Segment>
      <Grid
        columns={(1 + (additionalSegments?.length || 0)) as any}
        stackable
        textAlign="center"
      >
        <Grid.Row verticalAlign="middle">
          <Grid.Column>
            <span style={{ color }}>
              <span>
                <Icon name="ethereum" />
                {enabled ? "Connected" : "Not Connected"}
              </span>
              <span style={{ marginLeft: "5px" }}>{info}</span>
            </span>
          </Grid.Column>
          {additionalSegments?.map((s, i) => (
            <Grid.Column key={i}>{s}</Grid.Column>
          ))}
        </Grid.Row>
      </Grid>
    </Segment>
  );
};

export default Bar;
