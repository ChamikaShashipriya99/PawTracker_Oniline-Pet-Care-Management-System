import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { BsArrowLeft } from "react-icons/bs";
import "./Advertisement.css";
import config from "../config";

const AddAdvertisement = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    advertisementType: "",
    petType: "",
    heading: "",
    description: ""
  });
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      enqueueSnackbar("Please enter a valid name (letters and spaces only)", { variant: "error" });
      return;
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      enqueueSnackbar("Please enter a valid email address", { variant: "error" });
      return;
    }
    if (!/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(formData.contactNumber)) {
      enqueueSnackbar("Please enter a valid phone number (e.g., 123-456-7890)", { variant: "error" });
      return;
    }
    if (!["Sell a Pet", "Lost Pet", "Found Pet"].includes(formData.advertisementType)) {
      enqueueSnackbar("Please select a valid advertisement type", { variant: "error" });
      return;
    }
    if (formData.advertisementType === "Sell a Pet" && !formData.petType) {
      enqueueSnackbar("Please select a pet type for selling a pet", { variant: "error" });
      return;
    }
    if (!formData.heading.trim()) {
      enqueueSnackbar("Please enter a heading", { variant: "error" });
      return;
    }
    if (!formData.description.trim()) {
      enqueueSnackbar("Please enter a description", { variant: "error" });
      return;
    }
    if (!photo) {
      enqueueSnackbar("Please upload a photo", { variant: "error" });
      return;
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      formDataToSend.append("photo", photo);

      const response = await axios.post(`${config.API_URL}/advertisements`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      enqueueSnackbar("Advertisement created successfully!", { variant: "success" });
      navigate("/advertisements/my-ads", { state: { email: formData.email } });
    } catch (error) {
      console.error("Error creating advertisement:", error);
      enqueueSnackbar(
        error.response?.data?.error || "Error creating advertisement",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  // Inline Spinner component
  const Spinner = () => (
    <div className="spinner-container fade-in">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Create Pet Advertisement 🐾</h3>
                <Link to="/ad-dashboard" className="btn btn-light">
                  <BsArrowLeft className="me-2" />
                  Back
                </Link>
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Left Column - Image Upload and Contact Info */}
                    <div className="col-md-4">
                      <div className="card mb-4">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Advertisement Image</h5>
                          <div className="mb-3">
                            <label htmlFor="photo" className="form-label">Upload Image</label>
                            <input
                              type="file"
                              id="photo"
                              name="photo"
                              onChange={handlePhotoChange}
                              className="form-control"
                              accept="image/jpeg,image/png,image/gif"
                              required
                            />
                            <small className="text-muted">JPEG/PNG/GIF, max 5MB</small>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Contact Information</h5>
                          <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="form-control bg-light"
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="form-control bg-light"
                              required
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                            <input
                              type="text"
                              id="contactNumber"
                              name="contactNumber"
                              value={formData.contactNumber}
                              onChange={handleChange}
                              className="form-control bg-light"
                              placeholder="e.g., 123-456-7890"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Advertisement Details */}
                    <div className="col-md-8">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Advertisement Details</h5>
                          <div className="row">
                            <div className="col-md-6 mb-3">
                              <label htmlFor="advertisementType" className="form-label">Advertisement Type</label>
                              <select
                                id="advertisementType"
                                name="advertisementType"
                                value={formData.advertisementType}
                                onChange={handleChange}
                                className="form-control"
                                required
                              >
                                <option value="">Select Type</option>
                                <option value="Sell a Pet">Sell a Pet</option>
                                <option value="Lost Pet">Lost Pet</option>
                                <option value="Found Pet">Found Pet</option>
                              </select>
                            </div>

                            {formData.advertisementType === "Sell a Pet" && (
                              <div className="col-md-6 mb-3">
                                <label htmlFor="petType" className="form-label">Pet Type</label>
                                <select
                                  id="petType"
                                  name="petType"
                                  value={formData.petType}
                                  onChange={handleChange}
                                  className="form-control"
                                  required
                                >
                                  <option value="">Select Pet Type</option>
                                  <option value="Cat">Cat</option>
                                  <option value="Dog">Dog</option>
                                  <option value="Bird">Bird</option>
                                  <option value="Fish">Fish</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <label htmlFor="heading" className="form-label">Heading</label>
                            <input
                              type="text"
                              id="heading"
                              name="heading"
                              value={formData.heading}
                              onChange={handleChange}
                              className="form-control"
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                              id="description"
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              className="form-control"
                              rows="4"
                              required
                            />
                          </div>

                          <div className="text-end">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={loading}
                            >
                              {loading ? "Creating..." : "Create Advertisement"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAdvertisement; 