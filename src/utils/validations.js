export const required = (value) => String(value || '').trim().length > 0;

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');

export const validateRegistration = (form) => {
  const errors = {};
  if (!required(form.full_name)) errors.full_name = 'Le nom complet est obligatoire.';
  if (!required(form.phone)) errors.phone = 'Le telephone est obligatoire.';
  if (!isEmail(form.email)) errors.email = 'Email invalide.';
  return errors;
};

export const validateContact = (form) => {
  const errors = {};
  if (!required(form.message)) errors.message = 'Le message est obligatoire.';
  if (form.email && !isEmail(form.email)) errors.email = 'Email invalide.';
  return errors;
};
