import React from "../../../node_modules/react";

import Row from '../../../node_modules/react-bootstrap/Row'
import Col from '../../../node_modules/react-bootstrap/Col'
import { Tab, Nav } from "../../../node_modules/react-bootstrap";

import { General as GeneralSettings } from './General';
import { Fields as FieldsSettings } from './Fields';
import { Integration as IntegrationSettings } from './Integration';
import { Dashboard as DashboardSettings } from './Dashboard';
import { Security as SecuritySettings } from './Security';

import Settings2Icon from '../../images/nav-icons/Icons_Misc_Settings2.svg';
import ColumnIcon from '../../images/nav-icons/Icons_Misc_column.svg';
import ItegrationIcon from '../../images/nav-icons/Icons_Misc_Integrations.svg';
import DashboardIcon from '../../images/nav-icons/Icons_Misc_Dashboard.svg';
import PrivateIcon from '../../images/nav-icons/Icons_Misc_Private.svg';

export default class SettingRouter extends React.Component {

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
                <Nav.Item>
                  <Nav.Link eventKey="dashboard">
                    <img src={DashboardIcon} alt="Dashboard Settings" style={{height:"32px", width:"32px"}}/>
                    <span>Dashboard</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="security">
                    <img src={PrivateIcon} alt="Security Settings" style={{height:"32px", width:"32px"}}/>
                    <span>Security</span>
                  </Nav.Link>
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