import React from "react";
import mondaySdk from "monday-sdk-js";
import { Container, Dropdown, Row, Col, Form } from 'react-bootstrap';
//data
import { KeyChain } from "./KeyChain";

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
            statusColumn: null
        };
    }

    componentDidMount() {
        // get both the context and settings
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
            // collect up the monday.setting values
            const settingIDColumn = (this.props.settings.id_column) ? Object.keys(this.props.settings.id_column)[0] : '';
            const settingStatusColumn = (this.props.settings.status_column) ? Object.keys(this.props.settings.status_column)[0] : '';
            const settingSubtitleColumn = (this.props.settings.subheading_column) ? Object.keys(this.props.settings.subheading_column)[0] : '';

            // if there is no stored setting, but there is a monday.setting, apply the monday.setting
            if (!storedIDColumn && settingIDColumn) {
                monday.storage.instance.setItem(KeyChain.Columns.ID, settingIDColumn);
            }
            if (!storedStatusColumn && settingStatusColumn) {
                monday.storage.instance.setItem(KeyChain.Columns.Status, settingStatusColumn);
            }
            if (!storedSubtitleColumn && settingSubtitleColumn) {
                monday.storage.instance.setItem(KeyChain.Columns.Status, settingSubtitleColumn);
            }

            this.setState({
                idColumn: storedIDColumn ? storedIDColumn : settingIDColumn,
                statusColumn: storedStatusColumn ? storedStatusColumn : settingStatusColumn,
                subtitleColumn: storedSubtitleColumn ? storedSubtitleColumn : settingSubtitleColumn 
            });
        })
    }

    setIDColumn(value) {
        const newId = this.props.columns[value].id;
        this.setState({
            idColumn: newId
        })
        monday.storage.instance.setItem(KeyChain.Columns.ID, newId);
    }
    setSubtitleColumn(value) {
        const newSubtitle = this.props.columns[value].id;
        this.setState({
            subtitleColumn: newSubtitle
        })
        monday.storage.instance.setItem(KeyChain.Columns.Subtitle, newSubtitle);
    }
    setStatusColumn(value) {
        const newStatus = this.props.columns[value].id;
        this.setState({
            statusColumn: newStatus
        })
        monday.storage.instance.setItem(KeyChain.Columns.Status, newStatus);
    }
    toggleDetail(id) {

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
                                    <Form.Control as='select' placeholder='Select a Column' >
                                        {this.props.columns.map((column, i) => 
                                            <option id={column.id} onClick={() => this.setIDColumn(i)} selected={this.state.idColumn == column.id}>{column.title}</option>
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
                                    <Form.Control as='select'>
                                        {this.props.columns.map((column, i) => 
                                            <option id={column.id} onClick={() => this.setSubtitleColumn(i)} selected={this.state.subtitleColumn == column.id}>{column.title}</option>
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
                                <Form.Control as='select'>
                                    {this.props.columns.map((column, i) => 
                                        <option id={column.id} onClick={() => this.setStatusColumn(i)} selected={this.state.statusColumn == column.id}>{column.title}</option>
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
                                    {this.props.columns.map(column =>
                                        <Form.Check type="checkbox" label={column.title} value={column.id}  onclick={this.toggleCheck(column.id)}/>
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