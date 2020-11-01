import React from "react";
import mondaySdk from "monday-sdk-js";
import { Row, Col, Tab, Nav } from 'react-bootstrap';

import { General as GeneralSettings } from './General';
import { Fields as FieldsSettings } from './Fields';
import { Integration as IntegrationSettings } from './Integration';

import Settings2Icon from '../../library/images/nav-icons/Icons_Misc_Settings2.svg';
import ColumnIcon from '../../library/images/nav-icons/Icons_Misc_column.svg';
import ItegrationIcon from '../../library/images/nav-icons/Icons_Misc_Integrations.svg';
//styles
import './Settings.scss';

const monday = mondaySdk();

export default class SettingRouter extends React.Component {

  constructor() {
    super();
    this.state = { 
      columns: [],
      loading: true,
      currentView: null
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
      <div>
        <Tab.Container id="left-setting-tabs" default="general">
          <Row>
            <Col xs={12}>
              <Nav className="mondayTab" variant="pills">
                <Nav.Item>
                  <Nav.Link
                    eventKey={SettingViews.General}
                    onClick={() => this.setState({currentView: SettingViews.General})}
                    className={this.state.currentView === SettingViews.General ? 'selected-view' : 'unselected-view'}
                  >General
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey={SettingViews.Fields} 
                    onClick={() => this.setState({currentView: SettingViews.Fields})}
                    className={this.state.currentView === SettingViews.Fields ? 'selected-view' : 'unselected-view'}
                  > 
                    Fields
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    eventKey={SettingViews.Integration} 
                    onClick={() => this.setState({currentView: SettingViews.Integration})}
                    className={this.state.currentView === SettingViews.Integration ? 'selected-view' : 'unselected-view'}
                  >
                    Integrations
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
            <Col xs={12}>
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
      </div>
    );
  }
}

const SettingViews = {
  General: 'general',
  Fields: 'field',
  Integration: 'integrations'
}