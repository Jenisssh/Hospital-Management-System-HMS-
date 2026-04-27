import Badge from './Badge.jsx';

const APPOINTMENT_VARIANT = {
  SCHEDULED: 'warning',
  CONFIRMED: 'primary',
  CANCELLED: 'danger',
  COMPLETED: 'success',
  NO_SHOW: 'danger',
};

const PAYMENT_VARIANT = {
  PENDING: 'warning',
  PAID: 'success',
  FAILED: 'danger',
  REFUNDED: 'danger',
};

const ROLE_VARIANT = {
  admin: 'accent',
  doctor: 'primary',
  patient: 'success',
};

export function AppointmentStatus({ status }) {
  return (
    <Badge variant={APPOINTMENT_VARIANT[status] || 'default'} dot>
      {status}
    </Badge>
  );
}

export function PaymentStatus({ status }) {
  return (
    <Badge variant={PAYMENT_VARIANT[status] || 'default'} dot>
      {status}
    </Badge>
  );
}

export function RoleBadge({ role }) {
  return (
    <Badge variant={ROLE_VARIANT[role] || 'default'}>{role?.toUpperCase()}</Badge>
  );
}
