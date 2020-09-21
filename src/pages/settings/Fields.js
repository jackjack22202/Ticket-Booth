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
                                    <Dropdown>
                                        <Dropdown.Toggle>{this.state.idColumn ? this.state.idColumn : 'Select a Column'}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onSelect={() => this.setIDColumn('single')}>First</Dropdown.Item>
                                            <Dropdown.Item onSelect={() => this.setIDColumn('double')}>Second</Dropdown.Item>
                                            <Dropdown.Item onSelect={() => this.setIDColumn('triple')}>Third</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Col>
                            </Row>
                            <Row className='setting-wrapper'>
                                <Col md>
                                    <div className={'bold'}>Ticket List</div>
                                    <Form.Label>
                                        <div>Ticket Subtitle</div>
                                        <div className='text-muted'>
                                            Choose any column to display under each ticket name.
                                        </div>
                                    </Form.Label>
                                    <Dropdown>
                                        <Dropdown.Toggle>{this.state.subtitleColumn ? this.state.subtitleColumn : 'Select a Column'}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onSelect={() => this.setSubtitle('first')}>one</Dropdown.Item>
                                            <Dropdown.Item onSelect={() => this.setSubtitle('second')}>two</Dropdown.Item>
                                            <Dropdown.Item onSelect={() => this.setSubtitle('third')}>three</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </Col>
                                <Col>
                                    <Form.Label>
                                        <div>Ticket Status</div>
                                        <div className='text-muted'>
                                            Choose a status column to display on your tickets.
                                        </div>
                                    </Form.Label>
                                    <Dropdown>
                                        <Dropdown.Toggle>{this.state.statusColumn ? this.state.statusColumn : 'Select a Column'}</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onSelect={() => this.setSubtitle('first')}>one</Dropdown.Item>
                                            <Dropdown.Item onSelect={() => this.setSubtitle('second')}>two</Dropdown.Item>
                                            <Dropdown.Item onSelect={() => this.setSubtitle('third')}>three</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
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