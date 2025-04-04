import React from 'react';
import { Link } from 'react-router-dom';
import vetImage from '../assets/images/vet.jpg';
import '../css/service.css'

function VetService() {
    return (
        <div className="service-container">
            <div className="service-header">
                <h1>Veterinary Services</h1>
                <img src={vetImage} alt="Veterinary Service" className="service-image" />
                <p className="service-description">
                    We provide comprehensive vet care including check-ups, vaccinations, and surgeries.
                </p>
            </div>

            <div className="service-features">
                <div className="feature-card">
                    <h3>Regular Check-ups</h3>
                    <p>Routine examinations to ensure your pet's ongoing health and detect any issues early.</p>
                </div>
                <div className="feature-card">
                    <h3>Vaccinations</h3>
                    <p>Essential vaccines to protect your pet against common diseases and infections.</p>
                </div>
                <div className="feature-card">
                    <h3>Surgery</h3>
                    <p>Both routine and complex surgical procedures performed by our skilled veterinarians.</p>
                </div>
                <div className="feature-card">
                    <h3>Dental Care</h3>
                    <p>Comprehensive dental services to maintain your pet's oral health and prevent issues.</p>
                </div>
                <div className="feature-card">
                    <h3>Emergency Care</h3>
                    <p>Immediate medical attention for urgent situations and accidents.</p>
                </div>
                <div className="feature-card">
                    <h3>Laboratory Services</h3>
                    <p>In-house testing for quick diagnosis and treatment planning.</p>
                </div>
            </div>

            <div className="pricing-section">
                <h2>Service Pricing</h2>
                <table className="pricing-table">
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
                            <td>Rs.85000</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Link to="/book-appointment?service=Vet Service" className="book-button">
                Book an Appointment
            </Link>
        </div>
    );
}

export default VetService