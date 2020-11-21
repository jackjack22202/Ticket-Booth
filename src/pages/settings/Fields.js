import React from "react";
import mondaySdk from "monday-sdk-js";
import { Container, Row, Col, Form } from "react-bootstrap";
//data
import { KeyChain } from "./KeyChain";
//styles
import "./Settings.scss";

const monday = mondaySdk();

export class Fields extends React.Component {
  constructor() {
    super();
    //bindings
    this.setIDColumn.bind(this);
    this.setSubtitleColumn.bind(this);
    this.setStatusColumn.bind(this);
    this.setDateColumn.bind(this);
    this.setPersonColumn.bind(this);
    this.toggleDetail.bind(this);

    this.state = {
      idColumn: null,
      subtitleColumn: null,
      statusColumn: null,
      dateColumn: null,
      personColumn: null,
      details: [],
    };

    this.getSettings();
  }

  componentDidMount() {
    this.getSettings();
  }

  getSettings() {
    Promise.all([
      monday.storage.instance.getItem(KeyChain.Columns.ID), //0
      monday.storage.instance.getItem(KeyChain.Columns.Status), //1
      monday.storage.instance.getItem(KeyChain.Columns.Subtitle), //2
      monday.storage.instance.getItem(KeyChain.Columns.Date),
      monday.storage.instance.getItem(KeyChain.Columns.Person),
      monday.storage.instance.getItem(KeyChain.Columns.Details),
    ]).then((allPromises) => {
      // collect up the monday.storage values
      const storedIDColumn = allPromises[0].data
        ? allPromises[0].data.value
        : "";
      const storedStatusColumn = allPromises[1].data
        ? allPromises[1].data.value
        : "";
      const storedSubtitleColumn = allPromises[2].data
        ? allPromises[2].data.value
        : "";
      const storedDateColumn = allPromises[3].data
        ? allPromises[3].data.value
        : "";
      const storedPersonColumn = allPromises[4].data
        ? allPromises[4].data.value
        : "";
      const storedDetails = allPromises[5].data
        ? allPromises[5].data.value?.split(",") ?? []
        : [];

      this.setState({
        idColumn: storedIDColumn,
        statusColumn: storedStatusColumn,
        subtitleColumn: storedSubtitleColumn,
        dateColumn: storedDateColumn,
        personColumn: storedPersonColumn,
        details: storedDetails,
      });
    });
  }

  setIDColumn(e) {
    const newId = this.props.columns.find((c) => c.title === e.target.value)
      ?.id;
    this.setState({
      idColumn: newId,
    });
    monday.storage.instance.setItem(KeyChain.Columns.ID, newId);
  }
  setSubtitleColumn(e) {
    const newSubtitle = this.props.columns.find(
      (c) => c.title === e.target.value
    )?.id;
    this.setState({
      subtitleColumn: newSubtitle,
    });
    monday.storage.instance.setItem(KeyChain.Columns.Subtitle, newSubtitle);
  }
  setStatusColumn(e) {
    const newStatus = this.props.columns.find((c) => c.title === e.target.value)
      ?.id;
    this.setState({
      statusColumn: newStatus,
    });
    monday.storage.instance.setItem(KeyChain.Columns.Status, newStatus);
  }
  setDateColumn(e) {
    const newDate = this.props.columns.find((c) => c.title === e.target.value)
      ?.id;
    this.setState({
      dateColumn: newDate,
    });
    monday.storage.instance.setItem(KeyChain.Columns.Date, newDate);
  }
  setPersonColumn(e) {
    const newPerson = this.props.columns.find((c) => c.title === e.target.value)
      ?.id;
    this.setState({
      personColumn: newPerson,
    });
    monday.storage.instance.setItem(KeyChain.Columns.Person, newPerson);
  }
  toggleDetail(value) {
    const targetId = this.props.columns[value].id;
    const targetIndex = this.state.details
      ? this.state.details.indexOf(targetId)
      : -1;

    let temp = this.state.details;
    if (targetIndex !== -1) {
      temp.splice(targetIndex, 1);
    } else {
      temp.push(targetId);
    }

    this.setState({ details: temp });
    monday.storage.instance.setItem(KeyChain.Columns.Details, temp);
  }

