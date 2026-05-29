function validate(rules) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, validators] of Object.entries(rules)) {
      const value = req.body[field];
      for (const validator of validators) {
        const error = validator(value, field);
        if (error) {
          errors.push(error);
          break;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    next();
  };
}

const required = (value, field) => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return `${field} is required`;
  }
  return null;
};

const minLength = (min) => (value, field) => {
  if (value && value.length < min) {
    return `${field} must be at least ${min} characters`;
  }
  return null;
};

const maxLength = (max) => (value, field) => {
  if (value && value.length > max) {
    return `${field} must be at most ${max} characters`;
  }
  return null;
};

const isEmail = (value, field) => {
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `${field} must be a valid email`;
  }
  return null;
};

const isIn = (allowedValues) => (value, field) => {
  if (value && !allowedValues.includes(value)) {
    return `${field} must be one of: ${allowedValues.join(', ')}`;
  }
  return null;
};

module.exports = { validate, required, minLength, maxLength, isEmail, isIn };
