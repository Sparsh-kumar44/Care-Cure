import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Card, Box, Typography, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Tooltip, Chip, InputAdornment, Skeleton, Stack, Grid
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { api, fmtDate, fmtTime, money } from '../api';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/common/Toast';
import PageHeader from '../components/common/PageHeader';
import PasswordConfirmDialog from '../components/common/PasswordConfirmDialog';

const PERIODS = [
  ['all', 'All time'], ['today', 'Today'], ['week', 'Last 7 days'], ['month', 'This month'],
  ['last_month', 'Last month'], ['year', 'This year'], ['last_year', 'Last year']
];

function inPeriod(date, period) {
  if (period === 'all') return true;
  const d = new Date(date);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (period === 'today') return sameDay;
  if (period === 'week') return d >= new Date(now.getTime() - 7 * 864e5);
  if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (period === 'last_month') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  }
  if (period === 'year') return d.getFullYear() === now.getFullYear();
  if (period === 'last_year') return d.getFullYear() === now.getFullYear() - 1;
  return true;
}

export default function Bills() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'admin';

  const [bills, setBills] = useState(null);
  const [period, setPeriod] = useState('all');
  const [search, setSearch] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(() => {
    api('/api/bills').then(setBills).catch((e) => toast(e.message, 'error'));
  }, [toast]);
  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (bills || []).filter((b) => inPeriod(b.createdAt, period) && (!q || b.patientName.toLowerCase().includes(q)));
  }, [bills, period, search]);

  const total = filtered.reduce((s, b) => s + (b.grandTotal || 0), 0);

  const remove = async () => {
    await api(`/api/bills/${toDelete.id}`, { method: 'DELETE' });
    toast('Bill deleted');
    setToDelete(null);
    load();
  };

  return (
    <>
      <PageHeader title="Bill History" subtitle="Browse, print and manage past bills." />

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              placeholder="Search patient name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack direction="row" spacing={1} justifyContent={{ md: 'flex-end' }}>
              <Chip label={`${filtered.length} bills`} />
              <Chip color="primary" label={`Total ${money(total)}`} />
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bill</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="center">Items</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!bills && [0, 1, 2, 3].map((i) => <TableRow key={i}><TableCell colSpan={8}><Skeleton /></TableCell></TableRow>)}
              {bills && filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>No bills found for the selected filter.</TableCell></TableRow>
              )}
              {filtered.map((b) => (
                <TableRow key={b.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>#{b.billNo}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600} variant="body2">{b.patientName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {b.patientAge} yrs{b.patientGender ? ` · ${b.patientGender}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>{b.patientPhone || '—'}</TableCell>
                  <TableCell align="center">{b.items.length}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{money(b.grandTotal)}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDate(b.createdAt)} <Typography component="span" variant="caption" color="text.secondary">{fmtTime(b.createdAt)}</Typography></TableCell>
                  <TableCell>{b.generatedBy}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Print"><IconButton color="primary" component="a" href={`/print-bill/${b.id}`} target="_blank"><PrintRoundedIcon /></IconButton></Tooltip>
                    {isAdmin && <Tooltip title="Delete"><IconButton color="error" onClick={() => setToDelete(b)}><DeleteRoundedIcon /></IconButton></Tooltip>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>

      <PasswordConfirmDialog
        open={!!toDelete}
        color="error"
        title="Delete bill"
        description={toDelete ? `Enter your password to delete bill #${toDelete.billNo} (${toDelete.patientName}).` : ''}
        confirmLabel="Delete"
        onClose={() => setToDelete(null)}
        onConfirmed={remove}
      />
    </>
  );
}
