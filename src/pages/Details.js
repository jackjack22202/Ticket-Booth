import config from '../library/config';
import React from "react";
import mondaySdk from "monday-sdk-js";
//controls
import { Link, Redirect } from "react-router-dom";
import { Image, Modal } from "react-bootstrap";
import CKEditor from "ckeditor4-react";
import { toast, ToastContainer, Zoom } from "react-toastify";
//styles
import "./Details.scss";
//data
import { KeyChain } from "./settings/KeyChain";
import loadmoreIcon from "../library/images/loadMore.svg";

const jwt = require('jsonwebtoken');
const monday = mondaySdk();
const Handlebars = require("handlebars");

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
      "Source"
    ]
  ],
  allowedContent: true
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

class Details extends React.Component {
  constructor(props) {
    super(props);
    const pathname = localStorage.getItem('pathname') || null;
    if (pathname != null && document.location.pathname != pathname) {
      this.redirect = true;
      this.pathname = pathname;
    } else {
      localStorage.setItem('pathname', document.location.pathname);
    }

    this.state = {
      ticket_id: this.props.match.params.id,
      ticket_data: null,
      field_values: [],
      fields_selected: [],
      client_emails: null,
      ticket_address: null,
      user: null,
      slug: null,
      account_id: null,
      settings: null,
      updates: [],
      outerLoading: true,
      updateLoading: false,
      rightOpen: true,
      emailFooter: "",
      up_page: 1,
      undo_email: false,
      showCannedModal: false,
      textResponses: [],
    };

    this.editorEvent = this.editorEvent.bind(this);
  }

  componentDidMount() {
    monday.listen("context", (res) => {
    this.setState({ context: res.data });

    new Promise((resolve, reject) => {

      Promise.all([
        monday.storage.instance.getItem(KeyChain.Columns.ID), //0
        monday.storage.instance.getItem(KeyChain.Columns.Status), //1
        monday.storage.instance.getItem(KeyChain.Columns.Subtitle), //2
        monday.storage.instance.getItem(KeyChain.Columns.Details),
        monday.storage.instance.getItem(KeyChain.Columns.Email),
        monday.storage.instance.getItem(KeyChain.Colors.Primary),
        monday.storage.instance.getItem(KeyChain.Columns.Date), //2
        monday.storage.instance.getItem(KeyChain.Columns.Person), //2
      ]).then((allResponses) => {
        const storedIDColumn = allResponses[0].data
          ? allResponses[0].data.value
          : "";
        const storedStatusColumn = allResponses[1].data
          ? allResponses[1].data.value
          : "";
        const storedSubtitleColumn = allResponses[2].data
          ? allResponses[2].data.value
          : "";
        const storedDetails = allResponses[3].data
          ? allResponses[3].data.value?.split(",") ?? []
          : [];
        const storedEmail = allResponses[4].data
          ? allResponses[4].data.value
          : "";
        const storedColor = allResponses[5].data
          ? allResponses[5].data.value
          : "";
        const storedDateColumn = allResponses[6].data
          ? allResponses[6].data.value
          : "";
        const storedPersonColumn = allResponses[7].data
          ? allResponses[7].data.value
          : "";
  
        this.setState({
          settings: {
            primaryColor: storedColor,
            id_column_key: storedIDColumn,
            status_column_key: storedStatusColumn,
            subheading_column_key: storedSubtitleColumn,
            date_column_key: storedDateColumn,
            person_column_key: storedPersonColumn,
            client_email_column_key: storedEmail,
            details_fields: storedDetails,
          },
        }, function() {
          resolve();
        })
      });
    }).then(() => {
        monday
        .api(
          `query { me { id birthday country_code created_at email enabled id is_guest is_pending is_view_only join_date location mobile_phone name phone photo_original photo_small photo_thumb photo_thumb_small photo_tiny teams { name } time_zone_identifier title url utc_hours_diff account { id slug } } items(ids: ${this.state.ticket_id}) { id name created_at creator { photo_thumb_small } column_values { id title text } updates (limit: 10, page: ${this.state.up_page}) { id created_at text_body body creator { id name photo_thumb_small } } } } `
        )
        .then((res) => {
          new Promise((resolve, _) => {
            var updates_list = res.data.items[0].updates;
            updates_list = updates_list.reverse();
            this.setState(
              {
                ticket_data: res.data.items[0],
                updates: updates_list,
                client_emails: res.data.items[0].column_values.find(
                  (x) => x.id === this.state.settings.client_email_column_key
                )?.text,
                ticket_address: `pulse-${this.state.ticket_id}@${res.data.me.account?.slug}.monday.com`,
                user: res.data.me,
                outerLoading: false,
                slug: res.data.me.account?.slug,
                account_id: res.data.me.account?.id
              },
              function () {
                // call back after set state is complete
                resolve();
              }
            );
          }).then(() => {
            this.fetchCannedResponses();
            Promise.all([
              monday.storage.instance.getItem(KeyChain.EmailFooter)
            ]).then((allPromises) => {
              new Promise((resolve, _) => {
                const storedEmailFooter = allPromises[0].data.value
                  ? allPromises[0].data.value
                  : "";
                const templateFooter = Handlebars.compile(storedEmailFooter);
                const compiledFooter = templateFooter(this.state.user);
                this.setState({ emailFooter: compiledFooter }, function () {
                  resolve();
                });
              }).then(() => {
                this.parseSidebarSettings();
              });
            });
          });
        });
      });
    });
  }

