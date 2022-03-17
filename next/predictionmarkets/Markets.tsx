import { Card, Icon, Image } from "semantic-ui-react";
import siteWideData from "sitewide/SiteWideData.json";
import { format, formatDistance } from "date-fns";
import Link from "next/link";
import { IMarketInfo } from "ethereum/contracts/PredictionMarket";
import { TruncateAndEllipse } from "util/String";

export interface IMarketsProps {
  markets: IMarketInfo[];
}

const Markets = ({ markets }: IMarketsProps) => {
  return (
    <Card.Group stackable itemsPerRow={2}>
      {markets
        .map((market) => (
          <Card key={market.useraddress + '_' + market.index}>
            <Card.Content>
              <Card.Header>
                <Link
                  href={`/predictionmarkets/markets/${market.useraddress}/${market.index}`}
                >
                  <a>
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
                    {TruncateAndEllipse(market.title || "Untitled", 100)}
                  </a>
                </Link>
              </Card.Header>
              <div>
                <Card.Meta>
                  <span className="date">By <a href={"/predictionmarkets/users/" + market.username}>
                    {market.username}</a></span>
                </Card.Meta>
                <Card.Description>
                  {TruncateAndEllipse(market.description || "", 100)}
                </Card.Description>
              </div>
            </Card.Content>
            <Card.Content extra>
              <a
                title="Money bet on market, including market maker"
                style={{ marginRight: "10px" }}
              >
                <Icon name="money" color="yellow" />
                {market.poolsize.toNumTokens(0)}
              </a>
              <a title="Number of bettors, including market maker">
                <Icon name="user" color="brown" />
                {market.uniqueBettors}
              </a>
            </Card.Content>
            <Card.Content extra>
              <span
                title={
                  format(market.timestamp, "yyyy-MM-dd HH:mm:ss") // This is in browser time zone
                }
                style={{ marginRight: "10px" }}
              >
                <Icon name="clock" color="green" />
                {formatDistance(new Date(market.timestamp), new Date(), {
                  addSuffix: true,
                })}
              </span>
              &nbsp; &nbsp;
              <span
                title={
                  format(market.closesAt, "yyyy-MM-dd HH:mm:ss") // This is in browser time zone
                }
              >
                <Icon name="clock" color="black" />
                {formatDistance(new Date(market.closesAt), new Date(), {
                  addSuffix: true,
                })}
              </span>
            </Card.Content>
          </Card>
        ))}
    </Card.Group>
  );
};

export { Markets };
