import { Card, Icon, Image } from "semantic-ui-react";
import siteWideData from 'sitewide/SiteWideData.json'
import { toNumberOfTokens } from "util/BN";

export interface IMarketsProps {
  markets: any[];
}

const Markets = ({ markets }: IMarketsProps) => {
  return (
    <Card.Group itemsPerRow={3}>
      {markets.map((market) => (
        <Card>
          <Image
            src={siteWideData.imageHashTemplate.replace('{0}', `${market.username}_${market.index}`)}
            wrapped
            ui={false}
          />
          <Card.Content>
            <Card.Header>{(market.title || 'Untitled').substring(0,50)}</Card.Header>
            <Card.Meta>
              <span className="date">By {market.username}</span>
            </Card.Meta>
            <Card.Description>
              {(market.description || '').substring(0, 100)}...
            </Card.Description>
          </Card.Content>
          <Card.Content extra>
            <a title="Money bet on market, including market maker">
              <Icon name="money" />
              {toNumberOfTokens(market.poolsize).toString()}
            </a>
            &nbsp;
            &nbsp;
            <a title="Number of bettors, including market maker">
              <Icon name="user" />
              {market.bets.length + 1}
            </a>
          </Card.Content>
        </Card>
      ))}
    </Card.Group>
  );
};

export { Markets };
