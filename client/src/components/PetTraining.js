// client/src/PetTraining.js
import React from 'react';
import { Link } from 'react-router-dom';
import trainingImage from '../assets/training.jpg';
import obedienceImg from '../assets/obedience.jpg'; // New image
import behaviorImg from '../assets/behavior.jpg'; // New image
import puppyImg from '../assets/puppy.jpg'; // New image
import advancedImg from '../assets/advanced.jpg'; // New image
import agilityImg from '../assets/agility.jpg'; // New image
import therapyImg from '../assets/therapy.jpg'; // New image
import emilyImg from '../assets/emily.jpg'; // New image for testimonial
import markImg from '../assets/mark.jpg'; // New image for testimonial
import './Service.css';

function PetTraining() {
    return (
        <div className="service-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content fade-in">
                    <h1 className="hero-title">Expert Pet Training Services 🐾</h1>
                    <p className="hero-subtitle">Unlock your pet’s potential with our tailored training programs—private or group sessions available.</p>
                    <Link to="/book-appointment?service=Pet Training" className="hero-btn">
                        Book a Session Now
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="content-section fade-in">
                <div className="container">
                    <h2 className="section-title">Our Training Programs</h2>
                    <div className="row">
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={obedienceImg} alt="Basic Obedience" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Basic Obedience</h3>
                                    <p>Teach fundamental commands like sit, stay, come, and leash walking.</p>
                                    <Link to="/book-appointment?service=Pet Training&type=Obedience" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={behaviorImg} alt="Behavior Correction" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Behavior Correction</h3>
                                    <p>Address issues like jumping, barking, or aggression with expert guidance.</p>
                                    <Link to="/book-appointment?service=Pet Training&type=Behavior" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={puppyImg} alt="Puppy Training" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Puppy Training</h3>
                                    <p>Early socialization and skills for puppies aged 8 weeks to 6 months.</p>
                                    <Link to="/book-appointment?service=Pet Training&type=Puppy" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={advancedImg} alt="Advanced Training" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Advanced Training</h3>
                                    <p>Master complex commands for pets ready to level up.</p>
                                    <Link to="/book-appointment?service=Pet Training&type=Advanced" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={agilityImg} alt="Agility Training" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Agility Training</h3>
                                    <p>Fun obstacle courses to boost physical and mental agility.</p>
                                    <Link to="/book-appointment?service=Pet Training&type=Agility" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="card hover-card">
                                <img src={therapyImg} alt="Therapy Dog Preparation" className="card-img-top" />
                                <div className="card-body">
                                    <h3>Therapy Dog Preparation</h3>
                                    <p>Prepare your pet to become a therapy or service animal.</p>
                                    <Link to="/book-appointment?service=Pet Training&type=Therapy" className="card-link">Book Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="content-section fade-in">
                <div className="container">
                    <h2 className="section-title">Training Options</h2>
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="card hover-card">
                                <div className="card-body text-center">
                                    <h3>Private Training</h3>
                                    <p>One-on-one sessions tailored to your pet's specific needs.</p>
                                    <p><strong>Price:</strong> Rs.7500 per session (60 minutes)</p>
                                    <p><strong>Package:</strong> Rs.40000 for 6 sessions</p>
                                    <Link to="/book-appointment?service=Pet Training&type=Private" className="card-link">Book Private Training</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card hover-card">
                                <div className="card-body text-center">
                                    <h3>Group Training</h3>
                                    <p>Small group classes (max 6 pets) for socialization and skills.</p>
                                    <p><strong>Price:</strong> Rs.3500 per session (90 minutes)</p>
                                    <p><strong>Package:</strong> Rs.18000 for 6 sessions</p>
                                    <Link to="/book-appointment?service=Pet Training&type=Group" className="card-link">Book Group Training</Link>
                                </div>
                            </div>
                        </div>
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
                                <img src={emilyImg} alt="Emily R." className="card-img-top" />
                                <div className="card-body">
                                    <p className="fst-italic">"The trainers are amazing! My dog now listens to commands perfectly."</p>
                                    <h4 className="mt-3">— Emily R.</h4>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card hover-card">
                                <img src={markImg} alt="Mark T." className="card-img-top" />
                                <div className="card-body">
                                    <p className="fst-italic">"Group training helped my puppy socialize and learn so quickly."</p>
                                    <h4 className="mt-3">— Mark T.</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call-to-Action Button */}
            <div className="text-center mb-5 fade-in">
                <Link to="/book-appointment?service=Pet Training" className="hero-btn">
                    Schedule Your Training Session Today
                </Link>
            </div>

        </div>
    );
}

export default PetTraining;