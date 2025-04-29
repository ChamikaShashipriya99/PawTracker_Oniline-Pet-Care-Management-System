import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, InputGroup } from 'react-bootstrap';

function Store() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Store component loaded");
    // Use the same endpoint as admin panel
    axios.get('http://localhost:5000/api/inventory')
      .then(res => {
        console.log('Store API response:', res.data);
        setItems(res.data);
        setFilteredItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
        alert('Failed to load products');
      });
  }, []);

  // Search functionality
  useEffect(() => {
    const results = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
  }, [searchTerm, items]);

  if (loading) return (
    <div className="container mt-5">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mt-4">
      <h2>Our Products</h2>
      
      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-8 mx-auto">
          <InputGroup>
            <Form.Control
              placeholder="Search products by name, category or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2"
            />
            {searchTerm && (
              <button 
                className="btn btn-outline-secondary" 
                onClick={() => setSearchTerm('')}
              >
                Clear
              </button>
            )}
          </InputGroup>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="alert alert-info">No products found matching your search.</div>
      ) : (
        <div className="row">
          {filteredItems.map(item => (
            <div className="col-md-4 mb-4" key={item._id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{item.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">{item.category}</h6>
                  <p className="card-text">{item.description}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-primary fw-bold">Rs. {item.price.toFixed(2)}</span>
                    <span className={`badge ${item.quantity > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                <div className="card-footer bg-transparent">
                  <button 
                    className="btn btn-primary w-100" 
                    disabled={item.quantity === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Store;
