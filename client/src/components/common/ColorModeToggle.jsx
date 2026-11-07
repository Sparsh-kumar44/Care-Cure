import { IconButton, Tooltip } from '@mui/material';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import { useColorMode } from '../../ColorModeContext';

export default function ColorModeToggle(props) {
  const { mode, toggle } = useColorMode();
  const dark = mode === 'dark';
  return (
    <Tooltip title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      <IconButton onClick={toggle} aria-label="Toggle dark mode" {...props}>
        {dark ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}
