//basics
import React from "react";
import mondaySdk from "monday-sdk-js";
import { Container, Row, Col, Form } from "react-bootstrap";
import { CirclePicker } from "react-color";
//styles
import "./Settings.scss";
//data
import { KeyChain } from "./KeyChain";

const monday = mondaySdk();

export class General extends React.Component {
  constructor() {
    super();
    //bindings
    this.setPrimary = this.setPrimary.bind(this);
    this.setSecondary = this.setSecondary.bind(this);
    this.setTicketsPerPage = this.setTicketsPerPage(this);

    this.state = {
      primary: "grey",
      secondary: "grey",
      // ticketsPerPage: 20, /** @TODO Unimplemented feature */
    };
  }

  componentDidMount() {
    this.getAllSettings();
  }

  getAllSettings() {
    Promise.all([
      monday.storage.instance.getItem(KeyChain.Colors.Primary),
      monday.storage.instance.getItem(KeyChain.Colors.Secondary),
      //monday.storage.instance.getItem(KeyChain.PerPage)
    ]).then((res) => {
      const primary = res[0];
      const secondary = res[1];
      //const perPage = res[2];

      this.setState({
        primary: primary.data.value ? primary.data.value : "grey",
        secondary: secondary.data.value ? secondary.data.value : "grey",
        //ticketsPerPage: res.data ? res.data.value : 20,
      });
    });
  }

  setPrimary(color) {
    const hex = color.hex;
    this.setState({ primary: hex });
    monday.storage.instance.setItem(KeyChain.Colors.Primary, hex);
  }

  setSecondary(color) {
    const hex = color.hex;
    this.setState({ secondary: hex });
    monday.storage.instance.setItem(KeyChain.Colors.Secondary, hex);
  }

  setTicketsPerPage() {
    /**
     * @TODO
     * Unimplemented feature
     */
  }

  render() {
    return (
      <div className="settingsMain">
        <div className="setting-wrapper">
          <div className="primary">
            <div className="settingTitle"> Primary</div>
            <div className="primaryWrapper">
              <div className="settingSubTitle">
                Choose your main theme color
              </div>
              <CirclePicker
                onChange={this.setPrimary}
                color={this.state.primary}
              />
            </div>
          </div>
          <div className="secondary">
            <div className="settingTitle">Secondary</div>
            <div className="secondaryWrapper">
              <div className="settingSubTitle">Choose your accent color</div>
              <CirclePicker
                onChange={this.setSecondary}
                color={this.state.secondary}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
