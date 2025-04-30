import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './FeedbackForm.css';

const FeedbackForm = () => {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState({
        rating: 5,
        comment: '',
        serviceType: 'grooming'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFeedback(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            console.log('Submitting feedback:', feedback); // Debug log
            const response = await axios.post('http://localhost:5000/api/feedback', feedback, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Feedback submission response:', response.data); // Debug log
            setSuccess('Feedback submitted successfully!');
            setFeedback({
                rating: 5,
                comment: '',
                serviceType: 'grooming'
            });
            setError('');

            // Redirect to feedback list after 2 seconds
            setTimeout(() => {
                navigate('/my-feedback');
            }, 2000);
        } catch (err) {
            console.error('Error submitting feedback:', err); // Debug log
            setError(err.response?.data?.message || 'Error submitting feedback');
            setSuccess('');
        }
    };

    return (
        <div className="feedback-form-container">
            <h2>Submit Feedback</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={handleSubmit} className="feedback-form">
                <div className="form-group">
                    <label>Service Type:</label>
                    <select
                        name="serviceType"
                        value={feedback.serviceType}
                        onChange={handleChange}
                        required
                    >
                        <option value="grooming">Grooming</option>
                        <option value="boarding">Boarding</option>
                        <option value="training">Training</option>
                        <option value="veterinary">Veterinary</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Rating:</label>
                    <div className="rating-input">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star ${star <= feedback.rating ? 'active' : ''}`}
                                onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label>Comment:</label>
                    <textarea
                        name="comment"
                        value={feedback.comment}
                        onChange={handleChange}
                        required
                        placeholder="Please share your experience..."
                        rows="4"
                    />
                </div>

                <button type="submit" className="submit-button">
                    Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm; 