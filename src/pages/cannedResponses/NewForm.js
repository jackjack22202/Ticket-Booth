import React, { useState, useEffect } from "react";
import { Button, Container, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import mondaySdk from "monday-sdk-js";
import CKEditor from "ckeditor4-react";
import "./NewForm.css";

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
      "Undo",
      "Redo",
      "Source",
    ],
  ],
  allowedContent: true,
  language: "en",
  image: {
    toolbar: ["imageTextAlternative", "imageStyle:full", "imageStyle:side"],
  },
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
  licenseKey: "",
};

const NewForm = () => {
  const [titleValue, setTitleValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [textResponses, setTextResponses] = useState([]);

  useEffect(() => {
    getTextResponses();
  });

  const getTextResponses = async () => {
    let textResponses = await monday.storage.instance.getItem("textResponses");
    if (textResponses.data.value) {
      let textResponsesData = JSON.parse(textResponses.data.value);
      setTextResponses(textResponsesData);
    }
  };
  const handleClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="main Container">
        <Link to="/" style={{ marginBottom: 20 }}>
          <Button className="btn btn-primary btn-sm">
            Dashboard
          </Button>
        </Link>

        <CKEditor
          data={textValue}
          config={editorConfiguration}
          onReady={(editor) => {
            // You can store the "editor" and use when it is needed.
            console.log("Editor is ready to use!", editor);
          }}
          onChange={(event, editor) => {
            setTextValue(editor.getData());
          }}
          onBlur={(event, editor) => {
            console.log("Blur.", editor);
          }}
          onFocus={(event, editor) => {
            console.log("Focus.", editor);
          }}
        />
        <p style={{ padding: 5, color: "#2b99ff" }} onClick={handleClick}>Select Canned Response</p>
      </div>

        <Modal show={showModal}>
          <Modal.Body>
            {textResponses.map((textResponse, index) => (
              <div
                className="body-area"
                onClick={() => {
                  setTextValue(textResponse.text);
                  closeModal();
                }}
              >
                <h5>{textResponse.title}</h5>
                <p dangerouslySetInnerHTML={{ __html: textResponse.text }}></p>
              </div>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button className="btn btn-primary btn-sm" onClick={closeModal}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
    </>
  );
};

export default NewForm;
