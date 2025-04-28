import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UpdatePetImage from './UpdatePetImage';

function MyPets() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [pets, setPets] = useState([]);
  const [editPet, setEditPet] = useState(null);
  const [showImageUpdate, setShowImageUpdate] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPets = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/pets/${user._id}`);
        setPets(res.data);
      } catch (error) {
        alert('Failed to fetch pets: ' + error.message);
      }
    };
    fetchPets();
  }, [navigate, user]);

  const handleDeletePet = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/pets/${id}`);
        setPets(pets.filter(pet => pet._id !== id));
        alert('Pet deleted successfully!');
      } catch (error) {
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const handleEditPet = (pet) => {
    setEditPet({ ...pet });
  };

  const handleUpdatePetImage = (pet) => {
    setSelectedPet(pet);
    setShowImageUpdate(true);
  };

  const handleImageUpdate = (updatedPet) => {
    setPets(pets.map(p => (p._id === updatedPet._id ? updatedPet : p)));
  };

  const validateEditPet = () => {
    const lettersRegex = /^[A-Za-z\s]+$/;
    const today = new Date();
    let errorMessage = '';
  
    if (!editPet.petName || !lettersRegex.test(editPet.petName)) {
      errorMessage = 'Pet name must contain only letters.';
    } else if (!editPet.breed || !lettersRegex.test(editPet.breed)) {
      errorMessage = 'Breed must contain only letters.';
    } else if (!editPet.birthday || new Date(editPet.birthday) >= today) {
      errorMessage = 'Birthday must be a past date.';
    } else if (!editPet.age || editPet.age <= 0) {
      errorMessage = 'Age must be a positive number.';
    } else if (!editPet.weight || editPet.weight <= 0) {
      errorMessage = 'Weight must be a positive number.';
    }
  
    if (errorMessage) {
      alert(errorMessage);
      return false;
    }
    return true;
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    if (!validateEditPet()) return;
  
    try {
      const res = await axios.put(`http://localhost:5000/api/users/pets/${editPet._id}`, editPet);
      setPets(pets.map(p => (p._id === editPet._id ? res.data : p)));
      setEditPet(null);
      alert('Pet updated successfully!');
    } catch (error) {
      alert('Update failed: ' + error.message);
    }
  };

  const handleChangeEditPet = (e) => {
    setEditPet({ ...editPet, [e.target.name]: e.target.value });
  };

  if (!user) return null;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4" style={{ borderRadius: '15px', border: 'none' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold" style={{ color: '#00c4cc', margin: 0 }}>
            <i className="fas fa-paw me-2"></i>My Pets
          </h2>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/profile')}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-arrow-left me-2"></i> Back to Profile
          </button>
        </div>
        
        {pets.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-paw fa-3x mb-3" style={{ color: '#00c4cc' }}></i>
            <h4 className="text-muted">No pets added yet</h4>
            <p className="text-muted">Add your first pet to get started!</p>
            <button 
              className="btn btn-primary mt-3" 
              onClick={() => navigate('/add-pet')}
              style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}
            >
              <i className="fas fa-plus me-2"></i>Add Pet
            </button>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {pets.map(pet => (
              <div key={pet._id} className="col">
                <div className="card h-100 shadow-sm" style={{ borderRadius: '15px', border: 'none', transition: 'transform 0.3s ease' }}>
                  <div className="card-body p-4">
                    <div className="text-center mb-3">
                      {pet.petPhoto ? (
                        <img 
                          src={`http://localhost:5000${pet.petPhoto}`} 
                          alt={pet.petName} 
                          className="img-fluid rounded mb-3" 
                          style={{ 
                            width: '150px', 
                            height: '150px', 
                            objectFit: 'cover',
                            border: '3px solid #00c4cc',
                            boxShadow: '0 4px 8px rgba(0, 196, 204, 0.2)'
                          }} 
                        />
                      ) : (
                        <div 
                          className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
                          style={{ 
                            width: '150px', 
                            height: '150px', 
                            backgroundColor: '#e9ecef',
                            border: '3px solid #00c4cc',
                            borderRadius: '10px'
                          }}
                        >
                          <i className="fas fa-paw fa-4x text-secondary"></i>
                        </div>
                      )}
                    </div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h4 className="card-title fw-bold" style={{ color: '#00c4cc' }}>
                        <i className="fas fa-paw me-2"></i>{pet.petName}
                      </h4>
                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEditPet(pet)}
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeletePet(pet._id)}
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="pet-details">
                      <div className="mb-2">
                        <span className="fw-bold me-2"><i className="fas fa-dog me-2"></i>Breed:</span>
                        <span>{pet.breed}</span>
                      </div>
                      <div className="mb-2">
                        <span className="fw-bold me-2"><i className="fas fa-calendar-alt me-2"></i>Birthday:</span>
                        <span>{new Date(pet.birthday).toLocaleDateString()}</span>
                      </div>
                      <div className="mb-2">
                        <span className="fw-bold me-2"><i className="fas fa-birthday-cake me-2"></i>Age:</span>
                        <span>{pet.age} years</span>
                      </div>
                      <div className="mb-2">
                        <span className="fw-bold me-2"><i className="fas fa-weight me-2"></i>Weight:</span>
                        <span>{pet.weight} kg</span>
                      </div>
                      {pet.specialConditions && (
                        <div className="mb-2">
                          <span className="fw-bold me-2"><i className="fas fa-notes-medical me-2"></i>Special Conditions:</span>
                          <span>{pet.specialConditions}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-3">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleUpdatePetImage(pet)}
                        style={{ borderRadius: '10px' }}
                      >
                        <i className="fas fa-camera me-2"></i>Update Photo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editPet && (
          <div className="mt-5">
            <div className="card shadow-sm" style={{ borderRadius: '15px', border: 'none' }}>
              <div className="card-header bg-white py-3" style={{ borderRadius: '15px 15px 0 0' }}>
                <h3 className="fw-bold mb-0" style={{ color: '#00c4cc' }}>
                  <i className="fas fa-edit me-2"></i>Edit Pet
                </h3>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleUpdatePet}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Pet Name</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-paw"></i></span>
                        <input 
                          type="text" 
                          name="petName" 
                          className="form-control" 
                          value={editPet.petName} 
                          onChange={handleChangeEditPet} 
                          required 
                          style={{ borderRadius: '0 10px 10px 0' }} 
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Breed</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-dog"></i></span>
                        <input 
                          type="text" 
                          name="breed" 
                          className="form-control" 
                          value={editPet.breed} 
                          onChange={handleChangeEditPet} 
                          required 
                          style={{ borderRadius: '0 10px 10px 0' }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Birthday</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-calendar-alt"></i></span>
                        <input 
                          type="date" 
                          name="birthday" 
                          className="form-control" 
                          value={editPet.birthday.split('T')[0]} 
                          onChange={handleChangeEditPet} 
                          required 
                          style={{ borderRadius: '0 10px 10px 0' }} 
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Age</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-birthday-cake"></i></span>
                        <input 
                          type="number" 
                          name="age" 
                          className="form-control" 
                          value={editPet.age} 
                          onChange={handleChangeEditPet} 
                          required 
                          style={{ borderRadius: '0 10px 10px 0' }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Weight (kg)</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-weight"></i></span>
                        <input 
                          type="number" 
                          name="weight" 
                          className="form-control" 
                          value={editPet.weight} 
                          onChange={handleChangeEditPet} 
                          required 
                          style={{ borderRadius: '0 10px 10px 0' }} 
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">Special Conditions</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-notes-medical"></i></span>
                        <input 
                          type="text" 
                          name="specialConditions" 
                          className="form-control" 
                          value={editPet.specialConditions || ''} 
                          onChange={handleChangeEditPet} 
                          style={{ borderRadius: '0 10px 10px 0' }} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setEditPet(null)}
                      style={{ borderRadius: '10px' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showImageUpdate && selectedPet && (
          <UpdatePetImage 
            pet={selectedPet}
            onUpdate={handleImageUpdate}
            onClose={() => {
              setShowImageUpdate(false);
              setSelectedPet(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default MyPets;