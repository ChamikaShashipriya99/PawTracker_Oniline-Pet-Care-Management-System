import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TwoFactorSetup from './TwoFactorSetup';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');

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
        console.error('Failed to fetch pets:', error.message);
      }
    };
    fetchPets();
  }, [navigate, user]);

  const handle2FAStatusChange = (enabled) => {
    setStatusMessage(enabled ? 'Two-Factor Authentication has been enabled successfully!' : 'Two-Factor Authentication has been disabled.');
    setStatusType(enabled ? 'success' : 'info');
    setShowStatus(true);
    setTimeout(() => {
      setShowStatus(false);
    }, 5000);
  };

  const handleDeletePet = async (petId) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/pets/${petId}`);
        setPets(pets.filter(pet => pet._id !== petId));
        setStatusMessage('Pet deleted successfully!');
        setStatusType('success');
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      } catch (error) {
        console.error('Error deleting pet:', error);
        setStatusMessage('Failed to delete pet. Please try again.');
        setStatusType('danger');
        setShowStatus(true);
        setTimeout(() => setShowStatus(false), 3000);
      }
    }
  };

  if (!user) return null;

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${user._id}`);
        localStorage.removeItem('user');
        alert('Account deleted successfully!');
        navigate('/login');
      } catch (error) {
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const handleDownloadProfile = () => {
    const doc = new jsPDF();
    
    // Add logo to PDF
    const logoImg = new Image();
    // Use absolute URL to ensure the image loads correctly
    logoImg.src = window.location.origin + '/logo.png';
    
    logoImg.onload = function() {
      // Calculate logo dimensions (max width 40mm while preserving aspect ratio)
      const imgWidth = 40;
      const imgHeight = imgWidth * logoImg.height / logoImg.width;
      
      // Add logo at the top center of the page
      doc.addImage(logoImg, 'PNG', (210 - imgWidth) / 2, 10, imgWidth, imgHeight);
      
      // Add title and text below the logo
      const yOffset = 10 + imgHeight + 10; // logo y position + logo height + spacing
      
      doc.setFontSize(18);
      doc.setTextColor(0, 123, 255);
      doc.text('Pet Care User Profile', 105, yOffset, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(85, 85, 85);
      doc.text(`Profile for ${user.username}`, 105, yOffset + 10, { align: 'center' });
      
      const profileData = [
        ['First Name', user.firstName],
        ['Last Name', user.lastName],
        ['Username', user.username],
        ['Email', user.email],
        ['Phone', user.phone]
      ];

      autoTable(doc, {
        startY: yOffset + 20,
        head: [['Field', 'Value']],
        body: profileData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      if (pets.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 123, 255);
        doc.text('Your Pets', 105, doc.lastAutoTable.finalY + 20, { align: 'center' });

        const petData = pets.map(pet => [
          pet.name,
          pet.breed,
          new Date(pet.birthday).toLocaleDateString(),
          pet.age,
          `${pet.weight} kg`,
          pet.specialConditions || 'None'
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Pet Name', 'Breed', 'Birthday', 'Age', 'Weight', 'Special Conditions']],
          body: petData,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [240, 240, 240] },
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(85, 85, 85);
        doc.text('No pets added yet.', 105, doc.lastAutoTable.finalY + 20, { align: 'center' });
      }

      doc.setFontSize(8);
      doc.setTextColor(85, 85, 85);
      doc.text('Generated by Online Pet Care System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.save(`${user.username}_profile.pdf`);
      alert('Profile and pet details downloaded as PDF!');
    };
    
    logoImg.onerror = function() {
      // If logo fails to load, continue without it
      console.log('Logo failed to load, generating PDF without logo');
      
      doc.setFontSize(18);
      doc.setTextColor(0, 123, 255);
      doc.text('Pet Care User Profile', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(85, 85, 85);
      doc.text(`Profile for ${user.username}`, 105, 30, { align: 'center' });
      
      const profileData = [
        ['First Name', user.firstName],
        ['Last Name', user.lastName],
        ['Username', user.username],
        ['Email', user.email],
        ['Phone', user.phone]
      ];

      autoTable(doc, {
        startY: 40,
        head: [['Field', 'Value']],
        body: profileData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      if (pets.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(0, 123, 255);
        doc.text('Your Pets', 105, doc.lastAutoTable.finalY + 20, { align: 'center' });

        const petData = pets.map(pet => [
          pet.name,
          pet.breed,
          new Date(pet.birthday).toLocaleDateString(),
          pet.age,
          `${pet.weight} kg`,
          pet.specialConditions || 'None'
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 30,
          head: [['Pet Name', 'Breed', 'Birthday', 'Age', 'Weight', 'Special Conditions']],
          body: petData,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [240, 240, 240] },
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(85, 85, 85);
        doc.text('No pets added yet.', 105, doc.lastAutoTable.finalY + 20, { align: 'center' });
      }

      doc.setFontSize(8);
      doc.setTextColor(85, 85, 85);
      doc.text('Generated by Online Pet Care System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
      doc.save(`${user.username}_profile.pdf`);
      alert('Profile and pet details downloaded as PDF!');
    };
  };

  return (
    <div className="container mt-5">
      {showStatus && (
        <div className={`alert alert-${statusType} alert-dismissible fade show`} role="alert" style={{ borderRadius: '10px' }}>
          <i className={`fas fa-${statusType === 'success' ? 'check-circle' : 'info-circle'} me-2`}></i>
          {statusMessage}
          <button type="button" className="btn-close" onClick={() => setShowStatus(false)}></button>
        </div>
      )}

      <div className="card shadow-lg p-4" style={{ borderRadius: '15px', border: 'none' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0" style={{ color: '#007bff', fontWeight: '600' }}>Profile 🐾</h2>
          <div>
            <button 
              onClick={handleDownloadProfile} 
              className="btn btn-outline-success me-2" 
              style={{ borderRadius: '10px' }}
            >
              <i className="fas fa-download me-2"></i> Download Profile
            </button>
            <button 
              onClick={handleDeleteAccount} 
              className="btn btn-outline-danger" 
              style={{ borderRadius: '10px' }}
            >
              <i className="fas fa-trash-alt me-2"></i> Delete Account
            </button>
          </div>
        </div>
        
        <div className="row">
          {/* Profile Photo and Basic Info */}
          <div className="col-md-4 mb-4">
            <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <div className="card-body text-center">
                {user.profilePhoto ? (
                  <img 
                    src={`http://localhost:5000${user.profilePhoto}`} 
                    alt="Profile" 
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
                <h4 className="mb-1">{user.firstName} {user.lastName}</h4>
                <p className="text-muted mb-3">@{user.username}</p>
                <Link 
                  to="/update-profile" 
                  className="btn btn-primary w-100" 
                  style={{ borderRadius: '10px' }}
                >
                  <i className="fas fa-edit me-2"></i> Edit Profile
                </Link>
              </div>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="col-md-8 mb-4">
            <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
                <h5 className="mb-0" style={{ color: '#007bff' }}>
                  <i className="fas fa-address-card me-2"></i> Contact Information
                </h5>
              </div>
        <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#e6f7ff' }}>
                        <i className="fas fa-envelope text-primary"></i>
                      </div>
                      <div>
                        <p className="text-muted mb-0">Email</p>
                        <p className="mb-0 fw-bold">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#e6f7ff' }}>
                        <i className="fas fa-phone text-primary"></i>
                      </div>
                      <div>
                        <p className="text-muted mb-0">Phone</p>
                        <p className="mb-0 fw-bold">{user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#e6f7ff' }}>
                        <i className="fas fa-calendar-alt text-primary"></i>
                      </div>
                      <div>
                        <p className="text-muted mb-0">Member Since</p>
                        <p className="mb-0 fw-bold">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#e6f7ff' }}>
                        <i className="fas fa-user-shield text-primary"></i>
                      </div>
                      <div>
                        <p className="text-muted mb-0">Account Type</p>
                        <p className="mb-0 fw-bold">{user.isAdmin ? 'Administrator' : 'Standard User'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics Section */}
        <div className="mb-4">
          <h3 style={{ color: '#007bff', fontWeight: '600' }}>
            <i className="fas fa-chart-pie me-2"></i> Account Statistics
          </h3>
          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: '#e6f7ff' }}>
                <div className="card-body text-center p-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px', backgroundColor: '#007bff' }}>
                    <i className="fas fa-paw fa-2x text-white"></i>
                  </div>
                  <h4 className="mb-1" style={{ color: '#007bff' }}>Pets</h4>
                  <p className="fs-2 mb-0" style={{ color: '#00c4cc', fontWeight: 'bold' }}>{pets.length}</p>
                  <p className="text-muted mb-0 mt-2">Registered pets</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffe6e6' }}>
                <div className="card-body text-center p-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px', backgroundColor: '#ff5733' }}>
                    <i className="fas fa-calendar-check fa-2x text-white"></i>
                  </div>
                  <h4 className="mb-1" style={{ color: '#ff5733' }}>Appointments</h4>
                  <p className="fs-2 mb-0" style={{ color: '#ff5733', fontWeight: 'bold' }}>0</p>
                  <p className="text-muted mb-0 mt-2">Scheduled appointments</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', backgroundColor: '#e6ffe6' }}>
                <div className="card-body text-center p-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px', backgroundColor: '#28a745' }}>
                    <i className="fas fa-concierge-bell fa-2x text-white"></i>
                  </div>
                  <h4 className="mb-1" style={{ color: '#28a745' }}>Services</h4>
                  <p className="fs-2 mb-0" style={{ color: '#28a745', fontWeight: 'bold' }}>0</p>
                  <p className="text-muted mb-0 mt-2">Booked services</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-4">
          <h3 style={{ color: '#007bff', fontWeight: '600' }}>
            <i className="fas fa-history me-2"></i> Recent Activity
          </h3>
          <div className="card" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#e6f7ff' }}>
                        <i className="fas fa-user-plus text-primary"></i>
                      </div>
                      <div>
                        <p className="mb-0 fw-bold">Account created</p>
                        <small className="text-muted">Welcome to PawTracker!</small>
                      </div>
                    </div>
                    <small className="text-muted">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                    </small>
                  </div>
                </div>
                {pets.length > 0 && (
                  <div className="list-group-item border-0 p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: '#e6ffe6' }}>
                          <i className="fas fa-paw text-success"></i>
                        </div>
                        <div>
                          <p className="mb-0 fw-bold">Added {pets.length} pet{pets.length > 1 ? 's' : ''}</p>
                          <small className="text-muted">Your furry friends are now registered</small>
                        </div>
                      </div>
                      <small className="text-muted">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-4">
          <h3 style={{ color: '#007bff', fontWeight: '600' }}>
            <i className="fas fa-bolt me-2"></i> Quick Actions
          </h3>
          <div className="row">
            <div className="col-md-6 mb-3">
              <div 
                className="card h-100" 
                style={{ 
                  borderRadius: '15px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }} 
                onClick={() => navigate('/add-pet')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: '#e6f7ff' }}>
                      <i className="fas fa-plus-circle fa-lg text-primary"></i>
                    </div>
                    <div>
                      <h5 className="mb-1">Add New Pet</h5>
                      <p className="text-muted mb-0">Register a new pet to your profile</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div 
                className="card h-100" 
                style={{ 
                  borderRadius: '15px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }} 
                onClick={() => navigate('/my-pets')}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="card-body p-4">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px', backgroundColor: '#e6ffe6' }}>
                      <i className="fas fa-list fa-lg text-success"></i>
                    </div>
                    <div>
                      <h5 className="mb-1">View All Pets</h5>
                      <p className="text-muted mb-0">See detailed information about your pets</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* My Pets Section */}
        <div className="mb-4">
          <h3 style={{ color: '#007bff', fontWeight: '600' }}>
            <i className="fas fa-paw me-2"></i> My Pets
          </h3>
          {pets.length === 0 ? (
            <div className="card" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
              <div className="card-body text-center p-5">
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px', backgroundColor: '#e6f7ff' }}>
                  <i className="fas fa-paw fa-2x text-primary"></i>
                </div>
                <h5 className="mb-2">No pets added yet</h5>
                <p className="text-muted mb-3">Start by adding your first pet to your profile</p>
                <Link to="/add-pet" className="btn btn-primary" style={{ borderRadius: '10px' }}>
                  <i className="fas fa-plus-circle me-2"></i> Add Pet
                </Link>
              </div>
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
                            src={`http://localhost:5000${pet.photo}`} 
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
                        {pet.specialConditions && pet.specialConditions.trim() !== '' && (
                          <div className="mb-2">
                            <span className="fw-bold me-2"><i className="fas fa-notes-medical me-2"></i>Special Needs:</span>
                            <span className="text-muted">{pet.specialConditions}</span>
                          </div>
                        )}
                      </div>

                      {/* Vaccination History Section */}
                      <div className="vaccination-history mt-3">
                        <h5 className="fw-bold" style={{ color: '#00c4cc' }}>
                          <i className="fas fa-syringe me-2"></i>Recent Vaccinations
                        </h5>
                        {pet.vaccinations && pet.vaccinations.length > 0 ? (
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
                                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                                  .slice(0, 3)
                                  .map(vaccination => (
                                    <tr key={vaccination._id}>
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
                            {pet.vaccinations.length > 3 && (
                              <div className="text-center">
                                <small className="text-muted">
                                  +{pet.vaccinations.length - 3} more vaccinations
                                </small>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <small className="text-muted">No vaccinations recorded</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add 2FA Section */}
        <div className="card mb-4" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
            <h5 className="mb-0" style={{ color: '#007bff' }}>
              <i className="fas fa-shield-alt me-2"></i> Security Settings
            </h5>
          </div>
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center mb-2">
                  <h6 className="mb-0 me-2">Two-Factor Authentication (2FA)</h6>
                  {user.twoFactorEnabled ? (
                    <span className="badge bg-success">
                      <i className="fas fa-check-circle me-1"></i>
                      Enabled
                    </span>
                  ) : (
                    <span className="badge bg-secondary">
                      <i className="fas fa-times-circle me-1"></i>
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-muted mb-0">
                  {user.twoFactorEnabled 
                    ? "Your account is protected with two-factor authentication. You will need to enter a verification code each time you log in."
                    : "Add an extra layer of security to your account by enabling two-factor authentication."}
                </p>
                {user.twoFactorEnabled && (
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Last verified: {new Date(user.twoFactorVerified).toLocaleDateString()}
                    </small>
                  </div>
                )}
              </div>
              <div className="col-md-4 text-end">
                {user.twoFactorEnabled ? (
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
                          // Open the TwoFactorSetup component in disable mode
                          setShow2FASetup(true);
                          // We'll modify the TwoFactorSetup component to show the disable view
                        }
                      }}
                      style={{ border: 'none', borderRadius: '10px' }}
                    >
                      <i className="fas fa-times-circle me-2"></i>
                      Disable 2FA
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShow2FASetup(true)}
                      style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}
                    >
                      <i className="fas fa-shield-alt me-2"></i>
                      Manage 2FA
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShow2FASetup(true)}
                    style={{ backgroundColor: '#00c4cc', border: 'none', borderRadius: '10px' }}
                  >
                    <i className="fas fa-shield-alt me-2"></i>
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>

            {user.twoFactorEnabled && (
              <div className="mt-3 pt-3 border-top">
                <h6 className="mb-3">Security Recommendations</h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>2FA is enabled</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <span>Backup codes are available</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-info-circle text-info me-2"></i>
                      <span>Keep your authenticator app secure</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-info-circle text-info me-2"></i>
                      <span>Save your backup codes in a safe place</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <br></br>
      <br></br>

      {show2FASetup && (
        <TwoFactorSetup
          user={user}
          onClose={() => setShow2FASetup(false)}
          onStatusChange={handle2FAStatusChange}
        />
      )}
    </div>
  );
}

export default Profile;