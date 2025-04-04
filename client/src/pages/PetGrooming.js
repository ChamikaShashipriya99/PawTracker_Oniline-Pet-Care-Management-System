import React from 'react';
import { Link } from 'react-router-dom';
import groomingImage from '../assets/images/grooming.jpg';
import '../css/service.css';

function PetGrooming() {
    return (
        <div className="service-container">
            <div className="service-header">
                <h1>Pet Grooming</h1>
                <img src={groomingImage} alt="Pet Grooming" className="service-image" />
                <p className="service-description">
                    Keep your pet looking great with our grooming services—baths, haircuts, and more!
                </p>
            </div>

            <div className="service-features">
                <div className="feature-card">
                    <h3>Bath & Brush</h3>
                    <p>Thorough cleaning with premium shampoos and conditioners suited to your pet's coat type.</p>
                </div>
                <div className="feature-card">
                    <h3>Haircuts</h3>
                    <p>Breed-specific or custom styling to keep your pet comfortable and looking great.</p>
                </div>
                <div className="feature-card">
                    <h3>Nail Trimming</h3>
                    <p>Safe and precise nail care to prevent discomfort and mobility issues.</p>
                </div>
                <div className="feature-card">
                    <h3>Ear Cleaning</h3>
                    <p>Gentle and thorough ear cleaning to prevent infections and discomfort.</p>
                </div>
                <div className="feature-card">
                    <h3>Teeth Brushing</h3>
                    <p>Oral hygiene service to maintain your pet's dental health between vet visits.</p>
                </div>
                <div className="feature-card">
                    <h3>De-shedding</h3>
                    <p>Specialized treatments to reduce shedding and keep your pet's coat healthy.</p>
                </div>
            </div>

            <div className="pricing-section">
                <h2>Service Pricing</h2>
                <table className="pricing-table">
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
                            <td>RS.6500</td>
                            <td>RS.8000</td>
                            <td>RS.9500</td>
                        </tr>
                        <tr>
                            <td>Nail Trim</td>
                            <td>Rs.1500</td>
                            <td>Rs.1500</td>
                            <td>Rs.2000</td>
                        </tr>
                        <tr>
                            <td>De-shedding Treatment</td>
                            <td>RS.4000</td>
                            <td>Rs.5000</td>
                            <td>Rs.6500</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Link to="/book-appointment?service=Pet Grooming" className="book-button">
                Book an Appointment
            </Link>
        </div>
    );
}

export default PetGrooming;