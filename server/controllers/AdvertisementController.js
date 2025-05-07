import { Advertisement } from "../models/Advertisement";

// Get all advertisements
export const getAllAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find({});
    return res.status(200).json({
      count: advertisements.length,
      data: advertisements,
    });
  } catch (error) {
    console.error("Error fetching advertisements:", error.stack);
    res.status(500).send({ message: "Server error fetching advertisements" });
  }
};

// Create new advertisement
export const createAdvertisement = async (req, res) => {
  try {
    const { name, email, contactNumber, advertisementType, petType, heading, description, petPrice, advertisementCost } = req.body;

    // Validate required fields
    if (!name || !email || !contactNumber || !advertisementType || !heading || !description) {
      return res.status(400).send({ message: "Please fill all required fields" });
    }

    // Validate advertisementType
    const validTypes = ["Sell a Pet", "Lost Pet", "Found Pet"];
    if (!validTypes.includes(advertisementType)) {
      return res.status(400).send({ message: "Invalid advertisement type" });
    }

    // Require petType and petPrice for "Sell a Pet"
    if (advertisementType === "Sell a Pet") {
      if (!petType) {
        return res.status(400).send({ message: "Pet type is required for selling a pet" });
      }
      if (!petPrice) {
        return res.status(400).send({ message: "Pet price is required for selling a pet" });
      }
    }

    // Validate advertisement cost
    const expectedCost = advertisementType === "Sell a Pet" ? 1000 : 500;
    if (parseInt(advertisementCost) !== expectedCost) {
      return res.status(400).send({ message: "Invalid advertisement cost" });
    }

    const newAdvertisement = {
      name,
      email,
      contactNumber,
      advertisementType,
      petType: advertisementType === "Sell a Pet" ? petType : undefined,
      petPrice: advertisementType === "Sell a Pet" ? petPrice : undefined,
      advertisementCost,
      heading,
      description,
      photo: req.file?.filename,
      status: "Pending",
      paymentStatus: "Pending",
    };

    const advertisement = await Advertisement.create(newAdvertisement);
    return res.status(201).send(advertisement);
  } catch (error) {
    console.error("Error creating advertisement:", error.stack);
    res.status(500).send({ message: "Server error creating advertisement" });
  }
};

// Get user advertisements
export const getUserAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find({ email: req.params.email });
    return res.status(200).json({
      count: advertisements.length,
      data: advertisements,
    });
  } catch (error) {
    console.error("Error fetching user advertisements:", error.stack);
    res.status(500).send({ message: "Server error fetching user advertisements" });
  }
};

// Get advertisement details by ID
export const getAdvertisementDetails = async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);
    if (!advertisement) {
      return res.status(404).send({ message: "Advertisement not found" });
    }
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error("Error fetching advertisement details:", error.stack);
    res.status(500).send({ message: "Server error fetching advertisement" });
  }
};

// Edit advertisement
export const editAdvertisement = async (req, res) => {
  try {
    const { name, email, contactNumber, advertisementType, petType, heading, description } = req.body;

    // Validate required fields
    if (!name || !email || !contactNumber || !advertisementType || !heading || !description) {
      return res.status(400).send({ message: "Please fill all required fields" });
    }

    // Validate advertisementType
    const validTypes = ["Sell a Pet", "Lost Pet", "Found Pet"];
    if (!validTypes.includes(advertisementType)) {
      return res.status(400).send({ message: "Invalid advertisement type" });
    }

    // Require petType for "Sell a Pet"
    if (advertisementType === "Sell a Pet" && !petType) {
      return res.status(400).send({ message: "Pet type is required for selling a pet" });
    }

    const updateData = {
      name,
      email,
      contactNumber,
      advertisementType,
      petType: advertisementType === "Sell a Pet" ? petType : undefined,
      heading,
      description,
      photo: req.file?.filename,
    };

    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!advertisement) {
      return res.status(404).send({ message: "Advertisement not found" });
    }
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error("Error updating advertisement:", error.stack);
    res.status(500).send({ message: "Server error updating advertisement" });
  }
};

// Delete advertisement
export const deleteAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndDelete(req.params.id);
    if (!advertisement) {
      return res.status(404).send({ message: "Advertisement not found" });
    }
    return res.status(200).send({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error.stack);
    res.status(500).send({ message: "Server error deleting advertisement" });
  }
};

// Approve advertisement
export const approveAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: "Approved" }, { new: true });
    if (!advertisement) {
      return res.status(404).send({ message: "Advertisement not found" });
    }
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error("Error approving advertisement:", error.stack);
    res.status(500).send({ message: "Server error approving advertisement" });
  }
};

// Reject advertisement
export const rejectAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { status: "Rejected" }, { new: true });
    if (!advertisement) {
      return res.status(404).send({ message: "Advertisement not found" });
    }
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error("Error rejecting advertisement:", error.stack);
    res.status(500).send({ message: "Server error rejecting advertisement" });
  }
};

// Mark advertisement as paid
export const payAdvertisement = async (req, res) => {
  try {
    const advertisement = await Advertisement.findByIdAndUpdate(req.params.id, { paymentStatus: "Paid" }, { new: true });
    if (!advertisement) {
      return res.status(404).send({ message: "Advertisement not found" });
    }
    return res.status(200).send(advertisement);
  } catch (error) {
    console.error("Error marking payment:", error.stack);
    res.status(500).send({ message: "Server error marking payment" });
  }
};