  render() {
    return (
      <>
        <h3 className="setting-padding">Field Settings</h3>
        <div className="fieldFlex">
          <div className="fieldWrapper">
            <div className="settingTitle">Ticket List</div>
            <div className="preTitle">Ticket ID</div>
            <div className="settingSubTitle">
              Choose a column that uniquely identifies each ticket.
            </div>
            <Form.Control
              as="select"
              placeholder="Select a Column"
              onChange={(e) => this.setIDColumn(e)}
            >
              {this.props.columns.map((column, i) => (
                <option
                  id={column.id}
                  selected={this.state.idColumn === column.id}
                  key={column.id}
                >
                  {column.title}
                </option>
              ))}
            </Form.Control>
          </div>
          <div className="fieldWrapper fieldWrapperMLR">
            <div className="settingTitle">Ticket List</div>
            <div className="preTitle">Ticket Subtitle</div>
            <div className="settingSubTitle">
              Choose any column to display under each ticket name.
            </div>

            <Form.Control
              as="select"
              onChange={(e) => this.setSubtitleColumn(e)}
            >
              {this.props.columns.map((column, i) => (
                <option
                  id={column.id}
                  selected={this.state.subtitleColumn === column.id}
                  key={column.id}
                >
                  {column.title}
                </option>
              ))}
            </Form.Control>
          </div>
          <div className="fieldWrapper">
            <div className="settingTitle">Ticket List</div>
            <div className="preTitle">Ticket Status</div>
            <div className="settingSubTitle">
              Choose a status column to display on your tickets.
            </div>
            <Form.Control as="select" onChange={(e) => this.setStatusColumn(e)}>
              {this.props.columns.map((column, i) => (
                <option
                  id={column.id}
                  selected={this.state.statusColumn === column.id}
                  key={column.id}
                >
                  {column.title}
                </option>
              ))}
            </Form.Control>
          </div>
        </div>
        <div className="fieldFlex fieldWrapperMT">
          <div className="fieldWrapper">
            <div className="settingTitle">Ticket List</div>
            <div className="preTitle">Person</div>
            <div className="settingSubTitle">
              Choose any person column type to display thumbnail.
            </div>
            <Form.Control
              as="select"
              placeholder="Select a Column"
              onChange={(e) => this.setPersonColumn(e)}
            >
              {this.props.columns.map((column, i) => (
                <option
                  id={column.id}
                  selected={this.state.personColumn === column.id}
                  key={column.id}
                >
                  {column.title}
                </option>
              ))}
            </Form.Control>
          </div>
          <div className="fieldWrapper fieldWrapperMLR">
            <div className="settingTitle">Ticket List</div>
            <div className="preTitle">Date Column</div>
            <div className="settingSubTitle">
              Choose any column to display date.
            </div>

            <Form.Control
              as="select"
              onChange={(e) => this.setDateColumn(e)}
            >
              {this.props.columns.map((column, i) => (
                <option
                  id={column.id}
                  selected={this.state.dateColumn === column.id}
                  key={column.id}
                >
                  {column.title}
                </option>
              ))}
            </Form.Control>
          </div>
        </div>
        <div className="fieldFlex fieldWrapperMT">
          <div className="fieldWrapper">
            <div className="settingTitle">Ticket Details</div>
            <div className="preTitle">Ticket Info</div>
            <div className="settingSubTitle">
              Select the columns to be displayed inside your tickets.
            </div>
            <div className="checkboxes">
            {this.props.columns.map((column, i) => {
              let contains = this.state.details
                ? this.state.details.indexOf(column.id) !== -1
                : false;
              return (
                <Form.Check
                  type="checkbox"
                  label={column.title}
                  value={column.id}
                  onChange={() => this.toggleDetail(i)}
                  checked={contains}
                  key={column.id}
                />
              );
            })}
            </div>
          </div>
        </div>
      </>
    );
  }
}
