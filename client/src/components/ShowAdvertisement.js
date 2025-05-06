import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import "./Advertisement.css";
import config from '../config';

const ShowAdvertisement = () => {
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${config.API_URL}/advertisements/details/${id}`)
      .then((response) => {
        setAdvertisement(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching advertisement:", error);
        setLoading(false);
      });
  }, [id]);

  // Inline BackButton component
  const BackButton = ({ destination = "/advertisements/my-ads" }) => (
    <div className="back-button fade-in">
      <Link to={destination} className="hero-btn back-btn">
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
          <h1 className="hero-title">Advertisement Details 🐾</h1>
          <p className="hero-subtitle">View the details of your pet advertisement.</p>
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="container">
         
          <BackButton />

          {loading ? (
            <Spinner />
          ) : advertisement ? (
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card hover-card">
                  <div className="card-body">
                    <h2 className="card-title section-title">{advertisement.heading}</h2>
                    <div className="detail-row">
                      <span className="detail-label">Description:</span>
                      <span>{advertisement.description}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Name:</span>
                      <span>{advertisement.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Email:</span>
                      <span>{advertisement.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Contact Number:</span>
                      <span>{advertisement.contactNumber}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Type:</span>
                      <span>{advertisement.advertisementType}</span>
                    </div>
                    {advertisement.petType && (
                      <div className="detail-row">
                        <span className="detail-label">Pet Type:</span>
                        <span>{advertisement.petType}</span>
                      </div>
                    )}
                    {advertisement.photo && (
                      <div className="detail-row">
                        <span className="detail-label">Image:</span>
                        <img
                          src={`${config.UPLOADS_URL}/uploads/${advertisement.photo}`}
                          alt={advertisement.heading}
                          className="detail-img"
                        />
                      </div>
                    )}
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`status-text ${
                        advertisement.status === "Approved" ? "status-approved" :
                        advertisement.status === "Rejected" ? "status-rejected" : "status-pending"
                      }`}>
                        {advertisement.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Payment Status:</span>
                      <span>{advertisement.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted">Advertisement not found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ShowAdvertisement;