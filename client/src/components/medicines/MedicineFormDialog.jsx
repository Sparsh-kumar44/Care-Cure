import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Alert } from '@mui/material';
import { api } from '../../api';
import { toDateInput } from '../../utils/medicine';

const EMPTY = { name: '', strips: '', tabletsPerStrip: '', expiry: '', price: '' };


export default function MedicineFormDialog({ open, medicine, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(medicine
      ? {
          name: medicine.name,
          strips: medicine.strips,
          tabletsPerStrip: medicine.tabletsPerStrip,
          expiry: toDateInput(medicine.expiry),
          price: medicine.price
        }
      : EMPTY);
  }, [open, medicine]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api(medicine ? `/api/medicines/${medicine.id}` : '/api/medicines', {
        method: medicine ? 'PUT' : 'POST',
        body: form
      });
      onSaved(medicine ? 'Medicine updated' : 'Medicine added');
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <form onSubmit={submit}>
        <DialogTitle>{medicine ? 'Edit medicine' : 'Add medicine'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}><TextField label="Medicine name" required autoFocus value={form.name} onChange={set('name')} /></Grid>
            <Grid item xs={6}><TextField label="Number of strips" type="number" required inputProps={{ min: 0, step: 'any' }} value={form.strips} onChange={set('strips')} /></Grid>
            <Grid item xs={6}><TextField label="Tablets per strip" type="number" required inputProps={{ min: 1 }} value={form.tabletsPerStrip} onChange={set('tabletsPerStrip')} /></Grid>
            <Grid item xs={6}><TextField label="Expiry date" type="date" required InputLabelProps={{ shrink: true }} value={form.expiry} onChange={set('expiry')} /></Grid>
            <Grid item xs={6}><TextField label="Price per strip (₹)" type="number" required inputProps={{ min: 0, step: '0.01' }} value={form.price} onChange={set('price')} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : medicine ? 'Update' : 'Add medicine'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
