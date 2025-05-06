/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import DogImage from "../assets/Dog.jpg";
import CatImage from "../assets/Cat.jpg";
import { AiOutlineClose } from "react-icons/ai";
import { MdEmail, MdContactPhone, MdSubject } from "react-icons/md";
import { BiUserCircle } from "react-icons/bi";
import { LuType } from "react-icons/lu";
import "./Advertisement.css";
import config from '../config';
import Pet1Image from "../assets/Pet1.jpg";

const AdvertisingDashboard = () => {
  const lostAndFoundSample = [
    {
      _id: "sample1",
      heading: "Lost Dog - Max",
      description: "Max, a 3-year-old Golden Retriever, went missing near Central Park on March 25, 2025. He's friendly, has a red collar, and responds to his name. Please contact if found!",
      photo: DogImage,
      name: "Sample User",
      email: "sample@example.com",
      contactNumber: "1234567890",
      advertisementType: "Lost and Found",
    },
  ];

  const sellAPetSample = [
    {
      _id: "sample2",
      heading: "Kitten for Sale - Luna",
      description: "Luna is a 6-month-old tabby kitten, fully vaccinated and litter-trained. Looking for a loving home! Available for pickup in downtown area.",
      photo: CatImage,
      name: "Sample User",
      email: "sample@example.com",
      contactNumber: "1234567890",
      advertisementType: "Sell a Pet",
      petType: "Cat",
    },
  ];

  const [approvedAds, setApprovedAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedAd, setSelectedAd] = useState(null);

  useEffect(() => {
    const fetchApprovedAds = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${config.API_URL}/advertisements`);
        const approved = response.data.data.filter(ad => ad.status === "Approved");
        setApprovedAds(approved);
      } catch (error) {
        console.error("Error fetching advertisements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedAds();
  }, []);

  const handleAdClick = (ad) => setSelectedAd(ad);

  // Inline Spinner component
  const Spinner = () => (
    <div className="d-flex justify-content-center my-4">
      <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  // Inline AdsModal component
  const AdsModal = ({ book, onClose }) => (
    <div className="modal fade-in" tabIndex="-1" onClick={onClose}>
      <div className="modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title">{book.heading}</h5>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <AiOutlineClose style={{ fontSize: "1.5rem", color: "#ff5733" }} />
          </button>
        </div>
        <div className="modal-body">
          {book.photo && (
            <img
              src={book._id.startsWith("sample") ? book.photo : `${config.UPLOADS_URL}/uploads/${book.photo}`}
              alt={book.heading}
              className="modal-img"
            />
          )}
          <div className="modal-details">
            <div className="detail-item">
              <BiUserCircle className="detail-icon" />
              <span className="detail-label">Name:</span>
              <span>{book.name || "N/A"}</span>
            </div>
            <div className="detail-item">
              <MdEmail className="detail-icon" />
              <span className="detail-label">Email:</span>
              <span>{book.email || "N/A"}</span>
            </div>
            <div className="detail-item">
              <MdContactPhone className="detail-icon" />
              <span className="detail-label">Contact Number:</span>
              <span>{book.contactNumber || "N/A"}</span>
            </div>
            <div className="detail-item">
              <LuType className="detail-icon" />
              <span className="detail-label">Type:</span>
              <span>{book.advertisementType}</span>
            </div>
            {book.advertisementType === "Sell a Pet" && (
              <div className="detail-item">
                <LuType className="detail-icon" />
                <span className="detail-label">Pet Type:</span>
                <span>{book.petType || "N/A"}</span>
              </div>
            )}
            <div className="detail-item">
              <MdSubject className="detail-icon" />
              <span className="detail-label">Description:</span>
              <span>{book.description}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="home-container">
      <section className="hero-section" style={{ backgroundImage: `url(${Pet1Image})` }}>
        <div className="hero-overlay">
          <div className="hero-content fade-in">
            <h1 className="hero-title">Advertising Dashboard 🐾</h1>
            <p className="hero-subtitle">Connect with pet lovers through our advertisement hub.</p>
          </div>

          <div className="dashboard-actions">
            <Link to="/advertisements/add">
              <button className="hero-btn">Create Advertisement</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="container">
          {loading ? (
            <Spinner />
          ) : (
            <>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card hover-card">
                    <div className="card-body">
                      <h3 className="section-title">Lost and Found</h3>
                      {lostAndFoundSample
                        .filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase()))
                        .map(ad => (
                          <div
                            key={ad._id}
                            className="card hover-card mb-3"
                            onClick={() => handleAdClick(ad)}
                          >
                            {ad.photo && (
                              <img
                                src={ad.photo}
                                alt={ad.heading}
                                className="card-img-top"
                              />
                            )}
                            <div className="card-body">
                              <h3>{ad.heading}</h3>
                              <p>{ad.description.slice(0, 100)}...</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="col-md-6 mb-4">
                  <div className="card hover-card">
                    <div className="card-body">
                      <h3 className="section-title">Sell a Pet</h3>
                      {sellAPetSample
                        .filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase()))
                        .map(ad => (
                          <div
                            key={ad._id}
                            className="card hover-card mb-3"
                            onClick={() => handleAdClick(ad)}
                          >
                            {ad.photo && (
                              <img
                                src={ad.photo}
                                alt={ad.heading}
                                className="card-img-top"
                              />
                            )}
                            <div className="card-body">
                              <h3>{ad.heading}</h3>
                              <p>{ad.description.slice(0, 100)}...</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="content-section">
                <h2 className="section-title">Admin Approved Advertisements</h2>
                {approvedAds.length > 0 ? (
                  <div className="row">
                    {approvedAds
                      .filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase()))
                      .map(ad => (
                        <div key={ad._id} className="col-md-4 mb-4">
                          <div
                            className="card hover-card"
                            onClick={() => handleAdClick(ad)}
                          >
                            {ad.photo && (
                              <img
                                src={`${config.UPLOADS_URL}/uploads/${ad.photo}`}
                                alt={ad.heading}
                                className="card-img-top"
                              />
                            )}
                            <div className="card-body">
                              <h3>{ad.heading}</h3>
                              <p>{ad.description.slice(0, 100)}...</p>
                              <p>Type: {ad.advertisementType}</p>
                              {ad.petType && <p>Pet Type: {ad.petType}</p>}
                              <div className="mt-2">
                                <span className="badge bg-success">Admin Approved</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center">No admin approved advertisements yet.</p>
                )}
              </div>
            </>
          )}

          {selectedAd && (
            <AdsModal book={selectedAd} onClose={() => setSelectedAd(null)} />
          )}
        </div>
      </section>
    </div>
  );
};

export default AdvertisingDashboard;