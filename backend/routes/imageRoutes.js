const express = require("express");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const mongoose = require("mongoose");

const router = express.Router();

// Configure multer to store files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/images/upload - Upload an image
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const gridfsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on("finish", () => {
      res.status(200).json({
        message: "File uploaded successfully",
        fileId: uploadStream.id,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload Error:", err);
      res.status(500).json({ error: "Failed to upload file" });
    });
  } catch (err) {
    console.error("Internal Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/images/:filename - Retrieve an image by filename
router.get("/:filename", async (req, res) => {
  try {
    const gridfsBucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "uploads",
    });

    const file = await mongoose.connection.db
      .collection("uploads.files")
      .findOne({ filename: req.params.filename });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.set("Content-Type", file.contentType);
    const readstream = gridfsBucket.openDownloadStreamByName(
      req.params.filename
    );
    readstream.pipe(res);
  } catch (err) {
    console.error("Error fetching file:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/images - List all images
router.get("/", async (req, res) => {
  try {
    const files = await mongoose.connection.db
      .collection("uploads.files")
      .find()
      .toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }

    res.status(200).json(files);
  } catch (err) {
    console.error("Error fetching files:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
