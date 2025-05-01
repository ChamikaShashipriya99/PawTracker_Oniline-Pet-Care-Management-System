import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Vaccinations() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [newVaccination, setNewVaccination] = useState({
    name: '',
    date: '',
    nextDueDate: '',
    notes: '',
    isCompleted: false
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/pets/${id}`);
        if (!res.data) {
          throw new Error('Pet not found');
        }
        
        setPet(res.data);
        
        // Ensure vaccinations is an array and sort by date
        const sortedVaccinations = Array.isArray(res.data.vaccinations) 
          ? [...res.data.vaccinations].sort((a, b) => new Date(b.date) - new Date(a.date))
          : [];
          
        console.log('Fetched vaccinations:', sortedVaccinations); // Debug log
        setVaccinations(sortedVaccinations);
        
        // Clear any existing error messages
        setStatusMessage('');
        setStatusType('');
      } catch (error) {
        console.error('Failed to fetch pet:', error);
        setStatusMessage(error.response?.data?.error || 'Failed to fetch pet details. Please try again.');
        setStatusType('danger');
        setPet(null);
        setVaccinations([]);
      }
    };

    if (id) {
      fetchPet();
    } else {
      setStatusMessage('Invalid pet ID');
      setStatusType('danger');
    }
  }, [id]);

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

      const res = await axios.post(`http://localhost:5000/api/users/pets/${id}/vaccinations`, formattedVaccination);
      
      // Add the new vaccination to the beginning of the list and sort
      const updatedVaccinations = [...vaccinations, res.data].sort((a, b) => new Date(b.date) - new Date(a.date));
      setVaccinations(updatedVaccinations);
      
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

  const handleDeleteVaccination = async (vaccinationId) => {
    if (window.confirm('Are you sure you want to delete this vaccination?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/pets/${id}/vaccinations/${vaccinationId}`);
        setVaccinations(vaccinations.filter(v => v._id !== vaccinationId));
        setStatusMessage('Vaccination deleted successfully!');
        setStatusType('success');
        setTimeout(() => setStatusMessage(''), 3000);
      } catch (error) {
        console.error('Failed to delete vaccination:', error);
        setStatusMessage('Failed to delete vaccination. Please try again.');
        setStatusType('danger');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    }
  };

  const handleUpdateVaccination = async (vaccinationId, updatedData) => {
    try {
      // Format dates before sending to server
      const formattedData = {
        ...updatedData,
        date: new Date(updatedData.date).toISOString(),
        nextDueDate: updatedData.nextDueDate ? new Date(updatedData.nextDueDate).toISOString() : null,
        isCompleted: Boolean(updatedData.isCompleted)
      };

      const res = await axios.put(`http://localhost:5000/api/users/pets/${id}/vaccinations/${vaccinationId}`, formattedData);
      
      // Update the vaccinations list and maintain sort order
      const updatedVaccinations = vaccinations.map(v => 
        v._id === vaccinationId ? res.data : v
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setVaccinations(updatedVaccinations);
      setStatusMessage(`Vaccination marked as ${res.data.isCompleted ? 'completed' : 'pending'}`);
      setStatusType('success');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update vaccination:', error);
      setStatusMessage(error.response?.data?.error || 'Failed to update vaccination. Please try again.');
      setStatusType('danger');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  if (!pet) return null;

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
            <i className="fas fa-syringe me-2"></i>Vaccinations for {pet.name}
          </h2>
          <button 
            className="btn btn-outline-primary" 
            onClick={() => navigate('/my-pets')}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-arrow-left me-2"></i> Back to My Pets
          </button>
        </div>

        <div className="card mb-4" style={{ borderRadius: '15px', border: 'none' }}>
          <div className="card-header bg-white py-3" style={{ borderRadius: '15px 15px 0 0' }}>
            <h3 className="fw-bold mb-0" style={{ color: '#00c4cc' }}>
              <i className="fas fa-plus-circle me-2"></i>Add New Vaccination
            </h3>
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

        <div className="card" style={{ borderRadius: '15px', border: 'none' }}>
          <div className="card-header bg-white py-3" style={{ borderRadius: '15px 15px 0 0' }}>
            <h3 className="fw-bold mb-0" style={{ color: '#00c4cc' }}>
              <i className="fas fa-list me-2"></i>Vaccination History
            </h3>
          </div>
          <div className="card-body p-4">
            {vaccinations.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-syringe fa-3x mb-3" style={{ color: '#00c4cc' }}></i>
                <h4 className="text-muted">No vaccinations added yet</h4>
                <p className="text-muted">Add your first vaccination above!</p>
              </div>
            ) : (
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
                    {vaccinations.map(vaccination => (
                      <tr key={vaccination._id}>
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
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleUpdateVaccination(vaccination._id, { ...vaccination, isCompleted: !vaccination.isCompleted })}
                            style={{ borderRadius: '10px' }}
                          >
                            <i className={`fas fa-${vaccination.isCompleted ? 'times' : 'check'}`}></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteVaccination(vaccination._id)}
                            style={{ borderRadius: '10px' }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vaccinations; 