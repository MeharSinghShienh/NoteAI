import React from "react";
import { formatNotes } from "../helpers";

import "./dragdrop.css";

// drag drop file component

class DragDropFileComponent extends React.Component {
  constructor() {
    super();
    this.state = {
      dragActive: false,
      aiNotesBody: "",
      selectedNote: null,
      notes: null,
    };
    this.inputRef = React.createRef(null);
  }

  // handle drag events
  handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      this.setState({ dragActive: true });
    } else if (e.type === "dragleave") {
      this.setState({ dragActive: false });
    }
  };

  // triggers when file is dropped
  handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ dragActive: false });
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const formData = new FormData();
      formData.append("pdfFile", e.dataTransfer.files[0]);

      fetch("http://localhost:5000/extract-text", {
        method: "post",
        body: formData,
      })
        .then((response) => {
          return response.text();
        })
        .then((extractedText) => {
          fetch("http://localhost:5000/readPython", {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: extractedText }),
          })
            .then((response) => {
              return response.text();
            })
            .then((aiNotes) => {
              this.props.newNoteAi(formatNotes(aiNotes));
            });
        });
    }
  };

  // triggers when file is selected with click
  handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append("pdfFile", e.target.files[0]);

      fetch("http://localhost:5000/extract-text", {
        method: "post",
        body: formData,
      })
        .then((response) => {
          return response.text();
        })
        .then((extractedText) => {
          fetch("http://localhost:5000/readPython", {
            method: "post",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: extractedText }),
          })
            .then((response) => {
              return response.text();
            })
            .then((aiNotes) => {
              this.props.newNoteAi(formatNotes(aiNotes));
            });
        });
    }
  };

  // triggers the input when the button is clicked
  onButtonClick = () => {
    this.inputRef.current.click();
  };

  render() {
    return (
      <form
        id="form-file-upload"
        onDragEnter={this.handleDrag}
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          ref={this.inputRef}
          type="file"
          accept="application/pdf"
          id="input-file-upload"
          multiple={false}
          onChange={this.handleChange}
        />
        <label
          id="label-file-upload"
          htmlFor="input-file-upload"
          className={this.state.dragActive ? "drag-active" : ""}
        >
          <div>
            <p style={{ fontSize: 30, margin: 10 }}>
              <b>NoteAI</b>
            </p>
            <button className="upload-button" onClick={this.onButtonClick}>
              Upload a file
            </button>
          </div>
        </label>
        {this.state.dragActive && (
          <div
            id="drag-file-element"
            onDragEnter={this.handleDrag}
            onDragLeave={this.handleDrag}
            onDragOver={this.handleDrag}
            onDrop={this.handleDrop}
          ></div>
        )}
      </form>
    );
  }
}

export default DragDropFileComponent;
