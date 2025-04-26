import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import { useSnackbar } from "notistack";
import "./Advertisement.css";

const DeleteAdvertisement = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteAdvertisement = () => {
    setLoading(true);
    axios
      .delete(`http://localhost:5000/advertisements/delete/${id}`)
      .then(() => {
        setLoading(false);
        enqueueSnackbar("Advertisement Deleted Successfully", { variant: "success" });
        navigate("/advertisements/my-ads");
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error deleting advertisement:", error);
        enqueueSnackbar("Error deleting advertisement", { variant: "error" });
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
          <h1 className="hero-title">Delete Advertisement 🐾</h1>
          <p className="hero-subtitle">Confirm deletion of your pet advertisement.</p>
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="container">
          
          {loading && <Spinner />}
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card hover-card">
                <div className="card-body text-center">
                  <h3 className="card-title confirm-title">Are you sure you want to delete this advertisement?</h3>
                  <div className="form-actions">
                    <button
                      className="btn btn-danger delete-btn"
                      onClick={handleDeleteAdvertisement}
                      disabled={loading}
                    >
                      {loading ? "Deleting..." : "Yes, Delete It"}
                    </button>
                    <button
                      className="btn cancel-button"
                      onClick={() => navigate("/advertisements/my-ads")}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeleteAdvertisement;