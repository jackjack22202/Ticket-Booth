import React from "react";
import mondaySdk from "monday-sdk-js";
import { Row, Col, Tab, Nav } from 'react-bootstrap';

import { General as GeneralSettings } from './General';
import { Fields as FieldsSettings } from './Fields';
import { Integration as IntegrationSettings } from './Integration';
import { Dashboard as DashboardSettings } from './Dashboard';

import Settings2Icon from '../../images/nav-icons/Icons_Misc_Settings2.svg';
import ColumnIcon from '../../images/nav-icons/Icons_Misc_column.svg';
import ItegrationIcon from '../../images/nav-icons/Icons_Misc_Integrations.svg';
import DashboardIcon from '../../images/nav-icons/Icons_Misc_Dashboard.svg';

const monday = mondaySdk();

export default class SettingRouter extends React.Component {

  constructor() {
    super();
    this.state = { columns: [], loading: true };
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
                  <Nav.Link eventKey="general">
                    <img src={Settings2Icon} alt="General Settings" style={{height:"32px", width:"32px"}}/>
                    <span>General</span>
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="field">
                    <img src={ColumnIcon} alt="Field Settings" style={{height:"32px", width:"32px"}}/>
                    <span>Fields</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="integration">
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
                <Tab.Pane eventKey="general">
                  <GeneralSettings/>
                </Tab.Pane>
                <Tab.Pane eventKey="field">
                  <FieldsSettings columns={this.state.columns} settings={this.state.settings}/>
                </Tab.Pane>
                <Tab.Pane eventKey="integration">
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