  fetchCannedResponses = async () => {
    let textResponses = await monday.storage.instance.getItem("textResponses");
    if (textResponses.data.value) {
      let textResponsesData = JSON.parse(textResponses.data.value);
      this.setState({
        textResponses: textResponsesData
      });
    }
  };

  fetchUpdates = function () {
    this.setState({ updateLoading: true });
    monday
      .api(
        `query { items(ids: ${this.state.ticket_data?.id}) { id name updates (limit: 10, page: ${this.state.up_page}) { id created_at text_body body creator { id name photo_thumb_small } } } } `
      )
      .then((response) => {
        const current_updates = this.state.updates;
        var new_updates = response.data.items[0].updates;
        new_updates = new_updates.reverse();
        const updates_list = new_updates.concat(current_updates);

        this.setState({ updates: updates_list, updateLoading: false });
      });
  };

  parseSidebarSettings = function () {
    const settings = this.state.settings;
    const ticketColumnValues = this.state.ticket_data.column_values;
    var parsedValues = [];

    this.setState({ field_values: [], fields_selected: [] });

    if (settings?.details_fields == null) {
      parsedValues = ticketColumnValues;
    } else if (settings?.details_fields?.length > 0) {
      let _ = settings?.details_fields?.forEach(function (entry) {
        const match =
          ticketColumnValues.find((column) => column.id === entry) || null;
        if (match) {
          parsedValues.push(match);
        }
        return null;
      });
      if (parsedValues?.length) {
        this.setState({ field_values: parsedValues });
      }
    } else {
      this.setState({ field_values: ticketColumnValues });
    }
    if (
      !this.state.field_values?.length ||
      this.state.field_values?.length === undefined
    ) {
      this.setState({ field_values: ticketColumnValues });
    }
  };

  toggleSidebar = (event) => {
    let key = `${event.currentTarget.parentNode.id}Open`;
    this.setState({ [key]: !this.state[key] });
  };

  openCannedResponse = () => {
    this.setState({
      showCannedModal: true
    });
  };

  closeModal = () => {
    this.setState({
      showCannedModal: false
    });
  };

