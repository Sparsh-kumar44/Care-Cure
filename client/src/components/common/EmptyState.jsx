import { Box, Typography } from '@mui/material';

export default function EmptyState({ icon, title, hint }) {
  return (
    <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}>
      {icon && <Box sx={{ mb: 1, '& svg': { fontSize: 48, opacity: 0.4 } }}>{icon}</Box>}
      <Typography fontWeight={600}>{title}</Typography>
      {hint && <Typography variant="body2">{hint}</Typography>}
    </Box>
  );
}
