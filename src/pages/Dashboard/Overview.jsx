import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import orderApi from '~/apis/orderApi';
import userApi from '~/apis/userApi';
import moment from 'moment';

// MUI Imports
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';

// Recharts Imports
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StatCard = ({ label, value, loading, color = 'primary.main', sub }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
      {label}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 700, color }}>
      {loading ? <CircularProgress size={24} /> : value}
    </Typography>
    {sub && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>{sub}</Typography>}
  </Paper>
);

export default function Overview() {
  const { user } = useOutletContext();

  const [orderStats, setOrderStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (user?.role === 'admin') {
          const promises = [
            orderApi.getOrderStats().catch(() => null),
            userApi.getUserStats().catch(() => null)
          ];
          const results = await Promise.all(promises);
          if (results[0]?.data) setOrderStats(results[0].data);
          if (results[1]?.data) setUserStats(results[1].data);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user?.role]);

  const getStatusColor = (s) => {
    const map = { completed: '#16a34a', pending: '#d97706', cancelled: '#dc2626', deleted: '#9ca3af' };
    return map[s.toLowerCase()] || '#6b7280';
  };

  // --- Chart Data Preparation ---
  // 1. Pie Chart Data (Orders Status)
  const pieData = orderStats?.byStatus?.map((status) => ({
    name: status._id.toUpperCase(),
    value: status.count,
    color: getStatusColor(status._id)
  })) || [];

  // 2. Line Chart Data (Revenue Trend) - Sorted chronologically
  const lineData = [...(orderStats?.daily || [])]
    .sort((a, b) => new Date(a._id) - new Date(b._id))
    .map((day) => ({
      date: moment(day._id).format('DD/MM'),
      revenue: day.revenue
    }));

  // 3. Bar Chart Data (Top Customers)
  const barData = orderStats?.topCustomers?.map((customer) => ({
    name: customer.name,
    spent: customer.totalSpent
  })) || [];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Welcome back, <strong>{user?.name || 'Staff'}</strong> · <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role}</span>
        </Typography>
      </Box>

      {user?.role === 'admin' && (
        <>
          {/* ROW 1: STAT CARDS */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                label="Total Revenue"
                value={fmt(orderStats?.revenue?.totalRevenue)}
                loading={loading}
                color="success.main"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <StatCard
                label="Total Orders"
                value={orderStats?.revenue?.totalOrders ?? '—'}
                loading={loading}
                color="primary.main"
              />
            </Grid>
          </Grid>

          {/* ROW 2: PIE CHART & LINE CHART */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: 350 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Orders by Status</Typography>
                {loading ? <CircularProgress /> : (
                  <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: 350 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Revenue Trend (Last 7 Days)</Typography>
                {loading ? <CircularProgress /> : (
                  <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={lineData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                      <Tooltip formatter={(value) => fmt(value)} />
                      <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* ROW 3: BAR CHART */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: 400 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Top Customers by Spend</Typography>
                {loading ? <CircularProgress /> : (
                  <ResponsiveContainer width="100%" height="90%">
                    <BarChart data={barData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                      <XAxis type="number" tickFormatter={(value) => `${value / 1000}k`} />
                      <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => fmt(value)} />
                      <Bar dataKey="spent" fill="#1976d2" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}