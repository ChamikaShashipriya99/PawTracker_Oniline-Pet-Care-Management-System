import { useEffect, useState } from "react";
import axios from "axios";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import { BsArrowLeft } from "react-icons/bs";
import "./Advertisement.css";

const MyAds = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/advertisements")
      .then((response) => {
        setAdvertisements(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch Error:", error.response?.data || error.message);
        setLoading(false);
        enqueueSnackbar("Error fetching advertisements: " + (error.response?.data?.message || error.message), { variant: "error" });
      });
  }, []);

  const handlePay = (id) => {
    axios
      .put(`http://localhost:5000/advertisements/pay/${id}`)
      .then(() => {
        setAdvertisements(advertisements.map(ad => 
          ad._id === id ? { ...ad, paymentStatus: "Paid" } : ad
        ));
        enqueueSnackbar("Payment Successful - Ad Published!", { variant: "success" });
      })
      .catch(error => {
        console.error("Payment Error:", error);
        enqueueSnackbar("Error processing payment", { variant: "error" });
      });
  };

  // Inline BackButton component
  const BackButton = ({ destination = "/ad-dashboard" }) => (
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
          <h1 className="hero-title">My Advertisements 🐾</h1>
          <p className="hero-subtitle">Manage your pet advertisements with PawTracker.</p>
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="container">
          

          <BackButton />

          {loading ? (
            <Spinner />
          ) : advertisements.length === 0 ? (
            <p className="text-center">No advertisements found.</p>
          ) : (
            <div className="row">
              {advertisements.map(ad => (
                <div key={ad._id} className="col-md-4 mb-4">
                  <div className="card hover-card">
                    {ad.photo && (
                      <img
                        src={`http://localhost:5000/uploads/${ad.photo}`}
                        alt={ad.heading}
                        className="card-img-top"
                      />
                    )}
                    <div className="card-body">
                      <h3>{ad.heading}</h3>
                      <p>{ad.description.slice(0, 100)}...</p>
                      <p>Contact: {ad.contactNumber}</p>
                      <p>Type: {ad.advertisementType}</p>
                      {ad.petType && <p>Pet Type: {ad.petType}</p>}
                      <p className={`status-text ${
                        ad.status === "Approved" ? "status-approved" :
                        ad.status === "Rejected" ? "status-rejected" : "status-pending"
                      }`}>
                        Status: {ad.status}
                      </p>
                      <div className="card-actions">
                        <Link to={`/advertisements/details/${ad._id}`}>
                          <button className="hero-btn action-btn">View</button>
                        </Link>
                        <Link to={`/advertisements/edit/${ad._id}`}>
                          <button className="hero-btn action-btn warning">Edit</button>
                        </Link>
                        <Link to={`/advertisements/delete/${ad._id}`}>
                          <button className="hero-btn action-btn danger">Delete</button>
                        </Link>
                        {ad.status === "Approved" && ad.paymentStatus === "Pending" && (
                          <button
                            onClick={() => handlePay(ad._id)}
                            className="hero-btn action-btn success"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyAds;