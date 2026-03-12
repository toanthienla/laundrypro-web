import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: 'white', py: 8, px: { xs: 2, md: 8 }, boxShadow: 4, mt: 4 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Brand & Description */}
          <Grid size={{ xs: 12, md: 4, lg: 5 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.02em', mb: 2 }}>
              LaundryPro
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, maxWidth: 360 }}>
              Create laundry orders, track their progress, and manage your account easily with LaundryPro.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { label: 'Home', path: '/' },
                { label: 'Our Services', path: '/services' },
                { label: 'Contact Us', path: '/contact' },
                { label: 'Sign In', path: '/login' },
              ].map((item) => (
                <Box
                  component="li"
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{ cursor: 'pointer', color: 'text.secondary', transition: 'color 0.2s', '&:hover': { color: 'text.primary' } }}
                >
                  {item.label}
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Contact */}
          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 2 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, color: 'text.secondary' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOnIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                <span>600 Nguyen Van Cu, Ninh Kieu, Can Tho, Vietnam</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhoneIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                <span>+84 987 654 321</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                <span>support@laundrypro.com</span>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box sx={{
          display: 'flex', flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', alignItems: 'center',
          pt: 4, color: 'text.disabled', fontSize: '0.875rem'
        }}>
          <Typography variant="body2" sx={{ mb: { xs: 2, md: 0 } }}>
            © 2026 LaundryPro. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((text) => (
              <Box key={text} component="span" sx={{ cursor: 'pointer', '&:hover': { color: 'text.primary' }, transition: 'color 0.2s' }}>
                {text}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
