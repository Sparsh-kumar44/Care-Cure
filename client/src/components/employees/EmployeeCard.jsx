import { memo } from 'react';
import { Card, CardContent, Avatar, Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

function EmployeeCard({ employee: e, canDelete, onDelete }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, fontWeight: 700 }}>{e.name?.[0]?.toUpperCase()}</Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} noWrap>{e.name}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>ID: {e.empId}</Typography>
          <Chip size="small" label={e.role} sx={{ mt: 0.5, textTransform: 'capitalize' }} />
        </Box>
        {canDelete && (
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => onDelete(e)}><DeleteRoundedIcon /></IconButton>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(EmployeeCard);
