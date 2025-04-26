import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MyPets() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [pets, setPets] = useState([]);
  const [editPet, setEditPet] = useState(null);

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
      <div className="card shadow p-4" style={{ borderRadius: '15px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 style={{ color: '#007bff', margin: 0 }}>My Pets 🐾</h2>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/profile')}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-arrow-left me-2"></i> Back to Profile
          </button>
        </div>
        {pets.length === 0 ? (
          <p className="text-center">No pets added yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Pet Name</th>
                  <th>Breed</th>
                  <th>Birthday</th>
                  <th>Age</th>
                  <th>Weight</th>
                  <th>Special Conditions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pets.map(pet => (
                  <tr key={pet._id}>
                    <td>{pet.petName}</td>
                    <td>{pet.breed}</td>
                    <td>{new Date(pet.birthday).toLocaleDateString()}</td>
                    <td>{pet.age}</td>
                    <td>{pet.weight} kg</td>
                    <td>{pet.specialConditions || 'None'}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => handleEditPet(pet)}
                        style={{ borderRadius: '10px' }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeletePet(pet._id)}
                        style={{ borderRadius: '10px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editPet && (
          <div className="mt-4">
            <h3 style={{ color: '#007bff' }}>Edit Pet</h3>
            <form onSubmit={handleUpdatePet}>
              <div className="mb-3">
              <label>Pet Name</label>
                <input type="text" name="petName" className="form-control" value={editPet.petName} onChange={handleChangeEditPet} required style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-3">
              <label>Breed</label>
                <input type="text" name="breed" className="form-control" value={editPet.breed} onChange={handleChangeEditPet} required style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-3">
              <label>Birthday</label>
                <input type="date" name="birthday" className="form-control" value={editPet.birthday.split('T')[0]} onChange={handleChangeEditPet} required style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-3">
              <label>Age</label>
                <input type="number" name="age" className="form-control" value={editPet.age} onChange={handleChangeEditPet} required style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-3">
              <label>Weight</label>
                <input type="number" name="weight" className="form-control" value={editPet.weight} onChange={handleChangeEditPet} required style={{ borderRadius: '10px' }} />
              </div>
              <div className="mb-3">
              <label>Special Conditions</label>
                <textarea name="specialConditions" className="form-control" value={editPet.specialConditions || ''} onChange={handleChangeEditPet} style={{ borderRadius: '10px' }} />
              </div>
              <button type="submit" className="btn btn-primary me-2" style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}>Update</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditPet(null)} style={{ borderRadius: '10px' }}>Cancel</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPets;