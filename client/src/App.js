import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminSignup from './components/AdminSignup';
import AddPet from './components/AddPet';
import MyPets from './components/MyPets';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import EmailVerification from './components/EmailVerification';
import FAQ from './components/FAQ';
import Contact from './components/Contact';

function AppContent({ isLoggedIn, setIsLoggedIn, isAdmin, setIsAdmin }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setIsAdmin(false);
      setTimeout(() => {
        if (user && user.isAdmin) {
          navigate('/admin/login');
        } else {
          navigate('/login');
        }
      }, 0);
    } catch (error) {
      console.error('Error during logout:', error);
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setIsAdmin(false);
      navigate('/login');
    }
  };

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user) {
        setIsLoggedIn(true);
        setIsAdmin(user.isAdmin);
        if (user.isAdmin && window.location.pathname === '/') {
          navigate('/admin/dashboard');
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, [navigate, setIsLoggedIn, setIsAdmin]);

  return (
    <>
      {(!isLoggedIn || !isAdmin) && (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ backgroundColor: 'rgba(0, 123, 255, 0.9)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <div className="container">
            <Link className="navbar-brand" to="/" style={{ fontFamily: 'Comic Sans MS', fontSize: '1.5rem' }}>
              🐾 PawTracker
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavUser">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavUser">
              <ul className="navbar-nav mx-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/">Home</Link>
                </li>
                {isLoggedIn && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/store">Store</Link>
                    </li>
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" id="servicesDropdown" role="button" data-bs-toggle="dropdown">
                        Services
                      </a>
                      <ul className="dropdown-menu" aria-labelledby="servicesDropdown">
                        <li><Link className="dropdown-item" to="/services/veterinary">Veterinary Service</Link></li>
                        <li><Link className="dropdown-item" to="/services/grooming">Grooming</Link></li>
                        <li><Link className="dropdown-item" to="/services/training">Pet Training</Link></li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/advertising">Advertising</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/faq">FAQ</Link>
                    </li>
                  </>
                )}
              </ul>
              <ul className="navbar-nav ms-auto">
                {!isLoggedIn ? (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/signup">Sign Up</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/login">Login</Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="nav-item me-2">
                      <a className="nav-link position-relative" href="#" onClick={(e) => e.preventDefault()}>
                        <i className="fas fa-bell fa-lg"></i>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          3
                          <span className="visually-hidden">unread notifications</span>
                        </span>
                      </a>
                    </li>
                    <li className="nav-item me-2">
                      <Link className="nav-link" to="/profile">
                        <i className="fas fa-user-circle fa-lg"></i>
                      </Link>
                    </li>
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" id="profileDropdown" role="button" data-bs-toggle="dropdown">
                        Profile
                      </a>
                      <ul className="dropdown-menu" aria-labelledby="profileDropdown">
                        <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                        <li><Link className="dropdown-item" to="/my-appointments">My Appointments</Link></li>
                        <li><Link className="dropdown-item" to="/my-advertisements">My Advertisements</Link></li>
                        <li><Link className="dropdown-item" to="/my-payments">My Payments</Link></li>
                      </ul>
                    </li>
                    <li className="nav-item">
                      <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </nav>
      )}

      {isLoggedIn && isAdmin && (
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ backgroundColor: 'rgba(255, 87, 51, 0.9)', boxShadow: '0 4px 8px rgba(0,0,0,0.2)' }}>
          <div className="container">
            <Link className="navbar-brand" to="/admin/dashboard" style={{ fontFamily: 'Comic Sans MS', fontSize: '1.5rem' }}>
              🐾 Admin Panel
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAdmin">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavAdmin">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )}

      <div style={{ paddingTop: '80px', minHeight: 'calc(100vh - 200px)' }}>
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/signup" element={<Signup setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          {isLoggedIn && (
            <>
              <Route path="/profile" element={<Profile />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/add-pet" element={<AddPet />} />
              <Route path="/my-pets" element={<MyPets />} />
              <Route path="/store" element={<div>Store Page</div>} />
              <Route path="/services/veterinary" element={<div>Veterinary Service Page</div>} />
              <Route path="/services/grooming" element={<div>Grooming Page</div>} />
              <Route path="/services/training" element={<div>Pet Training Page</div>} />
              <Route path="/advertising" element={<div>Advertising Page</div>} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/my-appointments" element={<div>My Appointments Page</div>} />
              <Route path="/my-advertisements" element={<div>My Advertisements Page</div>} />
              <Route path="/my-payments" element={<div>My Payments Page</div>} />
            </>
          )}
          <Route path="/admin/login" element={<AdminLogin setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/admin/signup" element={<AdminSignup setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </div>

      {(!isLoggedIn || !isAdmin) && (
        <footer className="bg-dark text-white py-4" style={{ backgroundImage: 'linear-gradient(to top, #007bff, #00c4cc)' }}>
          <div className="container">
            <div className="row">
              <div className="col-md-4">
                <h5>About PawTracker</h5>
                <p>We are dedicated to providing the best pet care management system, connecting pet owners with quality services and products.</p>
              </div>
              <div className="col-md-4">
                <h5>Quick Links</h5>
                <ul className="list-unstyled">
                  <li><a href="#" className="text-white">Pet Health Tips</a></li>
                  <li><a href="#" className="text-white">Find a Vet</a></li>
                  <li><a href="#" className="text-white">Pet Adoption</a></li>
                  <li><a href="#" className="text-white">Customer Reviews</a></li>
                </ul>
              </div>
              <div className="col-md-4">
                <h5>Contact Information</h5>
                <p>Email: <a href="mailto:support@petcare.com" className="text-white">support@petcare.com</a></p>
                <p>Phone: (123) 456-7890</p>
                <p>Address: 123 Pet Street, Animal City, PC 12345</p>
                <div>
                  <a href="#" className="text-white mx-2">Facebook</a>
                  <a href="#" className="text-white mx-2">Twitter</a>
                  <a href="#" className="text-white mx-2">Instagram</a>
                </div>
              </div>
            </div>
            <hr className="bg-white" />
            <p className="text-center">🐾 Online Pet Care Management System © 2025 | All Rights Reserved</p>
          </div>
        </footer>
      )}

      {isLoggedIn && isAdmin && (
        <footer className="bg-dark text-white text-center py-3" style={{ backgroundImage: 'linear-gradient(to top, #ff5733, #ff8c66)' }}>
          <div className="container">
            <p>🐾 Admin Control Center © 2025</p>
            <p>
              <a href="#" className="text-white mx-2">Admin Guide</a> |
              <a href="#" className="text-white mx-2">System Logs</a> |
              <a href="#" className="text-white mx-2">Support</a>
            </p>
            <p>Email: admin@petcare.com | Phone: (987) 654-3210</p>
          </div>
        </footer>
      )}
    </>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <Router>
      <AppContent 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
      />
    </Router>
  );
}