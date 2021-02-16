import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import "./AddCannedResponse.css";
import "bootstrap/dist/css/bootstrap.min.css";
import CKEditor from "ckeditor4-react";
import moment from "moment";
import mondaySdk from "monday-sdk-js";

const monday = mondaySdk();

const editorConfiguration = {
  toolbar: [
    [
      "Bold",
      "Italic",
      "Link",
      "BulletedList",
      "NumberedList",
      "BlockQuote",
      "Table",
      "Source"
    ]
  ],
  allowedContent: true,
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
    props.setShowTextModal(false);
    setTitleValue("");
    setTextValue("");
    monday.execute("notice", {
      message: "Response is being created",
      type: "info", // or "error" (red), or "info" (blue)
      timeout: 5000
    });
    monday.api(`query { me { id name } } `).then(async (res) => {
      let name = 'N A';
      if(res && res.data && res.data.me && res.data.me.name) {
        name = res.data.me.name;
      }
      const data = {
        title: titleValue,
        text: textValue,
        date: moment().format("MMM Do YYYY"),
        name: name
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
      props.getTextResponses();
      monday.execute("notice", {
        message: "Text Response added Successfully",
        type: "success", // or "error" (red), or "info" (blue)
        timeout: 10000
      });
    });
    
    
  };
  
  return (
    <>
      <Modal show={props.showTextModal} onHide={() => {}} className="modal">
        <Modal.Body>
          <div className="modalTitle">New Canned Text Response</div>
          <div className="modalLable"> Response Title</div>
          <input
            className="form-control"
            type="text"
            value={titleValue}
            placeholder="Insert Title"
            onChange={handleTitle}
          />
          <div className="modalLable"> Description</div>
          <CKEditor
            data={textValue}
            config={editorConfiguration}
            onChange={(event, editor) => {
              setTextValue(event.editor.getData());
            }}
          />
          <div className="modalButton">
            <a
              className="blackBtn"
              onClick={() => {
                props.setShowTextModal();
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

export default AddCannedResponse;
