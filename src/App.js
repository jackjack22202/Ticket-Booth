// Import Components used in App.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import SideNav, { NavItem, NavIcon, NavText } from "@trendmicro/react-sidenav";
import mondaySdk from "monday-sdk-js";
import { KeyChain } from "./pages/settings/KeyChain";
import { Messages } from "./library/Messages";

// Import Stylesheets
import "./library/custom_styles/react-sidenav.css";
import "./library/custom_styles/react-loadingmask.css";
import "./library/custom_styles/ReactToastify.css";
import "./App.css";

// Import Pages
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";
import Details from "./pages/Details";
import SettingRouter from "./pages/settings/SettingRouter";
import Announcements from "./pages/Announcements";
import AddCannedResponse from "./pages/cannedResponses/AddCannedResponse";
import AddFormResponse from "./pages/cannedResponses/AddFormResponse";
import Responses from "./pages/cannedResponses/Responses";
import NewForm from "./pages/cannedResponses/NewForm";

// Import Icon Images for Side Nav
import DashboardIcon from "./library/images/nav-icons/Icons_Misc_activity.svg";
import TicketsIcon from "./library/images/nav-icons/Icons_Misc_item.svg";
import SettingsIcon from "./library/images/nav-icons/Icons_Misc_Settings.svg";
import CannedResponsesIcon from "./library/images/nav-icons/cannedresponse.svg";
import AnnouncementsIcon from "./library/images/nav-icons/Icons_Misc_Megaphone.svg";
import Hamburger from "./library/images/hamburger.svg";
import MessageIcon from "./library/images/messageicon.svg";

const monday = mondaySdk();

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      first_launch: "true", // String type to comply with monday.storage()
      expanded: true,
    };
  }

  componentDidMount() {
    Promise.all([
      monday.storage.instance.getItem(KeyChain.FirstLaunch), //0
    ]).then((allResponses) => {
      console.log(allResponses);
      const firstLaunch = allResponses[0].data?.value
        ? allResponses[0].data.value
        : "true";

      this.setState(
        {
          first_launch: firstLaunch,
        },
        () => {
          if (this.state.first_launch === "true") {
            monday
              .execute("confirm", {
                message: Messages.firstLaunch,
                confirmButton: "Acknowledge!",
                cancelButton: "Remind Me Later",
              })
              .then((res) => {
                if (res.data && res.data.confirm) {
                  // Acknowledged welcome
                  monday.storage.instance.setItem(
                    KeyChain.FirstLaunch,
                    "false"
                  );
                } else {
                  // Remind Me Later
                  monday.storage.instance.setItem(KeyChain.FirstLaunch, "true");
                }
              });
          }
        }
      );
    });
  }

  render() {
    return (
      <>
        <Router>
          <Route
            render={({ location, history }) => (
              <React.Fragment>
                <div className="mainWrapper">
                  <SideNav
                    expanded={this.state.expanded}
                    onToggle={(expanded) => {
                      this.setState({ expanded });
                    }}
                    onSelect={(selected) => {
                      const to = "/" + selected;
                      if (location.pathname !== to) {
                        history.push(to);
                      }
                    }}
                  >
                    <SideNav.Toggle className="toggleBtn">
                      <img src={Hamburger} alt="Tickets Icon" />
                      <div className="toggleTitle">Booth</div>
                      <div className="toggleSupport">Support</div>
                    </SideNav.Toggle>
                    <SideNav.Nav defaultSelected="dashboard">
                      <NavItem eventKey="dashboard">
                        <div className="custNavItem">
                          <img src={DashboardIcon} alt="Dashboard Icon" />
                          <div className="navTitle">Dashboard</div>
                        </div>
                      </NavItem>
                      <NavItem eventKey="tickets">
                        <div className="custNavItem">
                          <img src={TicketsIcon} alt="Tickets Icon" />
                          <div className="navTitle">Tickets</div>
                        </div>
                      </NavItem>
                      <NavItem eventKey="announcements">
                        <div className="custNavItem">
                          <img
                            src={AnnouncementsIcon}
                            alt="Announcements Icon"
                          />
                          <div className="navTitle">Announcements</div>
                        </div>
                      </NavItem>
                      <NavItem eventKey="cannedResponses">
                        <div className="custNavItem">
                          <img
                            src={CannedResponsesIcon}
                            alt="Canned Responses Icon"
                          />

                          <div className="navTitle">Canned Responses</div>
                        </div>
                      </NavItem>
                      <NavItem eventKey="settings">
                        <div className="custNavItem">
                          <img src={SettingsIcon} alt="Settings Icon" />

                          <div className="navTitle">Settings</div>
                        </div>
                      </NavItem>
                    </SideNav.Nav>
                    <button
                      className="blackBtn feedbackBtn"
                      onClick={() => {
                        monday
                          .execute("confirm", {
                            message: `<iframe src="https://forms.monday.com/forms/embed/2cfd9a917144e22866ee8132fe1dc650" width="650" height="500" style="border: 0; box-shadow: 5px 5px 56px 0px rgba(0,0,0,0.25);"></iframe>`,
                            confirmButton: "Close",
                            excludeCancelButton: true,
                          })
                          .then((res) => {
                            // {'confirm': true}
                          });
                      }}
                    >
                      <img src={MessageIcon} />
                      Give Feedback
                    </button>
                  </SideNav>
                  <div className="sidebar-component">
                      <Switch>
                        <Route
                          path="/dashboard"
                          component={(props) => <Dashboard />}
                        />
                        <Route
                          path="/tickets"
                          component={(props) => <Tickets />}
                        />
                        <Route path="/details/:id" component={Details} />
                        <Route
                          path="/announcements"
                          component={(props) => <Announcements />}
                        />
                        <Route
                          path="/settings"
                          component={(props) => <SettingRouter />}
                        />
                        <Route
                          path="/cannedResponses"
                          component={(props) => <Responses />}
                        />
                        <Route
                          path="/textresponse"
                          component={(props) => <AddCannedResponse />}
                        />
                        <Route
                          path="/formresponse"
                          component={(props) => <AddFormResponse />}
                        />
                        <Route
                          path="/newform"
                          component={(props) => <NewForm />}
                        />
                        <Route path="/" component={(props) => <Dashboard />} />
                      </Switch>   
                  </div>
                </div>
              </React.Fragment>
            )}
          />
        </Router>
      </>
    );
  }
}
