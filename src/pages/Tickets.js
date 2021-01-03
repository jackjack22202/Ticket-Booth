import React from "react";
import { Link, Redirect } from "react-router-dom";
import mondaySdk from "monday-sdk-js";

import { Nav, Image, Row, Col } from "react-bootstrap";
import Pagination from "react-js-pagination";

import { KeyChain } from "./settings/KeyChain";

const monday = mondaySdk();

class Tickets extends React.Component {
  constructor(props) {
    super(props);
    const pathname = localStorage.getItem('pathname') || null;
    if (pathname != null && document.location.pathname != pathname) {
      this.redirect = true;
      this.pathname = pathname;
    } else {
      localStorage.setItem('pathname', document.location.pathname);
    }

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
    monday.listen("context", (res) => {
      this.setState({
        context: res.data,
      });
      Promise.all([
        monday.storage.instance.getItem(KeyChain.Columns.ID), //0
        monday.storage.instance.getItem(KeyChain.Columns.Status), //1
        monday.storage.instance.getItem(KeyChain.Columns.Subtitle), //2
        monday.storage.instance.getItem(KeyChain.Columns.Details),
        monday.storage.instance.getItem(KeyChain.Columns.Email),
        monday.storage.instance.getItem(KeyChain.Colors.Primary),
        monday.storage.instance.getItem(KeyChain.Columns.Date), //2
        monday.storage.instance.getItem(KeyChain.Columns.Person), //2
      ]).then((allResponses) => {
        const storedIDColumn = allResponses[0].data
          ? allResponses[0].data.value
          : "";
        const storedStatusColumn = allResponses[1].data
          ? allResponses[1].data.value
          : "";
        const storedSubtitleColumn = allResponses[2].data
          ? allResponses[2].data.value
          : "";
        const storedDetails = allResponses[3].data
          ? allResponses[3].data.value?.split(",") ?? []
          : [];
        const storedEmail = allResponses[4].data
          ? allResponses[4].data.value
          : "";
        const storedColor = allResponses[5].data
          ? allResponses[5].data.value
          : "";
        const storedDateColumn = allResponses[6].data
          ? allResponses[6].data.value
          : "";
        const storedPersonColumn = allResponses[7].data
          ? allResponses[7].data.value
          : "";
          

        this.setState({
          settings: {
            primaryColor: storedColor,
            id_column_key: storedIDColumn,
            status_column_key: storedStatusColumn,
            subheading_column_key: storedSubtitleColumn,
            date_column_key: storedDateColumn,
            person_column_key: storedPersonColumn,
            client_email_column_key: storedEmail,
            details_fields: storedDetails,
          },
        });
        monday
          .api(
            `query ($boardIds: [Int]) { boards (ids:$boardIds) { name groups { title id } } }`,
            {
              variables: {
                boardIds: this.state.context.boardIds,
              },
            }
          )
          .then((res) => {
            this.setState(
              {
                groups: res.data.boards[0].groups,
                selected_group: res.data.boards[0].groups[0],
                viewLoading: false,
              },
              () => {
                this.reloadData();
              }
            );
          });
      });
    });
  }

  reloadData() {
    return new Promise((resolve, _) => {
      this.fetchGroupMetadata().then(() => {
        this.fetchItems().then(() => {
          resolve();
        });
      });
    });
  }

  fetchGroupMetadata() {
    return new Promise((resolve, _) => {
      monday
        .api(
          `query ($boardIds: [Int], $groupId: String) { boards(ids: $boardIds) { name groups(ids: [$groupId]) { title id items { id name } } } } `,
          {
            variables: {
              boardIds: this.state.context.boardIds,
              groupId: this.state.selected_group.id,
            },
          }
        )
        .then((res) => {
          const groupItems = res?.data?.boards[0]?.groups[0]?.items?.length;
          this.setState(
            {
              total_items: groupItems,
              total_pages: Math.ceil(groupItems / this.page_limit),
              groupLoading: false,
            },
            () => {
              resolve();
            }
          );
        });
    });
  }

  fetchItems() {
    return new Promise((resolve, reject) => {
      monday
        .api(
          `query ($boardIds: [Int], $groupId: String, $current_page: Int, $limit: Int) { boards(ids: $boardIds) { name groups(ids: [$groupId]) { title id items(limit: $limit, page: $current_page) { id name group { id } created_at creator { photo_thumb_small } column_values { id title text additional_info value } } } } } `,
          {
            variables: {
              boardIds: this.state.context.boardIds,
              groupId: this.state.selected_group.id,
              current_page: this.state.current_page,
              limit: this.page_limit,
            },
          }
        )
        .then((res) => {
          const tickets = res?.data?.boards[0]?.groups[0]?.items;
          const promises = [];
          tickets.forEach((item) => {
            var person_column_data = item.column_values.find(
              (x) => x.id === this.state.settings.person_column_key
            )?.value
            try {
              person_column_data = JSON.parse(person_column_data);
              const person_id = person_column_data?.personsAndTeams[0]?.id;
              if(person_id) {
                const promise = monday.api(`query { users(ids: [${person_id}]) { photo_thumb_small } }`)
                .then((res) => {
                  const person_image_URL = res.data?.users[0]?.photo_thumb_small;
                  item.thumb_URL = person_image_URL;
                })
                .catch(() => {
                  item.thumb_URL = "";
                })
                promises.push(promise);
              }
              else {
                item.thumb_URL = "";
              }
            }
            catch {
              item.thumb_URL = item?.creator?.photo_thumb_small;
            }
          })
          Promise.all(promises).then(()=> {
            this.setState(
              {
                tickets: tickets,
                loading: false,
                listLoading: false,
              },
              () => {
                resolve();
              }
            );
          })
        });
    });
  }

