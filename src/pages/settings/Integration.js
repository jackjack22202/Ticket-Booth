import React from "../../../node_modules/react";
import { Row, Form, Col, Container, Dropdown } from "react-bootstrap";

export class Integration extends React.Component {
    render() {
        return (<>
            <h3>Integration settings</h3>
            <div>
                <Container>
                    <Col>
                        <Row className='setting-wrapper'>
                            <Col md>
                                <div className='bold'>API</div>
                                <Form.Label>
                                    <div>API Key</div>
                                    <div className='text-muted'>
                                        Admins personal API v2 Token
                                    </div>
                                </Form.Label>
                                <Form.Control>

                                </Form.Control>
                            </Col>
                        </Row>
                        <Row className='setting-wrapper'>
                            <Col md>
                                <div className='bold'>Client Support System</div>
                                <Form.Label>
                                    <div>Client Email</div>
                                    <div className='text-muted'>
                                        Choose the column that contains your client's email.
                                    </div>
                                </Form.Label>
                                <Dropdown>
                                    <Dropdown.Toggle>text...</Dropdown.Toggle>
                                </Dropdown>
                                <div className='bold'></div>
                                <Form.Label>
                                    <div>Client Email</div>
                                    <div className='text-muted'>
                                        Provide the footer template that will be insterted into outgoing support emails.
                                    </div>
                                </Form.Label>
                                <Form.Control>

                                </Form.Control>
                            </Col>
                        </Row>
                    </Col>
                </Container>
            </div>
        </>);
    }
}