  dateHandler(dateString) {
    const dateObject = new Date(dateString);
    var options = {
      weekday: "short",
      year: "2-digit",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    const formattedString = dateObject.toLocaleString("en-US", options);
    return formattedString;
  }

  editorEvent(event) {
    this.setState({ editorData: event.editor.getData() });
  }

  postUpdate = async function (audience) {
    this.setState({ updateLoading: true });
    var update_string = this.state.editorData;
    var email_string = this.state.editorData;
    this.setState({ editorData: "" });

    if (audience === "internal") {
      update_string = update_string.concat("<br><br>[Internal]");
    } else if (audience === "client") {
      update_string = update_string.concat("<br><br>[Client]");
      update_string = update_string.concat(this.state.emailFooter);
      email_string = email_string.concat(this.state.emailFooter);
    }
    monday
      .api(
        `mutation { create_update (item_id: ${this.state.ticket_id}, body: """${update_string}""") { id } }`
      )
      .then((res) => {
        monday
          .api(
            `query { items(ids: ${this.state.ticket_id}) { name updates(limit:1, page: 1) { id created_at text_body body creator { id name photo_thumb_small } replies { creator { name } created_at } } } } `
          )
          .then((res) => {
            const current_updates = this.state.updates;
            const new_updates = res.data.items[0].updates;
            const updates_list = current_updates.concat(new_updates);
            this.setState({
              updates: updates_list,
              updateLoading: false
            });
          });
      });

    if (audience === "client") {
      toast.success("Email is being sent to client");

      if (this.state.client_emails) {
        var raw = JSON.stringify({
          recipient: this.state.client_emails,
          creator: this.state.user.name,
          update_body: email_string,
          ticket_slug: this.state.slug,
          ticket_account: this.state.account_id,
          ticket_id: this.state.ticket_id,
          ticket_name: this.state.ticket_data.name,
          creator_address: this.state.user.email
        });
        const token = jwt.sign({ accountId: this.state.account_id }, config.monday_app.signing_secret);

        var requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" , 'Authorization': token },
          body: raw,
          redirect: "follow",
          mode: "cors"
        };
        await delay(5500);
        if (this.state.undo_email === false) {
          fetch(`${config.api.base_url}/emails/send`, requestOptions)
            .then((response) => response.json())
            .then((json) => {
              if (!json.tokenCheck.data.token) {
                monday
                  .execute("confirm", {
                    message:
                      "Your email request has been received. However, because a token was not found for your Monday Account, an update may not get published to the ticket when your client writes back. Please set your Email API Token from TicketBooth Settings.",
                    confirmButton: "Understood!",
                    excludeCancelButton: true
                  })
                  .then((res) => {
                    // {'confirm': true}
                  });
              }
            });
        }
      } else {
        monday
          .execute("confirm", {
            message: `Client Emails not found. Make sure you have selected a column in this app's settings.`,
            confirmButton: "Understood!",
            excludeCancelButton: true
          })
          .then((res) => {
            // {'confirm': true}
          });
      }
    }
  };

  editDetails = function () {
    monday.execute("openItemCard", { itemId: this.state.ticket_id });
  };

