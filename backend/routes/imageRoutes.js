const express = require("express");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Directory for storing files locally
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
  console.log(`Created local upload directory at: ${UPLOAD_DIR}`);
} else {
  console.log(`Local upload directory already exists at: ${UPLOAD_DIR}`);
}

// Configure multer for in-memory storage
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// POST /api/images/upload - Upload to both GridFS and local storage
router.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Incoming request to upload file to GridFS and local storage");

  try {
    if (!req.file) {
      console.error("No file received in the request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const gridfsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    console.log(
      "Uploading file to GridFS with filename:",
      req.file.originalname
    );

    // Upload to GridFS
    const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });
    uploadStream.end(req.file.buffer);

    // Save locally
    const localFilePath = path.join(
      UPLOAD_DIR,
      `${Date.now()}-${req.file.originalname}`
    );
    fs.writeFileSync(localFilePath, req.file.buffer);
    console.log(`File also saved locally at: ${localFilePath}`);

    uploadStream.on("finish", () => {
      console.log(
        "File successfully uploaded to GridFS with ID:",
        uploadStream.id
      );
      res.status(200).json({
        message: "File uploaded successfully to GridFS and local storage",
        gridfsFileId: uploadStream.id,
        localFilePath,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("Error during GridFS upload:", err);
      res.status(500).json({ error: "Failed to upload file to GridFS" });
    });
  } catch (err) {
    console.error("Internal server error during upload:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/images/local - List all files from local storage
router.get("/local", (req, res) => {
  console.log("Incoming request to list all files in local storage");

  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const fileData = files.map((file) => ({
      filename: file,
      url: `/uploads/${file}`,
    }));

    if (!files || files.length === 0) {
      console.warn("No files found in local storage");
      return res.status(404).json({ error: "No files found in local storage" });
    }

    console.log(`Found ${files.length} files in local storage`);
    res.status(200).json(fileData);
  } catch (err) {
    console.error("Error fetching files from local storage:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
