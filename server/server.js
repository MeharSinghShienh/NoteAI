const express = require("express");
const pdfParse = require("pdf-parse");
const multer = require("multer");
const bodyParser = require("body-parser");
const { spawn } = require("child_process");

const app = express();

const fs = require("fs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const cors = require("cors");
app.use(cors());

// Set up the storage configuration for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("pdfFile");

// extract pdf text
app.post("/extract-text", (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error("Error uploading file:", err);
      return res.status(400).end();
    }

    if (!req.file) {
      console.error("No file uploaded.");
      return res.status(400).end();
    }

    pdfParse(req.file.buffer).then((result) => {
      res.send(result.text);
    });
  });
});

// run python script
app.post("/readPython", (request, response) => {
  // Reading Python files
  var dataToSend;
  // spawn new child process to call the python script
  const python = spawn("python", [
    "../client/src/noteAI/noteai.py",
    request.body.data,
  ]);

  // collect data from script
  python.stdout.on("data", function (data) {
    dataToSend = data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  // in close event we are sure that stream from child process is closed
  python.on("exit", (code) => {
    response.send(dataToSend);
  });
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
