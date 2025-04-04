/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import { Link } from "react-router-dom";
import AdvertisementModal from "../components/home/AdvertisementModal";
import DogImage from "../assets/Dog.jpg"; // Import Dog.jpg
import CatImage from "../assets/Cat.jpg"; // Import Cat.jpg

const Home = () => {
  // Static sample ads with imported images
  const lostAndFoundSample = [
    {
      _id: "sample1",
      heading: "Lost Dog - Max",
      description: "Max, a 3-year-old Golden Retriever, went missing near Central Park on March 25, 2025. He’s friendly, has a red collar, and responds to his name. Please contact if found!",
      photo: DogImage, // Use imported image
    },
  ];

  const sellAPetSample = [
    {
      _id: "sample2",
      heading: "Kitten for Sale - Luna",
      description: "Luna is a 6-month-old tabby kitten, fully vaccinated and litter-trained. Looking for a loving home! Available for pickup in downtown area.",
      photo: CatImage, // Use imported image
    },
  ];

  const [approvedAds, setApprovedAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/advertisements")
      .then((response) => {
        const approved = response.data.data.filter(ad => ad.status === "Approved");
        setApprovedAds(approved);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
        setApprovedAds([]);
        setLoading(false);
      });
  }, []);

  const handleAdClick = (ad) => setSelectedAd(ad);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-5xl font-bold text-center mb-8">Paw-Tracker Advertisement Hub</h1>
      <div className="navbar bg-base-100 rounded-lg shadow-md mb-8">
        <div className="flex-1"></div>
        <div className="flex-none gap-4">
          <div className="form-control">
            <input
              type="text"
              placeholder="Search Ads"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-48 md:w-72"
            />
          </div>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img alt="Profile" src="/images/93469.jpeg" />
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><a>Profile</a></li>
              <li><a>Settings</a></li>
              <li><a>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <Link to="/advertisements/create">
          <button className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition">
            Create Advertisement
          </button>
        </Link>
        <Link to="/advertisements/my-ads">
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
            My Ads
          </button>
        </Link>
        <Link to="/advertisements/admin">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
            For Admin
          </button>
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Lost and Found Section with Sample */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Lost and Found</h2>
              {lostAndFoundSample.filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase())).map(ad => (
                <div
                  key={ad._id}
                  className="p-4 mb-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleAdClick(ad)}
                >
                  {ad.photo && (
                    <img
                      src={ad.photo}
                      alt={ad.heading}
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="text-lg font-medium">{ad.heading}</h3>
                  <p className="text-gray-600">{ad.description.slice(0, 100)}...</p>
                </div>
              ))}
            </div>

            {/* Sell a Pet Section with Sample */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Sell a Pet</h2>
              {sellAPetSample.filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase())).map(ad => (
                <div
                  key={ad._id}
                  className="p-4 mb-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => handleAdClick(ad)}
                >
                  {ad.photo && (
                    <img
                      src={ad.photo}
                      alt={ad.heading}
                      className="w-full h-40 object-cover rounded-md mb-2"
                    />
                  )}
                  <h3 className="text-lg font-medium">{ad.heading}</h3>
                  <p className="text-gray-600">{ad.description.slice(0, 100)}...</p>
                </div>
              ))}
            </div>
          </div>

          {/* Approved Advertisements Section */}
          <div className="mt-12">
            <h2 className="text-3xl font-semibold mb-6 text-center">Approved Advertisements</h2>
            {approvedAds.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedAds.filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase())).map(ad => (
                  <div
                    key={ad._id}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                    onClick={() => handleAdClick(ad)}
                  >
                    {ad.photo && (
                      <img
                        src={`http://localhost:5000/uploads/${ad.photo}`}
                        alt={ad.heading}
                        className="w-full h-40 object-cover rounded-md mb-2"
                      />
                    )}
                    <h3 className="text-xl font-semibold mb-2">{ad.heading}</h3>
                    <p className="text-gray-600 mb-2">{ad.description.slice(0, 100)}...</p>
                    <p className="text-gray-600 mb-2">Type: {ad.advertisementType}</p>
                    {ad.petType && <p className="text-gray-600 mb-2">Pet Type: {ad.petType}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No approved advertisements yet.</p>
            )}
          </div>
        </>
      )}

      {selectedAd && (
        <AdvertisementModal book={selectedAd} onClose={() => setSelectedAd(null)} />
      )}
    </div>
  );
};

export default Home;