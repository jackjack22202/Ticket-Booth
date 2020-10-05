import LoadingMask from "react-loadingmask";
import React from "react";
import { Link } from 'react-router-dom';
import mondaySdk from "monday-sdk-js";

import { Nav, Card, Image, Container, Row, Col } from 'react-bootstrap';
import Pagination from "react-js-pagination";

import { KeyChain } from './settings/KeyChain';
import ticketBooth from "../images/TicketBooth.gif";

const monday = mondaySdk();
const TicketBoothLogo = <img src={ticketBooth} alt="Ticket Booth Logo"/>


class Tickets extends React.Component {

  constructor(props) {
    super(props);

    // Default state
    this.page_limit = 20;
    this.state = {
      settings: {},
      tickets: [],
      groups: [],
      selected_group: null,
      total_pages: 1,
      current_page: 1,
      total_items: 0,
      viewLoading: true,
      groupLoading: true,
      listLoading: true,
    };
  }


  componentDidMount() {
    monday.listen("context", res => {
      this.setState({
        context: res.data
      });
      Promise.all([
        monday.storage.instance.getItem(KeyChain.Columns.ID), //0
        monday.storage.instance.getItem(KeyChain.Columns.Status), //1
        monday.storage.instance.getItem(KeyChain.Columns.Subtitle),  //2
        monday.storage.instance.getItem(KeyChain.Columns.Details),
        monday.storage.instance.getItem(KeyChain.Columns.Email),
        monday.storage.instance.getItem(KeyChain.Colors.Primary),

        ]).then(allResponses => {
        const storedIDColumn =  allResponses[0].data ? allResponses[0].data.value : '' ;
        const storedStatusColumn = allResponses[1].data ? allResponses[1].data.value : '';
        const storedSubtitleColumn = allResponses[2].data ? allResponses[2].data.value : '';
        const storedDetails = allResponses[3].data ? (allResponses[3].data.value?.split(',') ?? []) : [];
        const storedEmail = allResponses[4].data ? allResponses[4].data.value : '';
        const storedColor = allResponses[5].data ? allResponses[5].data.value : '';

        this.setState({ 
          settings : {
            primaryColor: storedColor,
            id_column_key: storedIDColumn,
            status_column_key: storedStatusColumn,
            subheading_column_key: storedSubtitleColumn,
            client_email_column_key: storedEmail,
            details_fields: storedDetails,
          }
        })
        monday.api(`query ($boardIds: [Int]) { boards (ids:$boardIds) { name groups { title id } } }`, {
            variables: {
                boardIds: this.state.context.boardIds
            }
        }).then(res => {
            this.setState({
                groups: res.data.boards[0].groups,
                selected_group: res.data.boards[0].groups[0],
                viewLoading: false,
            }, () => {
              this.reloadData();
            });
        });
      });
    })
  }

  reloadData() {
    return new Promise ((resolve, reject) => {
      this.fetchGroupMetadata()
      .then(() => {
        this.fetchItems()
        .then(()=> {
          resolve();
        })
      })
    })
  }

  fetchGroupMetadata() {
    return new Promise((resolve, reject) => {
      monday.api(`query ($boardIds: [Int], $groupId: String) { boards(ids: $boardIds) { name groups(ids: [$groupId]) { title id items { id name } } } } `, {
      variables: {
            boardIds: this.state.context.boardIds,
            groupId: this.state.selected_group.id
        }
    }).then(res => {
        const groupItems = res?.data?.boards[0]?.groups[0]?.items?.length;
        this.setState({
            total_items: groupItems,
            total_pages: Math.ceil(groupItems/this.page_limit),
            groupLoading: false,
        }, () => {
          resolve();
        });
      })
    })
  }

  fetchItems() {
    return new Promise((resolve, reject) => {
      monday.api(`query ($boardIds: [Int], $groupId: String, $current_page: Int, $limit: Int) { boards(ids: $boardIds) { name groups(ids: [$groupId]) { title id items(limit: $limit, page: $current_page) { id name group { id } created_at creator { photo_thumb_small } column_values { id title text additional_info } } } } } `, {
        variables: {
            boardIds: this.state.context.boardIds,
            groupId: this.state.selected_group.id,
            current_page: this.state.current_page,
            limit: this.page_limit
        }
    }).then(res => {
        this.setState({
            tickets: res?.data?.boards[0]?.groups[0]?.items,
            loading: false,
            listLoading: false
        }, () => {
          resolve();
        });
      })
    })  
  }

  dateHandler(dateString) {
    const dateObject = new Date(dateString);
    var options = {year: 'numeric', month: 'long', day: 'numeric'};
    const formattedString = dateObject.toLocaleString("en-US", options);
    return formattedString;
  }

  handlePageChange(pageNumber) {
    this.setState({ current_page: pageNumber, listLoading: true });
    this.reloadData();
  }

