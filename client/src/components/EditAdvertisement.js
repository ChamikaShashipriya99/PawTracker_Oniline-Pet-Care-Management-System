import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { BsArrowLeft } from "react-icons/bs";
import "./Advertisement.css";
import config from '../config';

const EditAdvertisement = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [advertisementType, setAdvertisementType] = useState("");
  const [petType, setPetType] = useState("");
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [uploadImage, setUploadImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // First try to get data from location state
    const advertisement = location.state?.advertisement;
    if (advertisement) {
      setName(advertisement.name || "");
      setEmail(advertisement.email || "");
      setContactNumber(advertisement.contactNumber || "");
      setAdvertisementType(advertisement.advertisementType || "");
      setPetType(advertisement.petType || "");
      setHeading(advertisement.heading || "");
      setDescription(advertisement.description || "");
      setExistingImage(advertisement.photo || null);
      setLoading(false);
    } else {
      // If no data in state, fetch from API
      setLoading(true);
      axios
        .get(`${config.API_URL}/advertisements/details/${id}`)
        .then((response) => {
          const ad = response.data;
          setName(ad.name || "");
          setEmail(ad.email || "");
          setContactNumber(ad.contactNumber || "");
          setAdvertisementType(ad.advertisementType || "");
          setPetType(ad.petType || "");
          setHeading(ad.heading || "");
          setDescription(ad.description || "");
          setExistingImage(ad.photo || null);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          console.error("Fetch Error:", error.response?.data || error.message);
          enqueueSnackbar("Error fetching advertisement", { variant: "error" });
        });
    }
  }, [id, location.state, enqueueSnackbar]);

  const handleEditAdvertisement = () => {
    if (!name.trim()) {
      enqueueSnackbar("Please enter a valid name", { variant: "error" });
      return;
    }
    if (!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      enqueueSnackbar("Please enter a valid email address", { variant: "error" });
      return;
    }
    if (!contactNumber.trim()) {
      enqueueSnackbar("Please enter a valid phone number", { variant: "error" });
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

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("contactNumber", contactNumber);
    formData.append("advertisementType", advertisementType);
    if (petType) formData.append("petType", petType);
    formData.append("heading", heading);
    formData.append("description", description);
    if (uploadImage) formData.append("photo", uploadImage);

    setLoading(true);

    axios
      .put(`${config.API_URL}/advertisements/edit/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setLoading(false);
        enqueueSnackbar("Advertisement Updated Successfully", { variant: "success" });
        navigate("/my-advertisements", { 
          state: { email },
          replace: true 
        });
      })
      .catch((error) => {
        setLoading(false);
        console.error("Update Error:", error.response?.data || error.message);
        enqueueSnackbar(
          error.response?.data?.message || "Error updating advertisement",
          { variant: "error" }
        );
      });
  };

  // Inline BackButton component
  const BackButton = ({ destination = "/advertisements/my-ads" }) => (
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

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Edit Pet Advertisement 🐾</h3>
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
                <form onSubmit={(e) => { e.preventDefault(); handleEditAdvertisement(); }}>
                  <div className="row">
                    {/* Left Column - Image Upload and Contact Info */}
                    <div className="col-md-4">
                      <div className="card mb-4">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Advertisement Image</h5>
                          {existingImage && (
                            <div className="text-center mb-3">
                              <img
                                src={`${config.UPLOADS_URL}/uploads/${existingImage}`}
                                alt="Current"
                                className="img-fluid rounded shadow-sm"
                                style={{ maxHeight: '200px', objectFit: 'cover' }}
                              />
                            </div>
                          )}
                          <div className="mb-3">
                            <label htmlFor="uploadImage" className="form-label">Update Image</label>
                            <input
                              type="file"
                              id="uploadImage"
                              name="uploadImage"
                              onChange={(e) => setUploadImage(e.target.files[0])}
                              className="form-control"
                              accept="image/jpeg,image/png,image/gif"
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
                            Updating...
                          </>
                        ) : (
                          'Save Changes'
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

export default EditAdvertisement;