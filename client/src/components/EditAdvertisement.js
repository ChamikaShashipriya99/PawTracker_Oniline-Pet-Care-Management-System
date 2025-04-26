import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { useSnackbar } from "notistack";
import "./Advertisement.css";

const EditAdvertisement = () => {
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
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/advertisements/details/${id}`)
      .then((response) => {
        const ad = response.data;
        setName(ad.name);
        setEmail(ad.email);
        setContactNumber(ad.contactNumber);
        setAdvertisementType(ad.advertisementType);
        setPetType(ad.petType || "");
        setHeading(ad.heading);
        setDescription(ad.description);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching advertisement:", error);
        enqueueSnackbar("Error loading advertisement", { variant: "error" });
      });
  }, [id]);

  const handleEditAdvertisement = () => {
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
      .put(`http://localhost:5000/advertisements/edit/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setLoading(false);
        enqueueSnackbar("Advertisement Updated Successfully", { variant: "success" });
        navigate("/advertisements/my-ads");
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error updating advertisement:", error);
        enqueueSnackbar("Error updating advertisement", { variant: "error" });
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
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content fade-in">
          <h1 className="hero-title">Edit Pet Advertisement 🐾</h1>
          <p className="hero-subtitle">Update your pet ad with the PawTracker community.</p>
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="container">

          <BackButton />

          {loading ? (
            <Spinner />
          ) : (
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card hover-card">
                  <div className="card-body">
                    <h2 className="card-title">Edit Advertisement</h2>
                    <form className="session-form" onSubmit={(e) => { e.preventDefault(); handleEditAdvertisement(); }}>
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
                            <option value="Dog">Dog</option>
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
                        <label htmlFor="uploadImage">Upload New Image (optional)</label>
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
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={() => navigate("/advertisements/my-ads")}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditAdvertisement;