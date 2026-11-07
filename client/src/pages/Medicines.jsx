import { useEffect, useMemo, useState, useCallback } from 'react';
import { Button } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { api } from '../api';
import { useToast } from '../components/common/Toast';
import PageHeader from '../components/common/PageHeader';
import PasswordConfirmDialog from '../components/common/PasswordConfirmDialog';
import MedicineFilters from '../components/medicines/MedicineFilters';
import MedicineGrid from '../components/medicines/MedicineGrid';
import MedicineFormDialog from '../components/medicines/MedicineFormDialog';

export default function Medicines() {
  const toast = useToast();
  const [meds, setMeds] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('none');

  const [form, setForm] = useState({ open: false, medicine: null });
  const [pendingEdit, setPendingEdit] = useState(null);   // awaiting password
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = useCallback(() => {
    api('/api/medicines').then(setMeds).catch((e) => toast(e.message, 'error'));
  }, [toast]);
  useEffect(load, [load]);

  const rows = useMemo(() => {
    if (!meds) return null;
    const q = search.trim().toLowerCase();
    const filtered = meds.filter((m) => !q || m.name.toLowerCase().includes(q));
    if (sort === 'none') return filtered;
    const dir = sort === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => dir * (new Date(a.expiry) - new Date(b.expiry)));
  }, [meds, search, sort]);

  const closeForm = () => setForm((f) => ({ ...f, open: false }));
  const handleSaved = (msg) => { toast(msg); closeForm(); load(); };

  const remove = async () => {
    await api(`/api/medicines/${pendingDelete.id}`, { method: 'DELETE' });
    toast('Medicine deleted');
    setPendingDelete(null);
    load();
  };

  return (
    <>
      <PageHeader
        title="Medicines"
        subtitle="Manage stock, pricing and expiry dates."
        action={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setForm({ open: true, medicine: null })}>
            Add medicine
          </Button>
        }
      />

      <MedicineFilters search={search} onSearch={setSearch} sort={sort} onSort={setSort} count={rows?.length} />

      <MedicineGrid medicines={rows} onEdit={setPendingEdit} onDelete={setPendingDelete} />

      <MedicineFormDialog open={form.open} medicine={form.medicine} onClose={closeForm} onSaved={handleSaved} />

      <PasswordConfirmDialog
        open={!!pendingEdit}
        title="Confirm edit"
        description={`Enter your password to edit "${pendingEdit?.name}".`}
        confirmLabel="Proceed"
        onClose={() => setPendingEdit(null)}
        onConfirmed={() => { setForm({ open: true, medicine: pendingEdit }); setPendingEdit(null); }}
      />
      <PasswordConfirmDialog
        open={!!pendingDelete}
        color="error"
        title="Confirm delete"
        description={`Enter your password to delete "${pendingDelete?.name}". This cannot be undone.`}
        confirmLabel="Delete"
        onClose={() => setPendingDelete(null)}
        onConfirmed={remove}
      />
    </>
  );
}
