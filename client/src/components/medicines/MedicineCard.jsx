import { memo } from 'react';
import { Card, CardContent, CardActions, Box, Typography, Stack, IconButton, Tooltip, Divider, LinearProgress } from '@mui/material';
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import { fmtDate } from '../../api';
import { expiryStatus, totalTablets, pricePerTablet } from '../../utils/medicine';
import ExpiryChip from './ExpiryChip';

const ACCENT = { expired: 'error', soon: 'warning', ok: 'primary' };

function Metric({ label, value }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" noWrap display="block">{label}</Typography>
      <Typography fontWeight={700} noWrap>{value}</Typography>
    </Box>
  );
}

function MedicineCard({ medicine: m, onEdit, onDelete, readOnly = false }) {
  const status = expiryStatus(m.expiry);
  const accent = ACCENT[status];
  const tablets = totalTablets(m);
  const lowStock = tablets < m.tabletsPerStrip * 2;

  return (
    <Card
      sx={{
        height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderTop: 4, borderTopColor: `${accent}.main`,
        transition: 'transform .15s, box-shadow .15s',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 28px rgba(20,38,43,.12)' }
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 42, height: 42, borderRadius: 2.5, display: 'grid', placeItems: 'center', flexShrink: 0,
              bgcolor: `${accent}.main`, color: '#fff'
            }}
          >
            <MedicationRoundedIcon />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography fontWeight={700} noWrap title={m.name}>{m.name}</Typography>
            <Typography variant="caption" color="text.secondary">ID #{m.id}</Typography>
          </Box>
          <ExpiryChip expiry={m.expiry} />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Metric label="Strips" value={Number((m.strips || 0).toFixed(2))} />
          <Metric label="Tabs / strip" value={m.tabletsPerStrip} />
          <Metric label="Tablets" value={tablets} />
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Stack direction="row" spacing={1}>
          <Metric label="Price / strip" value={`₹${m.price}`} />
          <Metric label="Price / tablet" value={`₹${pricePerTablet(m).toFixed(2)}`} />
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 1.5, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
          <EventRoundedIcon sx={{ fontSize: 18 }} />
          <Typography variant="body2">{fmtDate(m.expiry)}</Typography>
        </Stack>
        {!readOnly && (
        <Box>
          <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => onEdit(m)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(m)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
        </Box>
        )}
      </CardActions>
    </Card>
  );
}

export default memo(MedicineCard);
