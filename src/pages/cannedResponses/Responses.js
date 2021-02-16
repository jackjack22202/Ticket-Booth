import React, { useState, useEffect } from "react";
import {
  Container,
  Button,
  Row,
  Col,
  Nav
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import AddCannedResponse from "./AddCannedResponse";
import AddFormResponse from "./AddFormResponse";
import Avatar from "react-avatar";
import mondaySdk from "monday-sdk-js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Responses.css";
import "../../App.css";
import empty from "../../library/images/nav-icons/Icons_Misc_Settings2.svg";
// import ticketBooth from "../library/images/TicketBooth.gif";

const monday = mondaySdk();
const Responses = () => {
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
  }, []);

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
      <Button
        className="blueBtn"
        onClick={() => {
          setShowTextModal(true);
        }}
      >
        Create Response
      </Button>
    );

    cardList = (
      <>
        {textResponses.map((textResponse, index) => (
          <Col md={4} key={index}>
            <div
              className="cardView"
              onClick={() => {
                setSelectedIndex(index);
                setSelectedText(textResponse.text);
                setSelectedTitle(textResponse.title);
                setTimeout(() => {
                  setShowTextModal(true);
                }, 500);
              }}
            >
              <div className="title">{textResponse.title}</div>
              <div
                className="url"
                dangerouslySetInnerHTML={{ __html: textResponse.text }}
              ></div>
              <div className="bottomView">
                <Avatar name={textResponse.name} size={24} round="12px" />
                <div className="date">{textResponse.date}</div>
                <a
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTextResponse(index);
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} color="#676879" />
                </a>
              </div>
            </div>
          </Col>
        ))}
      </>
    );
  }

  if (showForm) {
    createFormButton = (
      <Button
        className="blueBtn"
        onClick={() => {
          setShowFormModal(true);
        }}
      >
        Create Form Response
      </Button>
    );

    formList = (
      <>
        {formResponses.map((textResponse, index) => (
          <Col md={4} key={index}>
            <div
              className="cardView"
              onClick={() => {
                setSelectedTitle(textResponse.title);
                setSelectedUrl(textResponse.url);
                setSelectedIndex(index);
                setShowFormModal(true);
              }}
            >
              <div className="title">{textResponse.title}</div>
              <div className="url">{textResponse.url}</div>
              <div className="bottomView">
                <Avatar name={textResponse.name} size={24} round="12px" />
                <div className="date">{textResponse.date}</div>
                <a
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFormResponse(index);
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} color="#676879" />
                </a>
              </div>
            </div>
          </Col>
        ))}
      </>
    );
  }

  return (
    <>
      <div className="navBar">
        <Nav className="mondayTab" variant="pills">
          <Nav.Item>
            <Nav.Link
              eventKey={0}
              onClick={handleText}
              className={
                show ? "selected-view nav-link active" : "unselected-view"
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
                showForm ? "selected-view nav-link active" : "unselected-view"
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
      {showForm && (
        <>
          <Container>
            <Row>{formList}</Row>
            <AddFormResponse
              setShowFormModal={closeModal}
              showFormModal={showFormModal}
              selectedIndex={selectedIndex}
              selectedTitle={selectedTitle}
              selectedUrl={selectedUrl}
              getFormResponses={getFormResponses}
            />
          </Container>
          {formResponses.length < 1 && (
            <Container className="emptyWrapper">
              <img src={empty} />
              <div className="emptyMessage">No Form Canned Response</div>
              <Button
                className="blueBtn"
                onClick={() => {
                  setShowFormModal(true);
                }}
              >
                Create
              </Button>
            </Container>
          )}
        </>
      )}
      {show && (
        <>
          <Container>
            <Row>{cardList}</Row>
            <AddCannedResponse
              setShowTextModal={closeModal}
              showTextModal={showTextModal}
              selectedIndex={selectedIndex}
              selectedTitle={selectedTitle}
              selectedText={selectedText}
              getTextResponses={getTextResponses}
            />
          </Container>
          {textResponses.length < 1 && (
            <Container className="emptyWrapper">
              <img src={empty} />
              <div className="emptyMessage">No Canned Response</div>
              <Button
                className="blueBtn"
                onClick={() => {
                  setShowTextModal(true);
                }}
              >
                Create
              </Button>
            </Container>
          )}
        </>
      )}
    </>
  );
};

export default Responses;
