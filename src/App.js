// Import Components used in App.js
import React from "react";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';

// Import Stylesheets
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-loadingmask/dist/react-loadingmask.css";
import "./App.css";

// Import Pages
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Details from './pages/Details';
import SettingRouter from './pages/settings/SettingRouter';
import Announcements from './pages/Announcements';

// Import Icon Images for Side Nav
import DashboardIcon from "./images/nav-icons/Icons_Misc_activity.svg";
import TicketsIcon from "./images/nav-icons/Icons_Misc_item.svg";
import SettingsIcon from "./images/nav-icons/Icons_Misc_Settings.svg";
import AnnouncementsIcon from "./images/nav-icons/Icons_Misc_Megaphone.svg";

function App() {
  return (
    <>
      <Router>
        <Route render={({ location, history }) => (
            <React.Fragment>
                <div className="sidenav">
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
                                <img src={DashboardIcon} alt="Dashboard Icon" style={{height:"32px", width:"32px"}}/>
                            </NavIcon>
                            <NavText>
                                Dashboard
                            </NavText>
                        </NavItem>
                        <NavItem eventKey="tickets">
                            <NavIcon>
                                <img src={TicketsIcon} alt="Tickets Icon" style={{height:"32px", width:"32px"}}/>
                            </NavIcon>
                            <NavText>
                                Tickets
                            </NavText>
                        </NavItem>
                        <NavItem eventKey="announcements">
                            <NavIcon>
                                <img src={AnnouncementsIcon} alt="Announcements Icon" style={{height:"32px", width:"32px"}}/>
                            </NavIcon>
                            <NavText>
                                Announcements
                            </NavText>
                        </NavItem>
                        <NavItem eventKey="settings">
                            <NavIcon>
                                <img src={SettingsIcon} alt="Settings Icon" style={{height:"32px", width:"32px"}}/>
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

export default App;