import LoadingMask from "react-loadingmask";
import React from "react";
import { Link } from 'react-router-dom';
import mondaySdk from "monday-sdk-js";

import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import './Details.scss';

const monday = mondaySdk();

class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        ticket_data: this.props.location.data?.ticket,
        subheading_column_key: this.props.location.data?.settings.subheading_column_key,
        client_email_column_key: this.props.location.data?.settings.client_email_column_key,
        updates: [],
        client_emails: null,
        reply_to_email: null,
        username: null,
        settings: null,
        field_values: [],
        fields_selected: [],
        outerLoading: true,
        updateLoading:false,
        rightOpen: true,
    }

    this.form = React.createRef();
    this.updateTextField = React.createRef();
  }

  componentDidMount() {
    // TODO: set up event listeners
    monday.listen("settings", data => {  
      this.setState({settings: data});
      this.parseSidebarSettings();
    })
    monday.listen("context", res => {
      this.setState({context: res.data});
      monday.api(`query { me { name account { slug } } items(ids: ${this.state.ticket_data.id}) { id name created_at creator { photo_thumb_small } column_values { id title text } updates { id created_at text_body body creator { id name photo_thumb_small } } } }`)
      .then(res => {
        this.setState({
            ticket_data: res.data.items[0],
            updates: res.data.items[0].updates, 
            client_emails: res.data.items[0].column_values.find(x => x.id === this.state.client_email_column_key)?.text, 
            reply_to_email: `pulse-${this.state.ticket_data.id}@${res.data.me.account?.slug}.monday.com`, 
            username: res.data.me.name, 
            outerLoading: false
          });
        this.setState({updates: this.state.updates?.reverse()})
        this.parseSidebarSettings();
      });
    })
    monday.listen("events", res => {
      this.setState({context: res.data});
      monday.api(`query { me { name account { slug } } items(ids: ${this.state.ticket_data.id}) { id name created_at creator { photo_thumb_small } column_values { id title text } updates { id created_at text_body body creator { id name photo_thumb_small } } } }`)
      .then(res => {
        this.setState({
            ticket_data: res.data.items[0],
            updates: res.data.items[0].updates, 
            client_emails: res.data.items[0].column_values.find(x => x.id === this.state.client_email_column_key)?.text, 
            reply_to_email: `pulse-${this.state.ticket_data.id}@${res.data.me.account?.slug}.monday.com`, 
            username: res.data.me.name, 
            outerLoading: false
          });
          this.setState({updates: this.state.updates?.reverse()})
          this.parseSidebarSettings();
      });
    })
  }

  parseSidebarSettings = function() {
    const settings = this.state.settings;
    this.setState({field_values: [], fields_selected: []});
      if (settings?.data?.details == null) {
        this.setState({field_values: this.state.ticket_data.column_values});
      } else if (settings?.data?.details?.all === true) {
        this.setState({field_values: this.state.ticket_data.column_values});
      } else if (Object.keys(settings?.data?.details).length > 0) {
        delete settings?.data?.details.all;

        var x = [];
        Object.entries(settings?.data?.details).map((entry) => {
          if (entry[1] === true) {
            const y = this.state.ticket_data.column_values.find(z => z.id === entry[0]) || null;
            if (y) {
              x.push(y);
            }
          }
          return null;
        });
        if(x.length > 0) {
          this.setState({field_values: x});
        }
      } else {
        this.setState({field_values: this.state.ticket_data.column_values});
      }
      if (this.state.field_values.length === 0) {
        this.setState({field_values: this.state.ticket_data.column_values});
      }
  }


  toggleSidebar = (event) => {
    let key = `${event.currentTarget.parentNode.id}Open`;
    this.setState({ [key]: !this.state[key] });
  }

  dateHandler(dateString) {
    const dateObject = new Date(dateString);
    var options = { weekday: 'short', year: '2-digit', month: 'short', day: 'numeric', hour: "2-digit", minute: "2-digit"};
    const formattedString = dateObject.toLocaleString("en-US", options);
    return formattedString;
  }

  postUpdate = function (audience) {
    this.setState({updateLoading: true});
    var update_string = this.updateTextField?.current?.value;
    this.form.current.reset();

    if(audience==="internal") {
      update_string = update_string.concat("<br><br>[Internal]");
    } else if (audience==="client") {
      update_string = update_string.concat("<br><br>[Client]");
    }
    update_string = update_string.replace(/\n/g, "<br>")
    monday.api(`mutation { create_update (item_id: ${this.state.ticket_data.id}, body: "${update_string}") { id } }`)
    .then(res => {
      monday.api(`query { items(ids: ${this.state.ticket_data.id}) { name updates { id created_at text_body body creator { id name photo_thumb_small } replies { creator { name } created_at } } } } `
      )
      .then(res => {
        this.setState({updates: res.data.items[0].updates.reverse(), updateLoading: false});
      });
    });
    
    if (audience==="client") {
      if (this.state.client_emails) {
        var raw = JSON.stringify({
          recipient: this.state.client_emails, 
          creator: this.state.username, 
          update_body: update_string, 
          reply_to: this.state.reply_to_email
        });

        var requestOptions = {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: raw,
          redirect: 'follow',
          mode: 'cors'
        };

        fetch("https://api.carbonweb.co/send", requestOptions)
      } else {
        monday.execute("confirm", {
          message: "Client Emails not found. Make sure you have selected a column in this app's settings.", 
          confirmButton: "Understood!", 
          excludeCancelButton: true
        }).then((res) => {
          // {"confirm": true}
        });
      }
    }
  }

  editDetails = function() {
    monday.execute('openItemCard', { itemId: this.state.ticket_data.id });
  }

  render() {
    const ticket = this.state.ticket_data;
    const subheading_column_key = this.state.subheading_column_key;
    const updates = this.state.updates;
    let rightOpen = this.state.rightOpen ? 'open' : 'closed';
    return (<>
      <div id='layout'>
          <div id='main'>
              <div className='header'>
              <Card style={{marginLeft: "24px", marginRight: "24px", marginBottom: "12px", marginTop: "12px", border:"none", borderBottom: "1px solid lightgray", paddingBottom: "12px"}}>
                <Container fluid>
                  <Row className="align-items-center">
                  <Col sm={1} md={1} lg={1}>
                  <Image src={ticket?.creator?.photo_thumb_small} roundedCircle fluid/>
                  </Col>
                  <Col sm={9} md={9} lg={9}>
                    <Row>
                    <h4>{ticket?.name}</h4>
                    </Row>
                    <Row className="text-muted">
                    <small>{(ticket?.column_values.find(x => x.id === subheading_column_key)?.text) || ''}</small>
                    </Row>
                  </Col>
                  <Col sm={2} md={2} lg={2}>
                    <Link to="/tickets"><button className="btn btn-primary float-right" style={{margin:"36px"}}>Back</button>{' '}</Link>
                  </Col>
                  </Row>
                </Container>
              </Card>
              </div>
              <div className='content'>
                <LoadingMask loading={this.state.outerLoading} text={"loading..."}  style={{height:"100%", width:"100%", display:(this.state.outerLoading ? "block" : "none")}}/>
                {updates?.map((update) => (
                  <Card style={{marginBottom:"16px", marginRight: "0px", marginLeft: "8px", borderTopWidth:"2px", borderTopStyle:"solid", borderTopColor:((update?.body.includes("[Client]")? "#7854cc" : "red"))}} key={update.id}>
                  <Card.Body>
                      <Container fluid>
                          <Row className="align-items-center">
                            <Col sm={1} md={1} lg={1}>
                            <Image src={update.creator.photo_thumb_small} roundedCircle fluid style={{marginRight:"8px"}}/>
                            </Col>
                            <Col>
                            <Row>{update.creator.name}</Row>
                            <Row className="text-muted">{this.dateHandler(update.created_at)}</Row>
                            </Col>
                          </Row>
                      </Container>
                  </Card.Body>
                  <Card.Body>
                    <div dangerouslySetInnerHTML={{ __html: update.body }} />
                  </Card.Body>
                </Card>        
                ))}
              </div>
              <div className='footer'>
              <Container fluid>
                <Row>
                  <Col>
                    <Form style={{margin:"8px"}} key={ticket?.id} ref={this.form}>
                      <Form.Group controlId="formBasicEmail">
                        <Form.Control as="textarea" placeholder="Write an update..." ref={this.updateTextField}/>
                      </Form.Group>
                    </Form>
                  </Col>
                  </Row>
                  <Row>
                    <Col></Col>
                  <Col sm="auto" md="auto" lg="auto">
                  <button className="btn btn-primary" style={{margin:"8px"}} onClick={() => this.postUpdate("client")} disabled={this.state.updateLoading}>Email</button>
                  <button className="btn btn-secondary" style={{margin:"8px"}} onClick={() => this.postUpdate("internal")} disabled={this.state.updateLoading}>Note</button>
                  </Col>
                </Row>
              </Container>
              </div>

          </div>

          <div id='right' className={`${rightOpen}`}>
            <div className={`icon ${rightOpen}`} onClick={this.toggleSidebar}>&equiv;</div>
            <div className={`sidebar ${rightOpen}`}>
            <Card id="rightbar" style={{ borderRadius: "12px", margin: "12px", boxShadow:"0px 0px 9px 3px rgba(200,200,200,0.5)"}} >
              <div className='header'>
                <h5 className={` title ${'right-' + rightOpen}`}>
                  <Card style={{marginLeft: "12px", marginRight: "12px", marginBottom: "12px", marginTop: "24px", border:"none", borderBottom: "1px solid lightgray", paddingBottom: "24px", textAlign: "center"}}>
                      Ticket Details
                  </Card>
                </h5>
              </div>
              <div className='sidebar-content'>
              <Card style={{border:"none"}}>
                <Container fluid>
                  {this.state.field_values.map((item) => (
                    <Row style={{marginBottom:"8px"}}>
                      <Col>
                        <strong>{item.title}:</strong>
                      </Col>
                      <Col>
                        {item.text}
                      </Col>
                    </Row>
                  ))}
                </Container>
              </Card>

              <Card.Body>
                <Card style={{marginLeft: "-10px", marginRight: "-10px", paddingTop: "12px", border:"none"}}>
                      <p><strong>Created At:</strong> {this.dateHandler(ticket?.created_at)}</p>
                </Card>
                <Row style={{justifyContent: 'center'}}>
                  <button className="btn btn-primary" style={{margin:"16px"}} onClick={() => this.editDetails()}>Edit</button>
                </Row>
              </Card.Body>  
              </div>
              </Card>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Details;