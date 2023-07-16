import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import EventNote from './EventNote';
import Profile from './Profile';
import EventProfile from './EventProfile';

const Event = (props) => {
  const event = props.event;
  console.log('event', event);

  switch (event.kind) {
    case 0:
      return <EventProfile event={event} />;
    case 1:
      return <EventNote event={event} />;
    default:
      return (
        <Container className="ps-0 pe-0">
          <Profile profile={event.author} pubkey={event.pubkey} />
          <Row>
            <Col xs={12}>
              <p>
                {event.content.length > 1000
                  ? event.content.substring(0, 1000) + '...'
                  : event.content}
              </p>
            </Col>
            <Col xs={12}>
              <small className="text-muted">
                Id: <b>{event.id}</b>
                <span className="ms-2">
                  Kind: <b>{event.kind}</b>
                </span>
              </small>
            </Col>
            <Col xs={12}>
              <small className="text-muted">
                {new Date(event.created_at * 1000).toLocaleString()}
              </small>
            </Col>
          </Row>
        </Container>
      );
  }
};

export default Event;
