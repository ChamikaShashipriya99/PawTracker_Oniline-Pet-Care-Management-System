import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import BackButton from "../components/BackButton";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";

const MyAds = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const fetchAdvertisements = () => {
    if (!email) {
      enqueueSnackbar("Please enter an email to fetch ads", { variant: "warning" });
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`http://localhost:5000/advertisements/my-ads/${encodeURIComponent(email)}`)
      .then((response) => {
        setAdvertisements(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch Error:", error.response?.data || error.message);
        setLoading(false);
        enqueueSnackbar("Error fetching advertisements: " + (error.response?.data?.message || error.message), { variant: "error" });
      });
  };

  useEffect(() => {
    if (email) {
      fetchAdvertisements();
    }
  }, [email]);

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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <BackButton destination="/" />
      <h1 className="text-3xl font-bold mb-8 text-center">My Advertisements</h1>
      <Link to="/" className="text-blue-500 hover:underline mb-6 inline-block">Back to Advertisement Page</Link>
      
      <div className="mb-6 flex justify-center">
        <input
          type="email"
          placeholder="Enter your email to see your ads"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-2 border-gray-300 px-4 py-2 rounded-md w-72"
        />
        <button
          onClick={fetchAdvertisements}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Fetch My Ads
        </button>
      </div>

      <p className="text-center text-gray-700 mb-6">Total Ads: {advertisements.length}</p>

      {loading ? (
        <Spinner />
      ) : advertisements.length === 0 ? (
        <p className="text-gray-500 text-center">No advertisements found for {email || "this email"}.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map(ad => (
            <div key={ad._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              {ad.photo && (
                <img
                  src={`http://localhost:5000/uploads/${ad.photo}`}
                  alt={ad.heading}
                  className="w-full h-40 object-cover rounded-md mb-2"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{ad.heading}</h3>
              <p className="text-gray-600 mb-2">{ad.description.slice(0, 100)}...</p>
              <p className="text-gray-600 mb-2">Contact: {ad.contactNumber}</p>
              <p className="text-gray-600 mb-2">Type: {ad.advertisementType}</p>
              {ad.petType && <p className="text-gray-600 mb-2">Pet Type: {ad.petType}</p>}
              <p className={`font-medium ${ad.status === "Approved" ? "text-green-500" : ad.status === "Rejected" ? "text-red-500" : "text-yellow-500"}`}>
                Status: {ad.status}
              </p>
              <div className="flex gap-2 mt-4">
                <Link to={`/advertisements/details/${ad._id}`}>
                  <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition">
                    View
                  </button>
                </Link>
                <Link to={`/advertisements/edit/${ad._id}`}>
                  <button className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition">
                    Edit
                  </button>
                </Link>
                <Link to={`/advertisements/delete/${ad._id}`}>
                  <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition">
                    Delete
                  </button>
                </Link>
                {ad.status === "Approved" && ad.paymentStatus === "Pending" && (
                  <button
                    onClick={() => handlePay(ad._id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                  >
                    Pay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAds;