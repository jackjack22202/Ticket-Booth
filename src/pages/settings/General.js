//basics
import React from "react";
import mondaySdk from "monday-sdk-js";
//controls
import { Container, Row, Col, Form, ButtonToolbar, Button, ButtonGroup } from 'react-bootstrap';
import { CirclePicker} from "react-color";
import { CircleSwatch } from 'react-color/lib/components/circle/CircleSwatch';

//data
import { KeyChain } from "./KeyChain";


const monday = mondaySdk();

export class General extends React.Component {

  constructor() {
    super();
    //bindings
    this.setPrimary = this.setPrimary.bind(this);
    this.setSecondary = this.setSecondary.bind(this);
    
    this.state = {primary: 'grey', secondary: 'grey'};

    this.getPrimary();
    this.getSecondary();
  }

  componentDidMount() {
    this.getPrimary();
    this.getSecondary();
  }

  getPrimary() {
    monday.storage.instance.getItem(KeyChain.Colors.Primary).then(res => {
      if (res.data) {
        const { color, version } = res.data;
        this.setState({primary: color});
      }
    });
  }

  getSecondary() {
    monday.storage.instance.getItem(KeyChain.Colors.Secondary).then(res => {
      if (res.data) {
        const { color, version } = res.data;
        this.setState({secondary: color});
      }
    });
  }

  setPrimary(color) {
    this.setState({primary: color.hex});
    monday.storage.instance.setItem(KeyChain.Colors.Primary, color).then(res => {
      console.log(`Updated the Primary Color Setting to ${color}.`);
    })
  }

  setSecondary(color) {
    this.setState({secondary: color.hex});
    monday.storage.instance.setItem(KeyChain.Colors.Secondary, color).then(res => {
      console.log(`Updated the Secondary Color Setting to ${color}.`);
    })
  }

    render() {
        return (
            <>
                <h3>General Settings</h3>
                <div>
                  <Container fluid>
                    <Row className={'setting-wrapper'}>
                      <Col md>
                        <Form.Label>
                            <div className={'flex'}>                          
                              <span>Primary</span>
                              <CircleSwatch color={this.state.primary} />
                            </div>
                            <div className={'subtext'}>
                              Choose your main theme color
                            </div>
                        </Form.Label>
                        <CirclePicker onChange={this.setPrimary} color={this.state.primary} />
                      </Col>
                      <Col md>
                        <Form.Label>
                          <div className={'flex'}>
                            <span>Secondary</span>
                            <CircleSwatch color={this.state.secondary} />
                          </div>
                          <div className={'subtext'}>
                            Choose your accent color
                          </div>
                        </Form.Label>
                        <CirclePicker onChange={this.setSecondary} color={this.state.secondary}/>
                      </Col>
                    </Row>
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
                  </Container>
                </div>
            </>
        );
    }
}