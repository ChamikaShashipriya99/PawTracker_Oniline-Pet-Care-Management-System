// client/src/VetService.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaStethoscope, FaSyringe, FaHeartbeat, FaTooth, FaAmbulance, FaFlask } from 'react-icons/fa';
import vetImage from '../assets/vet.jpg';
import './Service.css';

function VetService() {
    return (
        <div className="container my-5">
            {/* Hero Section */}
            <div className="position-relative rounded-3 overflow-hidden shadow-lg mb-5" style={{ height: '450px' }}>
                <img src={vetImage} alt="Veterinary Service" className="w-100 h-100 object-fit-cover brightness-70" />
                <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
                    <h1 className="text-white display-4 fw-bold mb-4 animate__animated animate__fadeIn">Comprehensive Veterinary Services</h1>
                    <p className="text-white fs-4 fw-light mb-4 animate__animated animate__fadeIn animate__delay-1s" style={{ maxWidth: '700px' }}>
                        Exceptional vet care for your pet—check-ups, vaccinations, surgeries, and more.
                    </p>
                    <Link to="/book-appointment?service=Vet Service" className="btn btn-primary btn-lg">
                        Book an Appointment
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-3 shadow-lg p-5 mb-5">
                <h2 className="section-heading text-center mb-5">Our Veterinary Services</h2>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaStethoscope className="feature-icon mb-3" />
                                <h3 className="card-title h5">Regular Check-ups</h3>
                                <p className="card-text">Routine exams to monitor health and catch issues early.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaSyringe className="feature-icon mb-3" />
                                <h3 className="card-title h5">Vaccinations</h3>
                                <p className="card-text">Essential vaccines to protect against diseases.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaHeartbeat className="feature-icon mb-3" />
                                <h3 className="card-title h5">Surgery</h3>
                                <p className="card-text">Expert surgical care for routine and complex procedures.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaTooth className="feature-icon mb-3" />
                                <h3 className="card-title h5">Dental Care</h3>
                                <p className="card-text">Complete dental services for optimal oral health.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaAmbulance className="feature-icon mb-3" />
                                <h3 className="card-title h5">Emergency Care</h3>
                                <p className="card-text">Urgent medical attention for emergencies.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaFlask className="feature-icon mb-3" />
                                <h3 className="card-title h5">Laboratory Services</h3>
                                <p className="card-text">In-house diagnostics for fast and accurate results.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-3 shadow-lg p-5 mb-5">
                <h2 className="section-heading text-center mb-4">Service Pricing</h2>
                <div className="table-responsive">
                    <table className="table table-striped table-hover pricing-table">
                        <thead>
                            <tr>
                                <th>Service</th>
                                <th>Description</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Regular Check-up</td>
                                <td>Comprehensive examination</td>
                                <td>Rs.5000</td>
                            </tr>
                            <tr>
                                <td>Vaccination</td>
                                <td>Core vaccines package</td>
                                <td>Rs.7500</td>
                            </tr>
                            <tr>
                                <td>Dental Cleaning</td>
                                <td>Complete dental assessment and cleaning</td>
                                <td>Rs.12000</td>
                            </tr>
                            <tr>
                                <td>Blood Work</td>
                                <td>Complete blood count and chemistry</td>
                                <td>Rs.8500</td>
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
                                <p className="card-text fst-italic">"The vet team saved my cat’s life during an emergency. I’m so grateful!"</p>
                                <h4 className="card-title text-primary mt-3">— Lisa P.</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card testimonial-card shadow-sm position-relative">
                            <div className="card-body text-center">
                                <p className="card-text fst-italic">"Regular check-ups here keep my dog healthy and happy."</p>
                                <h4 className="card-title text-primary mt-3">— Michael S.</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call-to-Action Button */}
            <div className="text-center mb-5">
                <Link to="/book-appointment?service=Vet Service" className="btn btn-primary btn-lg">
                    Schedule Your Vet Appointment Today
                </Link>
            </div>
        </div>
    );
}

export default VetService;