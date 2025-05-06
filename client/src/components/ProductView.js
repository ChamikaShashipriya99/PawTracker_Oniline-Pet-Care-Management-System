import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import config from '../config';

function ProductView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/inventory/${id}`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    try {
      // Get cart data from localStorage
      const cartData = localStorage.getItem('cart');
      let cart;
      
      // If cart data exists, parse it
      if (cartData) {
        cart = JSON.parse(cartData);
        // If parsing failed or result is not an array, initialize as empty array
        if (!Array.isArray(cart)) {
          cart = [];
        }
      } else {
        // If no cart data, initialize as empty array
        cart = [];
      }

      const existing = cart.find(item => item._id === product._id);
      
      if (existing) {
        existing.cartQuantity = (existing.cartQuantity || 0) + quantity;
        Object.assign(existing, product);
      } else {
        cart.push({ ...product, cartQuantity: quantity });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      navigate('/cart');
    } catch (error) {
      console.error('Error processing cart:', error);
      // If any error occurs, initialize cart as empty array
      const cart = [];
      cart.push({ ...product, cartQuantity: quantity });
      localStorage.setItem('cart', JSON.stringify(cart));
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <Container className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="loading-spinner"></div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-5">
        <div className="error-container text-center">
          <div className="error-icon mb-4">❌</div>
          <h3 className="mb-4">{error || 'Product not found'}</h3>
          <Button 
            variant="primary" 
            onClick={() => navigate('/store')}
            className="rounded-pill px-4 py-2"
          >
            Back to Store
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="product-detail-card">
        <Row className="g-0">
          <Col md={6}>
            <div className="product-image-container">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
              ) : (
                <div className="no-image-placeholder">
                  <span>No image available</span>
                </div>
              )}
            </div>
          </Col>
          <Col md={6}>
            <div className="product-info p-4 p-md-5">
              <div className="mb-4">
                <span className="category-badge">{product.category}</span>
                <h1 className="product-title mt-2">{product.name}</h1>
                <div className="stock-status mt-2">
                  <span className={`stock-badge ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="product-price mb-4">
                <h2>Rs. {product.price.toFixed(2)}</h2>
              </div>

              <div className="product-description mb-4">
                <h5>Description</h5>
                <p>{product.description}</p>
              </div>

              {product.quantity > 0 && (
                <div className="quantity-selector mb-4">
                  <Form.Group>
                    <Form.Label>Quantity</Form.Label>
                    <div className="d-flex align-items-center">
                      <Form.Control
                        type="number"
                        min="1"
                        max={product.quantity}
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="quantity-input"
                      />
                      <span className="ms-3 text-muted">
                        Available: {product.quantity}
                      </span>
                    </div>
                  </Form.Group>
                </div>
              )}

              <div className="action-buttons">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.quantity}
                  className="add-to-cart-btn me-3"
                >
                  Add to Cart
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => navigate('/store')}
                  className="back-btn"
                >
                  Back to Store
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style>
        {`
          .product-detail-card {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }

          .product-image-container {
            height: 100%;
            min-height: 400px;
            background-color: #f8f9fa;
            position: relative;
          }

          .product-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .no-image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8f9fa;
            color: #6c757d;
            min-height: 400px;
          }

          .category-badge {
            background-color: #e9ecef;
            color: #495057;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            display: inline-block;
          }

          .product-title {
            font-size: 2rem;
            font-weight: 600;
            color: #212529;
            margin-top: 0.5rem;
          }

          .stock-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
          }

          .stock-badge.in-stock {
            background-color: rgba(25, 135, 84, 0.1);
            color: #198754;
          }

          .stock-badge.out-of-stock {
            background-color: rgba(220, 53, 69, 0.1);
            color: #dc3545;
          }

          .product-price h2 {
            color: #0d6efd;
            font-weight: 600;
          }

          .product-description {
            color: #6c757d;
            line-height: 1.6;
          }

          .quantity-input {
            max-width: 100px;
            border-radius: 8px;
          }

          .add-to-cart-btn {
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: 500;
          }

          .back-btn {
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: 500;
          }

          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #0d6efd;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          .error-icon {
            font-size: 3rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 768px) {
            .product-image-container {
              min-height: 300px;
            }

            .product-info {
              padding: 2rem !important;
            }

            .product-title {
              font-size: 1.5rem;
            }
          }
        `}
      </style>
    </Container>
  );
}

export default ProductView;