export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
};

export const ACCESS_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
};

export const isAdmin = (profile) => profile?.role === ROLES.ADMIN;

export const isActiveStudent = (profile, activePack) =>
  {
    if (profile?.role !== ROLES.STUDENT) return false;
    if (profile?.access_status !== ACCESS_STATUS.ACTIVE) return false;
    if (activePack?.status !== ACCESS_STATUS.ACTIVE) return false;
    if (!activePack?.end_date) return true;

    const today = new Date().toISOString().slice(0, 10);
    return activePack.end_date >= today;
  };
