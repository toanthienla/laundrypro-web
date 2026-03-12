import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-toastify';
import authApi from '~/apis/authApi';

export default function MySecurity() {
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      return toast.warn('New password must be at least 6 characters.');
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.warn('New passwords do not match.');
    }
    setSaving(true);
    try {
      await authApi.changePassword(passwords.oldPassword, passwords.newPassword);
      toast.success('Password changed successfully.');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Security Settings</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Update your password to keep your account secure.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
        <form onSubmit={handleSave}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="password"
                label="New Password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                helperText="Minimum 6 characters"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disableElevation
              sx={{ px: 4, py: 1.2 }}
            >
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
