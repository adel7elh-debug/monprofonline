export const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-MA', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fr-MA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};
