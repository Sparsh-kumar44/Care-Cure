import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Alert } from '@mui/material';
import { api } from '../../api';

const EMPTY = { empId: '', name: '', password: '' };

export default function EmployeeFormDialog({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setForm(EMPTY); setError(''); } }, [open]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api('/api/employees', { method: 'POST', body: form });
      onSaved('Employee added');
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>Add employee</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Employee ID" required autoFocus value={form.empId} onChange={set('empId')} />
            <TextField label="Full name" required value={form.name} onChange={set('name')} />
            <TextField label="Password" type="password" required value={form.password} onChange={set('password')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Adding…' : 'Add employee'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
