import React from "react";
import mondaySdk from "monday-sdk-js";
import { Row, Form, Col, Container } from "react-bootstrap";
import CKEditor from "ckeditor4-react";
import { GrAttachment, GrEmoji } from "react-icons/gr";

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
        <Form.Group className="setting-padding">
          <Form.Label>
            <h3>Integration Settings</h3>
          </Form.Label>
        </Form.Group>
        <Form.Group className="setting-wrapper">
          <div className="setting-padding">
            <Form.Label>
              <div className="bold">API</div>
              <div>API Agreement</div>
              <div className="text-muted">
                Allows Ticket Booth to store users API key on a thirdparty
                database for board view integrations.
              </div>
            </Form.Label>
            <Form.Check
              type="checkbox"
              label="I Accept"
              onClick={(e) => this.setAcceptTerms(e.target.value)}
              checked={this.state.acceptedTerms}
            />
          </div>
          <div className="setting-padding">
            <Form.Label>
              <div>API Key</div>
              <div className="text-muted">Admins Personal API v2 Token</div>
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Paste your token here"
              ref={this.tokenField}
              onBlur={(event) => this.storeToken(event.target.value)}
              title={"Accept the agreement above to input a token."}
              disabled={!this.state.acceptedTerms}
            />
          </div>
        </Form.Group>

        <Form.Group className="setting-wrapper">
          <div className="setting-padding">
            <Form.Label>
              <div className="bold">Client Support System</div>
              <div>Client Email</div>
              <div className="text-muted">
                Choose the column that contains your client's email.
              </div>
            </Form.Label>
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
        </Form.Group>
        <div tag="texteditor" style={{ paddingTop: "30px" }}>
          <CKEditor
            data={this.state.editorData}
            config={editorConfiguration}
            onChange={this.editorEvent}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <p style={{ padding: 5, color: "#2b99ff" }}>
                <GrAttachment /> Add File
              </p>
              <p style={{ padding: 5, color: "#2b99ff" }}>GIF</p>
              <p style={{ padding: 5, color: "#2b99ff" }}>
                <GrEmoji /> Emoji
              </p>
              <p style={{ padding: 5, color: "#2b99ff" }}>@Mention</p>
            </div>
            <div>
              <button
                className="btn btn-primary"
                style={{ margin: "8px" }}
                onClick={() => this.setFooter()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
