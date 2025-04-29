import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Advertisement from "../models/Advertisement.js";
import requirePhoto from "../middleware/requirePhoto.js";

const router = express.Router();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../project_images"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and GIF images are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Get all advertisements
router.get("/", async (req, res) => {
  try {
    const advertisements = await Advertisement.find({});
    return res.status(200).json({ data: advertisements });
  } catch (error) {
    console.error("Error fetching advertisements:", error.stack);
    res.status(500).json({ message: "Server error fetching advertisements" });
  }
});

// Create new advertisement
router.post("/", upload.single("uploadImage"), requirePhoto, async (req, res) => {
  try {
    console.log("POST /advertisements received:", req.body, req.file); // Debug
    const { name, email, contactNumber, advertisementType, petType, heading, description } = req.body;

    // Validate required fields
    if (!name || !email || !contactNumber || !advertisementType || !heading || !description) {
      console.log("Validation failed: Missing required fields");
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Validate advertisementType
    const validTypes = ["Sell a Pet", "Lost Pet", "Found Pet"];
    if (!validTypes.includes(advertisementType)) {
      console.log("Validation failed: Invalid advertisement type:", advertisementType);
      return res.status(400).json({ message: "Invalid advertisement type" });
    }

    // Require petType for "Sell a Pet"
    if (advertisementType === "Sell a Pet" && !petType) {
      console.log("Validation failed: Pet type required for Sell a Pet");
      return res.status(400).json({ message: "Pet type is required for selling a pet" });
    }

    const newAdvertisement = {
      name,
      email,
      contactNumber,
      advertisementType,
      petType: advertisementType === "Sell a Pet" ? petType : "",
      heading,
      description,
      photo: req.file ? req.file.filename : null,
    };

    console.log("Creating advertisement:", newAdvertisement); // Debug
    const advertisement = await Advertisement.create(newAdvertisement);
    console.log("Advertisement created:", advertisement); // Debug
    return res.status(201).json({ message: "Advertisement created successfully", id: advertisement._id });
  } catch (error) {
    console.error("Error creating advertisement:", error.stack);
    res.status(500).json({ message: "Server error creating advertisement", error: error.message });
  }
});

// Get advertisement by ID
router.get("/details/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    return res.status(200).json(advertisement);
  } catch (error) {
    console.error("Error fetching advertisement:", error.stack);
    res.status(500).json({ message: "Server error fetching advertisement" });
  }
});

// Get advertisements by email
router.get("/my-ads/:email", async (req, res) => {
  try {
    const advertisements = await Advertisement.find({ email: req.params.email });
    return res.status(200).json({
      count: advertisements.length,
      data: advertisements,
    });
  } catch (error) {
    console.error("Error fetching user advertisements:", error.stack);
    res.status(500).json({ message: "Server error fetching user advertisements" });
  }
});

// Update advertisement
router.put("/edit/:id", upload.single("uploadImage"), async (req, res) => {
  try {
    const { name, email, contactNumber, advertisementType, petType, heading, description } = req.body;

    // Validate required fields
    if (!name || !email || !contactNumber || !advertisementType || !heading || !description) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Validate advertisementType
    const validTypes = ["Sell a Pet", "Lost Pet", "Found Pet"];
    if (!validTypes.includes(advertisementType)) {
      return res.status(400).json({ message: "Invalid advertisement type" });
    }

    // Require petType for "Sell a Pet"
    if (advertisementType === "Sell a Pet" && !petType) {
      return res.status(400).json({ message: "Pet type is required for selling a pet" });
    }

    const updateData = {
      name,
      email,
      contactNumber,
      advertisementType,
      petType: advertisementType === "Sell a Pet" ? petType : "",
      heading,
      description,
    };
    if (req.file) updateData.photo = req.file.filename;

    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    return res.status(200).json({ message: "Advertisement updated successfully" });
  } catch (error) {
    console.error("Error updating advertisement:", error.stack);
    res.status(500).json({ message: "Server error updating advertisement" });
  }
});

// Approve advertisement
router.put("/approve/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: "Approved" }, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    return res.status(200).json({ message: "Advertisement approved successfully" });
  } catch (error) {
    console.error("Error approving advertisement:", error.stack);
    res.status(500).json({ message: "Server error approving advertisement" });
  }
});

// Reject advertisement
router.put("/reject/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: "Rejected" }, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    return res.status(200).json({ message: "Advertisement rejected successfully" });
  } catch (error) {
    console.error("Error rejecting advertisement:", error.stack);
    res.status(500).json({ message: "Server error rejecting advertisement" });
  }
});

// Mark advertisement as paid
router.put("/pay/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { paymentStatus: "Paid" }, { new: true });
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    return res.status(200).json({ message: "Advertisement marked as paid" });
  } catch (error) {
    console.error("Error marking payment:", error.stack);
    res.status(500).json({ message: "Server error marking payment" });
  }
});

// Delete advertisement
router.delete("/delete/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }
    return res.status(200).json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error.stack);
    res.status(500).json({ message: "Server error deleting advertisement" });
  }
});

export default router;

// const express = require('express');
// const router = express.Router();
// const advertisementController = require('../controllers/AdvertisementController');

// router.get('/', advertisementController.getAllAdvertisements);
// router.get('/:id', advertisementController.getUserAdvertisements);
// router.post('/', advertisementController.createAdvertisement);
// router.put('/:id', advertisementController.editAdvertisement);
// router.delete('/:id', advertisementController.deleteAdvertisement);

// module.exports = router;