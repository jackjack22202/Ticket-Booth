import React from "../../../node_modules/react";
import mondaySdk from "monday-sdk-js";

import { Container, Dropdown, Row, Col, Form } from 'react-bootstrap';

const monday = mondaySdk();

export class Fields extends React.Component {

    constructor() {
        super();
        //bindings
        this.setIDColumn.bind(this);

        this.state = { idColumn: null };
    }

    componentDidMount() {
        monday.api(`
        query {
            boards
        }
        `).then((value) => {
            console.warn('__dev query results');
            console.log(value);
        })

        monday.get('context').then((value) => {
            console.warn('__dev');
            console.log(value);
        })

        monday.get('settings').then((value) => {
            console.warn('__dev');
            console.log(value);
        })
    }

    setIDColumn(value) {
        this.setState({idColumn: value})
    }

    render() {
        return (
            <>
                <h3>Field Settings</h3>
                <div>
                    <Container>
                        <Col>
                            <Row className='setting-wrapper'>
                                <Col md>
                                    <div className={'bold'}>General</div>
                                    <Form.Label>
                                        <div>Ticket ID</div>
                                        <div className={'text-muted'}>
                                            Choose a column that uniquely identifies each ticket.
                                        </div>
                                    </Form.Label>
                                    <Form.Control as='select' placeholder='Select a Column' >
                                        <option>blah blah blah</option>
                                    </Form.Control>
                                </Col>
                                <Col md></Col>
                            </Row>
                            <Row className='setting-wrapper'>
                                <Col md>
                                    <div className={'bold'}>General</div>
                                    <Form.Group>
                                        <Form.Label>
                                            <div>Ticket Subtitle</div>
                                            <div className='text-muted'>
                                                Choose any column to display under each ticket name.
                                            </div>
                                        </Form.Label>
                                        <Form.Control as='select'>
                                            <option>First Option</option>
                                            <option>Second Opinion</option>
                                            <option>Third Ornery</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col md>
                                    <div style={{height: '1.5em', marginBottom: '1em'}}></div>
                                    <Form.Group>
                                        <Form.Label>
                                            <div>Ticket Status</div>
                                            <div className='text-muted'>
                                                Choose a status column to display on your tickets.
                                            </div>
                                        </Form.Label>
                                        <Form.Control as='select'>

                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='setting-wrapper'>
                                <Col md>
                                    <div className='bold'>Ticket Details</div>
                                    <Form.Label>
                                        <div>Ticket Info</div>
                                        <div className='text-muted'>
                                            Select the columns to be displayed inside your tickets.
                                        </div>
                                    </Form.Label>
                                </Col>
                            </Row>
                        </Col>
                    </Container>
                </div>
            </>
        );
    }
}