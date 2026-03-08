// services/validation.js - Drop Validation Service

/**
 * Validate drop creation data
 */
function validateDrop(data) {
  const errors = [];

  // Required fields
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.push('Slug is required and must be a non-empty string');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }

  if (!data.scheduledAt) {
    errors.push('Scheduled date is required');
  } else {
    const scheduledDate = new Date(data.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Scheduled date is invalid');
    }
  }

  // Optional fields validation
  if (data.endsAt) {
    const endsDate = new Date(data.endsAt);
    if (isNaN(endsDate.getTime())) {
      errors.push('End date is invalid');
    } else if (data.scheduledAt && endsDate <= new Date(data.scheduledAt)) {
      errors.push('End date must be after scheduled date');
    }
  }

  // Product validation
  if (data.product) {
    if (data.product.downloadLimit !== undefined && data.product.downloadLimit !== null) {
      if (!Number.isInteger(data.product.downloadLimit) || data.product.downloadLimit < 0) {
        errors.push('Download limit must be a non-negative integer');
      }
    }

    if (data.product.price) {
      if (data.product.price.amount !== undefined) {
        if (typeof data.product.price.amount !== 'number' || data.product.price.amount < 0) {
          errors.push('Price amount must be a non-negative number');
        }
      }
    }
  }

  // Email validation for allowed emails
  if (data.allowedEmails && Array.isArray(data.allowedEmails)) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of data.allowedEmails) {
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email: ${email}`);
      }
    }
  }

  // Domain validation for allowed domains
  if (data.allowedDomains && Array.isArray(data.allowedDomains)) {
    const domainRegex = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
    for (const domain of data.allowedDomains) {
      if (!domainRegex.test(domain)) {
        errors.push(`Invalid domain: ${domain}`);
      }
    }
  }

  // Notification email validation
  if (data.notifications?.emailList && Array.isArray(data.notifications.emailList)) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of data.notifications.emailList) {
      if (!emailRegex.test(email)) {
        errors.push(`Invalid notification email: ${email}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate drop update data
 */
function validateDropUpdate(data) {
  const errors = [];

  // Same validation as create, but all fields are optional
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Name must be a non-empty string');
    }
  }

  if (data.slug !== undefined) {
    if (typeof data.slug !== 'string' || data.slug.trim().length === 0) {
      errors.push('Slug must be a non-empty string');
    } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
      errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
    }
  }

  if (data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length === 0) {
      errors.push('Description must be a non-empty string');
    }
  }

  if (data.scheduledAt !== undefined) {
    const scheduledDate = new Date(data.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      errors.push('Scheduled date is invalid');
    }
  }

  if (data.endsAt !== undefined) {
    const endsDate = new Date(data.endsAt);
    if (isNaN(endsDate.getTime())) {
      errors.push('End date is invalid');
    }
  }

  if (data.product !== undefined) {
    if (data.product.downloadLimit !== undefined && data.product.downloadLimit !== null) {
      if (!Number.isInteger(data.product.downloadLimit) || data.product.downloadLimit < 0) {
        errors.push('Download limit must be a non-negative integer');
      }
    }

    if (data.product.price) {
      if (data.product.price.amount !== undefined) {
        if (typeof data.product.price.amount !== 'number' || data.product.price.amount < 0) {
          errors.push('Price amount must be a non-negative number');
        }
      }
    }
  }

  if (data.allowedEmails !== undefined && Array.isArray(data.allowedEmails)) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of data.allowedEmails) {
      if (!emailRegex.test(email)) {
        errors.push(`Invalid email: ${email}`);
      }
    }
  }

  if (data.allowedDomains !== undefined && Array.isArray(data.allowedDomains)) {
    const domainRegex = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;
    for (const domain of data.allowedDomains) {
      if (!domainRegex.test(domain)) {
        errors.push(`Invalid domain: ${domain}`);
      }
    }
  }

  if (data.notifications?.emailList !== undefined && Array.isArray(data.notifications.emailList)) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of data.notifications.emailList) {
      if (!emailRegex.test(email)) {
        errors.push(`Invalid notification email: ${email}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateDrop,
  validateDropUpdate
};
