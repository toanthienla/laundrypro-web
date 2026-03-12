import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'white', boxShadow: 1, border: 1, borderColor: 'divider', zIndex: 1000 }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Typography variant="h5" sx={{ display: 'flex', alignItems: 'baseline', fontWeight: 800, letterSpacing: '-0.04em', userSelect: 'none' }}>
            <Box component="span" sx={{ color: 'primary.main' }}>Laundry</Box>
            <Box component="span" sx={{ color: 'text.primary' }}>Pro</Box>
            <Box component="span" sx={{ color: 'secondary.main', ml: 0.2, fontSize: '1.2em' }}>.</Box>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            onClick={() => navigate('/services')}
            sx={{ display: { xs: 'none', md: 'flex' }, color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary' } }}
          >
            Services
          </Button>
          <Button
            onClick={() => navigate('/contact')}
            sx={{ display: { xs: 'none', md: 'flex' }, color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary' } }}
          >
            Contact
          </Button>
          <Button variant="contained" onClick={() => navigate('/login')} sx={{ fontWeight: 500, px: 3 }}>
            Sign In
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
