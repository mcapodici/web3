import { Card, Icon, Image } from "semantic-ui-react";

export interface IMarketsProps {
  markets: any[];
}

const Markets = ({ markets }: IMarketsProps) => {
  return (
    <Card.Group>
      {markets.map((market) => (
        <Card>
          <Image
            src={`https://robohash.org/${market.username}_${market.index}`}
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
            <a>
              <Icon name="user" />
              22 Friends
            </a>
          </Card.Content>
        </Card>
      ))}
    </Card.Group>
  );
};

export { Markets };
