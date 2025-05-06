import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';
import config from '../config';

const MyFeedback = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const clearMessages = () => {
        setTimeout(() => {
            setSuccess('');
            setError('');
        }, 3000);
    };

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
    
            const user = JSON.parse(localStorage.getItem('user'))._id;
            console.log("token : " + token + " userId : " + user);
    
            const response = await axios.get(`${config.API_URL}/feedback/my-feedback`, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
    
            console.log('Fetched feedbacks:', response.data);
            setFeedbacks(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setError(err.response?.data?.message || 'Error fetching feedback');
        } finally {
            setLoading(false);
        }
    };
    

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this feedback?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${config.API_URL}/feedback/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
            setSuccess('Feedback deleted successfully!');
            setError('');
            clearMessages();
        } catch (err) {
            setError(err.response?.data?.message || 'Error deleting feedback');
            clearMessages();
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'status-approved';
            case 'rejected':
                return 'status-rejected';
            default:
                return 'status-pending';
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="my-feedback-container">
            <h2>My Feedback</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {feedbacks.length === 0 ? (
                <div className="no-feedback">
                    <p>You haven't submitted any feedback yet.</p>
                    <button onClick={() => navigate('/submit-feedback')} className="submit-new-button">
                        Submit New Feedback
                    </button>
                </div>
            ) : (
                <div className="feedback-list">
                    {feedbacks.map(feedback => (
                        <div key={feedback._id} className="feedback-card">
                            <div className="feedback-header">
                                <span className={`status ${getStatusColor(feedback.status)}`}>
                                    {feedback.status}
                                </span>
                                <span className="service-type">{feedback.serviceType}</span>
                            </div>
                            
                            <div className="rating">
                                {[...Array(5)].map((_, index) => (
                                    <span
                                        key={index}
                                        className={`star ${index < feedback.rating ? 'active' : ''}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            
                            <p className="comment">{feedback.comment}</p>
                            
                            {feedback.adminReply && feedback.adminReply.message && (
                                <div className="admin-reply">
                                    <h4>Admin Reply:</h4>
                                    <p>{feedback.adminReply.message}</p>
                                    <small>
                                        Replied on: {new Date(feedback.adminReply.repliedAt).toLocaleString()}
                                    </small>
                                </div>
                            )}
                            
                            <div className="feedback-footer">
                                <span className="date">
                                    {new Date(feedback.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => handleDelete(feedback._id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyFeedback; 
