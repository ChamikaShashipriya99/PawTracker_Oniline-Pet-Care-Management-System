import React from 'react';

function PasswordStrengthIndicator({ password }) {
  // Calculate password strength
  const calculateStrength = (password) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 20;
    
    // Contains number
    if (/\d/.test(password)) strength += 20;
    
    // Contains lowercase letter
    if (/[a-z]/.test(password)) strength += 20;
    
    // Contains uppercase letter
    if (/[A-Z]/.test(password)) strength += 20;
    
    // Contains special character
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    return strength;
  };
  
  // Get strength level text
  const getStrengthText = (strength) => {
    if (strength <= 20) return 'Very Weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Medium';
    if (strength <= 80) return 'Strong';
    return 'Very Strong';
  };
  
  // Get strength level color
  const getStrengthColor = (strength) => {
    if (strength <= 20) return '#ff4d4d'; // Red
    if (strength <= 40) return '#ffa64d'; // Orange
    if (strength <= 60) return '#ffff4d'; // Yellow
    if (strength <= 80) return '#4dff4d'; // Light Green
    return '#00cc00'; // Green
  };
  
  const strength = calculateStrength(password);
  const strengthText = getStrengthText(strength);
  const strengthColor = getStrengthColor(strength);
  
  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between mb-1">
        <small>Password Strength:</small>
        <small style={{ color: strengthColor }}>{strengthText}</small>
      </div>
      <div className="progress" style={{ height: '5px' }}>
        <div 
          className="progress-bar" 
          role="progressbar" 
          style={{ 
            width: `${strength}%`, 
            backgroundColor: strengthColor,
            transition: 'width 0.3s ease-in-out'
          }} 
          aria-valuenow={strength} 
          aria-valuemin="0" 
          aria-valuemax="100"
        ></div>
      </div>
      <div className="mt-2">
        <small className="text-muted">Password Requirements:</small>
        <ul className="small text-muted ps-2 mb-0">
          <li className={password.length >= 8 ? 'text-success' : ''}>
            {password.length >= 8 ? '✓' : '○'} At least 8 characters
          </li>
          <li className={/\d/.test(password) ? 'text-success' : ''}>
            {/\d/.test(password) ? '✓' : '○'} Contains a number
          </li>
          <li className={/[a-z]/.test(password) ? 'text-success' : ''}>
            {/[a-z]/.test(password) ? '✓' : '○'} Contains a lowercase letter
          </li>
          <li className={/[A-Z]/.test(password) ? 'text-success' : ''}>
            {/[A-Z]/.test(password) ? '✓' : '○'} Contains an uppercase letter
          </li>
          <li className={/[^A-Za-z0-9]/.test(password) ? 'text-success' : ''}>
            {/[^A-Za-z0-9]/.test(password) ? '✓' : '○'} Contains a special character
          </li>
        </ul>
      </div>
    </div>
  );
}

export default PasswordStrengthIndicator; 