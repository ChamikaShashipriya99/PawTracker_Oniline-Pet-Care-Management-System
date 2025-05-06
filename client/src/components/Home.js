import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import healthTipsImage from '../assets/health-tips.jpg';
import servicesImage from '../assets/services.jpg';
import testimonialsImage from '../assets/testimonials.jpg';
import adoptionImage from '../assets/adoption.jpg';
import emergencyImage from '../assets/emergency.jpg';
import blogImage from '../assets/blog.jpg';
import maxImage from '../assets/Max.jpg';
import lunaImage from '../assets/luna.jpg';
import rexImage from '../assets/Rex.jpg';
import dogImage from '../assets/Dog.jpg';
import catImage from '../assets/Cat.jpg';
import pet1Image from '../assets/Pet1.jpg';
import pet2Image from '../assets/Pet2.jpg';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function Home({ isLoggedIn }) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    { image: dogImage, title: "Find Your Perfect Pet Companion", subtitle: "Discover your new best friend today" },
    { image: catImage, title: "Expert Pet Care Services", subtitle: "Professional care for your beloved pets" },
    { image: pet1Image, title: "24/7 Emergency Support", subtitle: "Always here when you need us" },
    { image: pet2Image, title: "Professional Veterinary Care", subtitle: "Expert care for your pet's health" }
  ];

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        nextSlide();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTransitioning]);

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="slider-container">
          <button className="slider-arrow left" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="slider-arrow right" onClick={nextSlide}>
            <FaChevronRight />
          </button>
          
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-content">
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
                {!isLoggedIn && (
                  <button 
                    className="hero-btn" 
                    onClick={() => navigate('/signup')}
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <div className="slider-controls">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true);
                    setCurrentSlide(index);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="content-section">
        <div className="container">
          <h2 className="section-title">What We Offer</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={healthTipsImage} alt="Pet Health Tips" className="card-img-top" />
                <div className="card-body">
                  <h3>Pet Health Tips</h3>
                  <p>Learn how to keep your pets thriving with advice on nutrition, exercise, grooming, and preventative care.</p>
                  <button className="btn btn-link card-link">Read More</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={servicesImage} alt="Our Services" className="card-img-top" />
                <div className="card-body">
                  <h3>Our Services</h3>
                  <p>Schedule vet visits, track vaccinations, manage records, and get reminders—all in one easy-to-use platform.</p>
                  <button className="btn btn-link card-link">Explore Services</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={testimonialsImage} alt="Testimonials" className="card-img-top" />
                <div className="card-body">
                  <h3>Testimonials</h3>
                  <p>"This app saved me time and kept my cat's health on track!" - Sarah P.<br />"A must-have for pet owners!" - John D.</p>
                  <button className="btn btn-link card-link">See More</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={adoptionImage} alt="Pet Adoption Info" className="card-img-top" />
                <div className="card-body">
                  <h3>Pet Adoption Info</h3>
                  <p>Discover adoptable pets near you and connect with shelters to find your perfect furry friend.</p>
                  <button className="btn btn-link card-link">Start Adopting</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={emergencyImage} alt="Emergency Contacts" className="card-img-top" />
                <div className="card-body">
                  <h3>Emergency Contacts</h3>
                  <p>Access 24/7 vet hotlines, local emergency clinics, and poison control numbers instantly.</p>
                  <button className="btn btn-link card-link">Get Help Now</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={blogImage} alt="Pet Care Blog" className="card-img-top" />
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

      <section className="featured-pets-section">
        <div className="container">
          <h2 className="section-title">Featured Pets for Adoption</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={maxImage} alt="Max the Labrador" className="card-img-top" />
                <div className="card-body">
                  <h3>Max</h3>
                  <p>Age: 2 years | Breed: Labrador<br />A playful pup looking for an active family!</p>
                  <button className="btn btn-link card-link">Meet Max</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={lunaImage} alt="Luna the Cat" className="card-img-top" />
                <div className="card-body">
                  <h3>Luna</h3>
                  <p>Age: 1 year | Breed: Domestic Shorthair<br />A cuddly cat who loves to nap.</p>
                  <button className="btn btn-link card-link">Meet Luna</button>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card hover-card">
                <img src={rexImage} alt="Rex the German Shepherd" className="card-img-top" />
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