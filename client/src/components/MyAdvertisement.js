import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { BsArrowLeft } from "react-icons/bs";
import "./Advertisement.css";

const MyAdvertisement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Get email from navigation state or prompt user
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      enqueueSnackbar("Please provide an email to view your advertisements", { variant: "warning", autoHideDuration: 5000 });
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:5000/advertisements/my-ads/${encodeURIComponent(email)}`)
      .then((response) => {
        setAdvertisements(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error("Fetch Error:", error.response?.data || error.message);
        enqueueSnackbar(
          error.response?.data?.message || "Error fetching advertisements",
          { variant: "error", autoHideDuration: 5000 }
        );
      });
  }, [email, enqueueSnackbar]);

  // Inline BackButton component
  const BackButton = ({ destination = "/" }) => (
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
          <h1 className="hero-title">My Advertisements 🐾</h1>
          <p className="hero-subtitle">View and manage your pet ads on PawTracker.</p>
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="container">

          <BackButton destination="/" />

          {loading ? (
            <Spinner />
          ) : (
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="card hover-card">
                  <div className="card-body">
                    <h2 className="card-title">Your Advertisements</h2>
                    {advertisements.length === 0 ? (
                      <p>No advertisements found for {email}.</p>
                    ) : (
                      <div className="advertisement-list">
                        {advertisements.map((ad) => (
                          <div key={ad._id} className="advertisement-card fade-in">
                            {ad.photo && (
                              <img
                                src={`http://localhost:5000/uploads/${ad.photo}`}
                                alt={ad.heading}
                                className="img-preview"
                              />
                            )}
                            <div className="advertisement-details">
                              <h3>{ad.heading}</h3>
                              <p><strong>Type:</strong> {ad.advertisementType}</p>
                              {ad.petType && <p><strong>Pet Type:</strong> {ad.petType}</p>}
                              <p><strong>Description:</strong> {ad.description}</p>
                              <p><strong>Contact:</strong> {ad.contactNumber}</p>
                              <p><strong>Posted by:</strong> {ad.name} ({ad.email})</p>
                              <p><strong>Status:</strong> {ad.status}</p>
                              <p><strong>Payment Status:</strong> {ad.paymentStatus}</p>
                              <div className="advertisement-actions">
                                <Link
                                  to={`/edit-add${ad._id}`}
                                  className="hero-btn"
                                >
                                  Edit
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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

export default MyAdvertisement;