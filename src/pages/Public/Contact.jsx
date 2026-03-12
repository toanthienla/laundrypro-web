import React, { useState } from 'react';
import { toast } from 'react-toastify';
import contactApi from '~/apis/contactApi';
import Navbar from '~/components/Navbar';
import Footer from '~/components/Footer';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactApi.sendContact(formData);
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'white', color: 'text.primary', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <Box sx={{ flexGrow: 1, py: 8, px: { xs: 2, md: 8 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Typography variant="h3" sx={{ fontWeight: 600, color: 'text.primary', letterSpacing: '-0.02em', mb: 1.5 }}>
              Contact Us
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 300 }}>
              We'd love to hear from you. Send us a message and we'll respond promptly.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  placeholder="John Doe"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  placeholder="john@example.com"
                />
              </Grid>
            </Grid>

            <TextField
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              fullWidth
              placeholder="How can we help?"
            />

            <TextField
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={6}
              placeholder="Your message here..."
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={loading}
                sx={{
                  width: { xs: '100%', md: 'auto' },
                  px: 5, py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 500,
                  boxShadow: 3,
                  '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
                  transition: 'all 0.3s',
                }}
              >
                Send Message
              </LoadingButton>
            </Box>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default Contact;
