import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaBox, FaPen, FaTrash, FaDownload, FaSearch, FaStore, FaTruck, FaStoreAlt } from 'react-icons/fa';
import config from '../config';

const SUPPLIERS_ENDPOINT = `${config.API_URL}/suppliers`;

function SuppliersTable() {
  const [suppliers, setSuppliers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    products: {
      supplements: '',
      medicine: '',
      cages: '',
      food: '',
      other: ''
    },
    logo: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(SUPPLIERS_ENDPOINT);
      setSuppliers(res.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err.response?.data?.message || 'Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setError(null);
    // Validate required fields
    if (!form.name.trim()) {
      setError('Supplier name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Supplier email is required');
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setLoading(true);
      // Convert products object to string with category labels
      let productsString = '';
      if (typeof form.products === 'object' && form.products !== null) {
        const parts = [];
        if (form.products.supplements) parts.push(`Supplements: ${form.products.supplements}`);
        if (form.products.medicine) parts.push(`Medicine: ${form.products.medicine}`);
        if (form.products.cages) parts.push(`Cages: ${form.products.cages}`);
        if (form.products.food) parts.push(`Food: ${form.products.food}`);
        if (form.products.other) parts.push(`Other: ${form.products.other}`);
        productsString = parts.join(', ');
      } else {
        productsString = form.products || '';
      }
      const response = await axios.post(SUPPLIERS_ENDPOINT, {
        ...form,
        products: productsString
      });
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', address: '', products: { supplements: '', medicine: '', cages: '', food: '', other: '' }, logo: '' });
      await fetchSuppliers();
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to add supplier. Please check your input and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setError(null);
    // Validate required fields
    if (!form.name.trim()) {
      setError('Supplier name is required');
      return;
    }
    if (!form.email.trim()) {
      setError('Supplier email is required');
      return;
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setLoading(true);
      // Convert products object to string with category labels
      let productsString = '';
      if (typeof form.products === 'object' && form.products !== null) {
        const parts = [];
        if (form.products.supplements) parts.push(`Supplements: ${form.products.supplements}`);
        if (form.products.medicine) parts.push(`Medicine: ${form.products.medicine}`);
        if (form.products.cages) parts.push(`Cages: ${form.products.cages}`);
        if (form.products.food) parts.push(`Food: ${form.products.food}`);
        if (form.products.other) parts.push(`Other: ${form.products.other}`);
        productsString = parts.join(', ');
      } else {
        productsString = form.products || '';
      }
      await axios.put(`${SUPPLIERS_ENDPOINT}/${current._id}`, {
        ...form,
        products: productsString
      });
      setShowEdit(false);
      setForm({ name: '', email: '', phone: '', address: '', products: { supplements: '', medicine: '', cages: '', food: '', other: '' }, logo: '' });
      await fetchSuppliers();
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to update supplier. Please check your input and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this supplier?')) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`${SUPPLIERS_ENDPOINT}/${id}`);
        await fetchSuppliers();
      } catch (err) {
        console.error('Error deleting supplier:', err);
        setError(err.response?.data?.message || 'Failed to delete supplier. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const openEdit = (supplier) => {
    setCurrent(supplier);
    setForm(supplier);
    setShowEdit(true);
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Logo file size should be less than 5MB');
        return;
      }

      try {
        const base64 = await convertToBase64(file);
        console.log('Logo converted to base64, length:', base64.length);
        setForm({ ...form, logo: base64 });
      } catch (err) {
        console.error('Error processing logo:', err);
        setError('Error processing logo. Please try again.');
      }
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDownload = () => {
    try {
      // Prepare data for download
      const data = suppliers.map(supplier => ({
        Name: supplier.name,
        Email: supplier.email,
        Phone: supplier.phone || 'N/A',
        Address: supplier.address || 'N/A',
        Supplements: supplier.products.supplements || 'N/A',
        Medicine: supplier.products.medicine || 'N/A',
        Cages: supplier.products.cages || 'N/A',
        Food: supplier.products.food || 'N/A',
        Other: supplier.products.other || 'N/A'
      }));

      // Convert to CSV
      const headers = ['Name', 'Email', 'Phone', 'Address', 'Supplements', 'Medicine', 'Cages', 'Food', 'Other'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => 
            `"${(row[header] || '').toString().replace(/"/g, '""')}"`
          ).join(',')
        )
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `suppliers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading suppliers:', err);
      setError('Failed to download suppliers data. Please try again.');
    }
  };

  const handleToggleStatus = async (supplier) => {
    try {
      setLoading(true);
      const newStatus = supplier.status === 'active' ? 'inactive' : 'active';
      
      // Create updated supplier data
      const updatedSupplier = {
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone || '',
        address: supplier.address || '',
        products: supplier.products.supplements + ',' + supplier.products.medicine + ',' + supplier.products.cages + ',' + supplier.products.food + ',' + supplier.products.other,
        logo: supplier.logo || '',
        status: newStatus
      };

      // Make API call to update supplier
      const response = await axios.put(`${SUPPLIERS_ENDPOINT}/${supplier._id}`, updatedSupplier);
      
      if (response.data) {
        // Update the local state with the new supplier data
        setSuppliers(prevSuppliers => 
          prevSuppliers.map(s => 
            s._id === supplier._id ? { ...s, status: newStatus } : s
          )
        );
      }
      
      // Show success message
      setError(null);
    } catch (err) {
      console.error('Error updating supplier status:', err);
      setError(err.response?.data?.message || 'Failed to update supplier status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const searchLower = searchQuery.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.email.toLowerCase().includes(searchLower) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchLower)) ||
      (supplier.address && supplier.address.toLowerCase().includes(searchLower)) ||
      (supplier.products.supplements && supplier.products.supplements.toLowerCase().includes(searchLower)) ||
      (supplier.products.medicine && supplier.products.medicine.toLowerCase().includes(searchLower)) ||
      (supplier.products.cages && supplier.products.cages.toLowerCase().includes(searchLower)) ||
      (supplier.products.food && supplier.products.food.toLowerCase().includes(searchLower)) ||
      (supplier.products.other && supplier.products.other.toLowerCase().includes(searchLower))
    );
  });

  // Add this function to categorize products
  const categorizeProducts = (productsString) => {
    const categories = {
      supplements: [],
      medicine: [],
      cages: [],
      food: [],
      other: []
    };

    if (productsString) {
      const products = productsString.split(',').map(p => p.trim());
      products.forEach(product => {
        const lowerProduct = product.toLowerCase();
        if (lowerProduct.includes('supplement') || lowerProduct.includes('vitamin')) {
          categories.supplements.push(product);
        } else if (lowerProduct.includes('medicine') || lowerProduct.includes('drug')) {
          categories.medicine.push(product);
        } else if (lowerProduct.includes('cage') || lowerProduct.includes('kennel')) {
          categories.cages.push(product);
        } else if (lowerProduct.includes('food') || lowerProduct.includes('feed')) {
          categories.food.push(product);
        } else {
          categories.other.push(product);
        }
      });
    }

    return categories;
  };

  if (loading && !suppliers.length) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="suppliers-header mb-4">
        <h2 className="mb-4">Suppliers Management</h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
      </div>

      {/* Supplier Count Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="supplier-count-card total">
            <div className="count-icon">
              <FaStore size={24} />
            </div>
            <div className="count-info">
              <h3>{suppliers.length}</h3>
              <p>Total Suppliers</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="supplier-count-card active">
            <div className="count-icon">
              <FaTruck size={24} />
            </div>
            <div className="count-info">
              <h3>{suppliers.filter(s => s.status === 'active').length}</h3>
              <p>Active Suppliers</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="supplier-count-card inactive">
            <div className="count-icon">
              <FaStoreAlt size={24} />
            </div>
            <div className="count-info">
              <h3>{suppliers.filter(s => s.status === 'inactive').length}</h3>
              <p>Inactive Suppliers</p>
            </div>
          </div>
        </div>
      </div>

      <div className="search-container mb-4">
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search suppliers by name, email, phone, address, or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="action-buttons mb-4">
        <Button 
          onClick={() => setShowAdd(true)} 
          disabled={loading}
          className="add-supplier-btn"
        >
          Add Supplier
        </Button>
        <Button
          onClick={handleDownload}
          disabled={loading || !suppliers.length}
          className="download-btn"
        >
          <FaDownload className="me-2" />
          Download CSV
        </Button>
      </div>

      {loading && !suppliers.length ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover supplier-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Supplements</th>
                <th>Medicine</th>
                <th>Cages</th>
                <th>Food</th>
                <th>Other</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((supplier) => {
                const productCategories = categorizeProducts(supplier.products);
                return (
                  <tr key={supplier._id} className={supplier.status === 'inactive' ? 'inactive-row' : ''}>
                    <td>
                      {supplier.logo && supplier.logo.length > 0 ? (
                        <div className="supplier-logo-container">
                          <img 
                            src={supplier.logo} 
                            alt={`${supplier.name} logo`}
                            className="supplier-logo"
                            onError={(e) => {
                              console.error('Error loading logo for:', supplier.name);
                              e.target.style.display = 'none';
                              e.target.parentElement.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="supplier-logo-placeholder">
                          {supplier.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td>{supplier.name}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.phone || '-'}</td>
                    <td>{supplier.address || '-'}</td>
                    <td>
                      {productCategories.supplements.length > 0 ? (
                        <div className="product-category">
                          {productCategories.supplements.map((product, index) => (
                            <span key={index} className="product-tag">• {product}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {productCategories.medicine.length > 0 ? (
                        <div className="product-category">
                          {productCategories.medicine.map((product, index) => (
                            <span key={index} className="product-tag">• {product}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {productCategories.cages.length > 0 ? (
                        <div className="product-category">
                          {productCategories.cages.map((product, index) => (
                            <span key={index} className="product-tag">• {product}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {productCategories.food.length > 0 ? (
                        <div className="product-category">
                          {productCategories.food.map((product, index) => (
                            <span key={index} className="product-tag">• {product}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      {productCategories.other.length > 0 ? (
                        <div className="product-category">
                          {productCategories.other.map((product, index) => (
                            <span key={index} className="product-tag">• {product}</span>
                          ))}
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${supplier.status}`}>
                        {supplier.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button 
                          variant={supplier.status === 'active' ? 'danger' : 'success'}
                          size="sm" 
                          className="status-toggle-btn"
                          onClick={() => handleToggleStatus(supplier)}
                          disabled={loading}
                        >
                          {supplier.status === 'active' ? (
                            <>
                              <FaStoreAlt className="me-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <FaStore className="me-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="primary"
                          size="sm" 
                          className="edit-btn me-2"
                          onClick={() => openEdit(supplier)} 
                          disabled={loading}
                        >
                          <FaPen />
                        </Button>
                        <Button 
                          variant="danger"
                          size="sm" 
                          className="delete-btn"
                          onClick={() => handleDelete(supplier._id)} 
                          disabled={loading}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Supplier Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Add New Supplier</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <Form>
            <div className="row g-4">
              <div className="col-12">
                <Form.Group>
                  <div className="logo-upload-container">
                    <Form.Label className="form-label">Company Logo</Form.Label>
                    <div className="logo-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="d-none"
                        id="logo-upload"
                      />
                      <label htmlFor="logo-upload" className="logo-upload-label">
                        {form.logo ? (
                          <div className="logo-preview">
                            <img src={form.logo} alt="Logo preview" />
                            <Button
                              variant="link"
                              className="remove-logo"
                              onClick={(e) => {
                                e.preventDefault();
                                setForm({ ...form, logo: '' });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <div className="upload-icon">📷</div>
                            <p>Click to upload logo</p>
                            <span className="text-muted">Maximum file size: 5MB</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label">Name*</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplier name"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label">Email*</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplier email"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label">Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplier phone"
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="form-label">Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplier address"
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="form-label">Products</Form.Label>
                  <div className="product-categories-input">
                    <div className="mb-3">
                      <Form.Label>Supplements</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.supplements}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, supplements: e.target.value }
                        })}
                        placeholder="Enter supplements (comma separated)"
                      />
                    </div>
                    <div className="mb-3">
                      <Form.Label>Medicine</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.medicine}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, medicine: e.target.value }
                        })}
                        placeholder="Enter medicines (comma separated)"
                      />
                    </div>
                    <div className="mb-3">
                      <Form.Label>Cages</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.cages}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, cages: e.target.value }
                        })}
                        placeholder="Enter cages (comma separated)"
                      />
                    </div>
                    <div className="mb-3">
                      <Form.Label>Food</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.food}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, food: e.target.value }
                        })}
                        placeholder="Enter food items (comma separated)"
                      />
                    </div>
                    <div className="mb-3">
                      <Form.Label>Other Products</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.other}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, other: e.target.value }
                        })}
                        placeholder="Enter other products (comma separated)"
                      />
                    </div>
                  </div>
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button
            variant="light"
            onClick={() => setShowAdd(false)}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Adding...' : 'Add Supplier'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Update Supplier</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          <Form>
            <div className="row g-4">
              <div className="col-12">
                <Form.Group>
                  <div className="logo-upload-container">
                    <Form.Label className="form-label">Company Logo</Form.Label>
                    <div className="logo-upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="d-none"
                        id="logo-upload-edit"
                      />
                      <label htmlFor="logo-upload-edit" className="logo-upload-label">
                        {form.logo ? (
                          <div className="logo-preview">
                            <img src={form.logo} alt="Logo preview" />
                            <Button
                              variant="link"
                              className="remove-logo"
                              onClick={(e) => {
                                e.preventDefault();
                                setForm({ ...form, logo: '' });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="upload-placeholder">
                            <div className="upload-icon">📷</div>
                            <p>Click to upload logo</p>
                            <span className="text-muted">Maximum file size: 5MB</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label">Name*</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplier name"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label">Email*</Form.Label>
                  <Form.Control
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplier email"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="form-label">Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplier phone"
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="form-label">Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplier address"
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group>
                  <Form.Label className="form-label">Products</Form.Label>
                  <div className="product-categories-input">
                    <div className="mb-3">
                      <Form.Label>Supplements</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.supplements}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, supplements: e.target.value }
                        })}
                        placeholder="Enter supplements (comma separated)"
                      />
                    </div>
                    <div className="mb-3">
                      <Form.Label>Medicine</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.medicine}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, medicine: e.target.value }
                        })}
                        placeholder="Enter medicines (comma separated)"
                      />
                    </div>
                    <div className="mb-3">
                      <Form.Label>Cages</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.cages}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, cages: e.target.value }
                        })}
                        placeholder="Enter cages (comma separated)"
                      />
                    </div>
                    <div className="mb-3">
                      <Form.Label>Food</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.food}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, food: e.target.value }
                        })}
                        placeholder="Enter food items (comma separated)"
                      />
                    </div>
                    <div className="mb-3">
                      <Form.Label>Other Products</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={form.products.other}
                        onChange={(e) => setForm({
                          ...form,
                          products: { ...form.products, other: e.target.value }
                        })}
                        placeholder="Enter other products (comma separated)"
                      />
                    </div>
                  </div>
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button
            variant="light"
            onClick={() => setShowEdit(false)}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEdit}
            disabled={loading}
            className="submit-btn"
          >
            {loading ? 'Updating...' : 'Update Supplier'}
          </Button>
        </Modal.Footer>
      </Modal>

      <style>
        {`
          .suppliers-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding: 1rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          }

          .suppliers-header h2 {
            color: #1a1a1a;
            font-weight: 600;
            margin: 0;
            font-size: 1.75rem;
          }

          .action-buttons {
            display: flex;
            gap: 12px;
          }

          .add-supplier-btn {
            background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .add-supplier-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(13, 110, 253, 0.2);
            background: linear-gradient(135deg, #0a58ca 0%, #084298 100%);
          }

          .supplier-table {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }

          .supplier-table thead {
            background: #f8f9fa;
          }

          .supplier-table th {
            font-weight: 600;
            color: #2c3e50;
            padding: 1rem;
            border-bottom: 2px solid #dee2e6;
          }

          .supplier-table td {
            padding: 1rem;
            vertical-align: middle;
            border-bottom: 1px solid #dee2e6;
          }

          .supplier-table tbody tr:hover {
            background-color: #f8f9fa;
          }

          .inactive-row {
            background-color: #f8f9fa;
            opacity: 0.8;
          }

          .inactive-row:hover {
            opacity: 1;
          }

          .supplier-logo-container {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .supplier-logo {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .supplier-logo-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 8px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
            font-weight: 600;
            color: #6c757d;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .status-badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-weight: 500;
            display: inline-block;
          }

          .status-badge.active {
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
          }

          .status-badge.inactive {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
          }

          .action-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-start;
            align-items: center;
          }

          .status-toggle-btn {
            padding: 0.25rem 0.75rem;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 4px;
            min-width: 100px;
            justify-content: center;
            color: white;
          }

          .status-toggle-btn:hover {
            transform: translateY(-2px);
            opacity: 0.9;
          }

          .status-toggle-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          .edit-btn, .delete-btn {
            padding: 8px;
            border-radius: 8px;
            border: none;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            color: white;
          }

          .edit-btn:hover, .delete-btn:hover {
            transform: translateY(-2px);
            opacity: 0.9;
          }

          @media (max-width: 768px) {
            .action-buttons {
              flex-direction: column;
              align-items: stretch;
            }

            .status-toggle-btn {
              width: 100%;
              margin-bottom: 0.5rem;
            }
          }

          .download-btn {
            background: linear-gradient(135deg, #28a745 0%, #218838 100%);
            border: none;
            padding: 10px 20px;
            border-radius: 10px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
          }

          .download-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
            background: linear-gradient(135deg, #218838 0%, #1e7e34 100%);
            color: white;
          }

          .download-btn:disabled {
            background: #e9ecef;
            transform: none;
            box-shadow: none;
            cursor: not-allowed;
          }

          .download-btn svg {
            font-size: 1.1rem;
          }

          @media (max-width: 768px) {
            .action-buttons {
              flex-direction: column;
              width: 100%;
            }

            .download-btn {
              width: 100%;
              justify-content: center;
            }
          }

          .search-container {
            background: white;
            border-radius: 12px;
            padding: 1rem;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          }

          .search-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .search-icon {
            position: absolute;
            left: 1rem;
            color: #6c757d;
            font-size: 1.1rem;
          }

          .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            background-color: #f8f9fa;
          }

          .search-input:focus {
            outline: none;
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
            background-color: #fff;
          }

          .search-input::placeholder {
            color: #adb5bd;
          }

          .clear-search {
            position: absolute;
            right: 1rem;
            background: none;
            border: none;
            color: #6c757d;
            font-size: 1.25rem;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 50%;
            transition: all 0.2s ease;
          }

          .clear-search:hover {
            background-color: #e9ecef;
            color: #495057;
          }

          @media (max-width: 768px) {
            .search-container {
              padding: 0.75rem;
            }

            .search-input {
              font-size: 16px;
              padding: 0.625rem 1rem 0.625rem 2.25rem;
            }

            .search-icon {
              font-size: 1rem;
              left: 0.75rem;
            }

            .clear-search {
              right: 0.75rem;
            }
          }

          .supplier-count-card {
            background: white;
            border-radius: 15px;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
          }

          .supplier-count-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }

          .supplier-count-card.total {
            border-left: 5px solid #0d6efd;
          }

          .supplier-count-card.active {
            border-left: 5px solid #28a745;
          }

          .supplier-count-card.inactive {
            border-left: 5px solid #dc3545;
          }

          .count-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
          }

          .supplier-count-card.total .count-icon {
            background: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
          }

          .supplier-count-card.active .count-icon {
            background: rgba(40, 167, 69, 0.1);
            color: #28a745;
          }

          .supplier-count-card.inactive .count-icon {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
          }

          .count-info h3 {
            font-size: 1.75rem;
            font-weight: 600;
            margin: 0;
            color: #2c3e50;
          }

          .count-info p {
            margin: 0;
            color: #6c757d;
            font-size: 0.95rem;
          }

          @media (max-width: 768px) {
            .supplier-count-card {
              margin-bottom: 1rem;
            }
          }

          .product-category {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .product-tag {
            font-size: 0.875rem;
            color: #495057;
            display: block;
            line-height: 1.4;
          }

          .product-categories-input {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 12px;
          }

          .product-categories-input .form-label {
            font-size: 0.9rem;
            color: #6c757d;
            margin-bottom: 0.5rem;
          }

          .product-categories-input .form-control {
            font-size: 0.9rem;
          }

          @media (max-width: 768px) {
            .supplier-table {
              font-size: 0.875rem;
            }

            .product-tag {
              font-size: 0.8rem;
            }
          }
        `}
      </style>
    </div>
  );
}

export default SuppliersTable; 