  dateHandler(dateString) {
    const dateObject = new Date(dateString);
    var options = { year: "numeric", month: "long", day: "numeric" };
    const formattedString = dateObject.toLocaleString("en-US", options);
    return formattedString;
  }

  handlePageChange(pageNumber) {
    this.setState({ current_page: pageNumber, listLoading: true });
    this.reloadData();
  }

  render() {
    if(this.redirect) {
      return (<Redirect to={this.pathname} />);
    }
    const settings = this.state.settings;
    const tickets = this.state.tickets;
    const groups = this.state.groups;
    const selected_group = this.state.selected_group;

    const handleGroupSelect = (eventKey) => {
      this.setState(
        {
          groupLoading: true,
          listLoading: true,
          current_page: 1,
          selected_group: {
            id: eventKey,
            title: groups.find((x) => x.id === eventKey)?.title,
          },
        },
        () => {
          this.reloadData();
        }
      );
    };

    return (
      <>
        {/* <LoadingMask
          loading={this.state.viewLoading}
          indicator={TicketBoothLogo}
          style={{
            height: "100vh",
            width: "100%",
            display: this.state.viewLoading ? "block" : "none",
          }}
        ></LoadingMask> */}
        {/* <div style={{ display: this.state.viewLoading ? "none" : "block",}}> */}
        {/* <Container fluid> */}
        <div className="ticketTab">
          <Nav
            className="mondayTab"
            variant="pills"
            activeKey={selected_group?.id}
            onSelect={handleGroupSelect}
          >
            {groups.map((group) => (
              <Nav.Item key={group.id}>
                <Nav.Link eventKey={group.id} key={group.id}>
                  {group.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <div className="ticketCount">
            <strong>{this.state.total_items}</strong> Tickets in{" "}
            <strong>{selected_group?.title}</strong> Board Group
          </div>
        </div>
        {/* </Container> */}

        {/* <LoadingMask
            loading={this.state.groupLoading}
            indicator={TicketBoothLogo}
            text={"loading..."}
            style={{
              height: "100vh",
              width: "100%",
              display: this.state.groupLoading ? "block" : "none",
            }}
          /> */}
        {/* <div style={{ display: this.state.groupLoading ? "none" : "block" }}> */}
        {/* <LoadingMask
              loading={this.state.listLoading}
              indicator={TicketBoothLogo}
              text={"loading..."}
              style={{
                height: "100vh",
                width: "100%",
                display: this.state.listLoading ? "block" : "none",
              }}
            /> */}
        {/* <div style={{ display: this.state.listLoading ? "none" : "block" }}> */}

        <div className="ticketListTitle">
          <Row>
            <Col sm={1} md={1} lg={1} className="itemTitle">
              Creator
            </Col>
            <Col sm={5} md={5} lg={5}></Col>
            <Col sm={2} md={2} lg={2} className="itemTitle">
              Ticket Status
            </Col>
            <Col sm={2} md={2} lg={2} className="itemTitle">
              Last Updates
            </Col>
            <Col sm={2} md={2} lg={2}></Col>
          </Row>
        </div>
        <div className="ticketList">
          {tickets.map((item) => (
            <Row className="tktBoothCV" key={item.id}>
              <Col sm={1} md={1} lg={1}>
                <Image src={item?.thumb_URL} roundedCircle />
              </Col>
              <Col sm={5} md={5} lg={5}>
                <div className="tName">{item.name}</div>

                <div className="tUrl">
                  {item.column_values.find(
                    (x) => x.id === settings.subheading_column_key
                  )?.text || ""}
                </div>
              </Col>
              <Col sm={2} md={2} lg={2}>
                <div
                  className="status-box"
                  style={{
                    backgroundColor:
                      JSON.parse(
                        item.column_values.find(
                          (x) => x.id === settings.status_column_key
                        )?.additional_info || '""'
                      )?.color || "",
                  }}
                >
                  {item.column_values.find(
                    (x) => x.id === settings.status_column_key
                  )?.text || ""}
                </div>
              </Col>
              <Col sm={2} md={2} lg={2} className="lastUpdates">
                {this.dateHandler(item.column_values.find(
                    (x) => x.id === settings.date_column_key
                  )?.text || item.created_at)}
              </Col>
              <Col sm={2} md={2} lg={2} className="viewTkt">
                <span onClick={() => {localStorage.setItem('pathname', `/details/${item.id}`)}}>
                  <Link
                    to={{
                      pathname: `/details/${item.id}`,
                    }}
                    className="blueBtn"
                  >
                    View
                  </Link>
                </span>
                <div className="viewId">
                  ID#:{" "}
                  {item.column_values.find(
                    (x) => x.id === settings.id_column_key
                  )?.text || ""}
                </div>
              </Col>
            </Row>
          ))}
        </div>
        {/*             
            </div> */}

        <div className="tLPagination">
          <Pagination
            activePage={this.state.current_page}
            itemsCountPerPage={this.page_limit}
            totalItemsCount={this.state.total_items}
            pageRangeDisplayed={5}
            onChange={this.handlePageChange.bind(this)}
          />
        </div>

        {/* </div>
        </div> */}
      </>
    );
  }
}

export default Tickets;
