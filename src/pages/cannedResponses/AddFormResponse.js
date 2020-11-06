import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import { Link, useLocation, useHistory } from "react-router-dom";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

const AddFormResponse = () => {
  const history = useHistory();
  const { title, url, index } = useLocation();
  const [titleValue, setTitleValue] = useState(title);
  const [urlValue, setUrlValue] = useState(url);

  const handleTitle = (e) => {
    setTitleValue(e.target.value);
  };

  const handleUrl = (e) => {
    setUrlValue(e.target.value);
  };

  const saveClick = async () => {
    const data = {
      title: titleValue,
      url: urlValue,
      date: moment().format("MMM Do YY")
    };
    let formResponses = await monday.storage.instance.getItem("formResponses");
    let formResponsesData = JSON.parse(formResponses.data.value);
    if (index >= 0) {
        formResponsesData[index] = data
    } else {
      if (formResponsesData) {
        formResponsesData.push(data);
      } else {
        formResponsesData = [];
        formResponsesData.push(data);
      }
    }

    await monday.storage.instance.setItem(
      "formResponses",
      JSON.stringify(formResponsesData)
    );
    history.push("/cannedResponses");
  };

  return (
    <>
      <Modal show={true}>
        <Modal.Body>
          <p>Form title</p>
          <input
            type="text"
            style={{ width: "350px" }}
            value={titleValue}
            onChange={handleTitle}
          />
          <p>Past url here!</p>
          <input
            type="text"
            style={{ width: "350px" }}
            value={urlValue}
            onChange={handleUrl}
          />
        </Modal.Body>
        <Modal.Footer>
          <Link to="/cannedResponses">
            <Button
              className="btn btn-primary btn-sm"
              style={{ width: "70px" }}
            >
              Cancel
            </Button>
          </Link>
          <Button
            className="btn btn-success btn-sm"
            style={{ width: "70px" }}
            onClick={saveClick}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddFormResponse;
