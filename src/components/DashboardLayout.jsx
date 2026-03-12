import { useState } from 'react';
import { Outlet, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import authApi from '~/apis/authApi';

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import AppsIcon from '@mui/icons-material/Apps';
import ShieldIcon from '@mui/icons-material/Shield';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const DRAWER_WIDTH = 280;

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useOutletContext();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      navigate('/login');
    }
  };

  const navItems = [
    { label: 'Overview', icon: <TrendingUpIcon />, path: '/dashboard', exact: true },
    { label: 'Orders', icon: <ShoppingBagIcon />, path: '/dashboard/orders' },
    { label: 'Payments', icon: <AccountBalanceWalletIcon />, path: '/dashboard/payments' },
    { label: 'Services', icon: <AppsIcon />, path: '/dashboard/services' },
    { label: 'Customers', icon: <PeopleIcon />, path: '/dashboard/customers' },
  ];

  const adminItems = [
    { label: 'Inquiries', icon: <EmailIcon />, path: '/dashboard/contacts' },
    { label: 'Staffs', icon: <ShieldIcon />, path: '/dashboard/users' },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 1, borderColor: 'divider', height: 64, boxShadow: 2 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'baseline', fontWeight: 800, letterSpacing: '-0.04em', userSelect: 'none' }}>
          <Box component="span" sx={{ color: 'primary.main' }}>Laundry</Box>
          <Box component="span" sx={{ color: 'text.primary' }}>Pro</Box>
          <Box component="span" sx={{ color: 'secondary.main', ml: 0.2, fontSize: '1.2em' }}>.</Box>
        </Typography>
        {!isDesktop && (
          <IconButton onClick={() => setMobileOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 2 }}>
        <List disablePadding>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => handleNav(item.path)}
              selected={isActive(item.path, item.exact)}
              sx={{
                borderRadius: 2, mb: 0.5,
                '&.Mui-selected': { bgcolor: 'primary.50', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
                '&.Mui-selected:hover': { bgcolor: 'primary.100' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
            </ListItemButton>
          ))}
        </List>

        {user?.role === 'admin' && (
          <List disablePadding sx={{ mt: 1 }}>
            {adminItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => handleNav(item.path)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2, mb: 0.5,
                  '&.Mui-selected': { bgcolor: 'primary.50', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
                  '&.Mui-selected:hover': { bgcolor: 'primary.100' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      {/* User Info & Logout */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
          Sign Out
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <Box sx={{ width: DRAWER_WIDTH, flexShrink: 0, bgcolor: 'white', borderRight: 1, borderColor: 'divider', boxShadow: 2, position: 'sticky', top: 0, height: '100vh', zIndex: 1 }}>
          {sidebarContent}
        </Box>
      )}

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { lg: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, p: 0 } }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', overflow: 'hidden' }}>
        {/* Mobile Topbar */}
        <AppBar position="sticky" color="inherit" elevation={1} sx={{ display: { lg: 'none' }, bgcolor: 'white' }}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={() => setMobileOpen(true)} size="large"><MenuIcon /></IconButton>
              {/* <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>LaundryPro</Typography> */}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{user?.name || 'Staff User'}</Typography>
              <Typography variant="caption" sx={{ color: 'primary.700', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, bgcolor: 'primary.50', px: 1, py: 0.25, borderRadius: 1, border: 1, borderColor: 'primary.100' }}>{user?.role}</Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Desktop Topbar */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'white', boxShadow: 2, border: 1, borderColor: 'divider', zIndex: 1, height: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button startIcon={<OpenInNewIcon />} onClick={() => navigate('/')} sx={{ color: 'text.secondary' }}>
              View Public Site
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{user?.name || 'Staff User'}</Typography>
            <Typography variant="caption" sx={{ color: 'primary.700', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, bgcolor: 'primary.50', px: 1, py: 0.25, borderRadius: 1, border: 1, borderColor: 'primary.100' }}>{user?.role}</Typography>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 3, lg: 4 } }}>
          <Box sx={{ bgcolor: 'white', p: { xs: 3, md: 4 }, borderRadius: 4, boxShadow: 1, minHeight: '100%' }}>
            <Outlet context={{ user }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
