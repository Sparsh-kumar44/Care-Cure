import { Chip } from '@mui/material';
import { expiryStatus } from '../../utils/medicine';

export default function ExpiryChip({ expiry, ...props }) {
  const st = expiryStatus(expiry);
  if (st === 'ok') return null;
  return (
    <Chip
      size="small"
      color={st === 'expired' ? 'error' : 'warning'}
      label={st === 'expired' ? 'Expired' : 'Expiring soon'}
      {...props}
    />
  );
}
