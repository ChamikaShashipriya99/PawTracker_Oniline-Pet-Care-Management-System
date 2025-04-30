import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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

  // Get user data from localStorage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      if (user.email) {
        setEmail(user.email);
      }
      if (user.name) {
        setName(user.name);
      }
      if (user.contactNumber) {
        setContactNumber(user.contactNumber);
      }
    } else {
      enqueueSnackbar("Please log in to create an advertisement", { variant: "warning" });
      navigate('/login');
    }
  }, [navigate, enqueueSnackbar]);

  // Inline BackButton component
  const BackButton = ({ destination = "/advertisemenmy-advertisementsts/my-ads" }) => (
    <div className="back-button fade-in">
      <Link to={destination} className="back-btn">
        <BsArrowLeft style={{ marginRight: "8px", fontSize: "1.5rem" }} />
        Back
      </Link>
    </div>
  );

  // Inline Spinner component
  const Spinner = () => (
    <div className="spinner-container fade-in">
      <div className="spinner" />
    </div>
  );

  const handleSaveAdvertisement = () => {
    // Client-side validation
    if (!/^[A-Za-z\s]+$/.test(name)) {
      enqueueSnackbar("Please enter a valid name (letters and spaces only)", { variant: "error" });
      return;
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      enqueueSnackbar("Please enter a valid email address", { variant: "error" });
      return;
    }
    if (!/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(contactNumber)) {
      enqueueSnackbar("Please enter a valid phone number (e.g., 123-456-7890)", { variant: "error" });
      return;
    }
    if (!["Sell a Pet", "Lost Pet", "Found Pet"].includes(advertisementType)) {
      enqueueSnackbar("Please select a valid advertisement type", { variant: "error" });
      return;
    }
    if (advertisementType === "Sell a Pet" && !petType) {
      enqueueSnackbar("Please select a pet type for selling a pet", { variant: "error" });
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
    if (!uploadImage) {
      enqueueSnackbar("Please upload a photo", { variant: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("contactNumber", contactNumber);
    formData.append("advertisementType", advertisementType);
    if (petType) formData.append("petType", petType);
    formData.append("heading", heading);
    formData.append("description", description);
    formData.append("photo", uploadImage);

    setLoading(true);

    axios
      .post("http://localhost:5000/api/advertisements", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        setLoading(false);
        if (response.status === 201) {
          enqueueSnackbar("Advertisement Created Successfully", {
            variant: "success",
            autoHideDuration: 3000,
          });
          setName("");
          setEmail("");
          setContactNumber("");
          setAdvertisementType("");
          setPetType("");
          setHeading("");
          setDescription("");
          setUploadImage(null);
          navigate("/my-advertisements", { 
            state: { email },
            replace: true 
          });
        } else {
          throw new Error("Unexpected response status");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Submission Error:", error.response?.data || error.message);
        let errorMessage = "Error creating advertisement";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message.includes("Network Error")) {
          errorMessage = "Unable to connect to the server. Please try again later.";
        }
        enqueueSnackbar(errorMessage, {
          variant: "error",
          autoHideDuration: 5000,
        });
      });
  };

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Create Pet Advertisement 🐾</h3>
                <Link to="/my-advertisements" className="btn btn-light">
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
                <form onSubmit={(e) => { e.preventDefault(); handleSaveAdvertisement(); }}>
                  <div className="row">
                    {/* Left Column - Image Upload and Contact Info */}
                    <div className="col-md-4">
                      <div className="card mb-4">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Advertisement Image</h5>
                          <div className="mb-3">
                            <label htmlFor="uploadImage" className="form-label">Upload Image</label>
                            <input
                              type="file"
                              id="uploadImage"
                              name="uploadImage"
                              onChange={(e) => setUploadImage(e.target.files[0])}
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
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="form-control bg-light"
                              required
                            />
                            <small className="text-muted">Pre-filled from your profile, can be changed</small>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={email}
                              className="form-control bg-light"
                              readOnly
                              disabled
                            />
                            <small className="text-muted">Email is taken from your profile</small>
                          </div>
                          <div className="mb-3">
                            <label htmlFor="contactNumber" className="form-label">Contact Number</label>
                            <input
                              type="text"
                              id="contactNumber"
                              name="contactNumber"
                              value={contactNumber}
                              onChange={(e) => setContactNumber(e.target.value)}
                              className="form-control bg-light"
                              placeholder="e.g., 123-456-7890"
                              required
                            />
                            <small className="text-muted">Pre-filled from your profile, can be changed</small>
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
                                value={advertisementType}
                                onChange={(e) => setAdvertisementType(e.target.value)}
                                className="form-select"
                                required
                              >
                                <option value="">Select Type</option>
                                <option value="Sell a Pet">Sell a Pet</option>
                                <option value="Lost Pet">Lost Pet</option>
                                <option value="Found Pet">Found Pet</option>
                              </select>
                            </div>

                            {advertisementType === "Sell a Pet" && (
                              <div className="col-md-6 mb-3">
                                <label htmlFor="petType" className="form-label">Pet Type</label>
                                <select
                                  id="petType"
                                  name="petType"
                                  value={petType}
                                  onChange={(e) => setPetType(e.target.value)}
                                  className="form-select"
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
                              value={heading}
                              onChange={(e) => setHeading(e.target.value)}
                              className="form-control"
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                              id="description"
                              name="description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="form-control"
                              rows="4"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-footer bg-light mt-4">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => navigate("/my-advertisements")}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating...
                          </>
                        ) : (
                          'Create Advertisement'
                        )}
                      </button>
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

export default CreateAdvertisement;