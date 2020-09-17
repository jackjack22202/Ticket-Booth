import React from "../../../node_modules/react";


import Container from 'react-bootstrap/Container'

import Form from '../../../node_modules/react-bootstrap/Form'
import { CirclePicker } from "../../../node_modules/react-color";

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export class General extends React.Component {

  setPrimary(color, event) {
    
  }

  setSecondary(color, event) {

  }

    render() {
        return (
            <>
                <h3>General Settings</h3>
                <div>

                      <Container fluid>
                        <Row>
                          <Col sm={3}>
                            <Form.Label>Primary</Form.Label>
                            <CirclePicker onChange={this.setPrimary}/>
                          </Col>
                          <Col sm={3}>
                            <Form.Label>Accent</Form.Label>
                            <CirclePicker onChange={this.setSecondary}/>
                          </Col>
                        </Row>
                        <Row>
                          <Form.Label>Page Size</Form.Label>
                        </Row>
                        
                        
                      </Container>
                </div>
                

               
            </>
        );
    }
}