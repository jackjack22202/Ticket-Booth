import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import "./AddCannedResponse.css";
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
    props.setShowFormModal();
    setTitleValue("");
    setUrlValue("");
    monday.api(`query { me { id name } } `).then(async (res) => {
      let name = "N A";
      if (res && res.data && res.data.me && res.data.me.name) {
        name = res.data.me.name;
      }
      const data = {
        title: titleValue,
        url: urlValue,
        date: moment().format("MMM Do YYYY"),
        name: name
      };
      let formResponses = await monday.storage.instance.getItem(
        "formResponses"
      );
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
      monday.execute("notice", {
        message: "Form Response added Successfully",
        type: "success", // or "error" (red), or "info" (blue)
        timeout: 10000
      });
    });
  };

  return (
    <>
      <Modal show={props.showFormModal}>
        <Modal.Body>
          <div className="modalTitle">New Canned Form Response</div>
          <div className="modalLable"> Form Title</div>
          <input
            className="form-control"
            type="text"
            value={titleValue}
            placeholder="Insert Title"
            onChange={handleTitle}
          />
          <div className="modalLable"> Form Link</div>
          <input
            className="form-control"
            type="text"
            value={urlValue}
            placeholder=""
            onChange={handleUrl}
          />
          <div className="modalButton">
            <a
              className="blackBtn"
              onClick={() => {
                props.setShowFormModal();
              }}
            >
              Cancel
            </a>
            <a className="blueBtn" onClick={saveClick}>
              {selectedIndex > -1 ? "Update" : "Create"}
            </a>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddFormResponse;