  render() {
    const settings = this.state.settings
    const tickets = this.state.tickets;
    const groups = this.state.groups;
    const selected_group = this.state.selected_group;
    
    const handleGroupSelect = (eventKey) => {
      this.setState({
        groupLoading: true,
        listLoading: true,
        current_page: 1,
        selected_group: {
          id: eventKey,
          title: groups.find(
            (x) =>
              x.id ===
              eventKey
          )?.title
        }
      }, () => {
        this.reloadData();
      });
    };

    return (
      <>
    <LoadingMask
        loading={this.state.viewLoading}
        indicator={TicketBoothLogo}
        style={{
            height: '100vh',
            width: '100%',
            display: this.state.viewLoading ? 'block' : 'none',
        }}></LoadingMask>
    <div style={{ display: this.state.viewLoading ? 'none' : 'block' }}>
        <Card
            style={{
                marginLeft: '24px',
                marginRight: '24px',
                marginTop: '12px',
                border: 'none',
            }}>
            <Container fluid>
                <Row className='text-muted align-items-center'>
                    <Col>
                        <Nav
                            variant='pills'
                            activeKey={selected_group?.id}
                            onSelect={handleGroupSelect}>
                            {groups.map((group) => (
                                <Nav.Item key={group.id}>
                                    <Nav.Link
                                        eventKey={group.id}
                                        key={group.id}>
                                        {group.title}
                                    </Nav.Link>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </Col>
                    <Col style={{ textAlign: 'right' }}>
                        <strong>{this.state.total_items}</strong> Tickets in{' '}
                        <strong>{selected_group?.title}</strong> Board Group
                    </Col>
                </Row>
            </Container>
        </Card>

        <LoadingMask
            loading={this.state.groupLoading}
            indicator={TicketBoothLogo}
            text={'loading...'}
            style={{
                height: '100vh',
                width: '100%',
                display: this.state.groupLoading ? 'block' : 'none',
            }}
        />
        <div style={{ display: this.state.groupLoading ? 'none' : 'block' }}>
            <LoadingMask
            loading={this.state.listLoading}
            indicator={TicketBoothLogo}
            text={'loading...'}
            style={{
                height: '100vh',
                width: '100%',
                display: this.state.listLoading ? 'block' : 'none',
            }}
            />
            <div style={{ display: this.state.listLoading ? 'none' : 'block' }}>
                <Card
                    style={{
                        marginLeft: '24px',
                        marginRight: '24px',
                        marginBottom: '-24px',
                        marginTop: '12px',
                        border: 'none',
                    }}>
                    <Container fluid>
                        <Row className='text-muted align-items-center'>
                            <Col sm={1} md={1} lg={1}>
                                <p>
                                    <small style={{ textAlign: 'center' }}>
                                        <strong>Creator</strong>
                                    </small>
                                </p>
                            </Col>
                            <Col sm={3} md={3} lg={3}>
                                <p>
                                    <small style={{ textAlign: 'center' }}>
                                        <strong></strong>
                                    </small>
                                </p>
                            </Col>
                            <Col sm={2} md={2} lg={2}>
                                <p style={{ textAlign: 'center', width: '60%' }}>
                                    <small>
                                        <strong>Status</strong>
                                    </small>
                                </p>
                            </Col>
                            <Col sm={2} md={2} lg={2}>
                                <p>
                                    <small style={{ textAlign: 'center' }}>
                                        <strong>Created at</strong>
                                    </small>
                                </p>
                            </Col>
                            <Col sm={2} md={2} lg={2}>
                                <p>
                                    <small style={{ textAlign: 'center' }}>
                                        <strong></strong>
                                    </small>
                                </p>
                            </Col>
                        </Row>
                    </Container>
                </Card>
                {tickets.map((item) => (
                    <Card border='light' key={item.id} className='list-card'>
                        <Card.Body>
                            <Container fluid>
                                <Row className='align-items-center'>
                                    <Col sm={1} md={1} lg={1}>
                                        <Image
                                            src={item?.creator?.photo_thumb_small}
                                            roundedCircle
                                            fluid
                                            style={{ marginRight: '8px' }}
                                        />
                                    </Col>
                                    <Col sm={3} md={3} lg={3}>
                                        <Container>
                                            <Row>
                                                <Card.Title>{item.name}</Card.Title>
                                            </Row>
                                            <Row>
                                                <Card.Subtitle className='text-muted'>
                                                    {item.column_values.find(
                                                        (x) =>
                                                            x.id ===
                                                            settings.subheading_column_key
                                                    )?.text || ''}
                                                </Card.Subtitle>
                                            </Row>
                                        </Container>
                                    </Col>
                                    <Col sm={2} md={2} lg={2}>
                                        <div
                                            className='status-box'
                                            style={{
                                                backgroundColor:
                                                    JSON.parse(
                                                        item.column_values.find(
                                                            (x) =>
                                                                x.id ===
                                                                settings.status_column_key
                                                        )?.additional_info || '""'
                                                    )?.color || '',
                                            }}>
                                            {item.column_values.find(
                                                (x) => x.id === settings.status_column_key
                                            )?.text || 'Status N/A'}
                                        </div>
                                    </Col>
                                    <Col sm={2} md={2} lg={2}>
                                        {this.dateHandler(item.created_at)}
                                    </Col>
                                    <Col sm={2} md={2} lg={2}>
                                        <Link
                                            to={{
                                                pathname: `/details/${item.id}`,
                                                data: {
                                                    ticket: item,
                                                    settings: settings
                                                },
                                            }}>
                                            <button
                                                className='btn btn-primary'
                                                style={{
                                                    margin: '8px',
                                                    backgroundColor:
                                                        settings.primaryColor,
                                                    borderColor:
                                                        settings.primaryColor,
                                                }}>
                                                View
                                            </button>
                                        </Link>
                                    </Col>
                                    <Col
                                        sm={2}
                                        md={2}
                                        lg={2}
                                        style={{ color: 'lightgray' }}>
                                        ID#:{' '}
                                        {item.column_values.find(
                                            (x) => x.id === settings.id_column_key
                                        )?.text || ''}
                                    </Col>
                                </Row>
                            </Container>
                        </Card.Body>
                    </Card>
                ))}
            </div>
            <Container>
                <Row className='align-items-center'>
                    <Pagination
                        activePage={this.state.current_page}
                        itemsCountPerPage={this.page_limit}
                        totalItemsCount={this.state.total_items}
                        pageRangeDisplayed={5}
                        onChange={this.handlePageChange.bind(this)}
                    />
                </Row>
            </Container>
        </div>
    </div>
</>
    );
  }
}

export default Tickets;