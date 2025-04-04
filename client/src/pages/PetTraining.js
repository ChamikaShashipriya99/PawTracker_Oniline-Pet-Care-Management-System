import React from 'react';
import { Link } from 'react-router-dom';
import trainingImage from '../assets/images/training.jpg';
import '../css/service.css';

function PetTraining() {
    return (
        <div className="service-container">
            <div className="service-header">
                <h1>Pet Training</h1>
                <img src={trainingImage} alt="Pet Training" className="service-image" />
                <p className="service-description">
                    Train your pet with our expert trainers—private or group sessions available.
                </p>
            </div>

            <div className="service-features">
                <div className="feature-card">
                    <h3>Basic Obedience</h3>
                    <p>Fundamental commands such as sit, stay, come, and leash walking.</p>
                </div>
                <div className="feature-card">
                    <h3>Behavior Correction</h3>
                    <p>Address specific behavior issues like jumping, barking, or aggression.</p>
                </div>
                <div className="feature-card">
                    <h3>Puppy Training</h3>
                    <p>Early socialization and basic skills for puppies from 8 weeks to 6 months.</p>
                </div>
                <div className="feature-card">
                    <h3>Advanced Training</h3>
                    <p>Complex commands and skills for pets who have mastered the basics.</p>
                </div>
                <div className="feature-card">
                    <h3>Agility Training</h3>
                    <p>Fun physical and mental exercises through obstacle courses.</p>
                </div>
                <div className="feature-card">
                    <h3>Therapy Dog Preparation</h3>
                    <p>Special training for pets suited to become therapy or service animals.</p>
                </div>
            </div>

            <div className="pricing-section">
                <h2>Training Options</h2>
                <div className="training-options">
                    <div className="feature-card">
                        <h3>Private Training</h3>
                        <p>One-on-one sessions with our trainers, customized to your pet's specific needs.</p>
                        <p><strong>Price:</strong> Rs.7500 per session (60 minutes)</p>
                        <p><strong>Package:</strong> Rs.40000 for 6 sessions</p>
                        <Link to="/book-appointment?service=Pet Training&type=Private" className="book-button">
                            Book Private Training
                        </Link>
                    </div>

                    <div className="feature-card">
                        <h3>Group Training</h3>
                        <p>Small group classes (maximum 6 pets) for socialization and basic skills.</p>
                        <p><strong>Price:</strong> Rs.3500 per session (90 minutes)</p>
                        <p><strong>Package:</strong> Rs.18000 for 6 sessions</p>
                        <Link to="/book-appointment?service=Pet Training&type=Group" className="book-button">
                            Book Group Training
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PetTraining