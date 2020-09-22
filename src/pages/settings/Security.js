import React from "../../../node_modules/react";
import mondaySdk from "../../../node_modules/monday-sdk-js";

import { Row, Form, Col, Container, Dropdown } from "react-bootstrap";


const monday = mondaySdk();

export class Security extends React.Component {

    constructor(props) {
      super(props);

      this.state = {
        loading: false
      }

      this.form = React.createRef();
      this.tokenField = React.createRef();
    }

    componentDidMount() {
      monday.listen("context", res => {
        this.setState({context: res.data});
        monday.api(`query { me { name account { slug } } }`)
        .then(res => {
          this.setState({ slug: res.data.me.account?.slug });
        });
      })
    }

    storeToken = function () {
        this.setState({updateLoading: true});
        var token = this.tokenField?.current?.value;
        if (token) {
          this.form.current.reset();
    
          var raw = JSON.stringify({
            slug: this.state.slug, 
            token: token, 
          });
      
          var requestOptions = {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: raw,
            redirect: 'follow',
            mode: 'cors'
          };
      
          fetch("https://9c96768575e3.ngrok.io/storeToken", requestOptions)
        }
      }

    render() {
        return (
            <>
                <h3>Security Terms</h3>
                <div>
                  <Container>
                    <Col>
                      <Row className='setting-wrapper'>
                        <Col md>
                          <div className='bold'>Integrations</div>
                          <Form.Label>
                            <div>API Agreement</div>
                            <div className='text-muted'>Allows Ticket Booth to store users API key on a thirdparty database for board view integrations.</div>
                          </Form.Label>
                          <Form.Check type='checkbox' label='I Accept' />
                        </Col>
                      </Row>
                      <Row className='setting-wrapper'>
                        <Col md>
                          <div className='bold'>Development</div>
                          <Form style={{margin:"8px"}} ref={this.form}>
                            <Form.Group controlId="formBasicEmail">
                              <Form.Control as="textarea" placeholder="Paste your token here..." ref={this.tokenField}/>

                            </Form.Group>
                            <button className="btn btn-primary" 
                                style={{margin:"8px"}} 
                                onClick={() => this.storeToken()} 
                                disabled={this.state.loading}
                                >
                                    Store
                            </button>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Container>
                </div>
            </>
        );
    }
}