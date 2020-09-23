import React from "../../../node_modules/react";
import mondaySdk from "../../../node_modules/monday-sdk-js";

import Form from '../../../node_modules/react-bootstrap/Form';


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
      
          fetch("https://api.carbonweb.co/storeToken", requestOptions)
        }
      }

    render() {
        return (
            <>
                <h3>Security & Token Settings</h3>
                <div>
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
                </div>
            </>
        );
    }
}