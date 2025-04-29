import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home({ isLoggedIn }) {
  const navigate = useNavigate();

  // Placeholder image URLs
  const placeholderImage = 'https://via.placeholder.com/300x200';

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content fade-in">
          <h1 className="hero-title">Welcome to Online Pet Care 🐾</h1>
          <p className="hero-subtitle">Your trusted companion for pet health, happiness, and care.</p>
          {!isLoggedIn && (
            <button 
              className="btn btn-primary hero-btn" 
              onClick={() => navigate('/signup')}
            >
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
                <img src={placeholderImage} alt="Pet Health Tips" className="card-img-top" />
                <div className="card-body">
                  <h3>Pet Health Tips</h3>
                  <p>Learn how to keep your pets thriving with advice on nutrition, exercise, grooming, and preventative care.</p>
                  <button className="btn btn-link card-link">Read More</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={placeholderImage} alt="Our Services" className="card-img-top" />
                <div className="card-body">
                  <h3>Our Services</h3>
                  <p>Schedule vet visits, track vaccinations, manage records, and get reminders—all in one easy-to-use platform.</p>
                  <button className="btn btn-link card-link">Explore Services</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={placeholderImage} alt="Testimonials" className="card-img-top" />
                <div className="card-body">
                  <h3>Testimonials</h3>
                  <p>"This app saved me time and kept my cat's health on track!" - Sarah P.<br />"A must-have for pet owners!" - John D.</p>
                  <button className="btn btn-link card-link">See More</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={placeholderImage} alt="Pet Adoption Info" className="card-img-top" />
                <div className="card-body">
                  <h3>Pet Adoption Info</h3>
                  <p>Discover adoptable pets near you and connect with shelters to find your perfect furry friend.</p>
                  <button className="btn btn-link card-link">Start Adopting</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={placeholderImage} alt="Emergency Contacts" className="card-img-top" />
                <div className="card-body">
                  <h3>Emergency Contacts</h3>
                  <p>Access 24/7 vet hotlines, local emergency clinics, and poison control numbers instantly.</p>
                  <button className="btn btn-link card-link">Get Help Now</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={placeholderImage} alt="Pet Care Blog" className="card-img-top" />
                <div className="card-body">
                  <h3>Pet Care Blog</h3>
                  <p>Stay updated with our latest articles on training, behavior, and seasonal pet care tips.</p>
                  <button className="btn btn-link card-link">Visit Blog</button>
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
                <img src={placeholderImage} alt="Max the Labrador" className="card-img-top" />
                <div className="card-body">
                  <h3>Max</h3>
                  <p>Age: 2 years | Breed: Labrador<br />A playful pup looking for an active family!</p>
                  <button className="btn btn-link card-link">Meet Max</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={placeholderImage} alt="Luna the Cat" className="card-img-top" />
                <div className="card-body">
                  <h3>Luna</h3>
                  <p>Age: 1 year | Breed: Domestic Shorthair<br />A cuddly cat who loves to nap.</p>
                  <button className="btn btn-link card-link">Meet Luna</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={placeholderImage} alt="Rex the German Shepherd" className="card-img-top" />
                <div className="card-body">
                  <h3>Rex</h3>
                  <p>Age: 3 years | Breed: German Shepherd<br />Loyal and smart, ready for a forever home.</p>
                  <button className="btn btn-link card-link">Meet Rex</button>
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