import React from "react";
import mondaySdk from "monday-sdk-js";
import { Form, Container, Row, Col } from "react-bootstrap";
import CKEditor from "ckeditor4-react";
import { GrAttachment, GrEmoji, GrThreeDEffects } from "react-icons/gr";
import { RiAlertFill } from "react-icons/ri"

//data
import { KeyChain } from "./KeyChain";
//styles
import "./Settings.scss";

const monday = mondaySdk();

const editorConfiguration = {
  toolbar: [
    [
      "Bold",
      "Italic",
      "Link",
      "BulletedList",
      "NumberedList",
      "BlockQuote",
      "Table",
      "Undo",
      "Redo",
      "Source",
    ],
  ],
  allowedContent: true,
};

export class Integration extends React.Component {
  constructor() {
    super();

    this.form = React.createRef();
    this.tokenField = React.createRef();

    this.setAcceptTerms.bind(this);
    this.setEmailColumn.bind(this);
    this.storeToken.bind(this);
    this.setFooter.bind(this);

    this.state = {
      emailColumn: null,
      acceptedTerms: false,
      editorData: "",
    };
    this.getSettings();
    this.editorEvent = this.editorEvent.bind(this);
  }

  getSettings() {
    Promise.all([
      monday.storage.instance.getItem(KeyChain.AcceptedTerms),
      monday.storage.instance.getItem(KeyChain.Columns.Email),
      monday.storage.instance.getItem(KeyChain.EmailFooter),
    ]).then((allPromises) => {
      const storedAcceptedTerms = allPromises[0].data
        ? allPromises[0].data.value === "true"
        : false;
      const storedEmailColumn = allPromises[1].data
        ? allPromises[1].data.value
        : "";
      const storedEmailFooter = allPromises[2].data.value
        ? allPromises[2].data.value
        : "";
      this.setState({
        emailColumn: storedEmailColumn,
        acceptedTerms: storedAcceptedTerms,
        editorData: storedEmailFooter,
      });
    });
  }

  setAcceptTerms() {
    const newVal = !this.state.acceptedTerms;
    this.setState({
      acceptedTerms: newVal,
    });
    monday.storage.instance.setItem(KeyChain.AcceptedTerms, newVal);
  }

  setEmailColumn(e) {
    const newEmailColumn = this.props.columns.find(
      (c) => c.title === e.target.value
    )?.id;
    this.setState({
      emailColumn: newEmailColumn,
    });
    monday.storage.instance.setItem(KeyChain.Columns.Email, newEmailColumn);
  }

  setFooter() {
    const footerString = this.state.editorData.replace(/\n/g, "");
    monday.storage.instance.setItem(KeyChain.EmailFooter, footerString);
  }

  editorEvent(event) {
    this.setState({ editorData: event.editor.getData() });
  }

  storeToken() {
    this.setState({ updateLoading: true });
    var token = this.tokenField?.current?.value;
    if (token) {
      // this.form.current.reset();

      var raw = JSON.stringify({
        slug: this.state.slug,
        token: token,
      });

      var requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: raw,
        redirect: "follow",
        mode: "cors",
      };

      fetch("https://api.carbonweb.co/storeToken", requestOptions);
    }
  }

  componentDidMount() {
    // LISTEN to context for slug
    monday.listen("context", (res) => {
      this.setState({ context: res.data });
      monday.api(`query { me { name account { slug } } }`).then((res) => {
        this.setState({ slug: res.data.me.account?.slug });
      });
    });

    this.getSettings();
  }

  render() {
    return (
      <div>
        <h3 className="setting-padding">Integration Settings</h3>
        <div className="fieldFlex">
          <div className="fieldWrapper mRight">
            <div className="settingTitle">API</div>
            <div className="preTitle">API Agreement</div>
            <div className="settingSubTitle">
              Allows Ticket Booth to store users API key on a thirdparty
              database for board view integrations.
            </div>
            <div className="checkboxes">
              <Form.Check
                type="checkbox"
                label="I Accept"
                onClick={(e) => this.setAcceptTerms(e.target.value)}
                checked={this.state.acceptedTerms}
              />
            </div>
            <div className="preTitle">API Key</div>
            <div className="settingSubTitle">Admins Personal API v2 Token</div>
            <div>
              <Form.Control
                type="password"
                placeholder="Paste your token here"
                ref={this.tokenField}
                onBlur={(event) => this.storeToken(event.target.value)}
                title={"Accept the agreement above to input a token."}
                disabled={!this.state.acceptedTerms}
              />
            </div>
          </div>
          <div className="fieldWrapper mLeft">
            <div className="settingTitle">Client Support System</div>
            <div className="preTitle">Client Email</div>
            <div className="settingSubTitle">
              Choose the column that contains your client's email.
            </div>
            <Form.Control as="select" onChange={(e) => this.setEmailColumn(e)}>
              {this.props.columns.map((column, i) => (
                <option
                  id={column.id}
                  selected={this.state.emailColumn === column.id}
                  key={column.id}
                >
                  {column.title}
                </option>
              ))}
            </Form.Control>
          </div>
        </div>

        {/* <Row className="setting-wrapper">
          
        </Row> */}
        <div tag="texteditor" className="txtEditor fieldWrapperMT">
          <CKEditor
            data={this.state.editorData}
            config={editorConfiguration}
            onChange={this.editorEvent}
          />
          <div className="textEditorConfig">
            <div className="flexOne">
              <a>
                <GrAttachment/> Add File
              </a>
              <a>GIF</a>
              <a>
                <GrEmoji/> Emoji
              </a>
              <a>@Mention</a>
            </div>
            <button className="saveBtn" onClick={() => this.setFooter()}>
              Save
            </button>
          </div>
        </div>
        <div className="attention-box">
          <Container fluid>
            <Row>
              <div>
                <h6>
                <RiAlertFill className="alert-icon" color="#0085FF"/><strong>Please use the following tags to automatically insert user profile data:</strong>
                </h6>
              </div>
            </Row>
            <Row>
              <Col>
                <ul>
                  <li>{"{{name}}"}</li>
                  <li>{"{{phone}}"}</li>
                  <li>{"{{mobile_phone}}"}</li>
                  <li>{"{{country_code}}"}</li>
                  <li>{"{{email}}"}</li>
                  <li>{"{{title}}"}</li>
                </ul>
              </Col>
              <Col>
                <ul>
                  <li>{"{{birthday}}"}</li>
                  <li>{"{{join_date}}"}</li>
                  <li>{"{{location}}"}</li>
                  <li>{"{{time_zone_identifier}}"}</li>
                  <li>{"{{url}}"}</li>
                  <li>{"{{join_date}}"}</li>
                </ul>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }
}
