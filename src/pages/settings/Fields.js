import React from "react";
import mondaySdk from "monday-sdk-js";
import { Container, Row, Col, Form } from 'react-bootstrap';
//data
import { KeyChain } from "./KeyChain";
//styles
import './Settings.scss';

const monday = mondaySdk();

export class Fields extends React.Component {

    constructor() {
        super();
        //bindings
        this.setIDColumn.bind(this);
        this.setStatusColumn.bind(this);
        this.setSubtitleColumn.bind(this);
        this.toggleDetail.bind(this);

        this.state = { 
            idColumn: null,
            subtitleColumn: null,
            statusColumn: null,
            details: []
        };

        this.getSettings();
    }

    componentDidMount() {
        this.getSettings();
    }

    getSettings() {
        Promise.all([
            monday.storage.instance.getItem(KeyChain.Columns.ID), //0
            monday.storage.instance.getItem(KeyChain.Columns.Status), //1
            monday.storage.instance.getItem(KeyChain.Columns.Subtitle),  //2
            monday.storage.instance.getItem(KeyChain.Columns.Details)
        ]).then(allPromises => {
            // collect up the monday.storage values
            const storedIDColumn =  allPromises[0].data ? allPromises[0].data.value : '' ;
            const storedStatusColumn = allPromises[1].data ? allPromises[1].data.value : '';
            const storedSubtitleColumn = allPromises[2].data ? allPromises[2].data.value : '';
            const storedDetails = allPromises[3].data ? (allPromises[3].data.value.split(',') ?? []) : [];

            this.setState({
                idColumn: storedIDColumn,
                statusColumn: storedStatusColumn,
                subtitleColumn: storedSubtitleColumn,
                details: storedDetails
            });
        })
    }

    setIDColumn(e) {
        const newId = this.props.columns.find(c => c.title === e.target.value)?.id;
        this.setState({
            idColumn: newId
        })
        monday.storage.instance.setItem(KeyChain.Columns.ID, newId);
    }
    setSubtitleColumn(e) {
        const newSubtitle = this.props.columns.find(c => c.title === e.target.value)?.id;
        this.setState({
            subtitleColumn: newSubtitle
        })
        monday.storage.instance.setItem(KeyChain.Columns.Subtitle, newSubtitle);
    }
    setStatusColumn(e) {
        const newStatus = this.props.columns.find(c => c.title === e.target.value)?.id;
        this.setState({
            statusColumn: newStatus
        })
        monday.storage.instance.setItem(KeyChain.Columns.Status, newStatus);
    }
    toggleDetail(value) {
        const targetId = this.props.columns[value].id;
        const targetIndex = this.state.details ? this.state.details.indexOf(targetId) : -1;

        let temp = this.state.details;
        if (targetIndex !== -1) {
            temp.splice(targetIndex, 1);

        } else {
            temp.push(targetId);
        }

        this.setState({details: temp});
        monday.storage.instance.setItem(KeyChain.Columns.Details, temp);
    }

    render() {
        return (
            <Container>
                <Col>
                    <Row >
                        <Col md>
                            <Form.Group className='setting-padding'>
                                <Form.Label>
                                    <h3>Field Settings</h3>
                                </Form.Label>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='setting-wrapper' style={{marginBottom: '1em'}}> 
                        <Col >
                            <Form.Group className='setting-padding'>
                                <div >
                                    <Form.Label>
                                        <div className={'bold'}>General</div>
                                        <div>Ticket ID</div>
                                        <div className={'text-muted'}>
                                            Choose a column that uniquely identifies each ticket.
                                        </div>
                                    </Form.Label>
                                    <Form.Control as='select' placeholder='Select a Column' onChange={(e) => this.setIDColumn(e)}>
                                        {this.props.columns.map((column, i) => 
                                            <option id={column.id}  selected={this.state.idColumn === column.id}>{column.title}</option>
                                        )}
                                    </Form.Control>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='setting-wrapper' style={{marginBottom: '1em'}}>
                        <Col>
                            <Form.Group className='setting-padding'>
                                    <Form.Label>
                                        <div className='bold'>Ticket List</div>
                                        <div>Ticket Subtitle</div>
                                        <div className='text-muted'>
                                            Choose any column to display under each ticket name.
                                        </div>
                                    </Form.Label>
                                    <Form.Control as='select' onChange={(e) => this.setSubtitleColumn(e)}>
                                        {this.props.columns.map((column, i) => 
                                            <option id={column.id}  selected={this.state.subtitleColumn === column.id}>{column.title}</option>
                                        )}
                                    </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md>
                            <Form.Group className='setting-padding'>
                                <Form.Label>
                                    <div style={{height: '1.5em', marginBottom: '1em'}}></div>
                                    <div>Ticket Status</div>
                                    <div className='text-muted'>
                                        Choose a status column to display on your tickets.
                                    </div>
                                </Form.Label>
                                <Form.Control as='select' onChange={(e) => this.setStatusColumn(e)}>
                                    {this.props.columns.map((column, i) => 
                                        <option id={column.id}  selected={this.state.statusColumn === column.id}>{column.title}</option>
                                    )}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className='setting-wrapper' style={{marginBottom: '1em'}}>
                        <Col md>
                            <Form.Group >
                                <div className='setting-padding'>
                                <Form.Label>
                                    <div className='bold'>Ticket Details</div>
                                    <div>Ticket Info</div>
                                    <div className='text-muted'>
                                        Select the columns to be displayed inside your tickets.
                                    </div>
                                </Form.Label>
                                <div>
                                    {this.props.columns.map((column, i) => {
                                        let contains = this.state.details ? (this.state.details.indexOf(column.id) !== -1) : false;
                                        return <Form.Check type="checkbox" label={column.title} value={column.id}  onChange={() => this.toggleDetail(i)} checked={contains}/>
                                        }
                                    )}
                                </div>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Col>
            </Container>
        );
    }
}