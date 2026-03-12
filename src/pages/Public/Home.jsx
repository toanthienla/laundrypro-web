import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';
import heroImg from '~/assets/images/hero_laundry.png';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'white', color: 'text.primary', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <Grid container sx={{ flexGrow: 1 }}>
        <Grid size={{ xs: 12, md: 6 }} sx={{ p: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 8 }}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h2" sx={{ fontWeight: 600, mb: 3, color: 'text.primary', lineHeight: 1.1, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
              Track Your Laundry with Ease
            </Typography>
            <Typography variant="h6" sx={{ mt: 0, mb: 5, color: 'text.secondary', lineHeight: 1.6, fontWeight: 400 }}>
              LaundryPro lets you place laundry orders, monitor their status,
              and manage your account all in one simple platform.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" size="large" onClick={() => navigate('/login')} sx={{ fontSize: '1rem', px: 4, py: 1.5, fontWeight: 500 }}>
                Track Status
              </Button>
              <Button size="large" onClick={() => navigate('/services')} sx={{ fontSize: '1rem', px: 3, py: 1.5, fontWeight: 500, color: 'text.secondary' }}>
                Explore Services
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <Box
            component="img"
            src={heroImg}
            alt="Fresh laundry"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', boxShadow: 4, borderRadius: 1 }}
          />
        </Grid>
      </Grid>

      <Footer />
    </Box>
  );
};

export default Home;
