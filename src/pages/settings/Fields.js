import React from "../../../node_modules/react";
import mondaySdk from "monday-sdk-js";

import { Container, Dropdown, Row, Col, Form } from 'react-bootstrap';

const monday = mondaySdk();

export class Fields extends React.Component {

    constructor() {
        super();
        //bindings
        this.setIDColumn.bind(this);
        this.setStatusColumn.bind(this);
        this.setSubtitleColumn.bind(this);

        this.state = { 
            idColumn: null,
            subtitleColumn: null,
            statusColumn: null,
            columns: [],
        };
    }

    componentDidMount() {
        // get both the context and settings
        let contextPromise = monday.get('context');
        let settingPromise = monday.get('settings');

        Promise.all([contextPromise, settingPromise]).then((ret) => {
            const board_context = ret[0];
            const settings = ret[1];
            
            monday.api(`
                query { 
                    boards(ids: ${board_context.data.boardId}) {
                        columns { type, id, title }
                    }
                }
            `).then(query_return => {

                console.warn('__DEV: query return');
                console.log(query_return);

                this.setState({
                    columns:  query_return.data.boards[0].columns,
                    idColumn: (settings.data.id_column) ? Object.keys(settings.data.id_column)[0] : '',
                    subtitleColumn:(settings.data.subheading_column) ? Object.keys(settings.data.subheading_column)[0] : '',
                    statusColumn: (settings.data.status_column) ? Object.keys(settings.data.status_column)[0] : ''
                });
            })
        })
    }

    setIDColumn(value) {
        this.setState({
            idColumn: this.state.columns[value].id
        })
    }
    setSubtitleColumn(value) {
        this.setState({
            subtitleColumn: this.state.columns[value].id
        })
    }
    setStatusColumn(value) {
        this.setState({
            statusColumn: this.state.columns[value].id
        })
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
                                        {this.state.columns.map((column, i) => 
                                            <option id={column.id} onClick={() => this.setIDColumn(i)}>{column.title}</option>
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
                                            {this.state.columns.map((column, i) => 
                                                <option id={column.id} onClick={() => this.setSubtitleColumn(i)}>{column.title}</option>
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
                                            {this.state.columns.map((column, i) => 
                                                <option id={column.id} onClick={() => this.setStatusColumn(i)}>{column.title}</option>
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
                                        {this.state.columns.map(column =>
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