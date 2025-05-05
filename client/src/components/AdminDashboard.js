import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import InventoryTable from './InventoryTable';
import config from '../config';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '', password: ''
  });
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');
  const [errors, setErrors] = useState({
    firstName: '', lastName: '', username: '', email: '', phone: '', password: ''
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const user = JSON.parse(localStorage.getItem('user'));

  // Validation functions
  const validateFirstName = (value) => {
    if (!value) return 'First name is required';
    if (!/^[A-Za-z]+$/.test(value)) return 'Only letters are allowed';
    return '';
  };

  const validateLastName = (value) => {
    if (!value) return 'Last name is required';
    if (!/^[A-Za-z]+$/.test(value)) return 'Only letters are allowed';
    return '';
  };

  const validateUsername = (value) => {
    if (!value) return 'Username is required';
    if (!/^[A-Za-z0-9]+$/.test(value)) return 'Only alphanumeric characters are allowed';
    return '';
  };

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    return '';
  };

  const validatePhone = (value) => {
    if (!value) return 'Phone number is required';
    if (!/^\d{10}$/.test(value)) return 'Phone number must be 10 digits';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        return validateFirstName(value);
      case 'lastName':
        return validateLastName(value);
      case 'username':
        return validateUsername(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'password':
        return validatePassword(value);
      default:
        return '';
    }
  };

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/admin/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/users/users`);
        console.log('Fetched users:', res.data);
        setUsers(res.data);
      } catch (error) {
        alert('Failed to fetch users: ' + error.message);
      }
    };
    fetchUsers();
  }, [navigate, user]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase().trim();
    setSearchTerm(term);

    if (term === '') {
      setFilteredUsers([]);
      setSearchError('');
    } else {
      const filtered = users
        .filter(u => {
          if (activeTab === 'admins') {
            return u.isAdmin && u.username.toLowerCase().includes(term);
          } else {
            return !u.isAdmin && u.username.toLowerCase().includes(term);
          }
        })
        .sort((a, b) => a.username.localeCompare(b.username));
      console.log('Filtered users:', filtered);
      setFilteredUsers(filtered);
      setSearchError(filtered.length === 0 ? `No ${activeTab === 'admins' ? 'admins' : 'users'} found with that name.` : '');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${config.API_URL}/users/${id}`);
        const updatedUsers = users.filter(user => user._id !== id);
        setUsers(updatedUsers);
        setFilteredUsers(filteredUsers.filter(user => user._id !== id));
        alert('User deleted successfully!');
        if (id === user._id) {
          localStorage.removeItem('user');
          navigate('/admin/login');
        }
      } catch (error) {
        alert('Delete failed: ' + error.message);
      }
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    
    const validationErrors = {
      firstName: validateFirstName(newAdmin.firstName),
      lastName: validateLastName(newAdmin.lastName),
      username: validateUsername(newAdmin.username),
      email: validateEmail(newAdmin.email),
      phone: validatePhone(newAdmin.phone),
      password: validatePassword(newAdmin.password)
    };
    
    setErrors(validationErrors);
    
    if (Object.values(validationErrors).some(error => error !== '')) {
      return;
    }

    try {
      const response = await axios.post(`${config.API_URL}/users/admin/add`, newAdmin);
      alert('New admin added successfully!');
      setNewAdmin({ firstName: '', lastName: '', username: '', email: '', phone: '', password: '' });
      const res = await axios.get(`${config.API_URL}/users/users`);
      setUsers(res.data);
      if (searchTerm) {
        const filtered = res.data
          .filter(u => u.username.toLowerCase().includes(searchTerm))
          .sort((a, b) => a.username.localeCompare(b.username));
        setFilteredUsers(filtered);
        setSearchError(filtered.length === 0 ? 'No users or admins found with that name.' : '');
      } else {
        setFilteredUsers([]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.details || error.message;
      alert('Failed to add admin: ' + errorMessage);
    }
  };

  const handleEditUser = (user) => {
    setEditUser({ ...user });
    setErrors({
      firstName: '', lastName: '', username: '', email: '', phone: '', password: ''
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    const validationErrors = {
      firstName: validateFirstName(editUser.firstName),
      lastName: validateLastName(editUser.lastName),
      username: validateUsername(editUser.username),
      email: validateEmail(editUser.email),
      phone: validatePhone(editUser.phone)
    };
    
    setErrors(validationErrors);
    
    if (Object.values(validationErrors).some(error => error !== '')) {
      return;
    }

    try {
      const res = await axios.put(`${config.API_URL}/users/${editUser._id}`, editUser);
      const updatedUsers = users.map(u => (u._id === editUser._id ? res.data : u));
      setUsers(updatedUsers);
      setFilteredUsers(filteredUsers.map(u => (u._id === editUser._id ? res.data : u)));
      setEditUser(null);
      alert('User updated successfully!');
      if (editUser._id === user._id) {
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (error) {
      alert('Update failed: ' + error.message);
    }
  };

  const handleChangeNewAdmin = (e) => {
    const { name, value } = e.target;
    setNewAdmin({ ...newAdmin, [name]: value });
    // Validate the field and update errors
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleChangeEditUser = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
    // Validate the field and update errors
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const handleDownloadAllPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(24);
    doc.setTextColor(255, 87, 51);
    doc.text('PawTracker Admin Report', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(85, 85, 85);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Add user statistics
    doc.setFontSize(16);
    doc.setTextColor(0, 123, 255);
    doc.text('User Statistics', 20, 45);
    
    // Add user counts
    doc.setFontSize(12);
    doc.setTextColor(85, 85, 85);
    doc.text(`Total Users: ${userCount}`, 20, 55);
    doc.text(`Total Admins: ${adminCount}`, 20, 62);
    
    // Add user list
    doc.setFontSize(16);
    doc.setTextColor(0, 123, 255);
    doc.text('All Users', 20, 80);
    
    const tableData = users.map(u => [
      u.firstName,
      u.lastName,
      u.username,
      u.email,
      u.phone,
      u.isAdmin ? 'Admin' : 'User'
    ]);
    
    autoTable(doc, {
      startY: 85,
      head: [['First Name', 'Last Name', 'Username', 'Email', 'Phone', 'Role']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });
    
    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(85, 85, 85);
    doc.text('Generated by PawTracker Admin System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
    
    // Save the PDF
    doc.save('pawtracker_admin_report.pdf');
    alert('Admin report downloaded successfully!');
  };

  const handleDownloadSearchResultsPDF = () => {
    const doc = new jsPDF();
    
    // Add title with same styling as handleDownloadAllPDF
    doc.setFontSize(18);
    doc.setTextColor(255, 87, 51);
    doc.text('Pet Care Admin Report', 105, 20, { align: 'center' });
    
    // Add subtitle
    doc.setFontSize(12);
    doc.setTextColor(85, 85, 85);
    doc.text('Search Results', 105, 30, { align: 'center' });
    
    // Add search term and date
    doc.setFontSize(10);
    doc.text(`Search Term: ${searchTerm}`, 14, 40);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 45);
    
    // Create table with same styling as handleDownloadAllPDF
    const tableColumn = ['First Name', 'Last Name', 'Username', 'Email', 'Phone', 'Role'];
    const tableRows = filteredUsers.map(user => [
      user.firstName,
      user.lastName,
      user.username,
      user.email,
      user.phone,
      user.isAdmin ? 'Admin' : 'User'
    ]);
    
    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { 
        fontSize: 10, 
        cellPadding: 3 
      },
      headStyles: { 
        fillColor: [255, 87, 51], 
        textColor: [255, 255, 255] 
      },
      alternateRowStyles: { 
        fillColor: [240, 240, 240] 
      }
    });

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(85, 85, 85);
    doc.text('Generated by Online Pet Care Admin System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
    
    // Save the PDF
    doc.save(`search-results-${searchTerm}.pdf`);
  };

  const userCount = users.filter(u => !u.isAdmin).length;
  const adminCount = users.filter(u => u.isAdmin).length;

  // Prepare data for charts
  const userRoleData = {
    labels: ['Users', 'Admins'],
    datasets: [
      {
        data: [userCount, adminCount],
        backgroundColor: ['#007bff', '#ff5733'],
        borderColor: ['#0056b3', '#cc4529'],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for registration trends (you should replace this with real data from your backend)
  const registrationTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Registrations',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
        borderWidth: 1,
      },
    ],
  };

  // Mock data for active users (you should replace this with real data from your backend)
  const activeUsersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Users',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: '#ff5733',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Statistics',
      },
    },
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4" style={{ borderRadius: '15px', border: 'none' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0" style={{ color: '#007bff', fontWeight: '600' }}>Admin Dashboard 🐾</h2>
          <button className="btn btn-outline-success" onClick={handleDownloadAllPDF} style={{ borderRadius: '10px' }}>
            <i className="fas fa-download me-2"></i> Download Report
          </button>
        </div>

        {/* Add Tab Navigation */}
        <ul className="nav nav-tabs mb-4" id="adminTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              style={{ borderRadius: '10px 10px 0 0' }}
            >
              <i className="fas fa-chart-line me-2"></i> Dashboard
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
              style={{ borderRadius: '10px 10px 0 0' }}
            >
              <i className="fas fa-users me-2"></i> Users
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'admins' ? 'active' : ''}`}
              onClick={() => setActiveTab('admins')}
              style={{ borderRadius: '10px 10px 0 0' }}
            >
              <i className="fas fa-user-shield me-2"></i> Admins
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'add-admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-admin')}
              style={{ borderRadius: '10px 10px 0 0' }}
            >
              <i className="fas fa-user-plus me-2"></i> Add Admin
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="tab-pane fade show active">
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <div className="card-body text-center">
                      <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: '#e6f7ff', border: '3px solid #007bff' }}>
                        <i className="fas fa-users fa-2x text-primary"></i>
                      </div>
                      <h3 className="mb-1" style={{ color: '#007bff' }}>{userCount}</h3>
                      <p className="text-muted mb-0">Total Users</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card h-100" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <div className="card-body text-center">
                      <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: '#ffe6e6', border: '3px solid #ff5733' }}>
                        <i className="fas fa-user-shield fa-2x" style={{ color: '#ff5733' }}></i>
                      </div>
                      <h3 className="mb-1" style={{ color: '#ff5733' }}>{adminCount}</h3>
                      <p className="text-muted mb-0">Total Admins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="row">
                {/* User Role Distribution Pie Chart */}
                <div className="col-md-4">
                  <div className="card" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: '#007bff' }}>
                        <i className="fas fa-chart-pie me-2"></i> User Distribution
                      </h5>
                      <div style={{ height: '250px' }}>
                        <Pie data={userRoleData} options={chartOptions} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Trends Bar Chart */}
                <div className="col-md-8">
                  <div className="card" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: '#007bff' }}>
                        <i className="fas fa-chart-bar me-2"></i> Registration Trends
                      </h5>
                      <div style={{ height: '250px' }}>
                        <Bar 
                          data={registrationTrendsData} 
                          options={{
                            ...chartOptions,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: 'Number of Users'
                                }
                              }
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Users Line Chart */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                    <div className="card-body">
                      <h5 className="card-title" style={{ color: '#007bff' }}>
                        <i className="fas fa-chart-line me-2"></i> Active Users
                      </h5>
                      <div style={{ height: '300px' }}>
                        <Line 
                          data={activeUsersData} 
                          options={{
                            ...chartOptions,
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: {
                                  display: true,
                                  text: 'Number of Active Users'
                                }
                              }
                            }
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="tab-pane fade show active">
              <div className="card mb-4" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
                  <h5 className="mb-0" style={{ color: '#007bff' }}>
                    <i className="fas fa-search me-2"></i> Search Users
                  </h5>
                </div>
                <div className="card-body">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ borderRadius: '10px' }}
                  />
                  {searchError && <p className="text-danger mt-2">{searchError}</p>}
                </div>
              </div>

              <div className="card" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0" style={{ color: '#007bff' }}>
                      <i className="fas fa-list me-2"></i> {searchTerm ? 'Search Results' : 'All Users'}
                    </h5>
                    <div>
                      {searchTerm ? (
                        <button
                          onClick={handleDownloadSearchResultsPDF}
                          className="btn btn-outline-primary me-2"
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fas fa-download me-2"></i> Download Search Results
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const doc = new jsPDF();
                            doc.setFontSize(24);
                            doc.setTextColor(0, 123, 255);
                            doc.text('PawTracker User List', 105, 20, { align: 'center' });
                            
                            doc.setFontSize(12);
                            doc.setTextColor(85, 85, 85);
                            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
                            
                            const userData = users.filter(u => !u.isAdmin).map(u => [
                              u.firstName,
                              u.lastName,
                              u.username,
                              u.email,
                              u.phone
                            ]);
                            
                            autoTable(doc, {
                              startY: 40,
                              head: [['First Name', 'Last Name', 'Username', 'Email', 'Phone']],
                              body: userData,
                              theme: 'grid',
                              styles: { fontSize: 10, cellPadding: 3 },
                              headStyles: { fillColor: [0, 123, 255], textColor: [255, 255, 255] },
                              alternateRowStyles: { fillColor: [240, 240, 240] },
                            });
                            
                            doc.setFontSize(8);
                            doc.setTextColor(85, 85, 85);
                            doc.text('Generated by PawTracker Admin System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
                            
                            doc.save('pawtracker_user_list.pdf');
                            alert('User list downloaded successfully!');
                          }}
                          className="btn btn-outline-primary"
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fas fa-download me-2"></i> Download User List
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(searchTerm ? filteredUsers : users.filter(u => !u.isAdmin)).map(u => (
                          <tr key={u._id}>
                            <td>{u.firstName}</td>
                            <td>{u.lastName}</td>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.phone}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEditUser(u)}
                                data-bs-toggle="modal"
                                data-bs-target="#editUserModal"
                                style={{ borderRadius: '10px' }}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteUser(u._id)}
                                style={{ borderRadius: '10px' }}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div className="tab-pane fade show active">
              <div className="card mb-4" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
                  <h5 className="mb-0" style={{ color: '#ff5733' }}>
                    <i className="fas fa-search me-2"></i> Search Admins
                  </h5>
                </div>
                <div className="card-body">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{ borderRadius: '10px' }}
                  />
                  {searchError && <p className="text-danger mt-2">{searchError}</p>}
                </div>
              </div>

              <div className="card" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0" style={{ color: '#ff5733' }}>
                      <i className="fas fa-user-shield me-2"></i> {searchTerm ? 'Search Results' : 'Admin List'}
                    </h5>
                    <div>
                      {searchTerm ? (
                        <button
                          onClick={() => {
                            const doc = new jsPDF();
                            doc.setFontSize(24);
                            doc.setTextColor(255, 87, 51);
                            doc.text('PawTracker Admin Search Results', 105, 20, { align: 'center' });
                            
                            doc.setFontSize(12);
                            doc.setTextColor(85, 85, 85);
                            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
                            doc.text(`Search Term: ${searchTerm}`, 14, 40);
                            
                            const adminData = filteredUsers.map(u => [
                              u.firstName,
                              u.lastName,
                              u.username,
                              u.email,
                              u.phone
                            ]);
                            
                            autoTable(doc, {
                              startY: 45,
                              head: [['First Name', 'Last Name', 'Username', 'Email', 'Phone']],
                              body: adminData,
                              theme: 'grid',
                              styles: { fontSize: 10, cellPadding: 3 },
                              headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255] },
                              alternateRowStyles: { fillColor: [240, 240, 240] },
                            });
                            
                            doc.setFontSize(8);
                            doc.setTextColor(85, 85, 85);
                            doc.text('Generated by PawTracker Admin System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
                            
                            doc.save(`admin_search_results_${searchTerm}.pdf`);
                            alert('Admin search results downloaded successfully!');
                          }}
                          className="btn btn-outline-danger me-2"
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fas fa-download me-2"></i> Download Search Results
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const doc = new jsPDF();
                            doc.setFontSize(24);
                            doc.setTextColor(255, 87, 51);
                            doc.text('PawTracker Admin List', 105, 20, { align: 'center' });
                            
                            doc.setFontSize(12);
                            doc.setTextColor(85, 85, 85);
                            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
                            
                            const adminData = users.filter(u => u.isAdmin).map(u => [
                              u.firstName,
                              u.lastName,
                              u.username,
                              u.email,
                              u.phone
                            ]);
                            
                            autoTable(doc, {
                              startY: 40,
                              head: [['First Name', 'Last Name', 'Username', 'Email', 'Phone']],
                              body: adminData,
                              theme: 'grid',
                              styles: { fontSize: 10, cellPadding: 3 },
                              headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255] },
                              alternateRowStyles: { fillColor: [240, 240, 240] },
                            });
                            
                            doc.setFontSize(8);
                            doc.setTextColor(85, 85, 85);
                            doc.text('Generated by PawTracker Admin System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
                            
                            doc.save('pawtracker_admin_list.pdf');
                            alert('Admin list downloaded successfully!');
                          }}
                          className="btn btn-outline-danger"
                          style={{ borderRadius: '10px' }}
                        >
                          <i className="fas fa-download me-2"></i> Download Admin List
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(searchTerm ? filteredUsers : users.filter(u => u.isAdmin)).map(admin => (
                          <tr key={admin._id}>
                            <td>{admin.firstName}</td>
                            <td>{admin.lastName}</td>
                            <td>{admin.username}</td>
                            <td>{admin.email}</td>
                            <td>{admin.phone}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleEditUser(admin)}
                                data-bs-toggle="modal"
                                data-bs-target="#editUserModal"
                                style={{ borderRadius: '10px' }}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteUser(admin._id)}
                                style={{ borderRadius: '10px' }}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Admin Tab */}
          {activeTab === 'add-admin' && (
            <div className="tab-pane fade show active">
              <div className="card" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
                  <h5 className="mb-0" style={{ color: '#007bff' }}>
                    <i className="fas fa-user-plus me-2"></i> Add New Admin
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleAddAdmin}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">First Name</label>
                        <input 
                          type="text" 
                          name="firstName" 
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} 
                          placeholder="First Name" 
                          value={newAdmin.firstName} 
                          onChange={handleChangeNewAdmin} 
                          required 
                          style={{ borderRadius: '10px' }} 
                        />
                        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name</label>
                        <input 
                          type="text" 
                          name="lastName" 
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} 
                          placeholder="Last Name" 
                          value={newAdmin.lastName} 
                          onChange={handleChangeNewAdmin} 
                          required 
                          style={{ borderRadius: '10px' }} 
                        />
                        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Username</label>
                        <input 
                          type="text" 
                          name="username" 
                          className={`form-control ${errors.username ? 'is-invalid' : ''}`} 
                          placeholder="Username" 
                          value={newAdmin.username} 
                          onChange={handleChangeNewAdmin} 
                          required 
                          style={{ borderRadius: '10px' }} 
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                          placeholder="Email" 
                          value={newAdmin.email} 
                          onChange={handleChangeNewAdmin} 
                          required 
                          style={{ borderRadius: '10px' }} 
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`} 
                          placeholder="Phone" 
                          value={newAdmin.phone} 
                          onChange={handleChangeNewAdmin} 
                          required 
                          style={{ borderRadius: '10px' }}
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Password</label>
                        <input 
                          type="password" 
                          name="password" 
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`} 
                          placeholder="Password" 
                          value={newAdmin.password} 
                          onChange={handleChangeNewAdmin} 
                          required 
                          style={{ borderRadius: '10px' }}
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="submit" className="btn btn-primary" style={{ borderRadius: '10px' }}>
                        <i className="fas fa-user-plus me-2"></i> Add Admin
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit User Modal */}
        <div className="modal fade" id="editUserModal" tabIndex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ borderRadius: '15px', border: 'none' }}>
              <div className="modal-header" style={{ borderBottom: '1px solid #e9ecef' }}>
                <h5 className="modal-title" id="editUserModalLabel" style={{ color: '#007bff' }}>
                  <i className="fas fa-user-edit me-2"></i> Edit User/Admin
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {editUser && (
                  <form onSubmit={handleUpdateUser}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">First Name</label>
                        <input 
                          type="text" 
                          name="firstName" 
                          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} 
                          value={editUser.firstName} 
                          onChange={handleChangeEditUser} 
                          required 
                          style={{ borderRadius: '10px' }} 
                        />
                        {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name</label>
                        <input 
                          type="text" 
                          name="lastName" 
                          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} 
                          value={editUser.lastName} 
                          onChange={handleChangeEditUser} 
                          required 
                          style={{ borderRadius: '10px' }} 
                        />
                        {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Username</label>
                        <input 
                          type="text" 
                          name="username" 
                          className={`form-control ${errors.username ? 'is-invalid' : ''}`} 
                          value={editUser.username} 
                          onChange={handleChangeEditUser} 
                          required 
                          style={{ borderRadius: '10px' }} 
                        />
                        {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email</label>
                        <input 
                          type="email" 
                          name="email" 
                          className={`form-control ${errors.email ? 'is-invalid' : ''}`} 
                          value={editUser.email} 
                          onChange={handleChangeEditUser} 
                          required 
                          style={{ borderRadius: '10px' }} 
                        />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          className={`form-control ${errors.phone ? 'is-invalid' : ''}`} 
                          value={editUser.phone} 
                          onChange={handleChangeEditUser} 
                          required 
                          style={{ borderRadius: '10px' }}
                        />
                        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      </div>
                      <div className="col-md-6 mb-3">
                        <select 
                          name="isAdmin" 
                          className="form-control" 
                          value={editUser.isAdmin} 
                          onChange={handleChangeEditUser} 
                          style={{ borderRadius: '10px' }}
                        >
                          <option value={true}>Admin</option>
                          <option value={false}>User</option>
                        </select>
                      </div>
                    </div>
                    <div className="d-flex justify-content-end">
                      <button type="button" className="btn btn-outline-secondary me-2" data-bs-dismiss="modal" style={{ borderRadius: '10px' }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" style={{ borderRadius: '10px' }}>
                        Update
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;