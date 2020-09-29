//basics
import React from "react";
import mondaySdk from "monday-sdk-js";
//controls
import { Container, Row, Col, Form, ButtonToolbar, Button, ButtonGroup } from 'react-bootstrap';
import { CirclePicker} from "react-color";

//data
import { KeyChain } from "./KeyChain";

const monday = mondaySdk();

export class General extends React.Component {

  constructor() {
    super();
    //bindings
    this.setPrimary = this.setPrimary.bind(this);
    this.setSecondary = this.setSecondary.bind(this);
    this.setTicketsPerPage = this.setTicketsPerPage(this);
    
    this.state = {
      primary: 'grey',
      secondary: 'grey',
      // ticketsPerPage: 20, /** @TODO Unimplemented feature */
    };
  }

  componentDidMount() {
    this.getAllSettings();
  }

  getAllSettings() {
    Promise.all([
      monday.storage.instance.getItem(KeyChain.Colors.Primary),
      monday.storage.instance.getItem(KeyChain.Colors.Secondary),
      //monday.storage.instance.getItem(KeyChain.PerPage)
    ]).then((res) => {
      const primary = res[0];
      const secondary = res[1];
      //const perPage = res[2];

      this.setState({
        primary: primary.data ? primary.data.value : 'grey',
        secondary: secondary.data ? secondary.data.value : 'grey',
        //ticketsPerPage: res.data ? res.data.value : 20,
      })
    })
  }

  setPrimary(color) {
    const hex = color.hex;
    this.setState({primary: hex});
    monday.storage.instance.setItem(KeyChain.Colors.Primary, hex);
  }

  setSecondary(color) {
    const hex = color.hex;
    this.setState({secondary: hex});
    monday.storage.instance.setItem(KeyChain.Colors.Secondary, hex);
  }

  setTicketsPerPage() {
    /**
     * @TODO
     * Unimplemented feature
     */
  }

  render() {
    return (
      <Container>
        <Col>
          <Row>
            <Col md>
              <Form.Group className="setting-padding">
                <Form.Label>
                  <h3>General Settings</h3>
                </Form.Label>
              </Form.Group>
            </Col>
          </Row>
          <Row className='setting-wrapper'>
            <Col md>
              <Form.Group className='setting-padding'>
                <Form.Label>
                    <div className={'flex'}>                          
                      <span>Primary</span>
                    </div>
                    <div className={'subtext'}>
                      Choose your main theme color
                    </div>
                </Form.Label>
                <CirclePicker onChange={this.setPrimary} color={this.state.primary} />

              </Form.Group>
            </Col>
            <Col md>
              <Form.Group className='setting-padding'>
                <Form.Label>
                  <div className={'flex'}>
                    <span>Secondary</span>
                  </div>
                  <div className={'subtext'}>
                    Choose your accent color
                  </div>
                </Form.Label>
                <CirclePicker onChange={this.setSecondary} color={this.state.secondary}/>
              </Form.Group>
            </Col>
          </Row>
        </Col>
        {/**
        <Row className={'setting-wrapper'}>
          <Col>
            <div className={'bold'}>Ticket List</div>
            <Form.Label>
              <div>Tickets Displayed</div>
              <div className={'subtext'}>Choose the number of tickets to display per page</div>
              <ButtonToolbar>
                <ButtonGroup>
                  <Button variant="secondary">1</Button>
                  <Button variant="secondary">2</Button>
                  <Button variant="secondary">3</Button>
                  <Button variant="secondary">4</Button>
                  <Button variant="secondary">5</Button>
                  <Button variant="secondary">6</Button>
                  <Button variant="secondary">7</Button>
                  <Button variant="secondary">8</Button>
                </ButtonGroup>
              </ButtonToolbar>
            </Form.Label>
          </Col>
        </Row>
         */}
      </Container>
      
    );
  }
}