import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import orderApi from '~/apis/orderApi';
import moment from 'moment';

export default function MyOrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      try {
        setLoading(true);
        const res = await orderApi.getMyOrderById(orderId);
        setOrder(res.data);
      } catch (err) {
        toast.error('Failed to load order details.');
        navigate('/my/orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, navigate]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={28} /></Box>;
  if (!order) return <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Order not found.</Typography></Box>;

  const styleChip = (text, type) => {
    let color, bg, border;
    if (type === 'completed' || type === 'paid') { color = '#16a34a'; bg = '#f0fdf4'; border = '#bbf7d0'; }
    else if (type === 'error' || type === 'failed' || type === 'unpaid') { color = '#dc2626'; bg = '#fef2f2'; border = '#fecaca'; }
    else { color = '#d97706'; bg = '#fffbeb'; border = '#fde68a'; }
    return (
      <Typography variant="caption" sx={{ color, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 1.5, px: 2, py: 0.5, fontWeight: 700, letterSpacing: '0.05em' }}>
        {text}
      </Typography>
    );
  };

  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/my/orders')}
        sx={{ mb: 3 }}
      >
        Back to Orders
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Order #{order._id.substring(order._id.length - 6).toUpperCase()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Placed on {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {styleChip(order.status.toUpperCase(), order.status)}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Items & Notes */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Order Items
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(order.orderItems || []).map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: idx !== order.orderItems.length - 1 ? '1px dashed #e0e0e0' : 'none' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{item.serviceId?.name || 'Unknown Service'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.quantity} × {fmt(item.unitPrice)}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {fmt(item.totalPrice)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Box sx={{ minWidth: 200 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2">{fmt(order.totalPrice)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{fmt(order.totalPrice)}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {order.note && (
            <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, bgcolor: '#fffbf0', borderColor: '#fde68a' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#b45309' }}>
                Note
              </Typography>
              <Typography variant="body2" sx={{ color: '#92400e' }}>{order.note}</Typography>
            </Paper>
          )}
        </Grid>

        {/* Right Column: Customer & Payment */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Payment Info */}
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3, mb: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Payment
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              {styleChip(order.payment ? order.payment.status.toUpperCase() : 'UNPAID', order.payment ? order.payment.status : 'unpaid')}
            </Box>

            {order.payment && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Method</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>{order.payment.method}</Typography>
                </Box>
                {order.payment.transactionRef && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Ref</Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', px: 1, py: 0.5, borderRadius: 1 }}>
                      {order.payment.transactionRef}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {!order.payment || order.payment.status === 'pending' ? (
              <Button variant="contained" fullWidth sx={{ mt: 3, py: 1.5, fontWeight: 700 }}>
                Pay Now
              </Button>
            ) : null}
          </Paper>

          {/* Delivery / Personal Info */}
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}>
              Contact Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Name</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.customerId?.name || 'N/A'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Phone</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.customerId?.phone?.replace(/^\+84/, '0')}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Address</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{order.customerId?.address || 'Pickup at store'}</Typography>
              </Box>
            </Box>
          </Paper>

        </Grid>
      </Grid>
    </Box>
  );
}
