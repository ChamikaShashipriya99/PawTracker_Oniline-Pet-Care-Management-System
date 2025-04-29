import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
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
    // Here you can add checkout logic
    alert('Proceeding to checkout...');
    // You can navigate to a checkout page or show a payment modal
    // For now, we'll just clear the cart
    localStorage.removeItem('cart');
    setCart([]);
    // You can redirect to a thank you page or back to store
    navigate('/store');
  };

  if (cart.length === 0) {
    return (
      <div className="container mt-5">
        <h2>Your Cart</h2>
        <div className="alert alert-info">Your cart is empty.</div>
        <Button variant="primary" onClick={() => navigate('/store')}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item, idx) => (
            <tr key={item._id}>
              <td>{idx + 1}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>Rs. {item.price.toFixed(2)}</td>
              <td>{item.cartQuantity || 1}</td>
              <td>Rs. {(item.price * (item.cartQuantity || 1)).toFixed(2)}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleRemove(item._id)}>
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      <div className="text-end">
        <h4 className="mb-3">Total: Rs. {getTotal().toFixed(2)}</h4>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={() => navigate('/store')}>
            Continue Shopping
          </Button>
          <Button 
            variant="success" 
            size="lg" 
            onClick={handleCheckout}
            className="px-5"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Cart; 