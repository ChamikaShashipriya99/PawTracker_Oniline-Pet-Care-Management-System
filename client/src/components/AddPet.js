import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

function AddPet() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [pet, setPet] = useState({
    name: '',
    type: '',
    breed: '',
    birthday: '',
    age: '',
    weight: '',
    specialConditions: ''
  });
  const [petPhoto, setPetPhoto] = useState(null);
  const [errors, setErrors] = useState({});

  if (!user) {
    navigate('/login');
    return null;
  }

  const calculateAge = (birthday) => {
    if (!birthday) return '';
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newPet = { ...pet, [name]: value };
    
    // If birthday changes, calculate age
    if (name === 'birthday') {
      newPet.age = calculateAge(value);
    }

    setPet(newPet);
    setErrors({ ...errors, [name]: '' });
  };

  const handleFileChange = (e) => {
    setPetPhoto(e.target.files[0]);
    setErrors({ ...errors, petPhoto: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    const lettersRegex = /^[A-Za-z\s]+$/;
    const today = new Date();

    if (!pet.name || !lettersRegex.test(pet.name)) {
      newErrors.name = 'Pet name must contain only letters.';
    }
    if (!pet.type) {
      newErrors.type = 'Pet type is required.';
    }
    if (!pet.breed || !lettersRegex.test(pet.breed)) {
      newErrors.breed = 'Breed must contain only letters.';
    }
    if (!pet.birthday || new Date(pet.birthday) >= today) {
      newErrors.birthday = 'Birthday must be a past date.';
    }
    if (!pet.age || pet.age <= 0) {
      newErrors.age = 'Age must be a positive number.';
    }
    if (!pet.weight || pet.weight <= 0) {
      newErrors.weight = 'Weight must be a positive number.';
    }
    if (pet.specialConditions && !lettersRegex.test(pet.specialConditions)) {
      newErrors.specialConditions = 'Special conditions must contain only letters and spaces.';
    }
    if (petPhoto && !petPhoto.type.startsWith('image/')) {
      newErrors.petPhoto = 'Only image files are allowed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('userId', user._id);
    formData.append('name', pet.name);
    formData.append('type', pet.type);
    formData.append('breed', pet.breed);
    formData.append('birthday', pet.birthday);
    formData.append('age', pet.age);
    formData.append('weight', pet.weight);
    formData.append('specialConditions', pet.specialConditions || '');
    if (petPhoto) {
      formData.append('petPhoto', petPhoto);
    }

    try {
      const response = await axios.post(`${config.API_URL}/users/pets`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        alert('Pet added successfully!');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error adding pet:', error);
      alert('Failed to add pet: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4" style={{ maxWidth: '600px', margin: '0 auto', borderRadius: '15px', border: 'none' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0" style={{ color: '#007bff', fontWeight: '600' }}>Add Pet 🐾</h2>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/profile')}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-arrow-left me-2"></i> Back
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={pet.name}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                  placeholder="Pet Name"
                />
                <label>Pet Name</label>
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <select
                  name="type"
                  className={`form-control ${errors.type ? 'is-invalid' : ''}`}
                  value={pet.type}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                >
                  <option value="">Select Pet Type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Fish">Fish</option>
                  <option value="Other">Other</option>
                </select>
                <label>Pet Type</label>
                {errors.type && <div className="invalid-feedback">{errors.type}</div>}
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="text"
                  name="breed"
                  className={`form-control ${errors.breed ? 'is-invalid' : ''}`}
                  value={pet.breed}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                  placeholder="Breed"
                />
                <label>Breed</label>
                {errors.breed && <div className="invalid-feedback">{errors.breed}</div>}
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="date"
                  name="birthday"
                  className={`form-control ${errors.birthday ? 'is-invalid' : ''}`}
                  value={pet.birthday}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                />
                <label>Birthday</label>
                {errors.birthday && <div className="invalid-feedback">{errors.birthday}</div>}
              </div>
            </div>
          </div>
          
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="number"
                  name="age"
                  className={`form-control ${errors.age ? 'is-invalid' : ''}`}
                  value={pet.age}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                  placeholder="Age"
                />
                <label>Age</label>
                {errors.age && <div className="invalid-feedback">{errors.age}</div>}
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="form-floating">
                <input
                  type="number"
                  name="weight"
                  className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
                  value={pet.weight}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: '10px', height: '50px' }}
                  placeholder="Weight (kg)"
                />
                <label>Weight (kg)</label>
                {errors.weight && <div className="invalid-feedback">{errors.weight}</div>}
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="form-floating">
              <textarea
                name="specialConditions"
                className="form-control"
                value={pet.specialConditions}
                onChange={handleChange}
                style={{ borderRadius: '10px', height: '100px' }}
                placeholder="Special Conditions/Notes"
              />
              <label>Special Conditions/Notes</label>
            </div>
          </div>
          
          <div className="card mb-4" style={{ borderRadius: '10px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body">
              <h5 className="card-title mb-3" style={{ color: '#007bff' }}>Pet Photo</h5>
              <div className="mb-3">
                <input
                  type="file"
                  name="petPhoto"
                  className={`form-control ${errors.petPhoto ? 'is-invalid' : ''}`}
                  onChange={handleFileChange}
                  required
                  style={{ borderRadius: '10px' }}
                />
                {errors.petPhoto && <div className="invalid-feedback">{errors.petPhoto}</div>}
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
              <i className="fas fa-plus-circle me-2"></i> Add Pet
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

export default AddPet;
