import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQ.css';

// Import images
import pet1 from '../assets/Pet1.jpg';
import pet2 from '../assets/Pet2.jpg';
import pet3 from '../assets/Pet3.jpg';
import pet4 from '../assets/Pet4.jpg';
import pet5 from '../assets/Pet5.jpg';
import pet6 from '../assets/Pet6.jpg';
import pet7 from '../assets/Pet7.jpg';
import pet8 from '../assets/Pet8.jpg';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What services do you offer?",
      answer: "We offer a comprehensive range of pet care services including veterinary care, grooming, and training. Our veterinary services include regular check-ups, vaccinations, and emergency care. Our grooming services cover bathing, trimming, and styling. We also provide professional pet training programs for obedience and behavior modification.",
      image: pet1
    },
    {
      question: "How do I book an appointment?",
      answer: "You can book an appointment through our online booking system. Simply log in to your account, select the service you need, choose your preferred date and time, and confirm your booking. You'll receive a confirmation email with all the details.",
      image: pet2
    },
    {
      question: "What are your operating hours?",
      answer: "Our facility is open Monday through Saturday from 8:00 AM to 6:00 PM. Emergency services are available 24/7. Please call our emergency hotline for after-hours care.",
      image: pet3
    },
    {
      question: "Do you accept walk-in appointments?",
      answer: "While we prefer scheduled appointments, we do accept walk-ins based on availability. However, scheduled appointments take priority. For the best experience, we recommend booking in advance.",
      image: pet4
    },
    {
      question: "What should I bring for my pet's first visit?",
      answer: "Please bring your pet's medical history, vaccination records, and any medications they're currently taking. Also, bring a leash for dogs and a carrier for cats. If your pet has any specific dietary requirements or allergies, please let us know.",
      image: pet5
    },
    {
      question: "How do I cancel or reschedule an appointment?",
      answer: "You can cancel or reschedule your appointment through your account dashboard or by contacting our customer service. We require at least 24 hours' notice for cancellations to avoid any cancellation fees.",
      image: pet6
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and cash. We also offer payment plans for certain services. Please contact our office for more information about payment options.",
      image: pet7
    },
    {
      question: "Do you offer pet insurance?",
      answer: "While we don't directly offer pet insurance, we work with several pet insurance providers and can help you with the claims process. We recommend researching different pet insurance options to find the best coverage for your pet's needs.",
      image: pet8
    }
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p className="faq-intro">
          Find answers to common questions about our pet care services. Can't find what you're looking for? 
          <Link to="/contact" className="contact-link"> Contact us</Link> for more information.
        </p>
      </div>
      
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
          >
            <div className="faq-content">
              <div className="faq-text">
                <div 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <h3>{faq.question}</h3>
                  <span className="faq-icon">
                    {activeIndex === index ? '−' : '+'}
                  </span>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
              <div className="faq-image">
                <img src={faq.image} alt={faq.question} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ; 