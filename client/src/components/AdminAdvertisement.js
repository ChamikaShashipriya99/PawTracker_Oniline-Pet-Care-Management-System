import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import { BsArrowLeft } from "react-icons/bs";
import "./Advertisement.css";

const AdminAdvertisement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/advertisements");
      setAdvertisements(response.data.data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Fetch Error:", error.response?.data || error.message);
      enqueueSnackbar("Error fetching advertisements", { variant: "error" });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      console.log('Updating status for advertisement:', id, 'to:', newStatus);
      
      // Use the specific endpoint based on the status
      const endpoint = newStatus === 'Approved' ? 'approve' : 'reject';
      const response = await axios.put(`http://localhost:5000/api/advertisements/${endpoint}/${id}`);
      
      console.log('Server response:', response.data);
      if (response.data.message) {
        enqueueSnackbar(response.data.message, { variant: "success" });
        await fetchAdvertisements(); // Refresh the list
      }
    } catch (error) {
      console.error("Status Update Error:", error.response?.data || error.message);
      enqueueSnackbar(error.response?.data?.message || "Error updating advertisement status", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-md-12">
          <div className="card shadow-lg border-0 rounded-lg">
            <div className="card-header bg-primary text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Manage Advertisements 🐾</h3>
                <Link to="/admin/dashboard" className="btn btn-light">
                  <BsArrowLeft className="me-2" />
                  Back to Dashboard
                </Link>
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Image</th>
                        <th>Heading</th>
                        <th>Type</th>
                        <th>Contact Info</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {advertisements.map((ad) => (
                        <tr key={ad._id}>
                          <td>
                            {ad.photo && (
                              <img
                                src={`http://localhost:5000/uploads/${ad.photo}`}
                                alt={ad.heading}
                                className="img-thumbnail"
                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              />
                            )}
                          </td>
                          <td>{ad.heading}</td>
                          <td>
                            <div>{ad.advertisementType}</div>
                            {ad.petType && <small className="text-muted">{ad.petType}</small>}
                          </td>
                          <td>
                            <div><strong>Name:</strong> {ad.name}</div>
                            <div><strong>Email:</strong> {ad.email}</div>
                            <div><strong>Phone:</strong> {ad.contactNumber}</div>
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: '200px' }}>
                              {ad.description}
                            </div>
                          </td>
                          <td>
                            <span className={`badge bg-${ad.status === 'Approved' ? 'success' : ad.status === 'Rejected' ? 'danger' : 'warning'}`}>
                              {ad.status}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group">
                              {ad.status === 'Pending' && (
                                <>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleStatusChange(ad._id, 'Approved')}
                                    disabled={loading}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleStatusChange(ad._id, 'Rejected')}
                                    disabled={loading}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdvertisement;