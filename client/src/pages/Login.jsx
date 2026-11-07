import { useState } from 'react';
import { Box, Card, Typography, TextField, Button, Alert, InputAdornment, IconButton, Avatar } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import ColorModeToggle from '../components/common/ColorModeToggle';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(empId.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2,
        background:
          'radial-gradient(circle at 15% 20%, rgba(79,193,187,.45), transparent 45%),' +
          'radial-gradient(circle at 85% 80%, rgba(59,91,219,.30), transparent 45%),' +
          'linear-gradient(135deg,#0b3d3b,#0a2f33)'
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12, '& button': { color: '#fff' } }}><ColorModeToggle /></Box>
      <Card sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 5 }, borderRadius: 5, border: 0, boxShadow: '0 30px 80px rgba(0,0,0,.35)' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar src="/logo.png" variant="rounded" sx={{ width: 84, height: 84, mx: 'auto', mb: 2, bgcolor: '#f3f7f8', p: 1, '& img': { objectFit: 'contain' } }} />
          <Typography variant="h5" sx={{ lineHeight: 1.3 }}>Shri Ram Chandra Prasad Care &amp; Cure Clinic</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>Sign in to the clinic management system</Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={submit}>
          <TextField
            label="Employee ID"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            required
            autoFocus
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><PersonRoundedIcon fontSize="small" /></InputAdornment> }}
          />
          <TextField
            label="Password"
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockRoundedIcon fontSize="small" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShow(!show)} edge="end">
                    {show ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button type="submit" variant="contained" size="large" fullWidth disabled={busy} sx={{ py: 1.3 }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </Box>
  );
}
