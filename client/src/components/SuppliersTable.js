import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaBox, FaPen, FaTrash, FaDownload, FaSearch } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SUPPLIERS_ENDPOINT = `${API_URL}/suppliers`;

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
    products: '',
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
    // Clear previous error
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
      console.log('Sending supplier data with logo:', form.logo ? 'Logo present' : 'No logo');
      const response = await axios.post(SUPPLIERS_ENDPOINT, form);
      
      console.log('Server response:', response.data);
      setShowAdd(false);
      setForm({ name: '', email: '', phone: '', address: '', products: '', logo: '' });
      await fetchSuppliers();
    } catch (err) {
      console.error('Error adding supplier:', err);
      setError(
        err.response?.data?.message || 
        'Failed to add supplier. Please check your input and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    // Clear previous error
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
      await axios.put(`${SUPPLIERS_ENDPOINT}/${current._id}`, {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        products: form.products.trim()
      });
      
      setShowEdit(false);
      setForm({ name: '', email: '', phone: '', address: '', products: '', logo: '' });
      await fetchSuppliers();
      
      // Show success message (you can add a success toast here if you want)
    } catch (err) {
      console.error('Error updating supplier:', err);
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
        Products: supplier.products || 'N/A'
      }));

      // Convert to CSV
      const headers = ['Name', 'Email', 'Phone', 'Address', 'Products'];
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

  const filteredSuppliers = suppliers.filter(supplier => {
    const searchLower = searchQuery.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(searchLower) ||
      supplier.email.toLowerCase().includes(searchLower) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchLower)) ||
      (supplier.address && supplier.address.toLowerCase().includes(searchLower)) ||
      (supplier.products && supplier.products.toLowerCase().includes(searchLower))
    );
  });

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
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredSuppliers.map((supplier) => {
            console.log('Rendering supplier:', supplier.name, 'Logo:', supplier.logo ? 'Present' : 'None');
            return (
              <Col key={supplier._id}>
                <Card className="supplier-card h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        {supplier.logo && supplier.logo.length > 0 ? (
                          <div className="supplier-logo-container me-3">
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
                          <div className="supplier-logo-placeholder me-3">
                            {supplier.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <Card.Title className="supplier-name mb-0">{supplier.name}</Card.Title>
                      </div>
                      <div className="action-buttons">
                        <Button 
                          variant="light"
                          size="sm" 
                          className="edit-btn me-2"
                          onClick={() => openEdit(supplier)} 
                          disabled={loading}
                        >
                          <FaPen />
                        </Button>
                        <Button 
                          variant="light"
                          size="sm" 
                          className="delete-btn"
                          onClick={() => handleDelete(supplier._id)} 
                          disabled={loading}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>

                    <div className="supplier-details">
                      <div className="detail-item">
                        <FaEnvelope className="detail-icon" />
                        <span className="detail-text">{supplier.email}</span>
                      </div>
                      {supplier.phone && (
                        <div className="detail-item">
                          <FaPhone className="detail-icon" />
                          <span className="detail-text">{supplier.phone}</span>
                        </div>
                      )}
                      {supplier.address && (
                        <div className="detail-item">
                          <FaMapMarkerAlt className="detail-icon" />
                          <span className="detail-text">{supplier.address}</span>
                        </div>
                      )}
                      {supplier.products && (
                        <div className="detail-item">
                          <FaBox className="detail-icon" />
                          <span className="detail-text">{supplier.products}</span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
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
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.products}
                    onChange={(e) => setForm({ ...form, products: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplied products (comma separated)"
                  />
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
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.products}
                    onChange={(e) => setForm({ ...form, products: e.target.value })}
                    className="form-input"
                    placeholder="Enter supplied products (comma separated)"
                  />
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

          .supplier-card {
            background: white;
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            transition: all 0.3s ease;
            overflow: hidden;
          }

          .supplier-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          }

          .supplier-card .card-body {
            padding: 1.5rem;
          }

          .supplier-logo-container {
            width: 64px;
            height: 64px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .supplier-logo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .supplier-logo:hover {
            transform: scale(1.05);
          }

          .supplier-logo-placeholder {
            width: 64px;
            height: 64px;
            border-radius: 12px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            font-weight: 600;
            color: #6c757d;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .supplier-name {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
          }

          .supplier-details {
            margin-top: 1.5rem;
            display: grid;
            gap: 1rem;
          }

          .detail-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 10px;
            transition: all 0.3s ease;
          }

          .detail-item:hover {
            background: #e9ecef;
            transform: translateX(5px);
          }

          .detail-icon {
            color: #0d6efd;
            font-size: 1.1rem;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(13, 110, 253, 0.1);
            border-radius: 8px;
            padding: 4px;
          }

          .detail-text {
            color: #495057;
            font-size: 0.95rem;
            font-weight: 500;
          }

          .action-buttons {
            display: flex;
            gap: 8px;
          }

          .edit-btn, .delete-btn {
            padding: 8px;
            border-radius: 10px;
            border: none;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
          }

          .edit-btn {
            background: rgba(13, 110, 253, 0.1);
            color: #0d6efd;
          }

          .delete-btn {
            background: rgba(220, 53, 69, 0.1);
            color: #dc3545;
          }

          .edit-btn:hover {
            background: #0d6efd;
            color: white;
            transform: translateY(-2px);
          }

          .delete-btn:hover {
            background: #dc3545;
            color: white;
            transform: translateY(-2px);
          }

          /* Modal Styles */
          .modal-content {
            border: none;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }

          .modal-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .modal-title {
            font-size: 1.5rem;
            color: #2c3e50;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .form-label {
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
          }

          .form-label::after {
            content: "*";
            color: #dc3545;
            margin-left: 4px;
          }

          .form-label:not([for="phone"]):not([for="address"]):not([for="products"])::after {
            display: none;
          }

          .form-input {
            border-radius: 10px;
            padding: 0.75rem 1rem;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
            font-size: 0.95rem;
            background-color: #f8f9fa;
          }

          .form-input:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
            background-color: #fff;
          }

          .form-input::placeholder {
            color: #adb5bd;
          }

          textarea.form-input {
            resize: vertical;
            min-height: 100px;
          }

          /* Logo Upload Styles */
          .logo-upload-container {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.3s ease;
          }

          .logo-upload-container:hover {
            border-color: #0d6efd;
            background: rgba(13, 110, 253, 0.05);
          }

          .logo-upload-area {
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .upload-placeholder {
            text-align: center;
            padding: 2rem;
          }

          .upload-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #6c757d;
          }

          .upload-placeholder p {
            margin-bottom: 0.5rem;
            color: #495057;
            font-weight: 500;
          }

          .upload-placeholder .text-muted {
            font-size: 0.875rem;
          }

          .logo-preview {
            position: relative;
            width: 100%;
            max-width: 200px;
            margin: 0 auto;
          }

          .logo-preview img {
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }

          .remove-logo {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255,255,255,0.9);
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 0.875rem;
            color: #dc3545;
            border: none;
            transition: all 0.3s ease;
          }

          .remove-logo:hover {
            background: #dc3545;
            color: white;
          }

          .modal-footer {
            padding: 1rem 1.5rem 1.5rem;
          }

          .cancel-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: 500;
            background: #f8f9fa;
            border: none;
            color: #495057;
            transition: all 0.3s ease;
          }

          .cancel-btn:hover {
            background: #e9ecef;
            transform: translateY(-2px);
          }

          .submit-btn {
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: 500;
            background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
            border: none;
            transition: all 0.3s ease;
          }

          .submit-btn:hover {
            background: linear-gradient(135deg, #0a58ca 0%, #084298 100%);
            transform: translateY(-2px);
          }

          .submit-btn:disabled {
            background: #e9ecef;
            transform: none;
          }

          /* Responsive Form Adjustments */
          @media (max-width: 768px) {
            .modal-body {
              padding: 1rem;
            }

            .form-input {
              font-size: 16px;
            }

            .logo-upload-area {
              min-height: 150px;
            }

            .upload-icon {
              font-size: 2rem;
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
        `}
      </style>
    </div>
  );
}

export default SuppliersTable; 