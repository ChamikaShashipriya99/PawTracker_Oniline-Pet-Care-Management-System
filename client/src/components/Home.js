import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

import healthTipsImg from '../assets/health-tips.jpg';
import servicesImg from '../assets/services.jpg';
import testimonialsImg from '../assets/testimonials.jpg';
import adoptionImg from '../assets/adoption.jpg';
import emergencyImg from '../assets/emergency.jpg';
import blogImg from '../assets/blog.jpg';
import maxImg from '../assets/Max.jpg';
import lunaImg from '../assets/luna.jpg';
import rexImg from '../assets/Rex.jpg';

function Home({ isLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content fade-in">
          <h1 className="hero-title">Welcome to Online Pet Care 🐾</h1>
          <p className="hero-subtitle">Your trusted companion for pet health, happiness, and care.</p>
          {!isLoggedIn && (
            <button className="hero-btn" onClick={() => navigate('/signup')}>
              Get Started
            </button>
          )}
        </div>
      </section>

      <section className="content-section fade-in">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={healthTipsImg} alt="Pet Health Tips" className="card-img-top" />
                <div className="card-body">
                  <h3>Pet Health Tips</h3>
                  <p>Learn how to keep your pets thriving with advice on nutrition, exercise, grooming, and preventative care.</p>
                  <a href="#" className="card-link">Read More</a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={servicesImg} alt="Our Services" className="card-img-top" />
                <div className="card-body">
                  <h3>Our Services</h3>
                  <p>Schedule vet visits, track vaccinations, manage records, and get reminders—all in one easy-to-use platform.</p>
                  <a href="#" className="card-link">Explore Services</a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={testimonialsImg} alt="Testimonials" className="card-img-top" />
                <div className="card-body">
                  <h3>Testimonials</h3>
                  <p>"This app saved me time and kept my cat’s health on track!" - Sarah P.<br />"A must-have for pet owners!" - John D.</p>
                  <a href="#" className="card-link">See More</a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={adoptionImg} alt="Pet Adoption Info" className="card-img-top" />
                <div className="card-body">
                  <h3>Pet Adoption Info</h3>
                  <p>Discover adoptable pets near you and connect with shelters to find your perfect furry friend.</p>
                  <a href="#" className="card-link">Start Adopting</a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={emergencyImg} alt="Emergency Contacts" className="card-img-top" />
                <div className="card-body">
                  <h3>Emergency Contacts</h3>
                  <p>Access 24/7 vet hotlines, local emergency clinics, and poison control numbers instantly.</p>
                  <a href="#" className="card-link">Get Help Now</a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={blogImg} alt="Pet Care Blog" className="card-img-top" />
                <div className="card-body">
                  <h3>Pet Care Blog</h3>
                  <p>Stay updated with our latest articles on training, behavior, and seasonal pet care tips.</p>
                  <a href="#" className="card-link">Visit Blog</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-pets-section fade-in">
        <div className="container">
          <h2 className="section-title">Featured Pets for Adoption</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={maxImg} alt="Max the Labrador" className="card-img-top" />
                <div className="card-body">
                  <h3>Max</h3>
                  <p>Age: 2 years | Breed: Labrador<br />A playful pup looking for an active family!</p>
                  <a href="#" className="card-link">Meet Max</a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={lunaImg} alt="Luna the Cat" className="card-img-top" />
                <div className="card-body">
                  <h3>Luna</h3>
                  <p>Age: 1 year | Breed: Domestic Shorthair<br />A cuddly cat who loves to nap.</p>
                  <a href="#" className="card-link">Meet Luna</a>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={rexImg} alt="Rex the German Shepherd" className="card-img-top" />
                <div className="card-body">
                  <h3>Rex</h3>
                  <p>Age: 3 years | Breed: German Shepherd<br />Loyal and smart, ready for a forever home.</p>
                  <a href="#" className="card-link">Meet Rex</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;