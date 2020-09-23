import React from "../../../node_modules/react";
import { Row, Form, Col, Container, Dropdown } from "react-bootstrap";

export class Dashboard extends React.Component {
    render() {
        return (<>
            <h3>Dashboard Settings</h3>
            <div>
                <Container>
                    <Col>
                        <Row className='setting-wrapper'>
                            <Col md>
                                <div className='bold'>Ticket Dashbaord</div>
                                <Form.Label>
                                    <div>Dashboard ID</div>
                                    <div className='text-muted'>
                                        Enter the ID for your landing dashboard
                                    </div>
                                </Form.Label>
                                <Form.Control placeholder='Insert Key Here'>
                                    
                                </Form.Control>
                            </Col>
                        </Row>
                        
                    </Col>
                </Container>
            </div>
        </>);
    }
}