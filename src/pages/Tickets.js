import LoadingMask from "react-loadingmask";
import React from "react";
import { Link } from 'react-router-dom';
import mondaySdk from "monday-sdk-js";

import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import ticketBooth from "./images/TicketBooth.gif";

const monday = mondaySdk();
const TicketBoothLogo = <img src={ticketBooth} alt="Ticket Booth Logo"/>


class Tickets extends React.Component {

  constructor(props) {
    super(props);

    // Default state
    this.state = {
      loading: true,
      settings: {},
      name: "",
      tickets: [],
    };
  }


  componentDidMount() {
    // TODO: set up event listeners
    monday.listen("settings", settings => {
      this.setState({
        id_column_key: (settings.data.id_column) ? (Object.keys(settings.data.id_column)[0]) : '',
        status_column_key: (settings.data.status_column) ? (Object.keys(settings.data.status_column)[0]) : '',
        subheading_column_key: (settings.data.subheading_column) ? (Object.keys(settings.data.subheading_column)[0]) : '',
        client_email_column_key: (settings.data.client_email_column) ? (Object.keys(settings.data.client_email_column)[0]) : '',
      })
    })

    monday.listen("context", res => {
      this.setState({
        context: res.data
      });
      monday.get("settings").then(settings => {
        this.setState({
          id_column_key: (settings.data.id_column) ? (Object.keys(settings.data.id_column)[0]) : '',
          status_column_key: (settings.data.status_column) ? (Object.keys(settings.data.status_column)[0]) : '',
          subheading_column_key: (settings.data.subheading_column) ? (Object.keys(settings.data.subheading_column)[0]) : '',
          client_email_column_key: (settings.data.client_email_column) ? (Object.keys(settings.data.client_email_column)[0]) : '',
        })
        monday.api(`query ($boardIds: [Int]) { boards (ids:$boardIds) { name items() { id name created_at creator { photo_thumb_small } column_values { id title text additional_info } } } }`, {
            variables: {
                boardIds: this.state.context.boardIds
            }
        }).then(res => {
            this.setState({
                tickets: res.data.boards[0].items,
                loading: false
            });
        });
      });
    })
  }

  dateHandler(dateString) {
    const dateObject = new Date(dateString);
    var options = {year: 'numeric', month: 'long', day: 'numeric'};
    const formattedString = dateObject.toLocaleString("en-US", options);
    return formattedString;
  }

  render() {
    const tickets = this.state.tickets;
    const subheading_column_key = this.state.subheading_column_key;
    const status_column_key = this.state.status_column_key;
    const id_column_key = this.state.id_column_key;
    const client_email_column_key = this.state.client_email_column_key;
    
    if (tickets.length) {
      console.log(JSON.parse(tickets[0].column_values.find(x => x.id === status_column_key)?.additional_info).color);
    }

    return (
      <>
        <LoadingMask loading={this.state.loading} indicator={TicketBoothLogo} style={{height:"100vh", width:"100%", display:(this.state.loading ? "block" : "none")}}>
        </LoadingMask>
        <div>
        <Card style={{marginLeft: "24px", marginRight: "24px", marginBottom: "-24px", marginTop: "12px", border:"none", display: (this.state.loading ? "none" : "block")}}>
          <Container fluid>
            <Row className="text-muted align-items-center">
            <Col sm={1} md={1} lg={1}><p><small style={{textAlign:"center"}}><strong>Creator</strong></small></p></Col>
            <Col sm={4} md={4} lg={4}><p><small style={{textAlign:"center"}}><strong></strong></small></p></Col>
            <Col sm={3} md={3} lg={3}><p style={{textAlign:"center", width:"60%"}}><small><strong>Status</strong></small></p></Col>
            <Col sm={2} md={2} lg={2}><p><small style={{textAlign:"center"}}><strong>Created at</strong></small></p></Col>
            <Col sm={2} md={2} lg={2}><p><small style={{textAlign:"center"}}><strong></strong></small></p></Col>
            </Row>
          </Container>
        </Card>
          {tickets.map((item) => (
            <Card border="light" key={item.id} className="list-card">
              <Card.Body>
                  <Container fluid>
                      <Row className="align-items-center">
                        <Col sm={1} md={1} lg={1}>
                          <Image src={item?.creator?.photo_thumb_small} roundedCircle fluid style={{marginRight:"8px"}}/>
                        </Col>
                        <Col sm={4} md={4} lg={4}>
                        <Container>
                        <Row>
                            <Card.Title>
                              {item.name}
                            </Card.Title>
                          </Row>
                          <Row>
                              <Card.Subtitle className="text-muted">
                                {(item.column_values.find(x => x.id === subheading_column_key)?.text) || ''}
                              </Card.Subtitle>
                          </Row>
                        </Container>
                          
                        </Col>
                        <Col sm={3} md={3} lg={3}>
                          <div className="status-box" style={{backgroundColor: (JSON.parse(item.column_values.find(x => x.id === status_column_key)?.additional_info)?.color) || '' }}>
                            {(item.column_values.find(x => x.id === status_column_key)?.text) || 'Status N/A'}
                          </div>
                        </Col>
                        <Col sm={2} md={2} lg={2}>
                          {this.dateHandler(item.created_at)}
                        </Col>
                        <Col sm={2} md={2} lg={2}>
                          <Container>
                          <Row className="align-items-center">
                            <Link to={{pathname: `/details/${item.id}`, data: {ticket: item, settings: {subheading_column_key: subheading_column_key, client_email_column_key: client_email_column_key}}}}>
                            <button className="btn btn-primary" style={{margin:"8px"}}>View</button>
                            </Link>
                          </Row>
                          <Row className="align-items-center">
                            <p style={{color:"lightgrey",}}>
                              ID#: {(item.column_values.find(x => x.id === id_column_key)?.text) || ''}
                            </p>
                          </Row>

                          </Container>
                        </Col>
                      </Row>
                  </Container>
              </Card.Body>
            </Card>
          ))} 
      </div>
      </>
    );
  }
}

export default Tickets;