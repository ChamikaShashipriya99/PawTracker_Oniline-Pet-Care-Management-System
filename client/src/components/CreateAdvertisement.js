import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { BsArrowLeft } from "react-icons/bs";
import "./Advertisement.css";

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
  const BackButton = ({ destination = "/ad-dashboard" }) => (
    <Link to={destination} className="back-button">
      <BsArrowLeft style={{ marginRight: "8px", fontSize: "18px" }} />
      Go Back
    </Link>
  );

  // Inline Spinner component
  const Spinner = () => (
    <div className="loading fade-in">Loading...</div>
  );

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content fade-in">
          <h1 className="hero-title">Create Pet Advertisement 🐾</h1>
          <p className="hero-subtitle">Share your pet ad with the PawTracker community.</p>
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="session-container">
          <div className="session-header">
            <BackButton />
            <h1>Add New Advertisement</h1>
          </div>

          {enqueueSnackbar.message && (
            <div className={`notification ${enqueueSnackbar.variant}`}>
              {enqueueSnackbar.message}
            </div>
          )}

          <form className="session-form" onSubmit={(e) => { e.preventDefault(); handleSaveAdvertisement(); }}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="text"
                id="contactNumber"
                name="contactNumber"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Advertisement Type</label>
              <div className="form-row">
                <div className="form-radio">
                  <input
                    type="radio"
                    id="lostAndFound"
                    name="advertisementType"
                    value="Lost and Found"
                    checked={advertisementType === "Lost and Found"}
                    onChange={(e) => setAdvertisementType(e.target.value)}
                    className="form-radio-input"
                  />
                  <label htmlFor="lostAndFound" className="form-radio-label">Lost and Found</label>
                </div>
                <div className="form-radio">
                  <input
                    type="radio"
                    id="sellAPet"
                    name="advertisementType"
                    value="Sell a Pet"
                    checked={advertisementType === "Sell a Pet"}
                    onChange={(e) => setAdvertisementType(e.target.value)}
                    className="form-radio-input"
                  />
                  <label htmlFor="sellAPet" className="form-radio-label">Sell a Pet</label>
                </div>
              </div>
            </div>

            {advertisementType === "Sell a Pet" && (
              <div className="form-group">
                <label htmlFor="petType">Pet Type</label>
                <select
                  id="petType"
                  name="petType"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Pet Type</option>
                  <option value="Cat">Cat</option>
                  <option value="Dog">[CENSORED]og</option>
                  <option value="Bird">Bird</option>
                  <option value="Fish">Fish</option>
                  <option value="Another">Another</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="heading">Heading</label>
              <input
                type="text"
                id="heading"
                name="heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label htmlFor="uploadImage">Upload Image</label>
              <input
                type="file"
                id="uploadImage"
                name="uploadImage"
                onChange={(e) => setUploadImage(e.target.files[0])}
                className="form-control"
                accept="image/*"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Add Advertisement"}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate("/advertising")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default CreateAdvertisement;