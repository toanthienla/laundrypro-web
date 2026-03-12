import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import authApi from '~/apis/authApi';

export default function CustomerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getProfile();
        setUser(res.data);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const navRoutes = [
    { label: 'My Orders', path: '/my/orders' },
    { label: 'Payment History', path: '/my/payments' },
    { label: 'Profile', path: '/my/profile' },
    { label: 'Security', path: '/my/security' }
  ];

  // Determine current tab index; default to false if no match to avoid warnings
  const currentTabIndex = navRoutes.findIndex(t => location.pathname === t.path || (t.path === '/my/orders' && location.pathname.startsWith('/my/orders')));
  const tabValue = currentTabIndex >= 0 ? currentTabIndex : false;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="md">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', alignItems: 'center', height: 72 }}>
            {/* Logo */}
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'baseline', fontWeight: 800, letterSpacing: '-0.04em', userSelect: 'none', cursor: 'pointer' }} onClick={() => navigate('/my/orders')}>
              <Box component="span" sx={{ color: 'primary.main' }}>Laundry</Box>
              <Box component="span" sx={{ color: 'text.primary' }}>Pro</Box>
              <Box component="span" sx={{ color: 'secondary.main', ml: 0.2, fontSize: '1.2em' }}>.</Box>
            </Typography>

            {/* User Info & Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {loadingUser ? (
                <CircularProgress size={20} />
              ) : (
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                  Hello, {user?.name || 'Customer'}
                </Typography>
              )}
            </Box>
          </Toolbar>

          {/* Tabs Navigation */}
          <Tabs
            value={tabValue}
            onChange={(e, val) => navigate(navRoutes[val].path)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'text.secondary',
                px: 3,
                '&.Mui-selected': { color: 'primary.main' }
              },
              '& .MuiTabs-indicator': { height: 3, borderTopLeftRadius: 3, borderTopRightRadius: 3 }
            }}
          >
            {navRoutes.map((route, idx) => (
              <Tab key={idx} label={route.label} disableRipple />
            ))}
          </Tabs>
        </Container>
      </AppBar>

      {/* Main Content Area */}
      <Container maxWidth="md" sx={{ pt: 4, pb: 8 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
