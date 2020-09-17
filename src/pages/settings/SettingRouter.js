import React from "../../../node_modules/react";

import Row from '../../../node_modules/react-bootstrap/Row'
import Col from '../../../node_modules/react-bootstrap/Col'
import { Tab, Nav } from "../../../node_modules/react-bootstrap";

import { General as GeneralSettings } from './General';
import { Fields as FieldsSettings } from './Fields';
import { Integration as IntegrationSettings } from './Integration';
import { Dashboard as DashboardSettings } from './Dashboard';
import { Security as SecuritySettings } from './Security';

export default class SettingRouter extends React.Component {

  render() {
    return (
      <>
        <Tab.Container id="left-setting-tabs" default="general">
          <Row>
            <Col sm={3}>
              <Nav className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="general">General</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="field">Fields</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="integration">Integrations</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="dashboard">Dashboard</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security">Security</Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>
            <Col sm={9}>
              <Tab.Content>
                <Tab.Pane eventKey="general">
                  <GeneralSettings />
                </Tab.Pane>
                <Tab.Pane eventKey="field">
                  <FieldsSettings />
                </Tab.Pane>
                <Tab.Pane eventKey="integration">
                  <IntegrationSettings />
                </Tab.Pane>
                <Tab.Pane eventKey="dashboard">
                  <DashboardSettings />
                </Tab.Pane>
                <Tab.Pane eventKey="security">
                  <SecuritySettings />
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </>
    );
  }
}