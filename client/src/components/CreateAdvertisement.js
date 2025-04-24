import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { BsArrowLeft } from "react-icons/bs";

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
          navigate("/advertisements/my-ads");
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

  // Inline BackButton component
  const BackButton = ({ destination = "/" }) => (
    <div className="d-flex">
      <Link
        to={destination}
        className="btn btn-primary d-flex align-items-center"
      >
        <BsArrowLeft className="me-2" style={{ fontSize: "1.5rem" }} />
        Back
      </Link>
    </div>
  );

  // Inline Spinner component
  const Spinner = () => (
    <div className="d-flex justify-content-center my-4">
      <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container my-4">
      <BackButton />
      <h1 className="display-5 my-4 fw-bold">Create Pet Advertisement</h1>
      {loading && <Spinner />}
      <div className="card shadow p-4" style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label fs-5 text-muted">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="-Chris mb-3">
          <label htmlFor="email" className="form-label fs-5 text-muted">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="contactNumber" className="form-label fs-5 text-muted">Contact Number</label>
          <input
            type="text"
            id="contactNumber"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label fs-5 text-muted">Advertisement Type</label>
          <div className="d-flex gap-3">
            <div className="form-check">
              <input
                type="radio"
                id="lostAndFound"
                name="advertisementType"
                value="Lost and Found"
                checked={advertisementType === "Lost and Found"}
                onChange={(e) => setAdvertisementType(e.target.value)}
                className="form-check-input"
              />
              <label htmlFor="lostAndFound" className="form-check-label">Lost and Found</label>
            </div>
            <div className="form-check">
              <input
                type="radio"
                id="sellAPet"
                name="advertisementType"
                value="Sell a Pet"
                checked={advertisementType === "Sell a Pet"}
                onChange={(e) => setAdvertisementType(e.target.value)}
                className="form-check-input"
              />
              <label htmlFor="sellAPet" className="form-check-label">Sell a Pet</label>
            </div>
          </div>
        </div>
        {advertisementType === "Sell a Pet" && (
          <div className="mb-3">
            <label htmlFor="petType" className="form-label fs-5 text-muted">Pet Type</label>
            <select
              id="petType"
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              className="form-select"
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
        <div className="mb-3">
          <label htmlFor="heading" className="form-label fs-5 text-muted">Heading</label>
          <input
            type="text"
            id="heading"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label fs-5 text-muted">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
            rows="4"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="uploadImage" className="form-label fs-5 text-muted">Upload Image</label>
          <input
            type="file"
            id="uploadImage"
            accept="image/*"
            onChange={(e) => setUploadImage(e.target.files[0])}
            className="form-control"
          />
        </div>
        <button
          className="btn btn-primary mt-3"
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