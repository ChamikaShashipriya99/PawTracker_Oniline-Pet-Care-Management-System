import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import { BsArrowLeft } from "react-icons/bs";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Advertisement.css";

const Admin = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/advertisements")
      .then((response) => {
        console.log("Fetched ads:", response.data.data);
        setAdvertisements(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch error:", error.response?.data || error.message);
        setLoading(false);
        enqueueSnackbar("Error fetching advertisements", { variant: "error" });
      });
  }, []);

  const handleApprove = (id) => {
    axios
      .put(`http://localhost:5000/advertisements/approve/${id}`)
      .then(() => {
        setAdvertisements(
          advertisements.map((ad) =>
            ad._id === id ? { ...ad, status: "Approved" } : ad
          )
        );
        enqueueSnackbar("Advertisement Approved", { variant: "success" });
      })
      .catch((error) => {
        console.error("Approve error:", error);
        enqueueSnackbar("Error approving advertisement", { variant: "error" });
      });
  };

  const handleReject = (id) => {
    axios
      .put(`http://localhost:5000/advertisements/reject/${id}`)
      .then(() => {
        setAdvertisements(
          advertisements.map((ad) =>
            ad._id === id ? { ...ad, status: "Rejected" } : ad
          )
        );
        enqueueSnackbar("Advertisement Rejected", { variant: "success" });
      })
      .catch((error) => {
        console.error("Reject error:", error);
        enqueueSnackbar("Error rejecting advertisement", { variant: "error" });
      });
  };

  // Inline Spinner component
  const Spinner = () => (
    <div className="d-flex justify-content-center my-4">
      <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  // Inline BackButton component
    const BackButton = ({ destination = "/ad-dashboard" }) => (
      <div className="back-button fade-in">
        <Link to={destination} className="back-btn">
          <BsArrowLeft style={{ marginRight: "8px", fontSize: "1.5rem" }} />
          Back
        </Link>
      </div>
    );


  const downloadPDF = () => {
    console.log("Generating PDF...");
    console.log("Ads for PDF:", advertisements);

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Pet Advertisement Summary", 14, 20);

    // Table (text-only, no images)
    const tableData = advertisements.length
      ? advertisements.map((ad) => [
          ad._id || "N/A",
          ad.heading || "No heading",
          ad.advertisementType || "N/A",
          ad.status || "N/A",
          ad.paymentStatus || "N/A",
          ad.email || "N/A",
        ])
      : [["N/A", "No ads available", "N/A", "N/A", "N/A", "N/A"]];

    doc.autoTable({
      startY: 30,
      head: [["ID", "Heading", "Type", "Status", "Payment Status", "Email"]],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      doc.text(
        "Pet Advertisement Hub",
        doc.internal.pageSize.width - 50,
        doc.internal.pageSize.height - 10
      );
    }

    console.log("Saving PDF as advertisement_summary.pdf...");
    doc.save("advertisement_summary.pdf");
    enqueueSnackbar("PDF downloaded", { variant: "success" });
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content fade-in">
          <h1 className="hero-title">Admin Dashboard 🐾</h1>
          <p className="hero-subtitle">Manage pet advertisements for the PawTracker community.</p>
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="container">

          <h2 className="section-title">Advertisement Management</h2>

          <button
            onClick={downloadPDF}
            className="hero-btn mb-4"
          >
            Download PDF Summary
          </button>

          {loading ? (
            <Spinner />
          ) : advertisements.length === 0 ? (
            <div className="no-ads">No advertisements found.</div>
          ) : (
            <div className="row">
              {advertisements.map((ad) => (
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
                      <h3 className="card-title">{ad.heading}</h3>
                      <p className="card-body-text">
                        {ad.description?.slice(0, 100)}...
                      </p>
                      <p className="card-body-text">Email: {ad.email}</p>
                      <p className="card-body-text">Contact: {ad.contactNumber}</p>
                      <p className="card-body-text">Type: {ad.advertisementType}</p>
                      {ad.petType && (
                        <p className="card-body-text">Pet Type: {ad.petType}</p>
                      )}
                      <p
                        className={`status-text ${
                          ad.status === "Approved"
                            ? "status-approved"
                            : ad.status === "Rejected"
                            ? "status-rejected"
                            : "status-pending"
                        }`}
                      >
                        Status: {ad.status}
                      </p>
                      <p className="card-body-text">Payment: {ad.paymentStatus}</p>
                      {ad.status === "Pending" && (
                        <div className="card-actions">
                          <button
                            onClick={() => handleApprove(ad._id)}
                            className="action-btn success"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(ad._id)}
                            className="action-btn danger"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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

export default Admin;