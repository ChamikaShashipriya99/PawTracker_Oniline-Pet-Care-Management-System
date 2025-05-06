import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { BsArrowLeft } from "react-icons/bs";
import "./Advertisement.css";
import config from '../config';

const MyAdvertisement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Get email from navigation state or localStorage
  const email = location.state?.email || JSON.parse(localStorage.getItem('user'))?.email || "";

  useEffect(() => {
    if (!email) {
      enqueueSnackbar("Please log in to view your advertisements", { variant: "warning", autoHideDuration: 5000 });
      navigate('/login');
      return;
    }

    setLoading(true);
    axios
      .get(`http://localhost:5000/api/advertisements/my-ads/${encodeURIComponent(email)}`)
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
  }, [email, enqueueSnackbar, navigate]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/advertisements/delete/${id}`);
        enqueueSnackbar('Advertisement deleted successfully', { variant: 'success' });
        // Refresh the advertisements list
        const response = await axios.get(`http://localhost:5000/api/advertisements/my-ads/${encodeURIComponent(email)}`);
        setAdvertisements(response.data.data || []);
      } catch (error) {
        console.error('Delete Error:', error.response?.data || error.message);
        enqueueSnackbar(
          error.response?.data?.message || 'Error deleting advertisement',
          { variant: 'error' }
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Updated BackButton component
  const BackButton = ({ destination = "/" }) => (
    <Link to={destination} className="btn btn-secondary">
      <BsArrowLeft className="me-2" />
      Back
    </Link>
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
                <h3 className="mb-0">My Advertisements 🐾</h3>
                <BackButton />
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <div className="row">
                  {advertisements.length === 0 ? (
                    <div className="col-12 text-center">
                      <p className="lead">No advertisements found for {email}.</p>
                    </div>
                  ) : (
                    advertisements.map((ad) => (
                      <div key={ad._id} className="col-md-6 mb-4">
                        <div className="card h-100 shadow-sm">
                          {ad.photo && (
                            <img
                              src={`${config.API_URL}/uploads/${ad.photo}`}
                              alt={ad.heading}
                              className="card-img-top"
                              style={{ height: '200px', objectFit: 'cover' }}
                            />
                          )}
                          <div className="card-body">
                            <h5 className="card-title">{ad.heading}</h5>
                            <p className="card-text">
                              <strong>Type:</strong> {ad.advertisementType}
                              {ad.petType && <><br /><strong>Pet Type:</strong> {ad.petType}</>}
                              <br /><strong>Description:</strong> {ad.description}
                              <br /><strong>Contact:</strong> {ad.contactNumber}
                              <br /><strong>Status:</strong> {ad.status}
                              <br /><strong>Payment Status:</strong> {ad.paymentStatus}
                            </p>
                          </div>
                          <div className="card-footer">
                            <div className="d-flex justify-content-between">
                              {ad.status === "Pending" && (
                                <>
                                  <Link
                                    to={`/advertisements/edit/${ad._id}`}
                                    state={{ advertisement: ad }}
                                    className="btn btn-primary"
                                  >
                                    Edit
                                  </Link>
                                  <button
                                    onClick={() => handleDelete(ad._id)}
                                    className="btn btn-danger"
                                    disabled={loading}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              {ad.status === "Approved" && (
                                <>
                                  {ad.paymentStatus === "Pending" && (
                                    <button
                                      className="btn btn-success"
                                      onClick={() => navigate(`/payment/${ad._id}`)}
                                    >
                                      Proceed to Pay
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(ad._id)}
                                    className="btn btn-danger"
                                    disabled={loading}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                              {ad.status === "Rejected" && (
                                <span className="text-danger">Advertisement Rejected</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAdvertisement;