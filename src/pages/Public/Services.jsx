import React, { useState, useEffect } from 'react';
import serviceApi from '~/apis/serviceApi';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import InboxIcon from '@mui/icons-material/Inbox';

const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchServices(); }, [selectedCategory, search]);

  const fetchCategories = async () => {
    try {
      const res = await serviceApi.getCategories();
      if (res && res.data) setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = { active: true };
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      const res = await serviceApi.getServices(params);
      const data = res?.data?.data || res?.data || [];
      setServices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', color: 'text.primary', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ flexGrow: 1, py: 8, px: { xs: 2, md: 8 }, zIndex: 1 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, mb: 1.5, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Services
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 300 }}>
              Tailored garment care for every need.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 5, justifyContent: 'center' }}>
            <TextField
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: { xs: '100%', md: 320 } }}
            />
            <TextField
              select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
              sx={{ width: { xs: '100%', md: 220 } }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Box>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={48} />
            </Box>
          )}

          <Grid container spacing={3}>
            {!loading && services.map((service) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, xl: 3 }} key={service._id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    transition: 'all 0.3s',
                    '&:hover': { boxShadow: 8, transform: 'translateY(-4px)' },
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  {service.image ? (
                    <CardMedia
                      component="img"
                      height="180"
                      image={service.image}
                      alt={service.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <Box sx={{ height: 180, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <InboxIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                    </Box>
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                      {service.name}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {service.category}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {service.price?.toLocaleString()} <Typography component="span" variant="body2">VND</Typography>
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, bgcolor: 'grey.100', px: 1.5, py: 0.5, borderRadius: 1 }}>
                        / {service.unit}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {!loading && services.length === 0 && (
              <Grid size={12}>
                <Box sx={{ textAlign: 'center', mt: 4, color: 'text.disabled' }}>
                  <InboxIcon sx={{ fontSize: 64, mb: 2, color: 'grey.400' }} />
                  <Typography variant="h6">No services found.</Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Services;
