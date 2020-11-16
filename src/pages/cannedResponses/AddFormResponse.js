import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import { Link, useLocation, useHistory } from "react-router-dom";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

const AddFormResponse = (props) => {
  const history = useHistory();
  const { selectedTitle, selectedUrl, selectedIndex } = props;
  const [titleValue, setTitleValue] = useState(selectedTitle);
  const [urlValue, setUrlValue] = useState(selectedUrl);
  useEffect(() => {
    setTitleValue(selectedTitle);
    setUrlValue(selectedUrl);
  }, [selectedTitle, selectedUrl]);

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
      date: moment().format("MMM Do YYYY"),
    };
    let formResponses = await monday.storage.instance.getItem("formResponses");
    let formResponsesData = JSON.parse(formResponses.data.value);
    if (selectedIndex >= 0) {
      formResponsesData[selectedIndex] = data;
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
    props.setShowFormModal();
    setTitleValue("");
    setUrlValue("");
  };

  return (
    <>
      <Modal show={props.showFormModal}>
        <Modal.Body>
          <div className="body-area">
            <p className="modal-heading">New Canned Form Response</p>
            <p className="res-title"> Form Title</p>
            <input
              className="form-control"
              type="text"
              value={titleValue}
              placeholder="Insert Title"
              onChange={handleTitle}
            />
            <p className="res-title"> Form Link</p>
            <input
              className="form-control"
              type="text"
              value={urlValue}
              placeholder=""
              onChange={handleUrl}
            />
          </div>
          <div className="save-btn modal-button">
            <div className="save-btn modal-button">
            <Button className="cancelBtn" style={{marginRight: 5}} onClick={() => {props.setShowFormModal();}}>Cancel</Button>
            <Button className="viewBtn" style={{color: "#fff"}} onClick={saveClick}>
              Create
            </Button>
          </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddFormResponse;
