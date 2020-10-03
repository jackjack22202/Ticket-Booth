import React from "react";
import mondaySdk from "monday-sdk-js";
import { Row, Form, Col, Container } from "react-bootstrap";
//data
import { KeyChain } from "./KeyChain";
//styles
import './Settings.scss';

const monday = mondaySdk();

export class Integration extends React.Component {

    constructor() {
        super();

        this.form = React.createRef();
        this.tokenField = React.createRef();

        this.setAcceptTerms.bind(this);
        this.setEmailColumn.bind(this);
        this.storeToken.bind(this);

        //this.setFooter.bind(this);  //@TODO Unfinished as it is not yet implemented

        this.state = {
            emailColumn: null,
            acceptedTerms: false,
            //emailFooter: '',  //@TODO Unfinished as it is not yet implemented
        }

        this.getSettings();
    }

    getSettings() {
        Promise.all([
            monday.storage.instance.getItem(KeyChain.AcceptedTerms),
            monday.storage.instance.getItem(KeyChain.Columns.Email)
        ]).then(allPromises => {
            const storedAcceptedTerms = allPromises[0].data ? (allPromises[0].data.value === 'true') : false;
            const storedEmailColumn =  allPromises[1].data ? allPromises[1].data.value : '' ;
            
            this.setState({
                emailColumn: storedEmailColumn,
                acceptedTerms: storedAcceptedTerms
            })
        })
    }

    setAcceptTerms() {
        const newVal = !this.state.acceptedTerms;
        this.setState({
            acceptedTerms: newVal
        });
        monday.storage.instance.setItem(KeyChain.AcceptedTerms, newVal);
    }

    setEmailColumn(e) {
        const newEmailColumn = this.props.columns.find(c => c.title === e.target.value)?.id;
        this.setState({
            emailColumn: newEmailColumn
        });
        monday.storage.instance.setItem(KeyChain.Columns.Email, newEmailColumn);
    }

    setFooter(value) {
        /**
         * Unfinished for now, please look at set EmailColumn for how to formulate this field
         * @TODO
         */
    }

    storeToken() {
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

    componentDidMount() {
        // LISTEN to context for slug
        monday.listen("context", res => {
            this.setState({context: res.data});
            monday.api(`query { me { name account { slug } } }`)
            .then(res => {
                this.setState({ slug: res.data.me.account?.slug });
            });
        })

        this.getSettings();
    }

    render() {
        return (
            <Container>
                <Col>
                    <Row >
                        <Col md>
                            <Form.Group className='setting-padding'>
                                <Form.Label>
                                    <h3>Integration Settings</h3>
                                </Form.Label>
                            </Form.Group>
                            <Form.Group className='setting-wrapper'>
                                <div className='setting-padding'>
                                    <Form.Label>
                                        <div className='bold'>API</div>
                                        <div>API Agreement</div>
                                        <div className='text-muted'>Allows Ticket Booth to store users API key on a thirdparty database for board view integrations.</div>
                                    </Form.Label>
                                    <Form.Check type='checkbox' label='I Accept' onClick={(e) => this.setAcceptTerms(e.target.value)} checked={this.state.acceptedTerms}/>
                                </div>
                                <div className='setting-padding'>
                                    <Form.Label>
                                        <div>API Key</div>
                                        <div className='text-muted'>
                                            Admins Personal API v2 Token
                                        </div>
                                    </Form.Label>
                                    <Form.Control type='password' 
                                        placeholder="Paste your token here" 
                                        ref={this.tokenField} 
                                        onBlur={(event) => this.storeToken(event.target.value)}
                                        title={'Accept the agreement above to input a token.'}
                                        disabled={!this.state.acceptedTerms}/>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row >
                        <Col md>
                            <Form.Group className='setting-wrapper'> 
                                <div className='setting-padding'>
                                    <Form.Label>
                                        <div className='bold'>Client Support System</div>
                                        <div>Client Email</div>
                                        <div className='text-muted'>
                                            Choose the column that contains your client's email.
                                        </div>
                                    </Form.Label>
                                    <Form.Control as='select' onChange={(e) => this.setEmailColumn(e)} >
                                        {this.props.columns.map((column, i) => 
                                            <option id={column.id}  selected={this.state.emailColumn === column.id}>
                                                {column.title}
                                            </option>
                                        )}
                                    </Form.Control>
                                </div>
                            </Form.Group>
                            {/** @TODO Unimplemented
                            <Form.Group>
                                <Form.Label>
                                    <div>Client Email</div>
                                    <div className='text-muted'>
                                        Provide the footer template that will be insterted into outgoing support emails.
                                    </div>
                                </Form.Label>
                                <Form.Control as='textarea' onBlur={(event) => this.setFooter()}>

                                </Form.Control>
                            </Form.Group>
                            */}
                            
                        </Col>
                    </Row>
                </Col>
            </Container>
        );
    }
}