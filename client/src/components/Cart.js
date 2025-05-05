import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(storedCart);
  }, []);

  const handleRemove = (id) => {
    const updatedCart = cart.filter(item => item._id !== id);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * (item.cartQuantity || 1), 0);
  };

  const handleCheckout = () => {
    localStorage.setItem('checkoutAmount', getTotal().toFixed(2));
    localStorage.setItem('checkoutPurpose', 'store_purchase');
    navigate('/payment-checkout');
  };

  if (cart.length === 0) {
    return (
      <Container className="py-5">
        <div className="text-center empty-cart">
          <div className="empty-cart-icon mb-4">🛒</div>
          <h2 className="mb-4">Your Cart is Empty</h2>
          <p className="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/store')}
            className="rounded-pill px-4 py-2"
          >
            Continue Shopping
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="cart-container">
        <div className="cart-header mb-4">
          <h2>Your Shopping Cart</h2>
          <p className="text-muted">{cart.length} {cart.length === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="cart-items-container">
          {cart.map((item) => (
            <div key={item._id} className="cart-item">
              <div className="cart-item-image">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="product-image"
                  />
                ) : (
                  <div className="no-image-placeholder">
                    <span>No image</span>
                  </div>
                )}
              </div>
              <div className="cart-item-details">
                <h5 className="item-name">{item.name}</h5>
                <span className="category-badge">{item.category}</span>
                <div className="quantity-price mt-2">
                  <span className="quantity">Qty: {item.cartQuantity || 1}</span>
                  <span className="price">Rs. {item.price.toFixed(2)}</span>
                </div>
                <div className="subtotal mt-2">
                  Subtotal: <span className="fw-bold">Rs. {(item.price * (item.cartQuantity || 1)).toFixed(2)}</span>
                </div>
              </div>
              <div className="cart-item-actions">
                <Button 
                  variant="link" 
                  className="remove-btn"
                  onClick={() => handleRemove(item._id)}
                >
                  ✕
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-details">
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Subtotal</span>
              <span>Rs. {getTotal().toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Shipping</span>
              <span>Free</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold">Total</span>
              <span className="total-amount">Rs. {getTotal().toFixed(2)}</span>
            </div>
            <div className="d-grid gap-3">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleCheckout}
                className="checkout-btn"
              >
                Proceed to Checkout
              </Button>
              <Button 
                variant="outline-secondary"
                onClick={() => navigate('/store')}
                className="continue-shopping-btn"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .cart-container {
            max-width: 1000px;
            margin: 0 auto;
          }

          .empty-cart-icon {
            font-size: 4rem;
            color: #dee2e6;
          }

          .cart-items-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            margin-bottom: 2rem;
          }

          .cart-item {
            display: flex;
            padding: 1.5rem;
            border-bottom: 1px solid #f1f1f1;
            position: relative;
          }

          .cart-item:last-child {
            border-bottom: none;
          }

          .cart-item-image {
            width: 120px;
            height: 120px;
            border-radius: 12px;
            overflow: hidden;
            background-color: #f8f9fa;
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
          }

          .cart-item-details {
            flex: 1;
            padding: 0 1.5rem;
          }

          .item-name {
            font-weight: 600;
            margin-bottom: 0.5rem;
          }

          .category-badge {
            background-color: #e9ecef;
            color: #495057;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
          }

          .quantity-price {
            color: #6c757d;
            font-size: 0.95rem;
          }

          .quantity-price .price {
            margin-left: 1rem;
            font-weight: 500;
          }

          .subtotal {
            color: #495057;
            font-size: 0.95rem;
          }

          .remove-btn {
            color: #dc3545;
            font-size: 1.2rem;
            padding: 0.5rem;
            text-decoration: none;
          }

          .remove-btn:hover {
            color: #bb2d3b;
          }

          .cart-summary {
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 2rem;
          }

          .total-amount {
            font-size: 1.2rem;
            font-weight: 600;
            color: #0d6efd;
          }

          .checkout-btn {
            border-radius: 30px;
            padding: 12px 30px;
            font-weight: 500;
          }

          .continue-shopping-btn {
            border-radius: 30px;
            padding: 12px 30px;
            font-weight: 500;
          }

          @media (max-width: 768px) {
            .cart-item {
              flex-direction: column;
            }

            .cart-item-image {
              width: 100%;
              height: 200px;
              margin-bottom: 1rem;
            }

            .cart-item-details {
              padding: 1rem 0;
            }

            .cart-item-actions {
              position: absolute;
              top: 1rem;
              right: 1rem;
            }
          }
        `}
      </style>
    </Container>
  );
}

export default Cart; 