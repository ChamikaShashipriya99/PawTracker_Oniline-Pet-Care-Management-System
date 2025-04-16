// client/src/PetGrooming.js
import React from 'react';
import { Link } from 'react-router-dom';
import groomingImage from '../assets/grooming.jpg';
import bathImg from '../assets/bath.jpg'; // New image
import haircutImg from '../assets/haircut.jpg'; // New image
import nailTrimImg from '../assets/nail-trim.jpg'; // New image
import earCleanImg from '../assets/ear-clean.jpg'; // New image
import teethBrushImg from '../assets/teeth-brush.jpg'; // New image
import deshedImg from '../assets/deshed.jpg'; // New image
import sarahImg from '../assets/sarah.jpg'; // New image for testimonial
import johnImg from '../assets/john.jpg'; // New image for testimonial
import './Service.css';

function PetGrooming() {
    return (
        <div className="service-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">Professional Pet Grooming Services 🐾</h1>
                    <p className="hero-subtitle">Elevate your pet’s care with our expert grooming services—designed for comfort, style, and well-being.</p>
                    <Link to="/book-appointment?service=Pet Grooming" className="hero-btn">
                        Book Your Appointment
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="content-section fade-in">
                <div className="container">
                    <h2 className="section-title">Our Premium Grooming Services</h2>
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={bathImg} alt="Bath & Brush" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Bath & Brush</h3>
                                    <p>Deep cleansing with premium, pet-safe products tailored to your pet’s coat type.</p>
                                    <Link to="/book-appointment?service=Pet Grooming&type=Bath" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={haircutImg} alt="Haircuts" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Haircuts</h3>
                                    <p>Custom or breed-specific styling to ensure your pet looks and feels their best.</p>
                                    <Link to="/book-appointment?service=Pet Grooming&type=Haircut" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={nailTrimImg} alt="Nail Trimming" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Nail Trimming</h3>
                                    <p>Expert nail care to maintain your pet’s comfort and mobility.</p>
                                    <Link to="/book-appointment?service=Pet Grooming&type=NailTrim" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={earCleanImg} alt="Ear Cleaning" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Ear Cleaning</h3>
                                    <p>Gentle ear cleaning to promote hygiene and prevent infections.</p>
                                    <Link to="/book-appointment?service=Pet Grooming&type=EarClean" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={teethBrushImg} alt="Teeth Brushing" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Teeth Brushing</h3>
                                    <p>Professional dental care for fresh breath and healthy teeth.</p>
                                    <Link to="/book-appointment?service=Pet Grooming&type=TeethBrush" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={deshedImg} alt="De-shedding" className="card-img-top" />
                                <div className="card-body">
                                    <h3>De-shedding</h3>
                                    <p>Specialized treatments to minimize shedding and enhance coat health.</p>
                                    <Link to="/book-appointment?service=Pet Grooming&type=Deshed" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="content-section fade-in">
                <div className="container">
                    <h2 className="section-title">Our Pricing Plans</h2>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
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
            </section>

            {/* Testimonials Section */}
            <section className="content-section fade-in">
                <div className="container">
                    <h2 className="section-title">What Our Clients Say</h2>
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="card hover-card">
                                <img src={sarahImg} alt="Sarah M." className="card-img-top" />
                                <div className="card-body">
                                    <p className="fst-italic">"The grooming team is outstanding! My dog has never looked better or been happier."</p>
                                    <h4 className="mt-3">— Sarah M.</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card hover-card">
                                <img src={johnImg} alt="John D." className="card-img-top" />
                                <div className="card-body">
                                    <p className="fst-italic">"A truly professional and caring service. I trust them completely with my pet."</p>
                                    <h4 className="mt-3">— John D.</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call-to-Action Button */}
            <div className="text-center mb-5 fade-in">
                <Link to="/book-appointment?service=Pet Grooming" className="hero-btn">
                    Schedule Your Appointment Today
                </Link>
            </div>
        </div>
    );
}

export default PetGrooming;