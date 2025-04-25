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

const Home = () => {
  const lostAndFoundSample = [
    {
      _id: "sample1",
      heading: "Lost Dog - Max",
      description: "Max, a 3-year-old Golden Retriever, went missing near Central Park on March 25, 2025. He’s friendly, has a red collar, and responds to his name. Please contact if found!",
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
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      tabIndex="-1"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{book.heading}</h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
              <AiOutlineClose className="text-danger" style={{ fontSize: "1.5rem" }} />
            </button>
          </div>
          <div className="modal-body">
            {book.photo && (
              <img
                src={book._id.startsWith("sample") ? book.photo : `http://localhost:5000/uploads/${book.photo}`}
                alt={book.heading}
                className="img-fluid mx-auto d-block mb-4 rounded shadow-sm"
                style={{ maxWidth: "256px", maxHeight: "256px", objectFit: "cover" }}
              />
            )}
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-2">
                <BiUserCircle className="text-danger fs-4" />
                <span className="text-muted">Name:</span>
                <span>{book.name || "N/A"}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <MdEmail className="text-danger fs-4" />
                <span className="text-muted">Email:</span>
                <span>{book.email || "N/A"}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <MdContactPhone className="text-danger fs-4" />
                <span className="text-muted">Contact Number:</span>
                <span>{book.contactNumber || "N/A"}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <LuType className="text-danger fs-4" />
                <span className="text-muted">Type:</span>
                <span>{book.advertisementType}</span>
              </div>
              {book.advertisementType === "Sell a Pet" && (
                <div className="d-flex align-items-center gap-2">
                  <LuType className="text-danger fs-4" />
                  <span className="text-muted">Pet Type:</span>
                  <span>{book.petType || "N/A"}</span>
                </div>
              )}
              <div className="d-flex align-items-start gap-2">
                <MdSubject className="text-danger fs-4" />
                <span className="text-muted">Description:</span>
                <span>{book.description}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container my-4">
      <h1 className="display-4 fw-bold text-center mb-5">Paw-Tracker Advertisement Hub</h1>
      
      <nav className="navbar navbar-expand-lg navbar-light bg-light rounded shadow-sm mb-5">
        <div className="container-fluid">
          <div className="flex-grow-1"></div>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <input
                type="text"
                placeholder="Search Ads"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-control"
                style={{ width: "250px" }}
              />
            </div>
            <div className="dropdown">
              <button
                className="btn btn-light rounded-circle"
                type="button"
                id="profileDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img
                  src="/images/93469.jpeg"
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px" }}
                />
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                <li><a className="dropdown-item" href="#">Profile</a></li>
                <li><a className="dropdown-item" href="#">Settings</a></li>
                <li><a className="dropdown-item" href="#">Logout</a></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex justify-content-between mb-5">
        <Link to="/advertising">
          <button className="btn btn-primary px-4">Create Advertisement</button>
        </Link>
        <Link to="/advertisements/my-ads">
          <button className="btn btn-primary px-4">My Ads</button>
        </Link>
        <Link to="/advertisements/admin">
          <button className="btn btn-primary px-4">For Admin</button>
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="row mb-5">
            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="card-title fs-3 mb-4">Lost and Found</h2>
                  {lostAndFoundSample.filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase())).map(ad => (
                    <div
                      key={ad._id}
                      className="card mb-3 bg-light cursor-pointer"
                      onClick={() => handleAdClick(ad)}
                    >
                      {ad.photo && (
                        <img
                          src={ad.photo}
                          alt={ad.heading}
                          className="card-img-top"
                          style={{ height: "160px", objectFit: "cover" }}
                        />
                      )}
                      <div className="card-body">
                        <h3 className="card-title fs-5">{ad.heading}</h3>
                        <p className="card-text text-muted">{ad.description.slice(0, 100)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="card-title fs-3 mb-4">Sell a Pet</h2>
                  {sellAPetSample.filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase())).map(ad => (
                    <div
                      key={ad._id}
                      className="card mb-3 bg-light cursor-pointer"
                      onClick={() => handleAdClick(ad)}
                    >
                      {ad.photo && (
                        <img
                          src={ad.photo}
                          alt={ad.heading}
                          className="card-img-top"
                          style={{ height: "160px", objectFit: "cover" }}
                        />
                      )}
                      <div className="card-body">
                        <h3 className="card-title fs-5">{ad.heading}</h3>
                        <p className="card-text text-muted">{ad.description.slice(0, 100)}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h2 className="fs-2 fw-bold text-center mb-4">Approved Advertisements</h2>
            {approvedAds.length > 0 ? (
              <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
                {approvedAds.filter(ad => ad.heading.toLowerCase().includes(query.toLowerCase())).map(ad => (
                  <div key={ad._id} className="col">
                    <div
                      className="card h-100 shadow-sm cursor-pointer"
                      onClick={() => handleAdClick(ad)}
                    >
                      {ad.photo && (
                        <img
                          src={`http://localhost:5000/uploads/${ad.photo}`}
                          alt={ad.heading}
                          className="card-img-top"
                          style={{ height: "160px", objectFit: "cover" }}
                        />
                      )}
                      <div className="card-body">
                        <h3 className="card-title fs-5 mb-2">{ad.heading}</h3>
                        <p className="card-text text-muted mb-2">{ad.description.slice(0, 100)}...</p>
                        <p className="card-text text-muted mb-2">Type: {ad.advertisementType}</p>
                        {ad.petType && <p className="card-text text-muted mb-2">Pet Type: {ad.petType}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted">No approved advertisements yet.</p>
            )}
          </div>
        </>
      )}

      {selectedAd && (
        <AdsModal book={selectedAd} onClose={() => setSelectedAd(null)} />
      )}
    </div>
  );
};

export default Home;