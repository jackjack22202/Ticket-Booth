import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import "./AddCannedResponse.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Link, useLocation, useHistory } from "react-router-dom";
import moment from "moment";
import mondaySdk from "monday-sdk-js";
import { propTypes } from "react-bootstrap/esm/Image";

const monday = mondaySdk();
const editorConfiguration = {
  toolbar: {
    items: [
      "underline",
      "bold",
      "italic",
      "link",
      "bulletedList",
      "numberedList",
      "blockQuote",
      "insertTable",
      "undo",
      "redo",
      "alignment"
    ]
  },
  language: "en",
  image: {
    toolbar: ["imageTextAlternative", "imageStyle:full", "imageStyle:side"]
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"]
  },
  licenseKey: ""
};

const AddCannedResponse = (props) => {
  const history = useHistory();

  const { selectedTitle, selectedText, selectedIndex } = props;
  const [titleValue, setTitleValue] = useState(selectedTitle);
  const [textValue, setTextValue] = useState(selectedText);
  useEffect(() => {
    setTitleValue(selectedTitle);
    setTextValue(selectedText);
  }, [selectedTitle, selectedText]);

  
  const handleTitle = (e) => {
    setTitleValue(e.target.value);
  };

  const saveClick = async () => {
    const data = {
      title: titleValue,
      text: textValue,
      date: moment().format("MMM Do YYYY"),
    };
    let textResponses = await monday.storage.instance.getItem("textResponses");
    let textResponsesData = JSON.parse(textResponses.data.value);
    if (selectedIndex >= 0) {
      textResponsesData[selectedIndex] = data;
    } else {
      if (textResponsesData) {
        textResponsesData.push(data);
      } else {
        textResponsesData = [];
        textResponsesData.push(data);
      }
    }
    await monday.storage.instance.setItem(
      "textResponses",
      JSON.stringify(textResponsesData)
    );
    props.setShowTextModal(false);
    setTitleValue('');
    setTextValue('');
  };

  const closeModal = () => {
    //setTitleValue('');
    //setTextValue('');
  }

  return (
    <>
      <Modal show={props.showTextModal} className="model">
        <Modal.Body>
          <div className="body-area" style={{paddingRight: 20}}>
            <p className="modal-heading">New Canned Text Response</p>
            <p className="res-title"> Response Title</p>
            <input
              className="form-control"
              type="text"
              value={titleValue}
              placeholder="Insert Title"
              onChange={handleTitle}
            />
            <p className="res-title"> Description</p>
            <CKEditor
              editor={ClassicEditor}
              data={textValue}
              config={editorConfiguration}
              onChange={(event, editor) => {
                setTextValue(editor.getData());
              }}
            />
          </div>
          <div className="save-btn modal-button">
            <Button className="cancelBtn" style={{marginRight: 5}} onClick={() => {props.setShowTextModal();}}>Cancel</Button>
            <Button className="viewBtn" style={{color: "#fff"}} onClick={saveClick}>
              Create
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddCannedResponse;
