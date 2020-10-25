// Import Components used in App.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import mondaySdk from "monday-sdk-js";
import { KeyChain } from './pages/settings/KeyChain';
import { Messages } from './library/Messages';

// Import Stylesheets
import './library/custom_styles/react-sidenav.css';
import './library/custom_styles/react-loadingmask.css';
import "./App.css";

// Import Pages
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Details from './pages/Details';
import SettingRouter from './pages/settings/SettingRouter';
import Announcements from './pages/Announcements';

// Import Icon Images for Side Nav
import DashboardIcon from "./library/images/nav-icons/Icons_Misc_activity.svg";
import TicketsIcon from "./library/images/nav-icons/Icons_Misc_item.svg";
import SettingsIcon from "./library/images/nav-icons/Icons_Misc_Settings.svg";
import AnnouncementsIcon from "./library/images/nav-icons/Icons_Misc_Megaphone.svg";

const monday = mondaySdk();

export default class App extends React.Component {

    constructor() {
      super();
      this.state = { 
        first_launch: "true" // String type to comply with monday.storage()
      };
    }
  
    componentDidMount() {
        Promise.all([
            monday.storage.instance.getItem(KeyChain.FirstLaunch), //0

        ]).then(allResponses => {
            console.log(allResponses);
            const firstLaunch =  allResponses[0].data?.value ? allResponses[0].data.value : "true" ;

            this.setState({ 
                first_launch: firstLaunch
            }, () => {
                if (this.state.first_launch === "true") {
                    monday.execute("confirm", {
                        message: Messages.firstLaunch, 
                        confirmButton: "Acknowledge!", 
                        cancelButton: "Remind Me Later"
                      }).then((res) => {
                          if (res.data.confirm) {
                            // Acknowledged welcome
                            monday.storage.instance.setItem(KeyChain.FirstLaunch, "false");
                          } else {
                            // Remind Me Later
                            monday.storage.instance.setItem(KeyChain.FirstLaunch, "true");
                          }
                    })
                }
            })
        })
    }

render() {
  return (
    <>
      <Router>
        <Route render={({ location, history }) => (
            <React.Fragment>
                <div className="sidenav sidenav-custom">
                <SideNav onSelect={(selected) => { 
                  const to = '/' + selected; 
                  if (location.pathname !== to) { 
                    history.push(to); 
                    } 
                  }} >
                  <SideNav.Toggle />
                    <SideNav.Nav defaultSelected="dashboard">
                        <NavItem eventKey="dashboard">
                            <NavIcon>
                                <img src={DashboardIcon} alt="Dashboard Icon" style={{height:"18px"}}/>
                            </NavIcon>
                            <NavText>
                                Dashboard
                            </NavText>
                        </NavItem>
                        <NavItem eventKey="tickets">
                            <NavIcon>
                                <img src={TicketsIcon} alt="Tickets Icon" style={{height:"18px"}}/>
                            </NavIcon>
                            <NavText>
                                Tickets
                            </NavText>
                        </NavItem>
                        <NavItem eventKey="announcements">
                            <NavIcon>
                                <img src={AnnouncementsIcon} alt="Announcements Icon" style={{height:"18px"}}/>
                            </NavIcon>
                            <NavText>
                                Announcements
                            </NavText>
                        </NavItem>
                        <NavItem eventKey="settings">
                            <NavIcon>
                                <img src={SettingsIcon} alt="Settings Icon" style={{height:"18px"}}/>
                            </NavIcon>
                            <NavText>
                                Settings
                            </NavText>
                        </NavItem>
                    </SideNav.Nav>
                </SideNav>
                </div>
                <div className="sidebar-component">
                <main>
                    <Switch>
                        <Route path="/dashboard" component={props => <Dashboard />} />
                        <Route path="/tickets" component={props => <Tickets />} />
                        <Route path="/details/:id" component={Details} />
                        <Route path="/announcements" component={props => <Announcements />} />
                        <Route path="/settings" component={props => <SettingRouter />} />
                        <Route path="/" component={props => <Dashboard />} />
                    </Switch>
                </main>
                </div>
            </React.Fragment>
        )}/>
      </Router>
    </>
  )
}
}