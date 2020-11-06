import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "./AddCannedResponse.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Link, useLocation, useHistory } from "react-router-dom";
import moment from "moment";
import mondaySdk from "monday-sdk-js";

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

const AddCannedResponse = () => {
  const history = useHistory();

  const { title, text, index } = useLocation();
  const [titleValue, setTitleValue] = useState(title);
  const [textValue, setTextValue] = useState(text);
  const handleTitle = (e) => {
    setTitleValue(e.target.value);
  };

  const saveClick = async () => {
    const data = {
      title: titleValue,
      text: textValue,
      date: moment().format("MMM Do YY")
    };
    let textResponses = await monday.storage.instance.getItem("textResponses");
    let textResponsesData = JSON.parse(textResponses.data.value);
    if (index >= 0) {
      textResponsesData[index] = data;
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
    history.push("/cannedResponses");
  };

  return (
    <>
      <Modal show={true}>
        <Modal.Body>
          <div className="body-area">
            <h5>Title</h5>
            <input type="text" value={titleValue} onChange={handleTitle} />

            <CKEditor
              editor={ClassicEditor}
              data={textValue}
              config={editorConfiguration}
              onInit={(editor) => {
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
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Link to="/cannedResponses">
            <Button className="btn btn-primary btn-sm">Cancel</Button>
          </Link>

          <Button className="btn btn-success btn-sm" onClick={saveClick}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddCannedResponse;
