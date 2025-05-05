import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UpdateProfile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    ...user,
    password: '', // New password field (optional)
    confirmPassword: '' // Confirm password field (optional)
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user.profilePhoto ? `http://localhost:5000${user.profilePhoto}` : null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear error on change
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, profilePhoto: 'Only image files are allowed.' });
      } else {
        setErrors({ ...errors, profilePhoto: '' });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const nameRegex = /^[A-Za-z]+$/;
    const usernameRegex = /^[A-Za-z0-9]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!nameRegex.test(formData.firstName)) newErrors.firstName = "First name must contain only letters.";
    if (!nameRegex.test(formData.lastName)) newErrors.lastName = "Last name must contain only letters.";
    if (!usernameRegex.test(formData.username)) newErrors.username = "Username must be alphanumeric.";
    if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email format.";
    if (!phoneRegex.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits.";

    // Password validation (only if user is updating it)
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters long.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prepare data to send, excluding confirmPassword since it's only for validation
    const { confirmPassword, ...dataToSend } = formData;

    // If password is empty, remove it from the update to avoid sending an empty string
    if (!dataToSend.password) {
      delete dataToSend.password;
    }

    try {
      // Create FormData object for multipart/form-data submission
      const formDataToSend = new FormData();
      
      // Append all text fields
      Object.keys(dataToSend).forEach(key => {
        formDataToSend.append(key, dataToSend[key]);
      });
      
      // Append profile photo if selected
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }
      
      const res = await axios.put(`http://localhost:5000/api/users/${user._id}`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      localStorage.setItem('user', JSON.stringify(res.data));
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      alert('Update failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4" style={{ maxWidth: '600px', margin: '0 auto', borderRadius: '15px', border: 'none' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0" style={{ color: '#007bff', fontWeight: '600' }}>Update Profile 🐾</h2>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/profile')}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-arrow-left me-2"></i> Back
          </button>
        </div>
        
        <form onSubmit={handleSave}>
          <div className="card mb-4" style={{ borderRadius: '10px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body text-center">
              <h5 className="card-title mb-3" style={{ color: '#007bff' }}>Profile Photo</h5>
              <div className="mb-3">
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile Preview" 
                    className="img-fluid rounded-circle mb-3" 
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover', 
                      border: '3px solid #007bff',
                      boxShadow: '0 4px 8px rgba(0, 123, 255, 0.2)'
                    }} 
                  />
                ) : (
                  <div 
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      backgroundColor: '#e9ecef',
                      border: '3px solid #007bff'
                    }}
                  >
                    <i className="fas fa-user fa-4x text-secondary"></i>
                  </div>
                )}
                <div className="mb-3">
                  <input
                    type="file"
                    name="profilePhoto"
                    className={`form-control ${errors.profilePhoto ? 'is-invalid' : ''}`}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ borderRadius: '10px' }}
                  />
                  {errors.profilePhoto && <div className="invalid-feedback">{errors.profilePhoto}</div>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="text"
                  name="firstName"
                  className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                  placeholder="First Name"
                />
                <label>First Name</label>
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="text"
                  name="lastName"
                  className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                  placeholder="Last Name"
                />
                <label>Last Name</label>
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="text"
                  name="username"
                  className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                  placeholder="Username"
                />
                <label>Username</label>
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                  placeholder="Email"
                />
                <label>Email</label>
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="form-floating">
              <input
                type="tel"
                name="phone"
                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                value={formData.phone}
                onChange={handleChange}
                required
                style={{ borderRadius: '10px', height: '50px' }}
                placeholder="Phone Number"
              />
              <label>Phone Number</label>
              {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
          </div>
          
          <div className="card mb-4" style={{ borderRadius: '10px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ color: '#007bff' }}>Change Password (Optional)</h5>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="form-floating">
                    <input
                      type="password"
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', height: '50px' }}
                      placeholder="New Password"
                    />
                    <label>New Password</label>
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-floating">
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', height: '50px' }}
                      placeholder="Confirm Password"
                    />
                    <label>Confirm Password</label>
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between mt-4">
            <button 
              type="submit" 
              className="btn btn-primary px-4 py-2" 
              style={{ 
                backgroundColor: '#00c4cc', 
                border: 'none', 
                borderRadius: '10px',
                fontWeight: '500',
                boxShadow: '0 4px 6px rgba(0, 196, 204, 0.2)'
              }}
            >
              <i className="fas fa-save me-2"></i> Save Changes
            </button>
            <button 
              type="button" 
              className="btn btn-outline-secondary px-4 py-2" 
              style={{ borderRadius: '10px' }} 
              onClick={() => navigate('/profile')}
            >
              <i className="fas fa-times me-2"></i> Cancel
            </button>
          </div>
        </form>
      </div>
      <br></br>
      <br></br>
    </div>
  );
}

export default UpdateProfile;