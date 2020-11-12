import React, { useState, useEffect, useRef } from "react";
import { Container, Card, Button, CardColumns, Row, Col, Tab, Nav } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import AddCannedResponse from "./AddCannedResponse";
import AddFormResponse from "./AddFormResponse";
import Avatar from "react-avatar";
import mondaySdk from "monday-sdk-js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Responses.css";
import moment from "moment";

const monday = mondaySdk();
let date = moment().format("MMM Do YYYY");

const Responses = () => {
  const history = useHistory();
  const [show, setShow] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [textResponses, setTextResponses] = useState([]);
  const [formResponses, setFormResponses] = useState([]);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("");

  useEffect(() => {
    getTextResponses();
    getFormResponses();
  }, [textResponses, formResponses]);

  const getTextResponses = async () => {
    let textResponses = await monday.storage.instance.getItem("textResponses");
    if (textResponses.data && textResponses.data.value) {
      let textResponsesData = JSON.parse(textResponses.data.value);
      setTextResponses(textResponsesData);
    }
  };

  const getFormResponses = async () => {
    let textResponses = await monday.storage.instance.getItem("formResponses");
    if (textResponses.data && textResponses.data.value) {
      let textResponsesData = JSON.parse(textResponses.data.value);
      setFormResponses(textResponsesData);
    }
  };

  let cardList;
  let formList;
  let createTextButton;
  let createFormButton;

  const handleForm = () => {
    setShow(false);
    setShowForm(true);
  };

  const handleText = () => {
    setShow(true);
    setShowForm(false);
  };

  const deleteTextResponse = (index) => {
    monday
      .execute("confirm", {
        title: "wewqew",
        message: "Are you sure you want delete text response?",
        confirmButton: "Delete",
        cancelButton: "Cancel",
        excludeCancelButton: false
      })
      .then((res) => {
        if (res.data.confirm) {
          const data = textResponses;
          data.splice(index, 1);
          monday.storage.instance.setItem(
            "textResponses",
            JSON.stringify(data)
          );
        }
      });
    // confirmAlert({
    //   customUI: ({ onClose }) => {
    //     return (
    //       <div className="custom-ui">
    //         <h3>Delete Response?</h3>
    //         <p>Are you sure to delete?</p>
    //         <button
    //           className="btn btn-secondary btn-sm"
    //           style={{ marginRight: 10 }}
    //           onClick={onClose}
    //         >
    //           No
    //         </button>
    //         <button
    //           className="btn btn-danger btn-sm"
    //           onClick={() => {
    //             const data = textResponses;
    //             data.splice(index, 1);
    //             monday.storage.instance.setItem(
    //               "textResponses",
    //               JSON.stringify(data)
    //             );
    //             onClose();
    //           }}
    //         >
    //           Delete
    //         </button>
    //       </div>
    //     );
    //   }
    // });
  };

  const closeModal = () => {
    setSelectedIndex(-1);
    setSelectedText("");
    setSelectedTitle("");
    setSelectedUrl("");
    setShowTextModal(false);
    setShowFormModal(false);
  };

  const deleteFormResponse = (index) => {
    monday
      .execute("confirm", {
        title: "wewqew",
        message: "Are you sure you want delete form response?",
        confirmButton: "Delete",
        cancelButton: "Cancel",
        excludeCancelButton: false
      })
      .then((res) => {
        if (res.data.confirm) {
          const data = formResponses;
          data.splice(index, 1);
          monday.storage.instance.setItem(
            "formResponses",
            JSON.stringify(data)
          );
        }
      });
  };

  if (show) {
    createTextButton = (
      <Button className="viewBtn create-btn" onClick={() => {
          setShowTextModal(true);
        }}>
        Create Response
      </Button>
    );

    cardList = (
      <CardColumns>
        {textResponses.map((textResponse, index) => (
          <div
            onClick={() => {
              setSelectedIndex(index);
              setSelectedText(textResponse.text);
              setSelectedTitle(textResponse.title);
              setTimeout(() => {
                setShowTextModal(true);
              }, 500);
            }}
          >
            <Card style={{}}>
              <Card.Body className="response-card">
                <Card.Title >{textResponse.title}</Card.Title>
                <Card.Text 
                  dangerouslySetInnerHTML={{ __html: textResponse.text }}
                  className="text"
                ></Card.Text>
                <div style={{position: 'absolute', bottom: '10px', width: '90%'}}>
                  <Avatar name="Foo Bar" size={24} round="12px" />
                  <Card.Link href="#" style={{fontSize: '13px'}}>{textResponse.date}</Card.Link>
                  <span
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTextResponse(index);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} color="#676879" />
                  </span>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </CardColumns>
    );
  }

  if (showForm) {
    createFormButton = (
      <Button className="viewBtn create-btn" onClick={() => {
          setShowFormModal(true);
        }}>
        Create Form Response
      </Button>
    );

    formList = (
      <CardColumns>
        {formResponses.map((textResponse, index) => (
          <div
            onClick={() => {
              setSelectedTitle(textResponse.title);
              setSelectedUrl(textResponse.url);
              setSelectedIndex(index);
              setShowFormModal(true);
            }}
          >
            <Card style={{}}>
              <Card.Body className="response-card">
                <Card.Title>{textResponse.title}</Card.Title>
                <Card.Text>{textResponse.url}</Card.Text>
                <div style={{position: 'absolute', bottom: '5px', width: '90%'}}>
                  <Avatar name="Foo Bar" size={24} round="12px" />
                  <Card.Link href="#">{textResponse.date}</Card.Link>
                  <span
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFormResponse(index);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} color="#676879" />
                  </span>
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
      </CardColumns>
    );
  }

  return (
    <>
      <Container className="container">
        <header className="head">
          <div className='row'>
        <Nav className="mondayTab" variant="pills">
            <Nav.Item>
              <Nav.Link
                eventKey={0}
                onClick={handleText}
                className={
                  show
                    ? "selected-view nav-link active"
                    : "unselected-view"
                }
              >
                Text
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey={1}
                onClick={handleForm}
                className={
                  showForm
                    ? "selected-view nav-link active"
                    : "unselected-view"
                }
              >
                Form
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

          {createFormButton}
          {createTextButton}
          </div>
        </header>
        {showForm && (
          <div>
            <div style={{ padding: "10px" }}>{formList}</div>
            <AddFormResponse
              setShowFormModal={closeModal}
              showFormModal={showFormModal}
              selectedIndex={selectedIndex}
              selectedTitle={selectedTitle}
              selectedUrl={selectedUrl}
            />
          </div>
        )}
        {show && (
          <div>
            <div style={{ padding: "10px" }}>{cardList}</div>
            <AddCannedResponse
              setShowTextModal={closeModal}
              showTextModal={showTextModal}
              selectedIndex={selectedIndex}
              selectedTitle={selectedTitle}
              selectedText={selectedText}
            />
          </div>
        )}
      </Container>
    </>
  );
};

export default Responses;
