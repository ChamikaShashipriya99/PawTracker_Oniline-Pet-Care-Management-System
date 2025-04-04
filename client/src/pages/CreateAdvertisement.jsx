import { useState } from "react";
import BackButton from "../components/BackButton";
import Spinner from "../components/Spinner";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const CreateAdvertisement = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [advertisementType, setAdvertisementType] = useState("");
  const [petType, setPetType] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [uploadImage, setUploadImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSaveAdvertisement = () => {
    if (!/^[A-Za-z\s]+$/.test(name)) {
      enqueueSnackbar("Please enter a valid name (letters and spaces only)", { variant: "error" });
      return;
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      enqueueSnackbar("Please enter a valid email address", { variant: "error" });
      return;
    }
    if (!/^\d{10}$/.test(contactNumber)) {
      enqueueSnackbar("Please enter a 10-digit phone number", { variant: "error" });
      return;
    }
    if (!advertisementType) {
      enqueueSnackbar("Please select an advertisement type", { variant: "error" });
      return;
    }
    if (!heading.trim()) {
      enqueueSnackbar("Please enter a heading", { variant: "error" });
      return;
    }
    if (!description.trim()) {
      enqueueSnackbar("Please enter a description", { variant: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("contactNumber", contactNumber);
    formData.append("advertisementType", advertisementType);
    if (advertisementType === "Sell a Pet" && petType) {
      formData.append("petType", petType);
    }
    formData.append("heading", heading);
    formData.append("description", description);
    if (uploadImage) {
      formData.append("uploadImage", uploadImage);
    }

    setLoading(true);

    axios
      .post("http://localhost:5000/advertisements", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setLoading(false);
        enqueueSnackbar("Advertisement Created Successfully", { variant: "success" });
        setTimeout(() => {
          navigate("/advertisements/my-ads"); // Updated to static path
        }, 500);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Submission Error:", error.response?.data || error.message);
        enqueueSnackbar(
          error.response?.data?.message || "Error creating advertisement",
          { variant: "error" }
        );
      });
  };

  return (
    <div className="p-6">
      <BackButton />
      <h1 className="text-3xl my-6 font-bold">Create Pet Advertisement</h1>
      {loading && <Spinner />}
      <div className="flex flex-col border-2 border-sky-400 rounded-xl w-[600px] p-6 mx-auto bg-white shadow-md">
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-600">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-600">Contact Number</label>
          <input
            type="text"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-600">Advertisement Type</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="advertisementType"
                value="Lost and Found"
                checked={advertisementType === "Lost and Found"}
                onChange={(e) => setAdvertisementType(e.target.value)}
                className="mr-2"
              />
              Lost and Found
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="advertisementType"
                value="Sell a Pet"
                checked={advertisementType === "Sell a Pet"}
                onChange={(e) => setAdvertisementType(e.target.value)}
                className="mr-2"
              />
              Sell a Pet
            </label>
          </div>
        </div>
        {advertisementType === "Sell a Pet" && (
          <div className="my-4">
            <label className="text-xl mr-4 text-gray-600">Pet Type</label>
            <select
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="border-2 border-gray-300 px-4 py-2 w-full rounded-md"
            >
              <option value="">Select Pet Type</option>
              <option value="Cat">Cat</option>
              <option value="Dog">Dog</option>
              <option value="Bird">Bird</option>
              <option value="Fish">Fish</option>
              <option value="Another">Another</option>
            </select>
          </div>
        )}
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-600">Heading</label>
          <input
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-600">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border-2 border-gray-300 px-4 py-2 w-full rounded-md"
            rows="4"
          />
        </div>
        <div className="my-4">
          <label className="text-xl mr-4 text-gray-600">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setUploadImage(e.target.files[0])}
            className="border-2 border-gray-300 px-4 py-2 w-full rounded-md"
          />
        </div>
        <button
          className="p-3 bg-sky-500 text-white rounded-lg m-8 hover:bg-sky-600 transition"
          onClick={handleSaveAdvertisement}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Advertisement"}
        </button>
      </div>
    </div>
  );
};

export default CreateAdvertisement;