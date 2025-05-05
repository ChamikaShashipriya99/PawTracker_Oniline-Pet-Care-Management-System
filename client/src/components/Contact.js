import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setMessage('');
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
      valid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setMessage('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 1500);
    
    // In a real application, you would send the form data to your backend
    // try {
    //   const res = await axios.post('http://localhost:5000/api/contact', formData);
    //   setMessage(res.data.message);
    //   setFormData({ name: '', email: '', subject: '', message: '' });
    // } catch (error) {
    //   setErrors({ submit: error.response?.data?.message || 'Failed to send message. Please try again.' });
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Contact Us 🐾</h2>
        <p className="text-center mb-4">
          Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
        </p>
        
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100 p-3" style={{ borderRadius: '10px', backgroundColor: '#f8f9fa' }}>
              <h4 className="mb-3">Get in Touch</h4>
              <p><strong>Email:</strong> support@pawtracker.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong> 123 Pet Care Lane, Animal City, AC 12345</p>
              <p><strong>Hours:</strong> Monday - Friday, 9:00 AM - 5:00 PM EST</p>
              
              <div className="mt-4">
                <h5>Frequently Asked Questions</h5>
                <p>Check our <Link to="/faq" style={{ color: '#007bff', textDecoration: 'none' }}>FAQ page</Link> for answers to common questions.</p>
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ borderRadius: '10px' }}
                />
                {errors.name && <small className="text-danger">{errors.name}</small>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ borderRadius: '10px' }}
                />
                {errors.email && <small className="text-danger">{errors.email}</small>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="subject" className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-control"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={{ borderRadius: '10px' }}
                />
                {errors.subject && <small className="text-danger">{errors.subject}</small>}
              </div>
              
              <div className="mb-3">
                <label htmlFor="message" className="form-label">Message</label>
                <textarea
                  className="form-control"
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  style={{ borderRadius: '10px' }}
                ></textarea>
                {errors.message && <small className="text-danger">{errors.message}</small>}
              </div>
              
              {message && <div className="alert alert-success">{message}</div>}
              {errors.submit && <div className="alert alert-danger">{errors.submit}</div>}
              
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={isSubmitting}
                style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <br></br>
      <br></br>
    </div>
  );
}

export default Contact; 