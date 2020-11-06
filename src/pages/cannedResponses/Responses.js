import React, { useState, useEffect } from "react";
import { Container, Card, Button, CardColumns } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons";
import Avatar from "react-avatar";
import mondaySdk from "monday-sdk-js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Responses.css";
import moment from "moment";


const monday = mondaySdk();
 let date=moment().format("MMM Do YYYY")

const Responses = () => {
  const history = useHistory();
  const [show, setShow] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [textResponses, setTextResponses] = useState([]);
  const [formResponses, setFormResponses] = useState([]);
  const [value, setValue] = useState(null);

  useEffect(() => {
    getTextResponses();
    getFormResponses();
  });

  const getTextResponses = async () => {
    let textResponses = await monday.storage.instance.getItem("textResponses");
    if (textResponses.data.value) {
      let textResponsesData = JSON.parse(textResponses.data.value);
      setTextResponses(textResponsesData);
    }
  };

  const getFormResponses = async () => {
    let textResponses = await monday.storage.instance.getItem("formResponses");
    let textResponsesData = JSON.parse(textResponses.data.value);
    setFormResponses(textResponsesData);
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
    const data = textResponses;
    data.splice(index, 1);
    //setTextResponses(data);
    monday.storage.instance.setItem("textResponses", JSON.stringify(data));
  };

  const deleteFormResponse = (index) => {
    const data = formResponses;
    data.splice(index, 1);
    //setFormResponses(data);
    monday.storage.instance.setItem("formResponses", JSON.stringify(data));
  };

  if (show) {
    createTextButton = (
      <Link to="/textresponse">
        <Button className="create-btn" variant="primary">
          Create response
        </Button>
      </Link>
    );

    cardList = (
      <CardColumns>
        {textResponses.map((textResponse, index) => (
          <div
              style={{padding: "10px"}}
            onClick={() => {
              history.push({
                pathname: "/textresponse",
                title: textResponse.title,
                text: textResponse.text,
                index: index
              });
            }}
          >
            <Card style={{ width: "15rem" }}>
              <Card.Body>

                <Card.Title>{textResponse.title}</Card.Title>
                <Card.Text
                  dangerouslySetInnerHTML={{ __html: textResponse.text }}
                ></Card.Text>
                <Avatar name="Foo Bar" size={24} round="12px" />
                <Card.Link href="#">{date}</Card.Link>
                <span
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTextResponse(index);
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} color="#676879" />
                </span>
              </Card.Body>
            </Card>
          </div>
        ))}
      </CardColumns>
    );
  }

  if (showForm) {
    createFormButton = (
      <Link to="/formresponse">
        <Button className="create-btn" variant="primary">
          Create form response
        </Button>
      </Link>
    );

    formList = (
      <CardColumns>
        {formResponses.map((textResponse, index) => (
          <div
              style={{padding: "20px"}}
            onClick={() => {
              history.push({
                pathname: "/formresponse",
                title: textResponse.title,
                url: textResponse.url,
                index: index
              });
            }}


          >
            <Card    className="main-card">
              <Card.Body>
                <span
                  className="icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFormResponse(index);
                  }}
                >
                  <FontAwesomeIcon icon={faTrashAlt} color="black" />
                </span>
                <Card.Title>{textResponse.title}</Card.Title>
                <Card.Text>{textResponse.url}</Card.Text>
                <Avatar name="Foo Bar" size={40} round="20px" />
                <Card.Link href="#">{textResponse.date}</Card.Link>
              </Card.Body>
            </Card>
          </div>
        ))}
      </CardColumns>
    );
  }

  return (
    <>
      <Container className="container" >
        <header className="head">
          <span
            variant="primary"
            className="btn-response"
            onClick={handleText}
          >
            Text
          </span>
          <span
            variant="primary"
            className="btn-response"
            onClick={handleForm}
          >
            Form
          </span>
          <Link to="/newform">
            <Button className="create-btn" variant="primary">
              New Button
            </Button>
          </Link>

          {createFormButton}
          {createTextButton}
        </header>

        {cardList}
        {formList}
      </Container>
    </>
  );
};

export default Responses;