  render() {
    if(this.redirect) {
      return (<Redirect to={this.pathname} />);
    }
    const ticket = this.state.ticket_data;
    const subheading_column_key = this.state.settings?.subheading_column_key;
    const updates = this.state.updates;
    let rightOpen = this.state.rightOpen ? "open" : "closed";

    return (
      <>
        <ToastContainer
          transition={Zoom}
          pauseOnFocusLoss={true}
          pauseOnHover={false}
          closeButton={({ closeToast }) => {
            const handleClick = () => {
              this.setState({ undo_email: true }, () => {
                closeToast();
              });
            };
            return (
              <button className="btn-toast" onClick={handleClick}>
                Undo
              </button>
            );
          }}
        />
        <div id="layout">
          <div id="main">
            <div className="ticketDetailsTitleView">
              <Image
                src={ticket?.creator?.photo_thumb_small}
                roundedCircle
                fluid
              />
              <div className="nameSubheading">
                <h4>{ticket?.name}</h4>
                <div className="text-muted">
                  {ticket?.column_values.find(
                    (x) => x.id === subheading_column_key
                  )?.text || ""}
                </div>
              </div>
              <span onClick={() => {localStorage.setItem('pathname', `/tickets`)}}>
                <Link
                  to={{
                    pathname: `/tickets`,
                  }}
                  className="blueBtn"
                >Back
                </Link>
              </span>
            </div>
            {/* <LoadingMask
              loading={this.state.outerLoading}
              style={{
                height: "100%",
                width: "100%",
                display: this.state.outerLoading ? "block" : "none",
              }}
            /> */}
            <button
              className="blackBtn loadmoreBtn"
              onClick={() => {
                const current_up_page = this.state.up_page + 1;
                this.setState({ up_page: current_up_page }, () => {
                  this.fetchUpdates();
                });
              }}
              disabled={this.state.updateLoading}
            >
              <img src={loadmoreIcon} />
              Load More Updates
            </button>
            <div className="updateCardScroll">
              {updates?.map((update) => (
                <div id="updatecard">
                  <div
                    key={update.id}
                    style={{
                      padding: 16,
                      borderTopLeftRadius: 4,
                      borderTopRightRadius: 4,
                      borderTop: update?.body.includes("[Client]")
                        ? "2px solid #7854cc"
                        : update?.body.includes("[Internal]")
                        ? "2px solid red"
                        : "none"
                    }}
                  >
                    <div className="creatorImgInfo">
                      <Image
                        src={update.creator.photo_thumb_small}
                        roundedCircle
                        fluid
                        style={{ marginRight: "8px" }}
                      />
                      <div className="createNameDate">
                        <div className="creatorName">{update.creator.name}</div>
                        <div className="text-muted">
                          {this.dateHandler(update.created_at)}
                        </div>
                      </div>
                    </div>
                    <div
                      className="detailsNType"
                      dangerouslySetInnerHTML={{
                        __html: update.body
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              tag="texteditor"
              key={ticket?.id}
              className="txtEditor tktDetailEdit"
            >
              <CKEditor
                data={this.state.editorData}
                config={editorConfiguration}
                onChange={this.editorEvent}
              />
              <div className="textEditorConfig">
                <div className="flexOne">
                  <button
                    className="blackBtn"
                    onClick={this.openCannedResponse}
                  >
                    Response
                  </button>
                </div>
                <div className="btnTxtConfig">
                  <button
                    className="blackBtn"
                    onClick={() => this.postUpdate("internal")}
                    disabled={this.state.updateLoading}
                  >
                    Note
                  </button>
                  <button
                    className="blueBtn"
                    onClick={() => this.postUpdate("client")}
                    disabled={this.state.updateLoading}
                  >
                    Email
                  </button>
                </div>
              </div>
            </div>

            {/* <div tag="texteditor" key={ticket?.id} className="txtEditor tktDetailEdit">
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
                  <p style={{ padding: 5, color: "#2b99ff" }} onClick={this.openCannedResponse}>Select Response</p>
                  <p style={{ padding: 5, color: "#2b99ff" }}>
                    <GrAttachment className="attachFile" /> Add File
                  </p>
                  <p style={{ padding: 5, color: "#2b99ff" }}>GIF</p>
                  <p style={{ padding: 5, color: "#2b99ff" }}>
                    <GrEmoji /> Emoji
                  </p>
                  <a>@Mention</a>
                </div>
                <div className="btnTxtConfig">
                  <button
                    className="blackBtn"
                    onClick={() => this.postUpdate("internal")}
                    disabled={this.state.updateLoading}
                  >
                    Note
                  </button>
                  <button
                    className="blueBtn"
                    onClick={() => this.postUpdate("client")}
                    disabled={this.state.updateLoading}
                  >
                    Email
                  </button>
                </div>
              </div>
            </div> */}
          </div>
          <div id="right" className={`${rightOpen}`}>
            <div className={`icon ${rightOpen}`} onClick={this.toggleSidebar}>
              &equiv;
              <h5 className={` title ${"right-" + rightOpen}`}>
                Ticket Details
              </h5>
            </div>
            {/* <div id="rightbar"> */}
            {/* <div className="header">
                <div className="drawerIcon" onClick={this.toggleSidebar}>
                  &equiv;
                </div>
               
              </div> */}
            <div className="updateCardStatusScroll">
              {this.state.field_values?.map((item) => (
                <div className="stats" key={item.title}>
                  <div>{item.title}:</div>

                  <div className="statsInfo">{item.text}</div>
                </div>
              ))}
              <div className="stats">
                <div>Created At:</div>
                <div className="statsInfo">
                  {this.dateHandler(ticket?.created_at)}
                </div>
              </div>
            </div>
            <div className="rightBtnWrapper">
              <button className="blackBtn" onClick={() => this.editDetails()}>
                Edit
              </button>
            </div>
            {/* </div> */}
          </div>
        </div>
        <Modal show={this.state.showCannedModal} onHide={() => {}}>
          <Modal.Body>
            {this.state.textResponses.map((textResponse, index) => (
              <div
                className="body-area-select"
                onClick={() => {
                  this.setState({
                    editorData: textResponse.text
                  });
                  this.closeModal();
                }}
              >
                <h6 style={{ fontSize: "19px" }}>{textResponse.title}</h6>
                <p
                  dangerouslySetInnerHTML={{ __html: textResponse.text }}
                  style={{ fontSize: "13px" }}
                ></p>
              </div>
            ))}
            <div className="modalButton">
              <a className="blueBtn" onClick={this.closeModal}>
                Cancel
              </a>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export default Details;
