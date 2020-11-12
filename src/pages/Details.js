import React from "react";
import mondaySdk from "monday-sdk-js";
//controls
import LoadingMask from "react-loadingmask";
import { Link } from "react-router-dom";
import { Image } from "react-bootstrap";
import CKEditor from "ckeditor4-react";
import { GrAttachment, GrEmoji } from "react-icons/gr";
import { Modal, Button } from "react-bootstrap";
//styles
import "./Details.scss";
import "bootstrap/dist/css/bootstrap.min.css";

//data
import { KeyChain } from "./settings/KeyChain";

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
      "Undo",
      "Redo",
      "Source",
    ],
  ],
  allowedContent: true,
};

class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ticket_id: this.props.match.params.id,
      ticket_data: this.props.location.data?.ticket,
      field_values: [],
      fields_selected: [],
      client_emails: null,
      ticket_address: null,
      user: null,
      slug: null,
      settings: this.props.location.data?.settings,
      updates: [],
      outerLoading: true,
      updateLoading: false,
      rightOpen: true,
      emailFooter: "",
      up_page: 1,
      showCannedModal: false,
      textResponses: []
    };

    this.editorEvent = this.editorEvent.bind(this);
  }

  componentDidMount() {
    monday.listen("context", (res) => {
      this.setState({ context: res.data });
      monday
        .api(
          `query { me { id birthday country_code created_at email enabled id is_guest is_pending is_view_only join_date location mobile_phone name phone photo_original photo_small photo_thumb photo_thumb_small photo_tiny teams { name } time_zone_identifier title url utc_hours_diff account { slug } } items(ids: ${this.state.ticket_data?.id}) { id name created_at creator { photo_thumb_small } column_values { id title text } updates (limit: 10, page: ${this.state.up_page}) { id created_at text_body body creator { id name photo_thumb_small } } } } `
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
              },
              function () {
                // call back after set state is complete
                resolve();
              }
            );
          }).then(() => {
            this.fetchCannedResponses();
            Promise.all([
              monday.storage.instance.getItem(KeyChain.EmailFooter),
            ]).then((allPromises) => {
              new Promise((resolve, _) => {
                const storedEmailFooter = allPromises[0].data.value
                  ? allPromises[0].data.value
                  : "";
                const templateFooter = Handlebars.compile(storedEmailFooter);
                const compiledFooter = templateFooter(this.state.user);
              }).then(() => {
                this.parseSidebarSettings();
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

  fetchUpdates = function() {
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
  }

  parseSidebarSettings = function () {
    const settings = this.state.settings;
    const ticketColumnValues = this.state.ticket_data.column_values;
    var parsedValues = [];

    this.setState({ field_values: [], fields_selected: [] });

    if (settings?.details_fields == null) {
      parsedValues = ticketColumnValues;
    } else if (settings?.details_fields?.length > 0) {
      let z = settings?.details_fields?.forEach(function (entry) {
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
    })
  };

  closeModal = () => {
    this.setState({
      showCannedModal: false
    })
  };

  dateHandler(dateString) {
    const dateObject = new Date(dateString);
    var options = {
      weekday: "short",
      year: "2-digit",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formattedString = dateObject.toLocaleString("en-US", options);
    return formattedString;
  }

  editorEvent(event) {
    this.setState({ editorData: event.editor.getData() });
  }

  postUpdate = function (audience) {
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
              updateLoading: false,
            });
          });
      });

    if (audience === "client") {
      if (this.state.client_emails) {
        var raw = JSON.stringify({
          recipient: this.state.client_emails,
          creator: this.state.user.name,
          update_body: email_string,
          ticket_address: this.state.ticket_address,
          ticket_slug: this.state.slug,
          ticket_id: this.state.ticket_id,
          ticket_name: this.state.ticket_data.name,
          creator_address: this.state.user.email,
        });

        var requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: raw,
          redirect: "follow",
          mode: "cors",
        };

        fetch("https://api.carbonweb.co/send", requestOptions)
          .then((response) => response.json())
          .then((json) => {
            if (!json.tokenCheck.data.token) {
              monday
                .execute("confirm", {
                  message:
                    "Your email request has been received. However, because a token was not found for your Monday Account, an update may not get published to the ticket when your client writes back. Please set your Email API Token from TicketBooth Settings.",
                  confirmButton: "Understood!",
                  excludeCancelButton: true,
                })
                .then((res) => {
                  // {'confirm': true}
                });
            }
          });
      } else {
        monday
          .execute("confirm", {
            message: `Client Emails not found. Make sure you have selected a column in this app's settings.`,
            confirmButton: "Understood!",
            excludeCancelButton: true,
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
    const ticket = this.state.ticket_data;
    const subheading_column_key = this.state.settings?.subheading_column_key;
    const updates = this.state.updates;
    let rightOpen = this.state.rightOpen ? "open" : "closed";

    return (
      <>
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
                <small className="text-muted">
                  {ticket?.column_values.find(
                    (x) => x.id === subheading_column_key
                  )?.text || ""}
                </small>
              </div>
              <Link to="/tickets" className="viewBtn float-right">
                Back
              </Link>
            </div>
            <LoadingMask
              loading={this.state.outerLoading}
              style={{
                height: "100%",
                width: "100%",
                display: this.state.outerLoading ? "block" : "none",
              }}
            />
            <div className="updateCardScroll">
            <button
                className="viewBtn"
                style={{ marginLeft: "16px" }}
                onClick={() => {
                  const current_up_page = this.state.up_page + 1;
                  this.setState({ up_page: current_up_page}, () => {
                    this.fetchUpdates();
                  })
                }}
                disabled={this.state.updateLoading}
              >
                Load More Updates
              </button>
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
                        : "none",
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
                        __html: update.body,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div
              tag="texteditor"
              style={{ paddingTop: "30px" }}
              key={ticket?.id}
            >
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
                  <p style={{ padding: 5, color: "#2b99ff" }}>@Mention</p>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 16,
                  }}
                >
                  <button
                    className="blackBtn"
                    style={{ marginRight: "16px" }}
                    onClick={() => this.postUpdate("internal")}
                    disabled={this.state.updateLoading}
                  >
                    Note
                  </button>
                  <button
                    className="viewBtn"
                    style={{ marginLeft: "16px" }}
                    onClick={() => this.postUpdate("client")}
                    disabled={this.state.updateLoading}
                  >
                    Email
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div id="right" className={`${rightOpen}`}>
            <div className={`icon ${rightOpen}`} onClick={this.toggleSidebar}>
              &equiv;
              <h5 className={` title ${"right-" + rightOpen}`}>
                Ticket Details
              </h5>
            </div>
            <div id="rightbar">
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
              <button
                className="blackBtn"
                style={{ margin: "16px auto 0px" }}
                onClick={() => this.editDetails()}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
        <Modal show={this.state.showCannedModal}>
          <Modal.Body>
            {this.state.textResponses.map((textResponse, index) => (
              <div
                className="body-area-select"
                onClick={() => {
                  this.setState({
                    editorData: textResponse.text,
                  })
                  this.closeModal();
                }}
              >
                <h6 style={{fontSize: '19px'}}>{textResponse.title}</h6>
                <p dangerouslySetInnerHTML={{ __html: textResponse.text }} style={{fontSize: '13px'}}></p>
              </div>
            ))}
            <div className="save-btn modal-button">
              <Button className="cancelBtn" style={{marginRight: 5}} onClick={this.closeModal}>Cancel</Button>
            </div>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

export default Details;
