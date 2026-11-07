import { memo } from 'react';
import { Card, Box, Typography, Skeleton } from '@mui/material';

function StatCard({ label, value, icon, color = 'primary', loading }) {
  return (
    <Card sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, height: '100%' }}>
      <Box
        sx={{
          width: 52, height: 52, borderRadius: 3, display: 'grid', placeItems: 'center',
          bgcolor: `${color}.main`, color: '#fff', boxShadow: 3, flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" noWrap>{label}</Typography>
        {loading ? <Skeleton width={70} height={38} /> : <Typography variant="h5" noWrap>{value}</Typography>}
      </Box>
    </Card>
  );
}

export default memo(StatCard);
