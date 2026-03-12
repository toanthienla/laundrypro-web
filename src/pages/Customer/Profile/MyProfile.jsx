import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from 'react-toastify';
import authApi from '~/apis/authApi';
import userApi from '~/apis/userApi';

export default function MyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', note: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await authApi.getProfile();
        const data = res.data;
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          note: data.note || ''
        });
      } catch (err) {
        toast.error('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userApi.updateProfile({
        name: profile.name,
        email: profile.email,
        address: profile.address,
        note: profile.note
      });
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch {
      navigate('/');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={28} /></Box>;

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>My Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Update your personal information and contact details.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
        <form onSubmit={handleSave}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Full Name" name="name" value={profile.name} onChange={handleChange} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Phone Number" name="phone" value={profile.phone} disabled helperText="Phone number cannot be changed" />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth type="email" label="Email Address" name="email" value={profile.email} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Delivery Address" name="address" value={profile.address} onChange={handleChange} multiline rows={2} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Delivery Note / Preferences" name="note" value={profile.note} onChange={handleChange} multiline rows={2} helperText="e.g. Call before delivery, gate code, etc." />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" color="error" onClick={handleLogout} startIcon={<LogoutIcon />} sx={{ px: 3, py: 1.2, fontWeight: 700, borderRadius: 2 }}>
              Log Out
            </Button>
            <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disableElevation sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 700 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
