import express from "express";
import { Advertisement } from "../models/AdvertisementModal.js";
import { upload } from "../middleware/requirePhoto.js";

const router = express.Router();

// Serve uploaded images statically
router.use('/uploads', express.static('../project_images'));

// Get all advertisements
router.get("/", async (req, res) => {
  try {
    const advertisements = await Advertisement.find({});
    return res.status(200).json({
      count: advertisements.length,
      data: advertisements,
    });
  } catch (error) {
    console.error("Error fetching advertisements:", error.message);
    res.status(500).send({ message: "Server error fetching advertisements" });
  }
});

// Create new advertisement
router.post("/", upload.single("uploadImage"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("File:", req.file);

    const { name, email, contactNumber, advertisementType, petType, heading, description } = req.body;
    if (!name || !email || !contactNumber || !advertisementType || !heading || !description) {
      console.log("Missing fields:", { name, email, contactNumber, advertisementType, heading, description });
      return res.status(400).send({ message: "Please fill all required fields" });
    }

    const newAdvertisement = {
      name,
      email,
      contactNumber,
      advertisementType,
      petType: advertisementType === "Sell a Pet" ? petType : undefined,
      heading,
      description,
      photo: req.file ? req.file.filename : null,
    };

    const advertisement = await Advertisement.create(newAdvertisement);
    return res.status(201).send(advertisement);
  } catch (error) {
    console.error("Detailed error creating advertisement:", error.stack);
    res.status(500).send({ message: "Server error creating advertisement", error: error.message });
  }
});

// Other routes (unchanged for brevity)
router.get("/my-ads/:email", async (req, res) => {
  try {
    const advertisements = await Advertisement.find({ email: req.params.email });
    return res.status(200).json({
      count: advertisements.length,
      data: advertisements,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

router.put("/approve/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: "Approved" }, { new: true });
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

router.put("/reject/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: "Rejected" }, { new: true });
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

router.put("/pay/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { paymentStatus: "Paid" }, { new: true });
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

export default router;