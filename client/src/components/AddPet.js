import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddPet() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [pet, setPet] = useState({
    petName: '',
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

  const handleChange = (e) => {
    setPet({ ...pet, [e.target.name]: e.target.value });

    // Clear error when user starts typing
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFileChange = (e) => {
    setPetPhoto(e.target.files[0]);
    setErrors({ ...errors, petPhoto: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    const lettersRegex = /^[A-Za-z\s]+$/;
    const today = new Date();
  
    if (!pet.petName) {
      newErrors.petName = "Pet name is required.";
    } else if (!lettersRegex.test(pet.petName)) {
      newErrors.petName = "Pet name must contain only letters.";
    }
  
    if (!pet.breed) {
      newErrors.breed = "Breed is required.";
    } else if (!lettersRegex.test(pet.breed)) {
      newErrors.breed = "Breed must contain only letters.";
    }
  
    if (!pet.birthday) {
      newErrors.birthday = "Birthday is required.";
    } else if (new Date(pet.birthday) >= today) {
      newErrors.birthday = "Birthday must be a past date.";
    }
  
    if (!pet.age || pet.age <= 0) {
      newErrors.age = "Age must be a positive number.";
    }
  
    if (!pet.weight || pet.weight <= 0) {
      newErrors.weight = "Weight must be a positive number.";
    }
  
    if (!petPhoto) {
      newErrors.petPhoto = "Pet photo is required.";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('userId', user._id);
    for (const key in pet) {
      formData.append(key, pet[key]);
    }
    if (petPhoto) {
      formData.append('petPhoto', petPhoto);
    }

    try {
      await axios.post('http://localhost:5000/api/users/pets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Pet added successfully!');
      navigate('/profile');
    } catch (error) {
      alert('Failed to add pet: ' + error.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ borderRadius: '15px' }}>
        <h2 className="text-center mb-4" style={{ color: '#007bff' }}>Add Pet 🐾</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="text" name="petName" className="form-control" placeholder="Pet Name" value={pet.petName} onChange={handleChange} required />
            {errors.petName && <small className="text-danger">{errors.petName}</small>}
          </div>
          <div className="mb-3">
            <input type="text" name="breed" className="form-control" placeholder="Breed" value={pet.breed} onChange={handleChange} required />
            {errors.breed && <small className="text-danger">{errors.breed}</small>}
          </div>
          <div className="mb-3">
            <input type="date" name="birthday" className="form-control" value={pet.birthday} onChange={handleChange} required />
            {errors.birthday && <small className="text-danger">{errors.birthday}</small>}
          </div>
          <div className="mb-3">
            <input type="number" name="age" className="form-control" placeholder="Age" value={pet.age} onChange={handleChange} required />
            {errors.age && <small className="text-danger">{errors.age}</small>}
          </div>
          <div className="mb-3">
            <input type="number" name="weight" className="form-control" placeholder="Weight (kg)" value={pet.weight} onChange={handleChange} required />
            {errors.weight && <small className="text-danger">{errors.weight}</small>}
          </div>
          <div className="mb-3">
            <textarea name="specialConditions" className="form-control" placeholder="Special Conditions/Notes" value={pet.specialConditions} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="petPhoto" className="form-label">Pet Photo</label>
            <input type="file" name="petPhoto" className="form-control" onChange={handleFileChange} required />
            {errors.petPhoto && <small className="text-danger">{errors.petPhoto}</small>}
          </div>
          <button type="submit" className="btn btn-primary w-100">Add Pet</button>
        </form>
      </div>
      <br></br>
      <br></br>
    </div>
  );
}

export default AddPet;
