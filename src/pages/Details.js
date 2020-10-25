import React from "react";
import mondaySdk from "monday-sdk-js";
//controls
import LoadingMask from "react-loadingmask";
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Image } from 'react-bootstrap';
import CKEditor from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic/build/ckeditor";
import { GrAttachment, GrEmoji } from "react-icons/gr";
//styles
import './Details.scss';
//data
import { KeyChain } from "./settings/KeyChain";

const monday = mondaySdk();
const Handlebars = require('handlebars');

const editorConfiguration = {
  toolbar: {
    items: [
      'underline',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      'blockQuote',
      'insertTable',
      'undo',
      'redo',
      'alignment'
    ]
  },
  language: 'en',
  image: {
    toolbar: [
      'imageTextAlternative',
      'imageStyle:full',
      'imageStyle:side'
    ]
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  },
  licenseKey: '',
  
};

class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        ticket_data: this.props.location.data?.ticket,
        field_values: [],
        fields_selected: [],
        client_emails: null,
        ticket_address: null,
        user: null,
        slug: null,
        settings: this.props.location.data?.settings,
        updates: [],
        outerLoading: true,
        updateLoading:false,
        rightOpen: true,
        emailFooter: ''
    }

    this.textEditor = React.createRef();
  }

  componentDidMount() {
    monday.listen("context", res => {
      this.setState({context: res.data});
      monday.api(`query { me { id birthday country_code created_at email enabled id is_guest is_pending is_view_only join_date location mobile_phone name phone photo_original photo_small photo_thumb photo_thumb_small photo_tiny teams { name } time_zone_identifier title url utc_hours_diff account { slug } } items(ids: ${this.state.ticket_data?.id}) { id name created_at creator { photo_thumb_small } column_values { id title text } updates { id created_at text_body body creator { id name photo_thumb_small } } } } `)
      .then(res => {
        this.setState({
            ticket_data: res.data.items[0],
            updates: res.data.items[0].updates, 
            client_emails: res.data.items[0].column_values.find(x => x.id === this.state.settings.client_email_column_key)?.text, 
            ticket_address: `pulse-${this.state.ticket_data.id}@${res.data.me.account?.slug}.monday.com`, 
            user: res.data.me,
            outerLoading: false,
            slug: res.data.me.account?.slug,
          }, function() {
            Promise.all([
              monday.storage.instance.getItem(KeyChain.EmailFooter),
            ]).then(allPromises => {
                const storedEmailFooter =  allPromises[0].data.value ? allPromises[0].data.value : '' ;
                const templateFooter = Handlebars.compile(storedEmailFooter);
                console.log(storedEmailFooter);
                const compiledFooter = templateFooter(this.state.user);
                console.log(compiledFooter);
                this.setState({
                    emailFooter: compiledFooter
                }, function() {
                  this.setState({updates: this.state.updates?.reverse()})
                  this.parseSidebarSettings();
                })
            })
          });
      });
    })
    monday.listen("events", res => {
      this.setState({context: res.data});
      monday.api(`query { me { id birthday country_code created_at email enabled id is_guest is_pending is_view_only join_date location mobile_phone name phone photo_original photo_small photo_thumb photo_thumb_small photo_tiny teams { name } time_zone_identifier title url utc_hours_diff account { slug } } items(ids: ${this.state.ticket_data?.id}) { id name created_at creator { photo_thumb_small } column_values { id title text } updates { id created_at text_body body creator { id name photo_thumb_small } } } } `)
      .then(res => {
        this.setState({
            ticket_data: res.data.items[0],
            updates: res.data.items[0].updates, 
            client_emails: res.data.items[0].column_values.find(x => x.id === this.state.settings.client_email_column_key)?.text, 
            ticket_address: `pulse-${this.state.ticket_data.id}@${res.data.me.account?.slug}.monday.com`, 
            user: res.data.me,
            outerLoading: false,
            slug: res.data.me.account?.slug,
          }, function() {
            Promise.all([
              monday.storage.instance.getItem(KeyChain.EmailFooter),
            ]).then(allPromises => {
                const storedEmailFooter =  allPromises[0].data.value ? allPromises[0].data.value : '' ;
                const templateFooter = Handlebars.compile(storedEmailFooter);
                const compiledFooter = templateFooter(this.state.user);
                this.setState({
                    emailFooter: compiledFooter
                }, function() {
                  this.setState({updates: this.state.updates?.reverse()})
                  this.parseSidebarSettings();
                })
            })
          });
      });
    })
  }

  parseSidebarSettings = function() {
    const settings = this.state.settings;
    const ticketColumnValues = this.state.ticket_data.column_values;
    var parsedValues = [];

    this.setState({field_values: [], fields_selected: []});

    if (settings?.details_fields == null) {
      parsedValues = ticketColumnValues;
    } else if ((settings?.details_fields).length > 0) {
      let z = settings?.details_fields?.forEach(function(entry) {
        const match = ticketColumnValues.find(column => column.id === entry) || null;
        if (match) {
          parsedValues.push(match);
        }
        return null;
      });
      if(parsedValues.length > 0) {
        this.setState({field_values: parsedValues});
      }
    } else {
      this.setState({field_values: ticketColumnValues.column_values});
    }
    if (this.state.field_values.length === 0) {
      this.setState({field_values: ticketColumnValues.column_values});
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
    var update_string = this.textEditor.getData();
    this.textEditor.setData('');

    if(audience==="internal") {
      update_string = update_string.concat("<br><br>[Internal]");
    } else if (audience==="client") {
      update_string = update_string.concat("<br><br>[Client]");
      update_string = update_string.concat(this.state.emailFooter);
    }
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
          creator: this.state.user.name, 
          update_body: update_string, 
          ticket_address: this.state.ticket_address,
          ticket_slug: this.state.slug,
          ticket_id: this.state.ticket_data.id,
          ticket_name: this.state.ticket_data.name,
          creator_address: this.state.user.email
        });

        var requestOptions = {
          method: 'POST',
          headers: {"Content-Type": "application/json"},
          body: raw,
          redirect: 'follow',
          mode: 'cors'
        };

        fetch("https://api.carbonweb.co/send", requestOptions)
        .then(response => response.json())
        .then(json => {
          if (!json.tokenCheck.data.token) {
            monday.execute("confirm", {
              message: "Your email request has been received. However, because a token was not found for your Monday Account, an update may not get published to the ticket when your client writes back. Please set your Email API Token from TicketBooth Settings.", 
              confirmButton: "Understood!", 
              excludeCancelButton: true
            }).then((res) => {
              // {"confirm": true}
            });
          }
        })
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
    const subheading_column_key = this.state.settings?.subheading_column_key;
    const updates = this.state.updates;
    let rightOpen = this.state.rightOpen ? 'open' : 'closed';
    
    return (
      <>
        <div id='layout'>
          <div id='main'>
            <div className='header'>
              <Card
                style={{
                  marginLeft: '24px',
                  marginRight: '24px',
                  marginBottom: '12px',
                  marginTop: '12px',
                  border: 'none',
                  borderBottom: '1px solid lightgray',
                  paddingBottom: '12px',
                }}>
                <Container fluid>
                  <Row className='align-items-center'>
                    <Col sm={1} md={1} lg={1}>
                      <Image
                        src={ticket?.creator?.photo_thumb_small}
                        roundedCircle
                        fluid
                      />
                    </Col>
                    <Col sm={9} md={9} lg={9}>
                      <Row>
                        <h4>{ticket?.name}</h4>
                      </Row>
                      <Row className='text-muted'>
                        <small>
                          {ticket?.column_values.find(
                            (x) =>
                              x.id === subheading_column_key
                          )?.text || ''}
                        </small>
                      </Row>
                    </Col>
                    <Col sm={2} md={2} lg={2}>
                      <Link to='/tickets'>
                        <button
                          className='btn btn-primary float-right'
                          style={{ margin: '36px' }}>
                          Back
                        </button>{' '}
                      </Link>
                    </Col>
                  </Row>
                </Container>
              </Card>
            </div>
            <div className='content'>
              <LoadingMask
                loading={this.state.outerLoading}
                text={'loading...'}
                style={{
                  height: '100%',
                  width: '100%',
                  display: this.state.outerLoading ? 'block' : 'none',
                }}
              />
              {updates?.map((update) => (
                <Card
                  id='updatecard'
                  style={{
                    borderTopColor: update?.body.includes('[Client]')
                      ? '#7854cc'
                      : update?.body.includes('[Internal]')
                      ? 'red'
                      : 'none',
                  }}
                  key={update.id}>
                  <Card.Body>
                    <Container fluid>
                      <Row className='align-items-center'>
                        <Col sm={1} md={1} lg={1}>
                          <Image
                            src={
                              update.creator.photo_thumb_small
                            }
                            roundedCircle
                            fluid
                            style={{ marginRight: '8px' }}
                          />
                        </Col>
                        <Col>
                          <Row>{update.creator.name}</Row>
                          <Row className='text-muted'>
                            {this.dateHandler(
                              update.created_at
                            )}
                          </Row>
                        </Col>
                      </Row>
                    </Container>
                  </Card.Body>
                  <Card.Body>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: update.body,
                      }}
                    />
                  </Card.Body>
                </Card>
              ))}
            </div>
            <div className='footer'>
              <Container fluid>
                <Row>
                  <Col>

                    <div tag="texteditor" style={{ paddingTop: "30px" }} key={ticket?.id}>
                      <CKEditor
                        editor={ClassicEditor}
                        data=""
                        config={editorConfiguration}

                        onInit={(editor) => {
                          // Attaching React.ref to editor
                          this.textEditor = editor;
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between"
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between"
                          }}
                        >
                          <p style={{ padding: 5, color: "#2b99ff" }}><GrAttachment/> Add File</p>
                          <p style={{ padding: 5, color: "#2b99ff" }}>GIF</p>
                          <p style={{ padding: 5, color: "#2b99ff" }}><GrEmoji/> Emoji</p>
                          <p style={{ padding: 5, color: "#2b99ff" }}>@Mention</p>
                        </div>
                        <div>
                          <button
                            className='btn btn-primary'
                            style={{ margin: '8px' }}
                            onClick={() => this.postUpdate('client')}
                            disabled={this.state.updateLoading}>
                            Email
                          </button>
                          <button
                            className='btn btn-secondary'
                            style={{ margin: '8px' }}
                            onClick={() => this.postUpdate('internal')}
                            disabled={this.state.updateLoading}>
                            Note
                          </button>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Container>
            </div>
          </div>
      
          <div id='right' className={`${rightOpen}`}>
            <div className={`icon ${rightOpen}`} onClick={this.toggleSidebar}>
              &equiv;
            </div>
            <div className={`sidebar ${rightOpen}`}>
              <Card id='rightbar'>
                <div className='header'>
                  <h5 className={` title ${'right-' + rightOpen}`}>
                    <Card id='rightcardheading'>Ticket Details</Card>
                  </h5>
                </div>
                <div className='sidebar-content'>
                  <Card style={{ border: 'none' }}>
                    <Container fluid>
                      {this.state.field_values?.map((item) => (
                        <Row style={{ marginBottom: '8px' }} key={item.title}>
                          <Col>
                            <strong>{item.title}:</strong>
                          </Col>
                          <Col>{item.text}</Col>
                        </Row>
                      ))}
                    </Container>
                  </Card>
      
                  <Card.Body>
                    <Card
                      style={{
                        marginLeft: '-10px',
                        marginRight: '-10px',
                        paddingTop: '12px',
                        border: 'none',
                      }}>
                      <p>
                        <strong>Created At:</strong>{' '}
                        {this.dateHandler(ticket?.created_at)}
                      </p>
                    </Card>
                    <Row style={{ justifyContent: 'center' }}>
                      <button
                        className='btn btn-primary'
                        style={{ margin: '16px' }}
                        onClick={() => this.editDetails()}>
                        Edit
                      </button>
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