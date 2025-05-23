import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, InputGroup, Tabs, Tab, Row, Col, Card } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import SuppliersTable from './SuppliersTable';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import config from '../config';
import { 
  BoxArrowUpRight, 
  Cart, 
  CurrencyDollar, 
  ExclamationTriangle, 
  XCircle,
  BarChart,
  ListCheck,
  ExclamationCircle
} from 'react-bootstrap-icons';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const INVENTORY_ENDPOINT = `${config.API_URL}/inventory`;

// Add function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Add axios interceptor for authentication
axios.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add axios interceptor for handling auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Define allowed categories for dropdown
const STORE_CATEGORIES = [
  'SUPPLEMENTS',
  'MEDICINE',
  'CAGES',
  'FOOD',
  'OTHER'
];

function InventoryTable() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState({});
  const [form, setForm] = useState({ name: '', category: '', description: '', quantity: 0, price: 0, image: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventoryStats, setInventoryStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    categoryDistribution: {}
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    const results = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
  }, [searchTerm, items]);

  useEffect(() => {
    if (items.length > 0) {
      const stats = {
        totalItems: items.length,
        totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        lowStockItems: items.filter(item => item.quantity < 5 && item.quantity > 0).length,
        outOfStockItems: items.filter(item => item.quantity === 0).length,
        categoryDistribution: items.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {})
      };
      setInventoryStats(stats);
    }
  }, [items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const res = await axios.get(INVENTORY_ENDPOINT);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to load inventory items. Please check if the server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // Full form validation
    const errors = {};
    // Name validation
    if (!form.name || form.name.trim().length === 0) {
      errors.name = 'Product name is required.';
    } else {
      if (/\d/.test(form.name)) errors.name = 'Product name cannot contain numbers.';
      else if (/[^a-zA-Z\s]/.test(form.name)) errors.name = 'Product name cannot contain special characters.';
      else if (form.name.length < 2 || form.name.length > 50) errors.name = 'Product name must be between 2 and 50 characters.';
    }
    // Category validation
    if (!form.category || !STORE_CATEGORIES.includes(form.category)) {
      errors.category = 'Please select a valid category.';
    }
    // Description validation
    if (!form.description || form.description.trim().length === 0) {
      errors.description = 'Description is required.';
    } else if (form.description.length < 5 || form.description.length > 500) {
      errors.description = 'Description must be between 5 and 500 characters.';
    }
    // Quantity validation
    if (form.quantity === undefined || form.quantity === null || form.quantity === '') {
      errors.quantity = 'Quantity is required.';
    } else if (!Number.isInteger(form.quantity) || form.quantity <= 0) {
      errors.quantity = 'Quantity must be a positive integer.';
    }
    // Price validation
    if (form.price === undefined || form.price === null || form.price === '') {
      errors.price = 'Price is required.';
    } else if (isNaN(form.price) || form.price <= 0) {
      errors.price = 'Price must be a positive number.';
    }
    // If there are errors, show them and do not submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setFormErrors({});
      const token = getAuthToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const response = await axios.post(INVENTORY_ENDPOINT, form);
      setShowAdd(false);
      setForm({ name: '', category: '', description: '', quantity: 0, price: 0, image: '' });
      await fetchItems();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to add item. Please try again.';
        setError(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    // Full form validation
    const errors = {};
    // Name validation
    if (!form.name || form.name.trim().length === 0) {
      errors.name = 'Product name is required.';
    } else {
      if (/\d/.test(form.name)) errors.name = 'Product name cannot contain numbers.';
      else if (/[^a-zA-Z\s]/.test(form.name)) errors.name = 'Product name cannot contain special characters.';
      else if (form.name.length < 2 || form.name.length > 50) errors.name = 'Product name must be between 2 and 50 characters.';
    }
    // Category validation
    if (!form.category || !STORE_CATEGORIES.includes(form.category)) {
      errors.category = 'Please select a valid category.';
    }
    // Description validation
    if (!form.description || form.description.trim().length === 0) {
      errors.description = 'Description is required.';
    } else if (form.description.length < 5 || form.description.length > 500) {
      errors.description = 'Description must be between 5 and 500 characters.';
    }
    // Quantity validation
    if (form.quantity === undefined || form.quantity === null || form.quantity === '') {
      errors.quantity = 'Quantity is required.';
    } else if (!Number.isInteger(form.quantity) || form.quantity < 0) {
      errors.quantity = 'Quantity must be a non-negative integer.';
    }
    // Price validation
    if (form.price === undefined || form.price === null || form.price === '') {
      errors.price = 'Price is required.';
    } else if (isNaN(form.price) || form.price < 0) {
      errors.price = 'Price must be a non-negative number.';
    }
    // If there are errors, show them and do not submit
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFormErrors({});
      const token = getAuthToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }
      await axios.put(`${INVENTORY_ENDPOINT}/${current._id}`, form);
      setShowEdit(false);
      setForm({ name: '', category: '', description: '', quantity: 0, price: 0, image: '' });
      await fetchItems();
    } catch (err) {
      console.error('Error updating item:', err);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please login again.');
      } else {
        setError(err.response?.data?.message || 'Failed to update item. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        if (!token) {
          window.location.href = '/login';
          return;
        }
        await axios.delete(`${INVENTORY_ENDPOINT}/${id}`);
        await fetchItems();
      } catch (err) {
        console.error('Error deleting item:', err);
        if (err.response?.status === 401) {
          setError('Your session has expired. Please login again.');
        } else {
          setError(err.response?.data?.message || 'Failed to delete item. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const openEdit = (item) => {
    setCurrent(item);
    setForm(item);
    setShowEdit(true);
  };

  const handleDownload = () => {
    // Create worksheet from items data
    const worksheet = XLSX.utils.json_to_sheet(items.map(item => ({
      ID: item._id,
      Name: item.name,
      Category: item.category,
      Description: item.description,
      Quantity: item.quantity,
      Price: `$${item.price.toFixed(2)}`
    })));

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

    // Generate and download Excel file
    XLSX.writeFile(workbook, 'inventory_data.xlsx');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Inventory Report', 14, 15);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Add summary statistics
    doc.setFontSize(14);
    doc.text('Summary Statistics', 14, 35);
    doc.setFontSize(12);
    doc.text(`Total Items: ${inventoryStats.totalItems}`, 20, 45);
    doc.text(`Total Value: Rs. ${inventoryStats.totalValue.toFixed(2)}`, 20, 52);
    doc.text(`Low Stock Items: ${inventoryStats.lowStockItems}`, 20, 59);
    doc.text(`Out of Stock Items: ${inventoryStats.outOfStockItems}`, 20, 66);
    
    // Add low stock items table
    doc.setFontSize(14);
    doc.text('Low Stock Items', 14, 80);
    const lowStockData = items
      .filter(item => item.quantity < 5 && item.quantity > 0)
      .map(item => [item.name, item.category, item.quantity.toString()]);
    
    autoTable(doc, {
      head: [['Name', 'Category', 'Quantity']],
      body: lowStockData,
      startY: 85,
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [255, 193, 7],
        textColor: 0,
        fontSize: 11,
        fontStyle: 'bold'
      }
    });
    
    // Add out of stock items table
    const lastY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Out of Stock Items', 14, lastY);
    const outOfStockData = items
      .filter(item => item.quantity === 0)
      .map(item => [item.name, item.category, `Rs. ${item.price.toFixed(2)}`]);
    
    autoTable(doc, {
      head: [['Name', 'Category', 'Last Price']],
      body: outOfStockData,
      startY: lastY + 5,
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [220, 53, 69],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      }
    });
    
    // Save the PDF
    doc.save('inventory_report.pdf');
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file);
        setForm({ ...form, image: compressedImage });
      } catch (error) {
        console.error('Error compressing image:', error);
        setError('Error processing image. Please try again.');
      }
    }
  };

  const getChartData = () => {
    const categoryData = {
      labels: Object.keys(inventoryStats.categoryDistribution),
      datasets: [{
        data: Object.values(inventoryStats.categoryDistribution),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 1
      }]
    };

    const stockStatusData = {
      labels: ['In Stock', 'Low Stock', 'Out of Stock'],
      datasets: [{
        label: 'Number of Items',
        data: [
          inventoryStats.totalItems - inventoryStats.lowStockItems - inventoryStats.outOfStockItems,
          inventoryStats.lowStockItems,
          inventoryStats.outOfStockItems
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    };

    return { categoryData, stockStatusData };
  };

  if (loading) {
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
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="inventory" title="Inventory">
          <div className="inventory-header mb-4">
            <h2 className="mb-4">Inventory Management</h2>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="search-section mb-4">
            <InputGroup className="search-container">
              <Form.Control
                placeholder="Search by name, category or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setSearchTerm('')}
                  className="clear-search"
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </div>

          <div className="action-buttons mb-4">
            <Button 
              onClick={() => setShowAdd(true)} 
              disabled={loading}
              className="add-item-btn me-2"
            >
              Add Item
            </Button>
            <Button 
              variant="success" 
              onClick={handleDownload} 
              disabled={loading}
              className="download-btn"
            >
              Download Inventory
            </Button>
            <Button onClick={handleDownloadPDF} className="download-btn" style={{ background: '#d9534f', border: 'none', marginLeft: '10px' }}>
              Download PDF
            </Button>
          </div>
          
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, idx) => (
                <tr key={item._id}>
                  <td>{idx + 1}</td>
                  <td>
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="table-image"
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {item.price.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${item.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-cell">
                      <Button size="sm" variant="info" onClick={() => openEdit(item)} disabled={loading}>
                        Update
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(item._id)} disabled={loading}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Add Modal */}
          <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered>
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="fw-bold">Add New Item</Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 py-4">
              <Form>
                <div className="image-upload-section mb-4">
                  <Form.Group>
                    <div className="upload-container">
                      <Form.Label className="upload-label">
                        Product Image
                      </Form.Label>
                      <div className="upload-area">
                        <Form.Control 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={loading}
                          className="upload-input"
                        />
                        {!form.image && (
                          <div className="upload-placeholder">
                            <div className="upload-icon">📷</div>
                            <p>Click to upload or drag and drop</p>
                            <span className="text-muted">Maximum file size: 5MB</span>
                          </div>
                        )}
                        {form.image && (
                          <div className="image-preview">
                            <img 
                              src={form.image} 
                              alt="Preview" 
                              className="preview-image"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Form.Group>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>Name</Form.Label>
                      <Form.Control 
                        value={form.name} 
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        disabled={loading}
                        className="form-input"
                        placeholder="Enter product name"
                      />
                      {formErrors.name && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.name}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        as="select"
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        disabled={loading}
                        className="form-input"
                        required
                      >
                        <option value="">Select Category</option>
                        {STORE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Control>
                      {formErrors.category && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.category}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-12">
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control 
                        as="textarea"
                        rows={3}
                        value={form.description} 
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        disabled={loading}
                        className="form-input"
                        placeholder="Enter product description"
                      />
                      {formErrors.description && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.description}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={form.quantity} 
                        onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                        disabled={loading}
                        className="form-input"
                        placeholder="Enter quantity"
                        min="0"
                      />
                      {formErrors.quantity && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.quantity}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>Price (Rs.)</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={form.price} 
                        onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                        disabled={loading}
                        className="form-input"
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                      />
                      {formErrors.price && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.price}</div>}
                    </Form.Group>
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 px-4 pb-4">
              <Button 
                variant="light" 
                onClick={() => setShowAdd(false)} 
                disabled={loading}
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
                {loading ? 'Adding...' : 'Add Product'}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Edit Modal */}
          <Modal show={showEdit} onHide={() => !loading && setShowEdit(false)} size="lg" centered>
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="fw-bold">Update Item</Modal.Title>
            </Modal.Header>
            <Modal.Body className="px-4 py-4">
              <Form>
                <div className="image-upload-section mb-4">
                  <Form.Group>
                    <div className="upload-container">
                      <Form.Label className="upload-label">
                        Product Image
                      </Form.Label>
                      <div className="upload-area">
                        <Form.Control 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={loading}
                          className="upload-input"
                        />
                        {!form.image && (
                          <div className="upload-placeholder">
                            <div className="upload-icon">📷</div>
                            <p>Click to upload or drag and drop</p>
                            <span className="text-muted">Maximum file size: 5MB</span>
                          </div>
                        )}
                        {form.image && (
                          <div className="image-preview">
                            <img 
                              src={form.image} 
                              alt="Preview" 
                              className="preview-image"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </Form.Group>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="form-label">Name</Form.Label>
                      <Form.Control 
                        value={form.name} 
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        disabled={loading}
                        className="form-input"
                        placeholder="Enter product name"
                      />
                      {formErrors.name && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.name}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="form-label">Category</Form.Label>
                      <Form.Control
                        as="select"
                        value={form.category}
                        onChange={e => setForm({ ...form, category: e.target.value })}
                        disabled={loading}
                        className="form-input"
                        required
                      >
                        <option value="">Select Category</option>
                        {STORE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </Form.Control>
                      {formErrors.category && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.category}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-12">
                    <Form.Group>
                      <Form.Label className="form-label">Description</Form.Label>
                      <Form.Control 
                        as="textarea"
                        rows={3}
                        value={form.description} 
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        disabled={loading}
                        className="form-input"
                        placeholder="Enter product description"
                      />
                      {formErrors.description && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.description}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="form-label">Quantity</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={form.quantity} 
                        onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                        disabled={loading}
                        className="form-input"
                        placeholder="Enter quantity"
                        min="0"
                      />
                      {formErrors.quantity && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.quantity}</div>}
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="form-label">Price (Rs.)</Form.Label>
                      <Form.Control 
                        type="number" 
                        value={form.price} 
                        onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                        disabled={loading}
                        className="form-input"
                        placeholder="Enter price"
                        min="0"
                        step="0.01"
                      />
                      {formErrors.price && <div style={{ color: 'red', fontSize: '0.9em' }}>{formErrors.price}</div>}
                    </Form.Group>
                  </div>
                </div>
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0 px-4 pb-4">
              <Button 
                variant="light" 
                onClick={() => setShowEdit(false)} 
                disabled={loading}
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
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
            </Modal.Footer>
          </Modal>
        </Tab>
        <Tab eventKey="suppliers" title="Suppliers">
          <SuppliersTable />
        </Tab>
        <Tab eventKey="report" title="Inventory Report">
          <div className="inventory-report p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="text-primary mb-0">
                <BarChart className="me-2" />
                Inventory Report
              </h2>
              <Button 
                variant="primary" 
                onClick={handleDownloadPDF}
                className="download-report-btn"
              >
                <BoxArrowUpRight className="me-2" />
                Download Report
              </Button>
            </div>
            
            <Row className="mb-4 g-4">
              <Col md={3}>
                <div className="stat-card bg-primary text-white p-4 rounded-3 shadow-sm">
                  <div className="d-flex align-items-center mb-2">
                    <Cart size={24} className="me-2" />
                    <h5 className="mb-0">Total Items</h5>
                  </div>
                  <h2 className="mb-0">{inventoryStats.totalItems}</h2>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-card bg-success text-white p-4 rounded-3 shadow-sm">
                  <div className="d-flex align-items-center mb-2">
                    <CurrencyDollar size={24} className="me-2" />
                    <h5 className="mb-0">Total Value</h5>
                  </div>
                  <h2 className="mb-0">Rs. {inventoryStats.totalValue.toFixed(2)}</h2>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-card bg-warning text-white p-4 rounded-3 shadow-sm">
                  <div className="d-flex align-items-center mb-2">
                    <ExclamationTriangle size={24} className="me-2" />
                    <h5 className="mb-0">Low Stock Items</h5>
                  </div>
                  <h2 className="mb-0">{inventoryStats.lowStockItems}</h2>
                </div>
              </Col>
              <Col md={3}>
                <div className="stat-card bg-danger text-white p-4 rounded-3 shadow-sm">
                  <div className="d-flex align-items-center mb-2">
                    <XCircle size={24} className="me-2" />
                    <h5 className="mb-0">Out of Stock</h5>
                  </div>
                  <h2 className="mb-0">{inventoryStats.outOfStockItems}</h2>
                </div>
              </Col>
            </Row>

            <Row className="mb-4 g-4">
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h5 className="card-title text-primary mb-3">
                      <BoxArrowUpRight className="me-2" />
                      Category Distribution
                    </h5>
                    <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                      <Pie 
                        data={getChartData().categoryData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h5 className="card-title text-warning mb-3">
                      <ExclamationCircle className="me-2" />
                      Stock Status Overview
                    </h5>
                    <div className="chart-container" style={{ position: 'relative', height: '300px' }}>
                      <Bar 
                        data={getChartData().stockStatusData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mb-4 g-4">
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h5 className="card-title text-warning mb-3">
                      <ExclamationCircle className="me-2" />
                      Low Stock Items
                    </h5>
                    <Table striped bordered hover responsive>
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items
                          .filter(item => item.quantity < 5 && item.quantity > 0)
                          .map(item => (
                            <tr key={item._id}>
                              <td>{item.name}</td>
                              <td>{item.category}</td>
                              <td className="text-warning fw-bold">{item.quantity}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Body>
                    <h5 className="card-title text-danger mb-3">
                      <ListCheck className="me-2" />
                      Out of Stock Items
                    </h5>
                    <Table striped bordered hover responsive>
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Last Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items
                          .filter(item => item.quantity === 0)
                          .map(item => (
                            <tr key={item._id}>
                              <td>{item.name}</td>
                              <td>{item.category}</td>
                              <td>Rs. {item.price.toFixed(2)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Tab>
      </Tabs>

      <style>
        {`
          .inventory-header h2 {
            color: #2c3e50;
            font-weight: 600;
          }

          .search-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .search-input {
            border-radius: 8px;
            padding: 12px;
            font-size: 1rem;
            border: 1px solid #dee2e6;
          }

          .search-input:focus {
            box-shadow: none;
            border-color: #0d6efd;
          }

          .clear-search {
            border-radius: 8px;
            margin-left: 10px;
          }

          .action-buttons {
            display: flex;
            gap: 10px;
          }

          .add-item-btn, .download-btn {
            border-radius: 8px;
            padding: 8px 16px;
            font-weight: 500;
          }

          .upload-container {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
          }

          .upload-container:hover {
            border-color: #0d6efd;
          }

          .upload-label {
            font-weight: 500;
            margin-bottom: 1rem;
          }

          .upload-area {
            position: relative;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .upload-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
          }

          .upload-placeholder {
            text-align: center;
          }

          .upload-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #6c757d;
          }

          .image-preview {
            width: 100%;
            height: 200px;
            overflow: hidden;
            border-radius: 8px;
          }

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .form-input {
            border-radius: 8px;
            padding: 10px;
            border: 1px solid #dee2e6;
            transition: all 0.3s ease;
          }

          .form-input:focus {
            box-shadow: none;
            border-color: #0d6efd;
          }

          .cancel-btn {
            border-radius: 8px;
            padding: 8px 20px;
          }

          .submit-btn {
            border-radius: 8px;
            padding: 8px 20px;
            font-weight: 500;
          }

          .table-image {
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 6px;
          }

          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
          }

          .status-badge.in-stock {
            background-color: rgba(25, 135, 84, 0.1);
            color: #198754;
          }

          .status-badge.out-of-stock {
            background-color: rgba(220, 53, 69, 0.1);
            color: #dc3545;
          }

          .action-buttons-cell {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
          }

          .action-buttons-cell .btn {
            padding: 4px 8px;
            font-size: 0.85rem;
            border-radius: 6px;
          }

          /* Make the table more responsive */
          .table {
            width: 100%;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }

          .table thead th {
            background-color: #f8f9fa;
            border-bottom: 2px solid #dee2e6;
            padding: 12px;
            font-weight: 600;
            color: #495057;
          }

          .table tbody td {
            padding: 12px;
            vertical-align: middle;
          }

          .table tbody tr:hover {
            background-color: #f8f9fa;
          }

          @media (max-width: 768px) {
            .action-buttons-cell {
              flex-direction: column;
              gap: 4px;
            }

            .action-buttons-cell .btn {
              width: 100%;
            }
          }

          .nav-tabs {
            border-bottom: 2px solid #dee2e6;
            margin-bottom: 2rem;
          }

          .nav-tabs .nav-link {
            border: none;
            color: #6c757d;
            font-weight: 500;
            padding: 1rem 1.5rem;
            margin-right: 1rem;
            transition: all 0.3s ease;
          }

          .nav-tabs .nav-link:hover {
            border: none;
            color: #0d6efd;
          }

          .nav-tabs .nav-link.active {
            border: none;
            color: #0d6efd;
            border-bottom: 2px solid #0d6efd;
          }

          /* Form Styles */
          .modal-content {
            border-radius: 12px;
            border: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }

          .modal-header {
            padding: 1.5rem 1.5rem 1rem;
          }

          .modal-header .modal-title {
            color: #2c3e50;
            font-size: 1.5rem;
          }

          .form-label {
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 0.5rem;
          }

          .form-input {
            border-radius: 8px;
            padding: 0.75rem 1rem;
            border: 1px solid #dee2e6;
            transition: all 0.3s ease;
            font-size: 1rem;
          }

          .form-input:focus {
            border-color: #0d6efd;
            box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.15);
          }

          .form-input:disabled {
            background-color: #f8f9fa;
            cursor: not-allowed;
          }

          .upload-container {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            transition: all 0.3s ease;
          }

          .upload-container:hover {
            border-color: #0d6efd;
          }

          .upload-label {
            font-weight: 500;
            color: #2c3e50;
            margin-bottom: 1rem;
          }

          .upload-area {
            position: relative;
            min-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .upload-input {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
          }

          .upload-placeholder {
            text-align: center;
          }

          .upload-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            color: #6c757d;
          }

          .image-preview {
            width: 100%;
            height: 200px;
            overflow: hidden;
            border-radius: 8px;
          }

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .cancel-btn {
            border-radius: 8px;
            padding: 0.5rem 1.5rem;
            font-weight: 500;
            border: 1px solid #dee2e6;
          }

          .submit-btn {
            border-radius: 8px;
            padding: 0.5rem 1.5rem;
            font-weight: 500;
          }

          .cancel-btn:hover {
            background-color: #f8f9fa;
          }

          .submit-btn:hover {
            transform: translateY(-1px);
          }

          textarea.form-input {
            resize: vertical;
            min-height: 100px;
          }

          /* Responsive adjustments */
          @media (max-width: 768px) {
            .modal-body {
              padding: 1rem;
            }

            .row {
              margin: 0;
            }

            .col-md-6 {
              padding: 0;
            }

            .upload-area {
              min-height: 150px;
            }
          }

          .inventory-report {
            background-color: #f8f9fa;
            border-radius: 10px;
          }

          .stat-card {
            transition: transform 0.2s ease-in-out;
          }

          .stat-card:hover {
            transform: translateY(-5px);
          }

          .stat-card h5 {
            font-size: 1rem;
            font-weight: 500;
          }

          .stat-card h2 {
            font-size: 1.8rem;
            font-weight: 600;
          }

          .card {
            border: none;
            border-radius: 10px;
          }

          .card-title {
            font-weight: 600;
          }

          .table {
            margin-bottom: 0;
          }

          .table thead th {
            font-weight: 600;
          }

          @media (max-width: 768px) {
            .stat-card {
              margin-bottom: 1rem;
            }

            .stat-card h2 {
              font-size: 1.5rem;
            }
          }

          .chart-container {
            background: white;
            border-radius: 8px;
            padding: 1rem;
          }

          .chart-container canvas {
            max-width: 100%;
          }

          .download-report-btn {
            border-radius: 8px;
            padding: 8px 16px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
          }

          .download-report-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
          }
        `}
      </style>
      <br></br>
      <br></br>
    </div>  
    );
}

export default InventoryTable;