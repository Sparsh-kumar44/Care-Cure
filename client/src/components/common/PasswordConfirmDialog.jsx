import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Alert, Avatar } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { api } from '../../api';


export default function PasswordConfirmDialog({ open, title, description, confirmLabel = 'Confirm', color = 'primary', onClose, onConfirmed }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setPassword(''); setError(''); setBusy(false); }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError('');
    try {
      const { valid } = await api('/api/auth/verify-password', { method: 'POST', body: { password } });
      if (!valid) {
        setError('Incorrect password. Try again.');
        setPassword('');
      } else {
        await onConfirmed();
      }
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.dark`, width: 40, height: 40 }}>
            <LockRoundedIcon fontSize="small" />
          </Avatar>
          {title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField autoFocus type="password" label="Your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit" disabled={busy}>Cancel</Button>
          <Button type="submit" variant="contained" color={color} disabled={busy || !password}>
            {busy ? 'Checking…' : confirmLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
