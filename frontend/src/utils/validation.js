// Validation utility functions for form inputs

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!email.trim()) {
    return 'Email is required';
  }
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return '';
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name) {
    return `${fieldName} is required`;
  }
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return `${fieldName} can only contain letters and spaces`;
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone) {
    return 'Phone number is required';
  }
  
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  // Allow formats like: +1234567890, 1234567890, +12 345 678 9012, etc.
  const phoneRegex = /^[+]?[\d]{10,15}$/;
  
  if (!phoneRegex.test(cleanPhone)) {
    return 'Please enter a valid phone number (10-15 digits)';
  }
  return '';
};

export const validateDateOfBirth = (dateOfBirth) => {
  if (!dateOfBirth) {
    return 'Date of birth is required';
  }
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (birthDate > today) {
    return 'Date of birth cannot be in the future';
  }
  
  if (age < 13) {
    return 'You must be at least 13 years old to register';
  }
  
  if (age > 120) {
    return 'Please enter a valid date of birth';
  }
  
  return '';
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

export const validateLicenseNumber = (licenseNumber) => {
  if (!licenseNumber) {
    return 'Medical license number is required';
  }
  if (licenseNumber.length < 5) {
    return 'Medical license number must be at least 5 characters';
  }
  return '';
};

export const validateSpecialty = (specialty) => {
  if (!specialty) {
    return 'Medical specialty is required';
  }
  return '';
};

export const validateExperience = (experience) => {
  const exp = parseInt(experience);
  if (!experience) {
    return 'Years of experience is required';
  }
  if (isNaN(exp) || exp < 0) {
    return 'Please enter a valid number of years';
  }
  if (exp > 60) {
    return 'Please enter a realistic number of years';
  }
  return '';
};

// Form validation helper
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return errors;
};
