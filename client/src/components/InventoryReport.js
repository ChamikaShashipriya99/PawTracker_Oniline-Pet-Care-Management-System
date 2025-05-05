import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Row, Col, Spinner } from 'react-bootstrap';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const INVENTORY_ENDPOINT = `${API_URL}/inventory`;

const COLORS = ['#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#e74c3c', '#9b59b6', '#f39c12', '#1abc9c'];

const InventoryReport = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const res = await axios.get(INVENTORY_ENDPOINT);
        setInventory(res.data);
      } catch (err) {
        setInventory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  // Summary calculations
  const totalEquipment = inventory.length;
  const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * (item.quantity || 0)), 0);

  // Status distribution
  const statusCounts = { 'In Stock': 0, 'Out of Stock': 0, 'Low Stock': 0 };
  inventory.forEach(item => {
    if (item.quantity === 0) statusCounts['Out of Stock']++;
    else if (item.quantity <= 5) statusCounts['Low Stock']++;
    else statusCounts['In Stock']++;
  });
  const statusData = Object.keys(statusCounts).map((name, i) => ({ name, value: statusCounts[name], color: COLORS[i] }));

  // Category distribution
  const categoryMap = {};
  inventory.forEach(item => {
    const cat = (item.category || 'Other').toUpperCase();
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categoryData = Object.keys(categoryMap).map((name, i) => ({ name, value: categoryMap[name], color: COLORS[i % COLORS.length] }));

  const today = new Date().toLocaleDateString();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '2rem' }}>
      <h2 style={{ fontWeight: 700 }}>Inventory Reports</h2>
      <div style={{ color: '#888', marginBottom: 8 }}>Inventory Report<br />Generated on {today}</div>
      <div className="mb-4">
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Refresh Data</button>
        <span style={{ float: 'right', color: '#555' }}>Welcome, <b>sandi003</b></span>
      </div>
      <Card className="mb-4 p-3">
        <h5>Overview</h5>
        <Row>
          <Col md={4} sm={12} className="mb-3">
            <Card className="text-center p-3">
              <div style={{ fontSize: 18, color: '#888' }}>Total Equipment</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{totalEquipment}</div>
            </Card>
          </Col>
          <Col md={4} sm={12} className="mb-3">
            <Card className="text-center p-3">
              <div style={{ fontSize: 18, color: '#888' }}>Total Items in Stock</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{totalItems}</div>
            </Card>
          </Col>
          <Col md={4} sm={12} className="mb-3">
            <Card className="text-center p-3">
              <div style={{ fontSize: 18, color: '#888' }}>Total Inventory Value</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>LKR {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </Card>
          </Col>
        </Row>
      </Card>
      <Row>
        <Col md={6} sm={12} className="mb-4">
          <Card className="p-3">
            <h6>Status Distribution</h6>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-status-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col md={6} sm={12} className="mb-4">
          <Card className="p-3">
            <h6>Category Distribution</h6>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-cat-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InventoryReport; 