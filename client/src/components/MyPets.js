import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import UpdatePetImage from './UpdatePetImage';
import config from '../config';

function MyPets() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [pets, setPets] = useState([]);
  const [editPet, setEditPet] = useState(null);
  const [showImageUpdate, setShowImageUpdate] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [newVaccination, setNewVaccination] = useState({
    name: '',
    date: '',
    nextDueDate: '',
    notes: '',
    isCompleted: false
  });
  const [editingVaccination, setEditingVaccination] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchPets = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/users/pets/${user._id}`);
        // Ensure vaccinations are properly sorted by date
        const petsWithSortedVaccinations = res.data.map(pet => ({
          ...pet,
          vaccinations: pet.vaccinations && Array.isArray(pet.vaccinations)
            ? [...pet.vaccinations].sort((a, b) => new Date(b.date) - new Date(a.date))
            : []
        }));
        setPets(petsWithSortedVaccinations);
      } catch (error) {
        console.error('Failed to fetch pets:', error);
        setStatusMessage('Failed to fetch pets. Please try again.');
        setStatusType('danger');
      }
    };
    fetchPets();
  }, [navigate, user]);

  const handleDeletePet = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await axios.delete(`${config.API_URL}/users/pets/${id}`);
        setPets(pets.filter(pet => pet._id !== id));
        setStatusMessage('Pet deleted successfully!');
        setStatusType('success');
        setTimeout(() => setStatusMessage(''), 3000);
      } catch (error) {
        console.error('Delete failed:', error);
        setStatusMessage('Failed to delete pet. Please try again.');
        setStatusType('danger');
        setTimeout(() => setStatusMessage(''), 3000);
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

  const handleChangeEditPet = (e) => {
    const { name, value } = e.target;
    const newPet = { ...editPet, [name]: value };
    
    // If birthday changes, calculate age
    if (name === 'birthday') {
      newPet.age = calculateAge(value);
    }

    setEditPet(newPet);
    setErrors({ ...errors, [name]: '' });
  };

  const validateEditPet = () => {
    const lettersRegex = /^[A-Za-z\s]+$/;
    const today = new Date();
    let errorMessage = '';
  
    if (!editPet.name || !lettersRegex.test(editPet.name)) {
      errorMessage = 'Pet name must contain only letters.';
    } else if (!editPet.type) {
      errorMessage = 'Pet type is required.';
    } else if (!editPet.breed || !lettersRegex.test(editPet.breed)) {
      errorMessage = 'Breed must contain only letters.';
    } else if (!editPet.birthday || new Date(editPet.birthday) >= today) {
      errorMessage = 'Birthday must be a past date.';
    } else if (!editPet.age || editPet.age <= 0) {
      errorMessage = 'Age must be a positive number.';
    } else if (!editPet.weight || editPet.weight <= 0) {
      errorMessage = 'Weight must be a positive number.';
    } else if (editPet.specialNeeds && !lettersRegex.test(editPet.specialNeeds)) {
      errorMessage = 'Special needs must contain only letters and spaces.';
    }
  
    if (errorMessage) {
      setStatusMessage(errorMessage);
      setStatusType('danger');
      setTimeout(() => setStatusMessage(''), 3000);
      return false;
    }
    return true;
  };

  const handleUpdatePet = async (e) => {
    e.preventDefault();
    if (!validateEditPet()) return;
  
    try {
      const res = await axios.put(`${config.API_URL}/users/pets/${editPet._id}`, editPet);
      setPets(pets.map(p => (p._id === editPet._id ? res.data : p)));
      setEditPet(null);
      setStatusMessage('Pet updated successfully!');
      setStatusType('success');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Update failed:', error);
      setStatusMessage('Failed to update pet. Please try again.');
      setStatusType('danger');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleVaccinationClick = (pet) => {
    setSelectedPet(pet);
    setShowVaccinationModal(true);
  };

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!newVaccination.name || !newVaccination.date) {
        setStatusMessage('Vaccination name and date are required.');
        setStatusType('danger');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      // Format dates before sending to server
      const formattedVaccination = {
        ...newVaccination,
        date: new Date(newVaccination.date).toISOString(),
        nextDueDate: newVaccination.nextDueDate ? new Date(newVaccination.nextDueDate).toISOString() : null,
        isCompleted: Boolean(newVaccination.isCompleted)
      };

      const res = await axios.post(`${config.API_URL}/users/pets/${selectedPet._id}/vaccinations`, formattedVaccination);
      
      // Update the selected pet's vaccinations
      const updatedPet = {
        ...selectedPet,
        vaccinations: [...(selectedPet.vaccinations || []), res.data].sort((a, b) => new Date(b.date) - new Date(a.date))
      };
      
      // Update the pets list
      setPets(pets.map(p => p._id === selectedPet._id ? updatedPet : p));
      setSelectedPet(updatedPet);
      
      // Reset form
      setNewVaccination({
        name: '',
        date: '',
        nextDueDate: '',
        notes: '',
        isCompleted: false
      });
      
      setStatusMessage('Vaccination added successfully!');
      setStatusType('success');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Failed to add vaccination:', error);
      setStatusMessage(error.response?.data?.error || 'Failed to add vaccination. Please try again.');
      setStatusType('danger');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleEditVaccination = (vaccination) => {
    setEditingVaccination({ ...vaccination });
  };

  const handleUpdateVaccination = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!editingVaccination.name || !editingVaccination.date) {
        setStatusMessage('Vaccination name and date are required.');
        setStatusType('danger');
        setTimeout(() => setStatusMessage(''), 3000);
        return;
      }

      // Format dates before sending to server
      const formattedVaccination = {
        ...editingVaccination,
        date: new Date(editingVaccination.date).toISOString(),
        nextDueDate: editingVaccination.nextDueDate ? new Date(editingVaccination.nextDueDate).toISOString() : null,
        isCompleted: Boolean(editingVaccination.isCompleted)
      };

      const res = await axios.put(
        `${config.API_URL}/users/pets/${selectedPet._id}/vaccinations/${editingVaccination._id}`,
        formattedVaccination
      );
      
      // Update the selected pet's vaccinations
      const updatedPet = {
        ...selectedPet,
        vaccinations: selectedPet.vaccinations.map(v => 
          v._id === editingVaccination._id ? res.data : v
        ).sort((a, b) => new Date(b.date) - new Date(a.date))
      };
      
      // Update the pets list
      setPets(pets.map(p => p._id === selectedPet._id ? updatedPet : p));
      setSelectedPet(updatedPet);
      setEditingVaccination(null);
      
      setStatusMessage('Vaccination updated successfully!');
      setStatusType('success');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update vaccination:', error);
      setStatusMessage(error.response?.data?.error || 'Failed to update vaccination. Please try again.');
      setStatusType('danger');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleDeleteVaccination = async (vaccinationId) => {
    if (window.confirm('Are you sure you want to delete this vaccination?')) {
      try {
        await axios.delete(
          `${config.API_URL}/users/pets/${selectedPet._id}/vaccinations/${vaccinationId}`
        );
        
        // Update the selected pet's vaccinations
        const updatedPet = {
          ...selectedPet,
          vaccinations: selectedPet.vaccinations.filter(v => v._id !== vaccinationId)
        };
        
        // Update the pets list
        setPets(pets.map(p => p._id === selectedPet._id ? updatedPet : p));
        setSelectedPet(updatedPet);
        
        setStatusMessage('Vaccination deleted successfully!');
        setStatusType('success');
        setTimeout(() => setStatusMessage(''), 3000);
      } catch (error) {
        console.error('Failed to delete vaccination:', error);
        setStatusMessage(error.response?.data?.error || 'Failed to delete vaccination. Please try again.');
        setStatusType('danger');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    }
  };

  if (!user) return null;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4" style={{ borderRadius: '15px', border: 'none' }}>
        {statusMessage && (
          <div className={`alert alert-${statusType} alert-dismissible fade show`} role="alert">
            {statusMessage}
            <button type="button" className="btn-close" onClick={() => setStatusMessage('')}></button>
          </div>
        )}

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
                      {pet.photo ? (
                        <img 
                          src={`${config.UPLOADS_URL}${pet.photo}`} 
                          alt={pet.name} 
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
                        <i className="fas fa-paw me-2"></i>{pet.name}
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
                        <span className="fw-bold me-2"><i className="fas fa-dog me-2"></i>Type:</span>
                        <span>{pet.type}</span>
                      </div>
                      <div className="mb-2">
                        <span className="fw-bold me-2"><i className="fas fa-dog me-2"></i>Breed:</span>
                        <span>{pet.breed}</span>
                      </div>
                      <div className="mb-2">
                        <span className="fw-bold me-2"><i className="fas fa-calendar-alt me-2"></i>Birthday:</span>
                        <span>{pet.birthday ? new Date(pet.birthday).toLocaleDateString() : 'Not set'}</span>
                      </div>
                      <div className="mb-2">
                        <span className="fw-bold me-2"><i className="fas fa-birthday-cake me-2"></i>Age:</span>
                        <span>{pet.age} years</span>
                      </div>
                      <div className="mb-2">
                        <span className="fw-bold me-2"><i className="fas fa-weight me-2"></i>Weight:</span>
                        <span>{pet.weight} kg</span>
                      </div>
                      <div className="col-md-6">
                        <div className="mb-2">
                          <span className="fw-bold me-2"><i className="fas fa-exclamation-triangle me-2"></i>Special Needs:</span>
                          <span className="text-muted">{pet.specialNeeds || 'None'}</span>
                        </div>
                      </div>
                      {pet.medicalHistory && pet.medicalHistory.trim() !== '' && (
                        <div className="mb-2">
                          <span className="fw-bold me-2"><i className="fas fa-file-medical me-2"></i>Medical History:</span>
                          <span className="text-muted">{pet.medicalHistory}</span>
                        </div>
                      )}
                      
                      {/* Vaccination History */}
                      {pet.vaccinations && pet.vaccinations.length > 0 && (
                        <div className="mt-3">
                          <h6 className="fw-bold" style={{ color: '#00c4cc' }}>
                            <i className="fas fa-syringe me-2"></i>Recent Vaccinations
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Date</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pet.vaccinations
                                  .slice(0, 3)
                                  .map((vaccination, index) => (
                                    <tr key={index}>
                                      <td>{vaccination.name}</td>
                                      <td>{new Date(vaccination.date).toLocaleDateString()}</td>
                                      <td>
                                        <span className={`badge ${vaccination.isCompleted ? 'bg-success' : 'bg-warning'}`}>
                                          {vaccination.isCompleted ? 'Completed' : 'Pending'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                          {pet.vaccinations.length > 3 && (
                            <div className="text-end">
                              <small className="text-muted">
                                +{pet.vaccinations.length - 3} more vaccinations
                              </small>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-center mt-3">
                      <button
                        className="btn btn-outline-primary me-2"
                        onClick={() => handleUpdatePetImage(pet)}
                        style={{ borderRadius: '10px' }}
                      >
                        <i className="fas fa-camera me-2"></i>Update Photo
                      </button>
                      <Link
                        to="#"
                        className="btn btn-outline-success"
                        style={{ borderRadius: '10px' }}
                        onClick={() => handleVaccinationClick(pet)}
                      >
                        <i className="fas fa-syringe me-2"></i>Vaccinations
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editPet && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{ borderRadius: '15px' }}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold" style={{ color: '#00c4cc' }}>
                    <i className="fas fa-edit me-2"></i>Edit Pet
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setEditPet(null)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleUpdatePet}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Pet Name</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="fas fa-paw"></i></span>
                          <input 
                            type="text" 
                            name="name" 
                            className="form-control" 
                            value={editPet.name} 
                            onChange={handleChangeEditPet} 
                            required 
                            style={{ borderRadius: '0 10px 10px 0' }} 
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Pet Type</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="fas fa-dog"></i></span>
                          <select
                            name="type"
                            className="form-control"
                            value={editPet.type}
                            onChange={handleChangeEditPet}
                            required
                            style={{ borderRadius: '0 10px 10px 0' }}
                          >
                            <option value="">Select Type</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Bird">Bird</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
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
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-bold">Birthday</label>
                        <div className="input-group">
                          <span className="input-group-text"><i className="fas fa-calendar-alt"></i></span>
                          <input 
                            type="date" 
                            name="birthday" 
                            className="form-control" 
                            value={editPet.birthday ? new Date(editPet.birthday).toISOString().split('T')[0] : ''} 
                            onChange={handleChangeEditPet} 
                            required 
                            style={{ borderRadius: '0 10px 10px 0' }} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
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
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">Special Needs</label>
                      <div className="input-group">
                        <span className="input-group-text"><i className="fas fa-notes-medical"></i></span>
                        <input 
                          type="text" 
                          name="specialNeeds" 
                          className="form-control" 
                          value={editPet.specialNeeds || ''} 
                          onChange={handleChangeEditPet} 
                          style={{ borderRadius: '0 10px 10px 0' }} 
                        />
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

        {/* Vaccination Modal */}
        {showVaccinationModal && selectedPet && (
          <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content" style={{ borderRadius: '15px' }}>
                <div className="modal-header">
                  <h5 className="modal-title fw-bold" style={{ color: '#00c4cc' }}>
                    <i className="fas fa-syringe me-2"></i>Vaccinations for {selectedPet.name}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowVaccinationModal(false);
                      setSelectedPet(null);
                      setNewVaccination({
                        name: '',
                        date: '',
                        nextDueDate: '',
                        notes: '',
                        isCompleted: false
                      });
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  {statusMessage && (
                    <div className={`alert alert-${statusType} alert-dismissible fade show`} role="alert">
                      {statusMessage}
                      <button type="button" className="btn-close" onClick={() => setStatusMessage('')}></button>
                    </div>
                  )}

                  {/* Add New Vaccination Form */}
                  <div className="card mb-4" style={{ borderRadius: '15px', border: 'none' }}>
                    <div className="card-header bg-white py-3" style={{ borderRadius: '15px 15px 0 0' }}>
                      <h6 className="fw-bold mb-0" style={{ color: '#00c4cc' }}>
                        <i className="fas fa-plus-circle me-2"></i>Add New Vaccination
                      </h6>
                    </div>
                    <div className="card-body p-4">
                      <form onSubmit={handleAddVaccination}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Vaccination Name</label>
                            <div className="input-group">
                              <span className="input-group-text"><i className="fas fa-syringe"></i></span>
                              <input 
                                type="text" 
                                className="form-control" 
                                value={newVaccination.name}
                                onChange={(e) => setNewVaccination({ ...newVaccination, name: e.target.value })}
                                required
                                style={{ borderRadius: '0 10px 10px 0' }}
                              />
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Date</label>
                            <div className="input-group">
                              <span className="input-group-text"><i className="fas fa-calendar-alt"></i></span>
                              <input 
                                type="date" 
                                className="form-control" 
                                value={newVaccination.date}
                                onChange={(e) => setNewVaccination({ ...newVaccination, date: e.target.value })}
                                max={new Date().toISOString().split('T')[0]}
                                required
                                style={{ borderRadius: '0 10px 10px 0' }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Next Due Date</label>
                            <div className="input-group">
                              <span className="input-group-text"><i className="fas fa-calendar-check"></i></span>
                              <input 
                                type="date" 
                                className="form-control" 
                                value={newVaccination.nextDueDate}
                                onChange={(e) => setNewVaccination({ ...newVaccination, nextDueDate: e.target.value })}
                                min={newVaccination.date || new Date().toISOString().split('T')[0]}
                                style={{ borderRadius: '0 10px 10px 0' }}
                              />
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold">Status</label>
                            <div className="input-group">
                              <span className="input-group-text"><i className="fas fa-check-circle"></i></span>
                              <select
                                className="form-control"
                                value={newVaccination.isCompleted}
                                onChange={(e) => setNewVaccination({ ...newVaccination, isCompleted: e.target.value === 'true' })}
                                required
                                style={{ borderRadius: '0 10px 10px 0' }}
                              >
                                <option value="false">Pending</option>
                                <option value="true">Completed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <label className="form-label fw-bold">Notes</label>
                          <div className="input-group">
                            <span className="input-group-text"><i className="fas fa-sticky-note"></i></span>
                            <textarea 
                              className="form-control" 
                              value={newVaccination.notes}
                              onChange={(e) => setNewVaccination({ ...newVaccination, notes: e.target.value })}
                              style={{ borderRadius: '0 10px 10px 0' }}
                            />
                          </div>
                        </div>
                        
                        <button 
                          type="submit" 
                          className="btn btn-primary"
                          style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}
                        >
                          Add Vaccination
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Vaccination History */}
                  <div className="card" style={{ borderRadius: '15px', border: 'none' }}>
                    <div className="card-header bg-white py-3" style={{ borderRadius: '15px 15px 0 0' }}>
                      <h6 className="fw-bold mb-0" style={{ color: '#00c4cc' }}>
                        <i className="fas fa-list me-2"></i>Vaccination History
                      </h6>
                    </div>
                    <div className="card-body p-4">
                      {selectedPet.vaccinations && selectedPet.vaccinations.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Next Due Date</th>
                                <th>Status</th>
                                <th>Notes</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPet.vaccinations.map((vaccination, index) => (
                                <tr key={index}>
                                  {editingVaccination?._id === vaccination._id ? (
                                    <>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={editingVaccination.name}
                                          onChange={(e) => setEditingVaccination({ ...editingVaccination, name: e.target.value })}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="date"
                                          className="form-control form-control-sm"
                                          value={editingVaccination.date ? new Date(editingVaccination.date).toISOString().split('T')[0] : ''}
                                          onChange={(e) => setEditingVaccination({ ...editingVaccination, date: e.target.value })}
                                        />
                                      </td>
                                      <td>
                                        <input
                                          type="date"
                                          className="form-control form-control-sm"
                                          value={editingVaccination.nextDueDate ? new Date(editingVaccination.nextDueDate).toISOString().split('T')[0] : ''}
                                          onChange={(e) => setEditingVaccination({ ...editingVaccination, nextDueDate: e.target.value })}
                                        />
                                      </td>
                                      <td>
                                        <select
                                          className="form-select form-select-sm"
                                          value={editingVaccination.isCompleted}
                                          onChange={(e) => setEditingVaccination({ ...editingVaccination, isCompleted: e.target.value === 'true' })}
                                        >
                                          <option value="false">Pending</option>
                                          <option value="true">Completed</option>
                                        </select>
                                      </td>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={editingVaccination.notes || ''}
                                          onChange={(e) => setEditingVaccination({ ...editingVaccination, notes: e.target.value })}
                                        />
                                      </td>
                                      <td>
                                        <button
                                          className="btn btn-sm btn-success me-1"
                                          onClick={handleUpdateVaccination}
                                          style={{ borderRadius: '5px' }}
                                        >
                                          <i className="fas fa-save"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-secondary"
                                          onClick={() => setEditingVaccination(null)}
                                          style={{ borderRadius: '5px' }}
                                        >
                                          <i className="fas fa-times"></i>
                                        </button>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td>{vaccination.name}</td>
                                      <td>{new Date(vaccination.date).toLocaleDateString()}</td>
                                      <td>{vaccination.nextDueDate ? new Date(vaccination.nextDueDate).toLocaleDateString() : 'N/A'}</td>
                                      <td>
                                        <span className={`badge ${vaccination.isCompleted ? 'bg-success' : 'bg-warning'}`}>
                                          {vaccination.isCompleted ? 'Completed' : 'Pending'}
                                        </span>
                                      </td>
                                      <td>{vaccination.notes || 'N/A'}</td>
                                      <td>
                                        <button
                                          className="btn btn-sm btn-primary me-1"
                                          onClick={() => handleEditVaccination(vaccination)}
                                          style={{ borderRadius: '5px' }}
                                        >
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() => handleDeleteVaccination(vaccination._id)}
                                          style={{ borderRadius: '5px' }}
                                        >
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <i className="fas fa-syringe fa-3x mb-3" style={{ color: '#00c4cc' }}></i>
                          <h4 className="text-muted">No vaccinations added yet</h4>
                          <p className="text-muted">Add your first vaccination above!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPets;