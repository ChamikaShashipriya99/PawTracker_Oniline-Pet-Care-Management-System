import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InventoryTable from './InventoryTable';

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
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !user || !user.isAdmin) {
        toast.error('Please log in as an admin to access this page');
        navigate('/admin/login');
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      const fetchUsers = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/users/users');
          console.log('Fetched users:', res.data);
          setUsers(res.data);
        } catch (error) {
          toast.error('Failed to fetch users: ' + error.message);
        }
      };
      fetchUsers();
    }
  }, [navigate]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase().trim();
    setSearchTerm(term);

    if (term === '') {
      setFilteredUsers([]);
      setSearchError('');
    } else {
      const filtered = users
        .filter(u => {
          const username = u.username ? u.username.toLowerCase() : '';
          const match = username.includes(term);
          console.log(`Checking ${username} against ${term}: ${match}`);
          return match;
        })
        .sort((a, b) => a.username.localeCompare(b.username));
      console.log('Filtered users:', filtered);
      setFilteredUsers(filtered);
      setSearchError(filtered.length === 0 ? 'No users or admins found with that name.' : '');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
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
      await axios.post('http://localhost:5000/api/users/admin/add', newAdmin);
      alert('New admin added successfully!');
      setNewAdmin({ firstName: '', lastName: '', username: '', email: '', phone: '', password: '' });
      const res = await axios.get('http://localhost:5000/api/users/users');
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
      alert('Failed to add admin: ' + error.message);
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
    
    // Check if there are any errors
    if (Object.values(validationErrors).some(error => error !== '')) {
      return;
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/users/${editUser._id}`, editUser);
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
    doc.setFontSize(18);
    doc.setTextColor(255, 87, 51);
    doc.text('Pet Care Admin Report', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(85, 85, 85);
    doc.text('All Users and Admins', 105, 30, { align: 'center' });

    const tableData = users.map(u => [
      u.firstName,
      u.lastName,
      u.username,
      u.email,
      u.phone,
      u.isAdmin ? 'Admin' : 'User'
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['First Name', 'Last Name', 'Username', 'Email', 'Phone', 'Role']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [255, 87, 51], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.setFontSize(8);
    doc.setTextColor(85, 85, 85);
    doc.text('Generated by Online Pet Care Admin System', 105, doc.internal.pageSize.height - 10, { align: 'center' });
    doc.save('all_users_and_admins.pdf');
    alert('User and admin details downloaded as PDF!');
  };

  const userCount = users.filter(u => !u.isAdmin).length;
  const adminCount = users.filter(u => u.isAdmin).length;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4" style={{ borderRadius: '15px', border: 'none' }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0" style={{ color: '#007bff', fontWeight: '600' }}>Admin Dashboard 🐾</h2>
          <button className="btn btn-outline-success" onClick={handleDownloadAllPDF} style={{ borderRadius: '10px' }}>
            <i className="fas fa-download me-2"></i> Download Report
          </button>
        </div>

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

        {searchTerm && (
          <div className="card mb-4" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
              <h5 className="mb-0" style={{ color: '#007bff' }}>
                <i className="fas fa-list me-2"></i> Search Results
              </h5>
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
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>{u.firstName}</td>
                        <td>{u.lastName}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>{u.phone}</td>
                        <td>
                          <span className={`badge ${u.isAdmin ? 'bg-danger' : 'bg-primary'}`} style={{ borderRadius: '10px' }}>
                            {u.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
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
        )}

        <div className="card mb-4" style={{ borderRadius: '15px', border: 'none', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <div className="card-header bg-white" style={{ borderRadius: '15px 15px 0 0', borderBottom: '1px solid #e9ecef' }}>
            <h5 className="mb-0" style={{ color: '#007bff' }}>
              <i className="fas fa-users me-2"></i> All Users and Admins
            </h5>
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
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>{u.firstName}</td>
                      <td>{u.lastName}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`badge ${u.isAdmin ? 'bg-danger' : 'bg-primary'}`} style={{ borderRadius: '10px' }}>
                          {u.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
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
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card shadow-sm mb-4" style={{ borderRadius: '15px', border: 'none' }}>
          <div className="card-body">
            <h5 className="card-title mb-4" style={{ color: '#007bff' }}>
              <i className="fas fa-tachometer-alt me-2"></i>Quick Actions
            </h5>
            <div className="row g-3">
              <div className="col-md-4 col-sm-6">
                <Link to="/admin/payment-dashboard" className="btn btn-primary w-100" style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #007bff, #00c4cc)' }}>
                  <i className="fas fa-credit-card me-2"></i>Manage Payments
                </Link>
              </div>
              <div className="col-md-4 col-sm-6">
                <Link to="/admin/refund-dashboard" className="btn btn-primary w-100" style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #007bff, #00c4cc)' }}>
                  <i className="fas fa-undo me-2"></i>Manage Refunds
                </Link>
              </div>
              <div className="col-md-4 col-sm-6">
                <Link to="/admin/dashboard" className="btn btn-primary w-100" style={{ borderRadius: '8px', background: 'linear-gradient(135deg, #007bff, #00c4cc)' }}>
                  <i className="fas fa-cog me-2"></i>System Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br></br>
      <ToastContainer />
    </div>
  );
}

export default AdminDashboard;