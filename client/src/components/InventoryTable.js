import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import * as XLSX from 'xlsx';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const INVENTORY_ENDPOINT = `${API_URL}/inventory`;

function InventoryTable() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [current, setCurrent] = useState({});
  const [form, setForm] = useState({ name: '', category: '', description: '', quantity: 0, price: 0 });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  useEffect(() => {
    const results = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
  }, [searchTerm, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(INVENTORY_ENDPOINT);
      setItems(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.response?.data?.message || 'Failed to load inventory items. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // Basic validation
    if (!form.name || !form.category) {
      setError('Name and Category are required fields');
      return;
    }
    
    if (form.quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }

    if (form.price < 0) {
      setError('Price cannot be negative');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(INVENTORY_ENDPOINT, form);
      console.log('Server response:', response.data); // Debug log
      setShowAdd(false);
      setForm({ name: '', category: '', description: '', quantity: 0, price: 0 });
      await fetchItems();
    } catch (err) {
      console.error('Error adding item:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add item. Please try again.';
      setError(`Error: ${errorMessage}`);
      console.log('Full error object:', err); // Debug log
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      setLoading(true);
      setError(null);
      await axios.put(`${INVENTORY_ENDPOINT}/${current._id}`, form);
      setShowEdit(false);
      setForm({ name: '', category: '', description: '', quantity: 0, price: 0 });
      await fetchItems();
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.response?.data?.message || 'Failed to update item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        setLoading(true);
        setError(null);
        await axios.delete(`${INVENTORY_ENDPOINT}/${id}`);
        await fetchItems();
      } catch (err) {
        console.error('Error deleting item:', err);
        setError(err.response?.data?.message || 'Failed to delete item. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStock = async (item) => {
    const amount = parseInt(prompt('Enter stock amount to add:', '1'), 10);
    if (!isNaN(amount) && amount > 0) {
      try {
        setLoading(true);
        setError(null);
        await axios.post(`${INVENTORY_ENDPOINT}/${item._id}/stock`, { amount });
        await fetchItems();
      } catch (err) {
        console.error('Error updating stock:', err);
        setError(err.response?.data?.message || 'Failed to update stock. Please try again.');
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
      <h2>Inventory Management</h2>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Search Bar */}
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Search by name, category or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button 
            variant="outline-secondary" 
            onClick={() => setSearchTerm('')}
          >
            Clear
          </Button>
        )}
      </InputGroup>

      <div className="mb-3 d-flex gap-2">
        <Button onClick={() => setShowAdd(true)} disabled={loading}>
          Add Item
        </Button>
        <Button variant="success" onClick={handleDownload} disabled={loading}>
          Download Inventory
        </Button>
      </div>
      
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item, idx) => (
            <tr key={item._id}>
              <td>{idx + 1}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>
                <Button size="sm" variant="success" onClick={() => handleStock(item)} disabled={loading}>
                  Stock Entry
                </Button>{' '}
                <Button size="sm" variant="info" onClick={() => openEdit(item)} disabled={loading}>
                  Update
                </Button>{' '}
                <Button size="sm" variant="danger" onClick={() => handleDelete(item._id)} disabled={loading}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add Modal */}
      <Modal show={showAdd} onHide={() => !loading && setShowAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control 
                type="number" 
                value={form.quantity} 
                onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control 
                type="number" 
                value={form.price} 
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd} disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => !loading && setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control 
                value={form.category} 
                onChange={e => setForm({ ...form, category: e.target.value })}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control 
                type="number" 
                value={form.quantity} 
                onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                disabled={loading}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Price</Form.Label>
              <Form.Control 
                type="number" 
                value={form.price} 
                onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                disabled={loading}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="info" onClick={handleEdit} disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default InventoryTable;