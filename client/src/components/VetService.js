// client/src/VetService.js
import React from 'react';
import { Link } from 'react-router-dom';
import vetImage from '../assets/vet.jpg';
import checkupImg from '../assets/checkup.jpg'; // New image
import vaccineImg from '../assets/vaccine.jpg'; // New image
import surgeryImg from '../assets/surgery.jpg'; // New image
import dentalImg from '../assets/dental.jpg'; // New image
import emergencyImg from '../assets/emergency.jpg'; // New image
import labImg from '../assets/lab.jpg'; // New image
import lisaImg from '../assets/lisa.jpg'; // New image for testimonial
import michaelImg from '../assets/michael.jpg'; // New image for testimonial
import './Service.css';

function VetService() {
    return (
        <div className="service-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">Comprehensive Veterinary Services 🐾</h1>
                    <p className="hero-subtitle">Exceptional vet care for your pet—check-ups, vaccinations, surgeries, and more.</p>
                    <Link to="/book-appointment?service=Vet Service" className="hero-btn">
                        Book an Appointment
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="content-section fade-in">
                <div className="container">
                    <h2 className="section-title">Our Veterinary Services</h2>
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={checkupImg} alt="Regular Check-ups" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Regular Check-ups</h3>
                                    <p>Routine exams to monitor health and catch issues early.</p>
                                    <Link to="/book-appointment?service=Vet Service&type=Checkup" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={vaccineImg} alt="Vaccinations" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Vaccinations</h3>
                                    <p>Essential vaccines to protect against diseases.</p>
                                    <Link to="/book-appointment?service=Vet Service&type=Vaccination" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={surgeryImg} alt="Surgery" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Surgery</h3>
                                    <p>Expert surgical care for routine and complex procedures.</p>
                                    <Link to="/book-appointment?service=Vet Service&type=Surgery" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={dentalImg} alt="Dental Care" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Dental Care</h3>
                                    <p>Complete dental services for optimal oral health.</p>
                                    <Link to="/book-appointment?service=Vet Service&type=Dental" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={emergencyImg} alt="Emergency Care" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Emergency Care</h3>
                                    <p>Urgent medical attention for emergencies.</p>
                                    <Link to="/book-appointment?service=Vet Service&type=Emergency" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={labImg} alt="Laboratory Services" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Laboratory Services</h3>
                                    <p>In-house diagnostics for fast and accurate results.</p>
                                    <Link to="/book-appointment?service=Vet Service&type=Lab" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="content-section fade-in">
                <div className="container">
                    <h2 className="section-title">Service Pricing</h2>
                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
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
            </section>

            {/* Testimonials Section */}
            <section className="content-section fade-in">
                <div className="container">
                    <h2 className="section-title">What Our Clients Say</h2>
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="card hover-card">
                                <img src={lisaImg} alt="Lisa P." className="card-img-top" />
                                <div className="card-body">
                                    <p className="fst-italic">"The vet team saved my cat’s life during an emergency. I’m so grateful!"</p>
                                    <h4 className="mt-3">— Lisa P.</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card hover-card">
                                <img src={michaelImg} alt="Michael S." className="card-img-top" />
                                <div className="card-body">
                                    <p className="fst-italic">"Regular check-ups here keep my dog healthy and happy."</p>
                                    <h4 className="mt-3">— Michael S.</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call-to-Action Button */}
            <div className="text-center mb-5 fade-in">
                <Link to="/book-appointment?service=Vet Service" className="hero-btn">
                    Schedule Your Vet Appointment Today
                </Link>
            </div>
        </div>
    );
}

export default VetService;