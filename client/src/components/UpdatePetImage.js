import React, { useState } from 'react';
import axios from 'axios';

function UpdatePetImage({ pet, onUpdate, onClose }) {
  const [petPhoto, setPetPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(pet.photo ? `http://localhost:5000${pet.photo}` : null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      setPetPhoto(file);
      setError('');
      
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!petPhoto) {
      setError('Please select an image to update');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', petPhoto);

      const res = await axios.put(`http://localhost:5000/api/users/pets/${pet._id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onUpdate(res.data);
      onClose();
    } catch (error) {
      console.error('Error updating pet photo:', error);
      setError(error.response?.data?.error || 'Failed to update pet photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Pet Photo</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-4">
              {photoPreview ? (
                <img 
                  src={photoPreview} 
                  alt="Pet Preview" 
                  className="img-fluid rounded mb-3" 
                  style={{ 
                    maxHeight: '200px',
                    objectFit: 'cover',
                    border: '3px solid #00c4cc',
                    boxShadow: '0 4px 8px rgba(0, 196, 204, 0.2)'
                  }} 
                />
              ) : (
                <div 
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    backgroundColor: '#e9ecef',
                    border: '3px solid #00c4cc',
                    borderRadius: '10px'
                  }}
                >
                  <i className="fas fa-paw fa-4x text-secondary"></i>
                </div>
              )}
              <div className="mb-3">
                <input
                  type="file"
                  className={`form-control ${error ? 'is-invalid' : ''}`}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ borderRadius: '10px' }}
                  disabled={isLoading}
                />
                {error && <div className="invalid-feedback">{error}</div>}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleUpdate} 
              style={{ backgroundColor: '#00c4cc', border: 'none' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Updating...
                </>
              ) : (
                'Update Photo'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdatePetImage; 