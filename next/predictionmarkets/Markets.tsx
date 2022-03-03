import { Card, Icon, Image } from "semantic-ui-react";
import siteWideData from "sitewide/SiteWideData.json";
import { toNumberOfTokens } from "util/BN";
import { formatDistance } from "date-fns";

export interface IMarketsProps {
  markets: any[];
}

const Markets = ({ markets }: IMarketsProps) => {
  return (
    <Card.Group itemsPerRow={2}>
      {markets
        .slice()
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .map((market) => (
          <Card>
            <Card.Content>
              <Card.Header>
                <Image
                  floated="left"
                  size="small"
                  src={siteWideData.imageHashTemplate.replace(
                    "{0}",
                    `${market.username}_${market.index}`
                  )}
                  ui={true}
                  circular={true}
                />
                {(market.title || "Untitled").substring(0, 50)}
              </Card.Header>
              <div>
                <Card.Meta>
                  <span className="date">By {market.username}</span>
                </Card.Meta>
                <Card.Description>
                  {(market.description || "").substring(0, 100)}...
                </Card.Description>
              </div>
            </Card.Content>
            <Card.Content extra>
              <a title="Money bet on market, including market maker" style={{marginRight:'10px'}}>
                <Icon name="money" color="yellow" />
                {toNumberOfTokens(market.poolsize).toString()}
              </a>
              <a title="Number of bettors, including market maker">
                <Icon name="user" color="brown" />
                {market.bets.length + 1}
              </a>
            </Card.Content>
            <Card.Content extra>
              <a title={"Created at " + market.timestamp.toLocaleString() + " (your local time)" } style={{marginRight:'10px'}}>
                <Icon name="clock" color="green" />
                {formatDistance(new Date(market.timestamp), new Date(), {
                  addSuffix: true,
                })}
              </a>
              &nbsp; &nbsp;
              <a title={"Closes at " + market.closesAt.toLocaleString() + " (your local time)"}>
                <Icon name="clock" color="black" />
                {formatDistance(new Date(market.closesAt), new Date(), {
                  addSuffix: true,
                })}
              </a>
            </Card.Content>
          </Card>
        ))}
    </Card.Group>
  );
};

export { Markets };
