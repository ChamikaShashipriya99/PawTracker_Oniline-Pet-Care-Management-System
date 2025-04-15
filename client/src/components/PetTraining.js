// client/src/PetTraining.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaPaw, FaDog, FaBabyCarriage, FaTrophy, FaRunning, FaHandsHelping } from 'react-icons/fa';
import trainingImage from '../assets/training.jpg';
import './Service.css';

function PetTraining() {
    return (
        <div className="container my-5">
            {/* Hero Section */}
            <div className="position-relative rounded-3 overflow-hidden shadow-lg mb-5" style={{ height: '450px' }}>
                <img src={trainingImage} alt="Pet Training" className="w-100 h-100 object-fit-cover brightness-70" />
                <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-center p-4">
                    <h1 className="text-white display-4 fw-bold mb-4 animate__animated animate__fadeIn">Expert Pet Training Services</h1>
                    <p className="text-white fs-4 fw-light mb-4 animate__animated animate__fadeIn animate__delay-1s" style={{ maxWidth: '700px' }}>
                        Unlock your pet’s potential with our tailored training programs—private or group sessions available.
                    </p>
                    <Link to="/book-appointment?service=Pet Training" className="btn btn-primary btn-lg">
                        Book a Session Now
                    </Link>
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-3 shadow-lg p-5 mb-5">
                <h2 className="section-heading text-center mb-5">Our Training Programs</h2>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaPaw className="feature-icon mb-3" />
                                <h3 className="card-title h5">Basic Obedience</h3>
                                <p className="card-text">Teach fundamental commands like sit, stay, come, and leash walking.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaDog className="feature-icon mb-3" />
                                <h3 className="card-title h5">Behavior Correction</h3>
                                <p className="card-text">Address issues like jumping, barking, or aggression with expert guidance.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaBabyCarriage className="feature-icon mb-3" />
                                <h3 className="card-title h5">Puppy Training</h3>
                                <p className="card-text">Early socialization and skills for puppies aged 8 weeks to 6 months.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaTrophy className="feature-icon mb-3" />
                                <h3 className="card-title h5">Advanced Training</h3>
                                <p className="card-text">Master complex commands for pets ready to level up.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaRunning className="feature-icon mb-3" />
                                <h3 className="card-title h5">Agility Training</h3>
                                <p className="card-text">Fun obstacle courses to boost physical and mental agility.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <FaHandsHelping className="feature-icon mb-3" />
                                <h3 className="card-title h5">Therapy Dog Preparation</h3>
                                <p className="card-text">Prepare your pet to become a therapy or service animal.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div className="bg-white rounded-3 shadow-lg p-5 mb-5">
                <h2 className="section-heading text-center mb-5">Training Options</h2>
                <div className="row row-cols-1 row-cols-md-2 g-4">
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <h3 className="card-title h5">Private Training</h3>
                                <p className="card-text">One-on-one sessions tailored to your pet's specific needs.</p>
                                <p className="card-text"><strong>Price:</strong> Rs.7500 per session (60 minutes)</p>
                                <p className="card-text"><strong>Package:</strong> Rs.40000 for 6 sessions</p>
                                <Link to="/book-appointment?service=Pet Training&type=Private" className="btn btn-primary mt-3">
                                    Book Private Training
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card h-100 feature-card shadow-sm">
                            <div className="card-body text-center">
                                <h3 className="card-title h5">Group Training</h3>
                                <p className="card-text">Small group classes (max 6 pets) for socialization and skills.</p>
                                <p className="card-text"><strong>Price:</strong> Rs.3500 per session (90 minutes)</p>
                                <p className="card-text"><strong>Package:</strong> Rs.18000 for 6 sessions</p>
                                <Link to="/book-appointment?service=Pet Training&type=Group" className="btn btn-primary mt-3">
                                    Book Group Training
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div className="bg-white rounded-3 shadow-lg p-5 mb-5">
                <h2 className="section-heading text-center mb-5">What Our Clients Say</h2>
                <div className="row row-cols-1 row-cols-md-2 g-4">
                    <div className="col">
                        <div className="card testimonial-card shadow-sm position-relative">
                            <div className="card-body text-center">
                                <p className="card-text fst-italic">"The trainers are amazing! My dog now listens to commands perfectly."</p>
                                <h4 className="card-title text-primary mt-3">— Emily R.</h4>
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <div className="card testimonial-card shadow-sm position-relative">
                            <div className="card-body text-center">
                                <p className="card-text fst-italic">"Group training helped my puppy socialize and learn so quickly."</p>
                                <h4 className="card-title text-primary mt-3">— Mark T.</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call-to-Action Button */}
            <div className="text-center mb-5">
                <Link to="/book-appointment?service=Pet Training" className="btn btn-primary btn-lg">
                    Schedule Your Training Session Today
                </Link>
            </div>
        </div>
    );
}

export default PetTraining;