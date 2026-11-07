 import { Card, Grid, TextField, MenuItem, InputAdornment, Stack, Chip } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

export default function MedicineFilters({ search, onSearch, sort, onSort, count }) {
  return (
    <Card sx={{ p: 2.5, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            placeholder="Search medicine name…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField select label="Sort by expiry" value={sort} onChange={(e) => onSort(e.target.value)}>
            <MenuItem value="none">Default</MenuItem>
            <MenuItem value="asc">Earliest first</MenuItem>
            <MenuItem value="desc">Latest first</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack direction="row" spacing={1} justifyContent={{ md: 'flex-end' }} flexWrap="wrap" useFlexGap>
            <Chip label={`${count ?? 0} medicines`} />
            <Chip color="error" variant="outlined" label="Expired" />
            <Chip color="warning" variant="outlined" label="Expiring ≤ 30 days" />
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
}
