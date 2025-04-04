import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import { useSnackbar } from "notistack";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
        setAdvertisements(response.data.data || []); // Fallback to empty array
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

  const downloadPDF = () => {
    console.log("Generating PDF...");
    console.log("Ads for PDF:", advertisements);

    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text("Pet Advertisement Summary", 14, 20);

    // Table (text-only, no images)
    const tableData = advertisements.length
      ? advertisements.map(ad => [
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
      headStyles: { fillColor: [0, 102, 204] }, // Blue header
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      doc.text("Pet Advertisement Hub", doc.internal.pageSize.width - 50, doc.internal.pageSize.height - 10);
    }

    console.log("Saving PDF as advertisement_summary.pdf...");
    doc.save("advertisement_summary.pdf");
    enqueueSnackbar("PDF downloaded", { variant: "success" });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <BackButton destination="/" />
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      <button
        onClick={downloadPDF}
        className="mb-6 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
      >
        Download PDF Summary
      </button>
      {loading ? (
        <Spinner />
      ) : advertisements.length === 0 ? (
        <p className="text-gray-500 text-center">No advertisements found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map((ad) => (
            <div
              key={ad._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              {ad.photo && (
                <img
                  src={`http://localhost:5000/uploads/${ad.photo}`}
                  alt={ad.heading}
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{ad.heading}</h3>
              <p className="text-gray-600 mb-2">{ad.description?.slice(0, 100)}...</p>
              <p className="text-gray-600 mb-2">Email: {ad.email}</p>
              <p className="text-gray-600 mb-2">Contact: {ad.contactNumber}</p>
              <p className="text-gray-600 mb-2">Type: {ad.advertisementType}</p>
              {ad.petType && <p className="text-gray-600 mb-2">Pet Type: {ad.petType}</p>}
              <p
                className={`font-medium mb-2 ${
                  ad.status === "Approved"
                    ? "text-green-500"
                    : ad.status === "Rejected"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                Status: {ad.status}
              </p>
              <p className="text-gray-600 mb-4">Payment: {ad.paymentStatus}</p>
              {ad.status === "Pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(ad._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(ad._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;