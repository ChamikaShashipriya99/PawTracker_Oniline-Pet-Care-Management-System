import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Store() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Store component loaded");
    // Use the same endpoint as admin panel
    axios.get('http://localhost:5000/api/inventory')
      .then(res => {
        console.log('Store API response:', res.data);
        setItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading products:', err);
        setLoading(false);
        alert('Failed to load products');
      });
  }, []);

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
      {items.length === 0 ? (
        <div className="alert alert-info">No products available at the moment.</div>
      ) : (
        <div className="row">
          {items.map(item => (
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
