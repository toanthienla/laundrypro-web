import { Navigate, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authApi from '~/apis/authApi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export default function ProtectedRoute({ allowedRoles }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getProfile();
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet context={{ user }} />;
}
