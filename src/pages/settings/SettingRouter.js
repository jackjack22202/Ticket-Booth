import React from "react";
import mondaySdk from "monday-sdk-js";
import { Row, Col, Tab, Nav } from 'react-bootstrap';

import { General as GeneralSettings } from './General';
import { Fields as FieldsSettings } from './Fields';
import { Integration as IntegrationSettings } from './Integration';

import Settings2Icon from '../../images/nav-icons/Icons_Misc_Settings2.svg';
import ColumnIcon from '../../images/nav-icons/Icons_Misc_column.svg';
import ItegrationIcon from '../../images/nav-icons/Icons_Misc_Integrations.svg';
//styles
import './Settings.scss';

const monday = mondaySdk();

export default class SettingRouter extends React.Component {

  constructor() {
    super();
    this.state = { 
      columns: [],
      loading: true,
      currentView: SettingViews.General
    };
  }

  componentDidMount() {
    // get both the context and settings
    Promise.all([
      monday.get('settings'),
      monday.get('context')
    ]).then(settingsAndContext => {
      const board_settings = settingsAndContext[0].data;
      const board_context = settingsAndContext[1].data
      monday.api(`
          query { 
              boards(ids: ${board_context.boardId}) {
                  columns { type, id, title }
              }
          }
      `).then(query_return => {
        this.setState({
          settings: board_settings,
          columns:  query_return.data.boards[0].columns,
        })
      });
    })
  }

  render() {
    return (
      <>
        <Tab.Container id="left-setting-tabs" default="general">
          <Row>
            <Col sm={3}>
              <Nav className="flex-column">
                <Nav.Item>
                  <Nav.Link
                    eventKey={SettingViews.General}
                    onClick={() => this.setState({currentView: SettingViews.General})}
                    className={this.state.currentView == SettingViews.General ? 'selected-view' : 'unselected-view'}
                  >
                    <img src={Settings2Icon} alt="General Settings" style={{height:"32px", width:"32px"}}/>
                    <span>General</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey={SettingViews.Fields} 
                    onClick={() => this.setState({currentView: SettingViews.Fields})}
                    className={this.state.currentView == SettingViews.Fields ? 'selected-view' : 'unselected-view'}
                  > 
                    <img src={ColumnIcon} alt="Field Settings" style={{height:"32px", width:"32px"}}/>
                    <span>Fields</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey={SettingViews.Integration} 
                    onClick={() => this.setState({currentView: SettingViews.Integration})}
                    className={this.state.currentView == SettingViews.Integration ? 'selected-view' : 'unselected-view'}
                  >
                    <img src={ItegrationIcon} alt="Integration Settings" style={{height:"32px", width:"32px"}}/>
                    <span>Integrations</span>
                  </Nav.Link>
                </Nav.Item>
                {/* 
                <Nav.Item>
                  <Nav.Link eventKey="dashboard">
                    <img src={DashboardIcon} alt="Dashboard Settings" style={{height:"32px", width:"32px"}}/>
                    <span>Dashboard</span>
                  </Nav.Link>
                </Nav.Item>
                */}
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey={SettingViews.General}>
                  <GeneralSettings/>
                </Tab.Pane>
                <Tab.Pane eventKey={SettingViews.Fields}>
                  <FieldsSettings columns={this.state.columns} settings={this.state.settings}/>
                </Tab.Pane>
                <Tab.Pane eventKey={SettingViews.Integration}>
                  <IntegrationSettings columns={this.state.columns} settings={this.state.settings}/>
                </Tab.Pane>
                {/*
                <Tab.Pane eventKey="dashboard">
                  <DashboardSettings />
                </Tab.Pane>
                */}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </>
    );
  }
}

const SettingViews = {
  General: 'general',
  Fields: 'field',
  Integration: 'integrations'
}