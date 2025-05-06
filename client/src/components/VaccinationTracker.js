import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import config from '../config';

const VaccinationTracker = () => {
  const { petId } = useParams();
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVaccination, setNewVaccination] = useState({
    name: '',
    date: '',
    nextDueDate: '',
    notes: '',
    isCompleted: false
  });
  const { enqueueSnackbar } = useSnackbar();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (petId) {
      fetchVaccinations();
    }
  }, [petId]);

  const fetchVaccinations = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/pets/${petId}/vaccinations`);
      setVaccinations(response.data);
    } catch (error) {
      console.error('Failed to fetch vaccinations:', error);
      setError('Failed to load vaccinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVaccination = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${config.API_URL}/pets/${petId}/vaccinations`,
        newVaccination
      );
      setVaccinations([...vaccinations, response.data]);
      setNewVaccination({ name: '', date: '', nextDueDate: '', notes: '' });
    } catch (error) {
      console.error('Failed to add vaccination:', error);
      setError('Failed to add vaccination. Please try again.');
    }
  };

  const handleUpdateVaccination = async (vaccinationId, updates) => {
    try {
      await axios.put(`${config.API_URL}/pets/${petId}/vaccinations/${vaccinationId}`, updates);
      setVaccinations(vaccinations.map(v => 
        v._id === vaccinationId ? { ...v, ...updates } : v
      ));
    } catch (error) {
      console.error('Failed to update vaccination:', error);
      setError('Failed to update vaccination. Please try again.');
    }
  };

  const handleDeleteVaccination = async (vaccinationId) => {
    try {
      await axios.delete(`${config.API_URL}/pets/${petId}/vaccinations/${vaccinationId}`);
      setVaccinations(vaccinations.filter(v => v._id !== vaccinationId));
    } catch (error) {
      console.error('Failed to delete vaccination:', error);
      setError('Failed to delete vaccination. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4" style={{ borderRadius: '15px', border: 'none' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0" style={{ color: '#007bff', fontWeight: '600' }}>
            <i className="fas fa-syringe me-2"></i>Vaccination Tracker
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ borderRadius: '10px' }}
          >
            <i className="fas fa-plus me-2"></i>
            {showAddForm ? 'Cancel' : 'Add Vaccination'}
          </button>
        </div>

        {showAddForm && (
          <div className="card mb-4" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <div className="card-body">
              <h5 className="card-title mb-3">Add New Vaccination</h5>
              <form onSubmit={handleAddVaccination}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Vaccination Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newVaccination.name}
                      onChange={(e) => setNewVaccination({ ...newVaccination, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newVaccination.date}
                      onChange={(e) => setNewVaccination({ ...newVaccination, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Next Due Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newVaccination.nextDueDate}
                      onChange={(e) => setNewVaccination({ ...newVaccination, nextDueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={newVaccination.isCompleted}
                      onChange={(e) => setNewVaccination({ ...newVaccination, isCompleted: e.target.value === 'true' })}
                      required
                    >
                      <option value="false">Pending</option>
                      <option value="true">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-control"
                    value={newVaccination.notes}
                    onChange={(e) => setNewVaccination({ ...newVaccination, notes: e.target.value })}
                    rows="3"
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: '10px' }}>
                  <i className="fas fa-save me-2"></i>Save Vaccination
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Vaccination Name</th>
                <th>Date</th>
                <th>Next Due Date</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaccinations.map((vaccination) => (
                <tr key={vaccination._id}>
                  <td>{vaccination.name}</td>
                  <td>{format(new Date(vaccination.date), 'MMM dd, yyyy')}</td>
                  <td>{format(new Date(vaccination.nextDueDate), 'MMM dd, yyyy')}</td>
                  <td>
                    <span className={`badge ${vaccination.isCompleted ? 'bg-success' : 'bg-warning'}`}>
                      {vaccination.isCompleted ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td>{vaccination.notes}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleUpdateVaccination(vaccination._id, { isCompleted: !vaccination.isCompleted })}
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
      </div>
    </div>
  );
};

export default VaccinationTracker; 