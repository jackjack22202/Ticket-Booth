import React from "react";
import ReactTooltip from '../../library/custom_styles/react-tooltip';
import mondaySdk from "monday-sdk-js";
import { Row } from "react-bootstrap";
import CKEditor from "ckeditor4-react";
import { RiAlertFill } from "react-icons/ri";

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
    this.setFooter.bind(this);

    this.state = {
      emailColumn: null,
      acceptedTerms: false,
      editorData: "",
      auth_checked: false,
      authorization: null,
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

  authorize() {
    const url =
      "https://auth.monday.com/oauth2/authorize?client_id=ab958ebc5a7bcfe32a5a1fab0bc69c15";
    window.open(url, "_blank");
  }

  validate() {
    this.setState({ authorization: null, auth_checked: false });
    var requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      mode: "cors",
    };
    fetch(
      `https://tb.carbonweb.co/checkToken?slug=${this.state.slug}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((data) =>
        this.setState({ authorization: data.data.token, auth_checked: true })
      );
  }

  componentDidMount() {
    // LISTEN to context for slug
    monday.listen("context", (res) => {
      this.setState({ context: res.data });
      monday.api(`query { me { name account { slug } } }`).then((res) => {
        this.setState({ slug: res.data.me.account?.slug });
        this.validate();
      });
    });

    this.getSettings();
  }

  render() {
    return (
      <div>
        <div className="fieldFlex">
          <div className="fieldWrapper">
            <div className="settingTitle">API</div>
            <div className="cardWrapper">
            <div className="preTitle">API Agreement</div>
            <div className="settingSubTitle">
              Authorize Ticketbooth to generate an app-specific token to access
              your Monday boards.
            </div>
            <div className="settingSubTitle">
              Current Status:{" "}
              <p
                style={{ display: this.state.auth_checked ? "block" : "none" }}
              >
                {this.state.authorization
                  ? "Verified Token Exists!"
                  : "Token Absent / Expired"}
              </p>
              <p
                style={{ display: !this.state.auth_checked ? "block" : "none" }}
              >
                Checking...
              </p>
            </div>
            {/* <div className="checkboxes">
              <Form.Check
                type="checkbox"
                label="I Accept"
                onClick={(e) => this.setAcceptTerms(e.target.value)}
                checked={this.state.acceptedTerms}
              />
            </div> */}
            <Row>
              <button
                className="authBtn"
                onClick={() => this.authorize()}
                disabled={!this.state.auth_checked}
              >
                Authorize
              </button>
              <button
                className="authBtn"
                onClick={() => this.validate()}
                disabled={!this.state.auth_checked}
              >
                Validate
              </button>
            </Row>
            {/* 
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
            </div> */}
            </div>
          </div>
          {/* <div className="fieldWrapper mLeft">
            <div className="settingTitle">Client Support System</div>
            <div className="cardWrapper">
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
          </div> */}
        </div>
        <div className="fieldFlex fieldWrapperMT">
          <div tag="texteditor" className="txtEditor">
          <ReactTooltip place="bottom" type="info" effect="solid"/>
            <a data-tip="This footer will be attached to all your customer updates posted in the Tickets Details Screen before sending an email">
            <CKEditor
              data={this.state.editorData}
              config={editorConfiguration}
              onChange={this.editorEvent}
            />
            </a>
          </div>
          <div className="attention-box">
            <div className="title">
              <RiAlertFill className="alert-icon" color="#0085FF" />
              <strong>
                Please use the following tags to automatically insert user
                profile data:
              </strong>
            </div>
            <div className="fieldFlex">
              <div className="txtEditor flexCol">
                <div>{"{{name}}"}</div>
                <div>{"{{phone}}"}</div>
                <div>{"{{mobile_phone}}"}</div>
                <div>{"{{country_code}}"}</div>
                <div>{"{{email}}"}</div>
                <div>{"{{title}}"}</div>
              </div>
              <div className="txtEditor flexCol">
                <div>{"{{birthday}}"}</div>
                <div>{"{{join_date}}"}</div>
                <div>{"{{location}}"}</div>
                <div>{"{{time_zone_identifier}}"}</div>
                <div>{"{{url}}"}</div>
                <div> {"{{join_date}}"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
