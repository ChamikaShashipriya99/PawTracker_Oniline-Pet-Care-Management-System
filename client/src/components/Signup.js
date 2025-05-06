import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';
import config from '../config';

function Signup({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setProfilePhoto(e.target.files[0]);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!user.firstName.match(/^[A-Za-z]+$/)) newErrors.firstName = "First name should contain only letters.";
    if (!user.lastName.match(/^[A-Za-z]+$/)) newErrors.lastName = "Last name should contain only letters.";
    if (!user.username.match(/^[A-Za-z0-9]{4,}$/)) newErrors.username = "Username must be at least 4 characters and alphanumeric.";
    if (!user.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Enter a valid email address.";
    if (!user.phone.match(/^\d{10}$/)) newErrors.phone = "Phone number must be 10 digits.";
    if (user.password.length < 8) newErrors.password = "Password must be at least 8 characters long.";
    if (!/\d/.test(user.password)) newErrors.password = "Password must contain at least one number.";
    if (!/[a-z]/.test(user.password)) newErrors.password = "Password must contain at least one lowercase letter.";
    if (!/[A-Z]/.test(user.password)) newErrors.password = "Password must contain at least one uppercase letter.";
    if (!/[^A-Za-z0-9]/.test(user.password)) newErrors.password = "Password must contain at least one special character.";
    if (profilePhoto && !profilePhoto.type.startsWith('image/')) newErrors.profilePhoto = "Only image files are allowed.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    Object.keys(user).forEach(key => {
      formData.append(key, user[key]);
    });
    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    }

    try {
      const res = await axios.post(`${config.API_URL}/users/signup`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (res.data) {
        alert('Signup successful! Please verify your email.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      setErrors({ general: error.response?.data?.error || 'Signup failed. Please try again.' });
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Sign Up 🐾</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <input type="text" name="firstName" className="form-control" placeholder="First Name" value={user.firstName} onChange={handleChange} required style={{ borderRadius: '10px' }} />
              {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
            </div>
            <div className="col-md-6 mb-3">
              <input type="text" name="lastName" className="form-control" placeholder="Last Name" value={user.lastName} onChange={handleChange} required style={{ borderRadius: '10px' }} />
              {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <input type="text" name="username" className="form-control" placeholder="Username" value={user.username} onChange={handleChange} required style={{ borderRadius: '10px' }} />
              {errors.username && <small className="text-danger">{errors.username}</small>}
            </div>
            <div className="col-md-6 mb-3">
              <input type="email" name="email" className="form-control" placeholder="Email" value={user.email} onChange={handleChange} required style={{ borderRadius: '10px' }} />
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <input type="tel" name="phone" className="form-control" placeholder="Phone" value={user.phone} onChange={handleChange} required style={{ borderRadius: '10px' }} />
              {errors.phone && <small className="text-danger">{errors.phone}</small>}
            </div>
            <div className="col-md-6 mb-3 position-relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                className="form-control" 
                placeholder="Password" 
                value={user.password} 
                onChange={handleChange} 
                required 
                style={{ borderRadius: '10px', paddingRight: '40px' }} 
              />
              <button
                type="button"
                className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  color: '#6c757d',
                  padding: '0.375rem',
                  marginRight: '0.5rem',
                  zIndex: 2
                }}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
              {errors.password && <small className="text-danger">{errors.password}</small>}
              <PasswordStrengthIndicator password={user.password} />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="profilePhoto" className="form-label">Profile Photo</label>
            <input type="file" name="profilePhoto" className="form-control" onChange={handleFileChange} style={{ borderRadius: '10px' }} />
            {errors.profilePhoto && <small className="text-danger">{errors.profilePhoto}</small>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}>Sign Up</button>
        </form>
        <p className="text-center mt-3" style={{ color: '#555' }}>
          Already have an account? <Link to="/Login" style={{ color: '#007bff', textDecoration: 'none' }}>Login here</Link>
        </p>
      </div>
      <br></br>
    </div>
  );
}

export default Signup;
