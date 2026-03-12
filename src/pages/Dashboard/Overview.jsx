import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import orderApi from '~/apis/orderApi';
import userApi from '~/apis/userApi';
import moment from 'moment';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Overview() {
  const { user } = useOutletContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [customerCount, setCustomerCount] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const promises = [orderApi.getAllOrders({ page: 1, limit: 5 }).catch(() => null)];
        if (user?.role === 'admin') {
          promises.push(orderApi.getOrderStats().catch(() => null));
          promises.push(userApi.getAllCustomers({ page: 1, limit: 1 }).catch(() => null));
        }
        const results = await Promise.all(promises);
        if (results[0]?.data) setRecentOrders(results[0].data.orders || []);
        if (user?.role === 'admin') {
          if (results[1]?.data) setStats(results[1].data);
          if (results[2]?.data) setCustomerCount(results[2].data.pagination?.total || 0);
        }
      } catch (err) { console.error('Dashboard load error:', err); } finally { setLoading(false); }
    };
    fetchDashboardData();
  }, [user?.role]);

  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  const getStatusStyle = (s) => ({ color: s === 'completed' ? '#16a34a' : '#d97706', fontWeight: 600, fontSize: '0.8rem' });

  const columns = [
    { field: '_id', headerName: 'Order ID', minWidth: 100, flex: 0.8, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>#{p.value.substring(p.value.length - 6).toUpperCase()}</Typography> },
    { field: 'createdAt', headerName: 'Date', minWidth: 130, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{moment(p.value).format('DD/MM/YYYY HH:mm')}</Typography> },
    { field: 'customerName', headerName: 'Customer', minWidth: 130, flex: 1.2, valueGetter: (value, row) => row.customerId?.name || 'Unknown' },
    { field: 'customerPhone', headerName: 'Phone', minWidth: 110, flex: 1, valueGetter: (value, row) => row.customerId?.phone?.replace(/^\+84/, '0') || '—', renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value}</Typography> },
    { field: 'totalPrice', headerName: 'Total', minWidth: 100, flex: 0.8, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(p.value)}</Typography> },
    { field: 'status', headerName: 'Status', minWidth: 90, flex: 0.7, renderCell: (p) => <Typography variant="body2" sx={getStatusStyle(p.value)}>{p.value?.toUpperCase()}</Typography> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Welcome back, <strong>{user?.name || 'Staff'}</strong> · <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</span>
        </Typography>
      </Box>

      {user?.role === 'admin' && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Revenue', value: fmt(stats?.revenue?.totalRevenue || 0) },
            { label: 'Total Orders', value: stats?.revenue?.totalOrders || 0 },
            { label: 'Pending', value: stats?.byStatus?.find(s => s._id === 'pending')?.count || 0 },
            { label: 'Customers', value: customerCount ?? '—' },
          ].map((s) => (
            <Grid size={{ xs: 6, lg: 3 }} key={s.label}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {loading ? <CircularProgress size={18} /> : s.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {user?.role !== 'admin' && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'New Order', sub: 'Create a laundry order', path: '/dashboard/orders' },
            { label: 'View Orders', sub: 'Manage all orders', path: '/dashboard/orders' },
            { label: 'Customers', sub: 'Manage profiles', path: '/dashboard/customers' },
          ].map((a) => (
            <Grid size={{ xs: 12, md: 4 }} key={a.label}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, cursor: 'pointer', transition: 'border-color 0.2s', '&:hover': { borderColor: 'text.primary' } }} onClick={() => navigate(a.path)}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{a.label}</Typography>
                <Typography variant="caption" color="text.secondary">{a.sub}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Orders</Typography>
          <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/dashboard/orders')} sx={{ color: 'text.secondary', fontWeight: 500 }}>View All</Button>
        </Box>
        <DataGrid
          rows={recentOrders} columns={columns} getRowId={(row) => row._id}
          loading={loading} autoHeight disableRowSelectionOnClick hideFooter density="comfortable"
          sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' }, '& .MuiDataGrid-cell': { borderColor: 'grey.100' } }}
          localeText={{ noRowsLabel: 'No recent orders.' }}
        />
      </Paper>
    </Box>
  );
}
