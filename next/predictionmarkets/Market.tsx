import { formatDistance } from "date-fns";
import { IMarketInfo } from "ethereum/contracts/PredictionMarket";
import React from "react";
import { Button, Card, Grid, Icon, Image } from "semantic-ui-react";
import siteWideData from "sitewide/SiteWideData.json";

export interface Props {
  market: IMarketInfo;
  showResolveButton: boolean;
  onResolveClick: () => void;
  forNarrowWidth: boolean;
}

export default ({
  market,
  showResolveButton,
  onResolveClick,
  forNarrowWidth,
}: Props) => {
  const marketStatusIndicator = (
    <span style={{ color: "green" }}>
      <p
        style={{
          fontSize: market.resolved ? "1em" : "2em",
          lineHeight: "1em",
          margin: "0 0 0.2em 0",
        }}
      >
        {market.resolved ? "RESOLVED" : market.impliedProb1.toFixed(0) + "%"}
      </p>
      {!market.resolved && (
        <p
          style={{
            fontSize: "1em",
            lineHeight: "1em",
            margin: "0",
          }}
        >
          chance
        </p>
      )}
    </span>
  );

  const header = (
    <Grid>
      <Grid.Row columns={forNarrowWidth ? 2 : 3}>
        {forNarrowWidth ? (
          <></>
        ) : (
          <Grid.Column textAlign="center" width={3}>
            <Image
              size="small"
              src={siteWideData.imageHashTemplate.replace(
                "{0}",
                `${market.username}_${market.index}`
              )}
              ui={true}
              circular={true}
            />
          </Grid.Column>
        )}
        <Grid.Column width={forNarrowWidth ? 8 : 10}>{market.title || "Untitled"}</Grid.Column>
        <Grid.Column width={forNarrowWidth ? 8 : 3} textAlign="right">
          {marketStatusIndicator}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );

  return (
    <Card.Group itemsPerRow={1}>
      <Card>
        <Card.Content>
          <Card.Header>{header}</Card.Header>
          <div style={{ marginTop: "1em" }}>
            <Card.Meta>
              <span className="date">By {market.username}</span>
            </Card.Meta>
            <Card.Description>{market.description}</Card.Description>
          </div>
        </Card.Content>
        <Card.Content extra>
          <a
            title="Money bet on market, including market maker"
            style={{ marginRight: "10px" }}
          >
            <Icon name="money" color="yellow" />
            {market.poolsize.toNumTokens(2)}
          </a>
          <a title="Number of bettors, including market maker">
            <Icon name="user" color="brown" />
            {market.uniqueBettors}
          </a>
        </Card.Content>
        <Card.Content extra>
          <Grid>
            <Grid.Row>
              <Grid.Column width={13}>
                <a
                  title={
                    "Created at " +
                    market.timestamp.toLocaleString() +
                    " (your local time)"
                  }
                  style={{ marginRight: "10px" }}
                >
                  <Icon name="clock" color="green" />
                  Created{" "}
                  {formatDistance(new Date(market.timestamp), new Date(), {
                    addSuffix: true,
                  })}
                </a>
                &nbsp; &nbsp;
                <a
                  title={
                    "Closes at " +
                    market.closesAt.toLocaleString() +
                    " (your local time)"
                  }
                >
                  <Icon name="clock" color="black" />
                  Closes{" "}
                  {formatDistance(new Date(market.closesAt), new Date(), {
                    addSuffix: true,
                  })}
                </a>
              </Grid.Column>
              <Grid.Column width={3} textAlign="right">
                {showResolveButton && (
                  <Button size="small" primary onClick={onResolveClick}>
                    RESOLVE
                  </Button>
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>
    </Card.Group>
  );
};
