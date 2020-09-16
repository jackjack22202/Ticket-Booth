import React from "react";
import mondaySdk from "monday-sdk-js";
import underConstruction from "./images/underconstruction.png";

import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const monday = mondaySdk();

class Settings extends React.Component {

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
      <div style={{textAlign:"center", marginTop: "24px"}}>
        <h3>Settings</h3>
      </div>
      <Container fluid>
        <Row>
          <Col>
            <Form style={{margin:"8px"}} ref={this.form}>
              <Form.Group controlId="formBasicEmail">
                <Form.Control as="textarea" placeholder="Paste your token here..." ref={this.tokenField}/>
              </Form.Group>
            </Form>
          </Col>
          </Row>
          <Row>
          <Col sm="auto" md="auto" lg="auto">
          <button className="btn btn-primary" style={{margin:"8px"}} onClick={() => this.storeToken()} disabled={this.state.loading}>Store</button>
          </Col>
        </Row>
      </Container>
      </>
    );
  }
}

export default Settings;