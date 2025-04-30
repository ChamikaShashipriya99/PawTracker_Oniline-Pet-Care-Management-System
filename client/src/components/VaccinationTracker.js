import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const VaccinationTracker = () => {
  const { petId } = useParams();
  const [vaccinations, setVaccinations] = useState([]);
  const [newVaccination, setNewVaccination] = useState({
    name: '',
    date: '',
    nextDueDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVaccinations();
  }, [petId]);

  const fetchVaccinations = async () => {
    try {
      const response = await axios.get(`/api/pets/${petId}/vaccinations`);
      setVaccinations(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch vaccinations');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVaccination(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/pets/${petId}/vaccinations`, newVaccination);
      setNewVaccination({
        name: '',
        date: '',
        nextDueDate: '',
        notes: ''
      });
      fetchVaccinations();
    } catch (err) {
      setError('Failed to add vaccination');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Vaccination Tracker</h2>
      
      {/* Add New Vaccination Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h3>Add New Vaccination</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Vaccination Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={newVaccination.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Date Given</label>
              <input
                type="date"
                className="form-control"
                name="date"
                value={newVaccination.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Next Due Date</label>
              <input
                type="date"
                className="form-control"
                name="nextDueDate"
                value={newVaccination.nextDueDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Notes</label>
              <textarea
                className="form-control"
                name="notes"
                value={newVaccination.notes}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary">Add Vaccination</button>
          </form>
        </div>
      </div>

      {/* Vaccination List */}
      <div className="card">
        <div className="card-body">
          <h3>Vaccination History</h3>
          {vaccinations.length === 0 ? (
            <p>No vaccinations recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date Given</th>
                    <th>Next Due Date</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((vaccination, index) => (
                    <tr key={index}>
                      <td>{vaccination.name}</td>
                      <td>{new Date(vaccination.date).toLocaleDateString()}</td>
                      <td>{new Date(vaccination.nextDueDate).toLocaleDateString()}</td>
                      <td>{vaccination.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaccinationTracker; 