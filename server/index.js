import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { Advertisement } from "./models/AdvertisementModal.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));
app.use("/uploads", express.static(path.join(__dirname, "../project_images")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "../project_images/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

mongoose
  .connect("mongodb+srv://dinuja:123@cluster0.amfdo.mongodb.net/advertisements?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("App connected to database"))
  .catch((err) => console.error("MongoDB connection error:", err));

// POST create advertisement
app.post("/advertisements", upload.single("uploadImage"), async (req, res) => {
  try {
    const { name, email, contactNumber, advertisementType, petType, heading, description } = req.body;
    if (!name || !email || !contactNumber || !advertisementType || !heading || !description) {
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
      status: "Pending",
      paymentStatus: "Pending",
    };
    const advertisement = await Advertisement.create(newAdvertisement);
    return res.status(201).send({ data: advertisement });
  } catch (error) {
    console.error("Error creating advertisement:", error.stack);
    res.status(500).send({ message: "Server error creating advertisement" });
  }
});

// GET all advertisements
app.get("/advertisements", async (req, res) => {
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

// GET user advertisements
app.get("/advertisements/my-ads/:email", async (req, res) => {
  try {
    const advertisements = await Advertisement.find({ email: req.params.email });
    return res.status(200).json({
      count: advertisements.length,
      data: advertisements,
    });
  } catch (error) {
    console.error("Error fetching user advertisements:", error.message);
    res.status(500).send({ message: "Server error fetching user advertisements" });
  }
});

// GET advertisement details by ID
app.get("/advertisements/details/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error("Error fetching advertisement details:", error.message);
    res.status(500).send({ message: "Server error fetching advertisement" });
  }
});

// PUT edit advertisement
app.put("/advertisements/edit/:id", upload.single("uploadImage"), async (req, res) => {
  try {
    const { name, email, contactNumber, advertisementType, petType, heading, description } = req.body;
    const updateData = {
      name,
      email,
      contactNumber,
      advertisementType,
      petType: advertisementType === "Sell a Pet" ? petType : undefined,
      heading,
      description,
    };
    if (req.file) {
      updateData.photo = req.file.filename;
    }
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error("Error updating advertisement:", error.message);
    res.status(500).send({ message: "Server error updating advertisement" });
  }
});

// DELETE advertisement
app.delete("/advertisements/delete/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error.message);
    res.status(500).send({ message: "Server error deleting advertisement" });
  }
});

// Existing PUT routes (approve, reject, pay)
app.put("/advertisements/approve/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: "Approved" }, { new: true });
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

app.put("/advertisements/reject/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: "Rejected" }, { new: true });
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

app.put("/advertisements/pay/:id", async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { paymentStatus: "Paid" }, { new: true });
    if (!advertisement) return res.status(404).send({ message: "Advertisement not found" });
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));