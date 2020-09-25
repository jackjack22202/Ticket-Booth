import React from "../../../node_modules/react";
import mondaySdk from "monday-sdk-js";

import { Container, Dropdown, Row, Col, Form } from 'react-bootstrap';

const monday = mondaySdk();

export class Fields extends React.Component {

    columns = [];

    constructor() {
        super();
        //bindings
        this.setIDColumn.bind(this);

        this.state = { idColumn: null };
    }

    componentDidMount() {
        // get the column information from the application table
        monday.get('context').then(board_context => {
            monday.api(`
                query { 
                    boards(ids: ${board_context.data ?? board_context.data.boardId}) {
                        columns { type id title }
                    }
                }
            `).then(query_return => {
                console.warn('__DEV: query return');
                console.log(query_return);

                this.columns = query_return.data.boards[0].columns;
            })
        })

        monday.get('settings').then((value) => {
            console.warn('__dev settings');
            console.log(value);
        })


    }

    setIDColumn(value) {
        this.setState({idColumn: this.columns[value]})
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
                                        {this.columns ?? this.columns.map((column, i) => 
                                            <option id={column.id} onClick={this.setIDColumn(i)}>{column.title}</option>
                                        )}
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
                                        {this.columns ?? this.columns.map((column, i) => 
                                            <option id={column.id} onClick={this.setSubtitleColumn(i)}>{column.title}</option>
                                        )}
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
                                            {this.columns ?? this.columns.map((column, i) => 
                                                <option id={column.id} onClick={this.set}>{column.title}</option>
                                            )}
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
                                    <div>
                                        {this.columns ?? this.columns.map(column =>
                                            <Form.Check type="checkbox" label={column.title} value={column.id}  />
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Container>
                </div>
            </>
        );
    }
}