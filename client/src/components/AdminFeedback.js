import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Feedback.css';

const AdminFeedback = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [replyMessage, setReplyMessage] = useState({});

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!token || !user) {
                setError('Please log in to continue');
                return;
            }

            const response = await axios.get('http://localhost:5000/api/feedback/all', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });            
    
            setFeedbacks(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            setError(err.response?.data?.message || 'Error fetching feedback');
        } finally {
            setLoading(false);
        }
    };
    
    

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!token || !user) {
                setError('Please log in to continue');
                return;
            }

            const response = await axios.patch(
                `http://localhost:5000/api/feedback/${id}/status`,
                { status: newStatus },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            setFeedbacks(feedbacks.map(feedback =>
                feedback._id === id ? response.data : feedback
            ));
            setSuccess(`Feedback ${newStatus} successfully!`);
            setError('');
            clearMessages();
        } catch (err) {
            console.error('Error updating status:', err);
            setError(err.response?.data?.message || 'Error updating feedback status');
            clearMessages();
        }
    };

    const clearMessages = () => {
        setTimeout(() => {
            setSuccess('');
            setError('');
        }, 3000);
    };

    const handleReplySubmit = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!token || !user) {
                setError('Please log in to continue');
                return;
            }

            if (!user.isAdmin) {
                setError('You do not have permission to reply to feedback');
                return;
            }

            if (!replyMessage[id] || replyMessage[id].trim() === '') {
                setError('Reply message cannot be empty');
                clearMessages();
                return;
            }

            const response = await axios.post(
                `http://localhost:5000/api/feedback/${id}/reply`,
                { message: replyMessage[id].trim() },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            if (response.data) {
                setFeedbacks(feedbacks.map(feedback =>
                    feedback._id === id ? response.data : feedback
                ));
                setReplyMessage({ ...replyMessage, [id]: '' });
                setSuccess('Reply sent successfully!');
                setError('');
                clearMessages();
            }
        } catch (err) {
            console.error('Error submitting reply:', err);
            if (err.response?.status === 403) {
                setError('You do not have permission to reply to feedback');
            } else if (err.response?.status === 401) {
                setError('Please log in to continue');
            } else {
                setError(err.response?.data?.message || 'Error submitting reply');
            }
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

    const filteredFeedbacks = feedbacks.filter(feedback => {
        if (filter === 'all') return true;
        return feedback.status === filter;
    });

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-feedback-container">
            <h2>Feedback Management</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="filter-controls">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Feedback</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {filteredFeedbacks.length === 0 ? (
                <div className="no-feedback">
                    <p>No feedback found.</p>
                </div>
            ) : (
                <div className="feedback-list">
                    {filteredFeedbacks.map(feedback => (
                        <div key={feedback._id} className="feedback-card">
                            <div className="feedback-header">
                                <div className="user-info">
                                    <span className="user-name">{feedback.user.name}</span>
                                    <span className="user-email">{feedback.user.email}</span>
                                </div>
                                <span className={`status ${getStatusColor(feedback.status)}`}>
                                    {feedback.status}
                                </span>
                            </div>

                            <div className="feedback-content">
                                <div className="service-info">
                                    <span className="service-type">{feedback.serviceType}</span>
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

                                <div className="reply-section">
                                    <textarea
                                        value={replyMessage[feedback._id] || ''}
                                        onChange={(e) => setReplyMessage({
                                            ...replyMessage,
                                            [feedback._id]: e.target.value
                                        })}
                                        placeholder="Type your reply here..."
                                        rows="3"
                                    />
                                    <button
                                        onClick={() => handleReplySubmit(feedback._id)}
                                        className="reply-button"
                                        disabled={!replyMessage[feedback._id]}
                                    >
                                        Send Reply
                                    </button>
                                </div>

                                <div className="feedback-footer">
                                    <span className="date">
                                        {new Date(feedback.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="status-controls">
                                        <button
                                            onClick={() => handleStatusUpdate(feedback._id, 'approved')}
                                            className={`status-button approve ${feedback.status === 'approved' ? 'active' : ''}`}
                                            disabled={feedback.status === 'approved'}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(feedback._id, 'rejected')}
                                            className={`status-button reject ${feedback.status === 'rejected' ? 'active' : ''}`}
                                            disabled={feedback.status === 'rejected'}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminFeedback; 