import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';

function Store() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Store component loaded");
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

  useEffect(() => {
    const results = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(results);
  }, [searchTerm, items]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading-spinner"></div>
    </div>
  );

  return (
    <div className="container py-5">
      <div className="store-header text-center mb-5">
        <h1 className="display-4 mb-4">Pet Store</h1>
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="search-container">
              <InputGroup className="shadow-sm">
                <InputGroup.Text className="bg-white border-end-0">
                  <FiSearch className="text-primary" />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 search-input"
                  style={{
                    boxShadow: 'none',
                    borderLeft: 'none',
                    fontSize: '1rem',
                    padding: '0.75rem'
                  }}
                />
                {searchTerm && (
                  <InputGroup.Text 
                    className="bg-white border-start-0 cursor-pointer"
                    onClick={() => setSearchTerm('')}
                    style={{ cursor: 'pointer' }}
                  >
                    <FiX className="text-primary" />
                  </InputGroup.Text>
                )}
              </InputGroup>
            </div>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-5">
          <div className="empty-state">
            <div className="empty-state-icon mb-4">🔍</div>
            <h3>No products found</h3>
            <p className="text-muted">Try adjusting your search terms</p>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {filteredItems.map(item => (
            <div className="col-sm-6 col-md-4 col-lg-3" key={item._id}>
              <div 
                className="product-card h-100"
                onClick={() => navigate(`/product/${item._id}`)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                }}
              >
                <div 
                  className="product-image"
                  style={{
                    height: '200px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-100 h-100"
                      style={{ 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                      <span>No image available</span>
                    </div>
                  )}
                  <div 
                    className="stock-badge"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '500',
                      backgroundColor: item.quantity > 0 ? 'rgba(25, 135, 84, 0.9)' : 'rgba(220, 53, 69, 0.9)',
                      color: '#fff'
                    }}
                  >
                    {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
                <div className="p-3">
                  <h5 className="product-title mb-1" style={{ fontSize: '1.1rem' }}>{item.name}</h5>
                  <p className="category-badge mb-2" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    {item.category}
                  </p>
                  <p className="description mb-3" style={{ 
                    fontSize: '0.9rem',
                    color: '#6c757d',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.description}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="price" style={{ 
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: '#0d6efd'
                    }}>
                      Rs. {item.price.toFixed(2)}
                    </span>
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      disabled={item.quantity === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${item._id}`);
                      }}
                      style={{
                        borderRadius: '20px',
                        padding: '4px 15px',
                        fontSize: '0.9rem'
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>
        {`
          .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          }
          
          .product-card:hover img {
            transform: scale(1.05);
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #0d6efd;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .search-input:focus {
            box-shadow: none !important;
          }

          .empty-state-icon {
            font-size: 3rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .store-header {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 3rem 0;
            border-radius: 15px;
            margin-bottom: 2rem;
          }

          .search-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .category-badge {
            display: inline-block;
            padding: 2px 8px;
            background-color: #f8f9fa;
            border-radius: 12px;
            font-size: 0.8rem;
          }
        `}
      </style>
    </div>
  );
}

export default Store;
