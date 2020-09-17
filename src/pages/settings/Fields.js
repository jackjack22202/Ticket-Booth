import React from "../../../node_modules/react";
import mondaySdk from "monday-sdk-js";

import { Container, Dropdown, Row, Col } from 'react-bootstrap';

const monday = mondaySdk();

export class Fields extends React.Component {

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

    render() {
        return (
            <>
                <h3>Field Settings</h3>
                <Container>
                    <h4>General</h4>
                    <Col>
                        <Row>
                            <div>Ticket ID</div>
                            <div>Choose a column that uniquely identifies each ticket.</div>
                            <div>
                                <Dropdown title="Select a Column...">
                                    <Dropdown.Menu >
                                        
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </Row>
                    </Col>
                </Container>
                <Container>

                </Container>
                <Container>
                    <h4>Ticket Details</h4>
                </Container>
            </>
        );
    }
}