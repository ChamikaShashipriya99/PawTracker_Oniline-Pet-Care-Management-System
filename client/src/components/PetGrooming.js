// client/src/PetGrooming.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBath, FaCut, FaPaw, FaSpa, FaTooth, FaLeaf } from 'react-icons/fa';
import groomingImage from '../assets/grooming.jpg';
import './Service.css';

function PetGrooming() {
    return (
        <div className="container my-5">
            {/* Hero Section */}
            <div className="position-relative rounded-3 overflow-hidden shadow-lg mb-5" style={{ height: '450px' }}>
                <img src={groomingImage} alt="Pet Grooming" className="w-100 h-100 object-fit-cover brightness-70" />
                <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
                    <h1 className="text-white display-4 fw-bold mb-4 animate__animated animate__fadeIn">Professional Pet Grooming Services</h1>
                    <p className="text-white fs-4 fw-light mb-4 animate__animated animate__fadeIn animate__delay-1s" style={{ maxWidth: '700px' }}>
                        Elevate your pet’s care with our expert grooming services—designed for comfort, style, and well-being.
                    </p>
                    <Link to="/book-appointment?service=Pet Grooming" className="btn btn-primary btn-lg">
                        Book Your Appointment
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-3 shadow-lg p-5 mb-5">
                <h2 className="section-heading text-center mb-5">Our Premium Grooming Services</h2>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaBath className="feature-icon mb-3" />
                                <h3 className="card-title h5">Bath & Brush</h3>
                                <p className="card-text">Deep cleansing with premium, pet-safe products tailored to your pet’s coat type.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaCut className="feature-icon mb-3" />
                                <h3 className="card-title h5">Haircuts</h3>
                                <p className="card-text">Custom or breed-specific styling to ensure your pet looks and feels their best.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaPaw className="feature-icon mb-3" />
                                <h3 className="card-title h5">Nail Trimming</h3>
                                <p className="card-text">Expert nail care to maintain your pet’s comfort and mobility.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaSpa className="feature-icon mb-3" />
                                <h3 className="card-title h5">Ear Cleaning</h3>
                                <p className="card-text">Gentle ear cleaning to promote hygiene and prevent infections.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaTooth className="feature-icon mb-3" />
                                <h3 className="card-title h5">Teeth Brushing</h3>
                                <p className="card-text">Professional dental care for fresh breath and healthy teeth.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaLeaf className="feature-icon mb-3" />
                                <h3 className="card-title h5">De-shedding</h3>
                                <p className="card-text">Specialized treatments to minimize shedding and enhance coat health.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-3 shadow-lg p-5 mb-5">
                <h2 className="section-heading text-center mb-4">Our Pricing Plans</h2>
                <div className="table-responsive">
                    <table className="table table-striped table-hover pricing-table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Small Pet</th>
                                <th>Medium Pet</th>
                                <th>Large Pet</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Basic Bath</td>
                                <td>Rs.2500</td>
                                <td>Rs.3500</td>
                                <td>Rs.4000</td>
                            </tr>
                            <tr>
                                <td>Full Grooming</td>
                                <td>Rs.6500</td>
                                <td>Rs.8000</td>
                                <td>Rs.9500</td>
                            </tr>
                            <tr>
                                <td>Nail Trim</td>
                                <td>Rs.1500</td>
                                <td>Rs.1500</td>
                                <td>Rs.2000</td>
                            </tr>
                            <tr>
                                <td>De-shedding Treatment</td>
                                <td>Rs.4000</td>
                                <td>Rs.5000</td>
                                <td>Rs.6500</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="bg-white rounded-3 shadow-lg p-5 mb-5">
                <h2 className="section-heading text-center mb-5">What Our Clients Say</h2>
                <div className="row row-cols-1 row-cols-md-2 g-4">
                    <div className="col">
                        <div className="card testimonial-card shadow-sm position-relative">
                            <div className="card-body text-center">
                                <p className="card-text fst-italic">"The grooming team is outstanding! My dog has never looked better or been happier."</p>
                                <h4 className="card-title text-primary mt-3">— Sarah M.</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card testimonial-card shadow-sm position-relative">
                            <div className="card-body text-center">
                                <p className="card-text fst-italic">"A truly professional and caring service. I trust them completely with my pet."</p>
                                <h4 className="card-title text-primary mt-3">— John D.</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call-to-Action Button */}
            <div className="text-center mb-5">
                <Link to="/book-appointment?service=Pet Grooming" className="btn btn-primary btn-lg">
                    Schedule Your Appointment Today
                </Link>
            </div>
        </div>
    );
}

export default PetGrooming;