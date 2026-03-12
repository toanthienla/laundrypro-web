import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Pagination from '@mui/material/Pagination';
import moment from 'moment';
import orderApi from '~/apis/orderApi';
import { toast } from 'react-toastify';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders({
        page,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setOrders(res.data?.orders || []);
      setTotalRecords(res.data?.pagination?.total || 0);
    } catch (err) {
      toast.error('Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  const getStatusChip = (status) => {
    if (status === 'completed') return <Chip label="Completed" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, borderRadius: 1.5 }} />;
    return <Chip label="Pending" size="small" sx={{ bgcolor: '#fff8e1', color: '#f57c00', fontWeight: 700, borderRadius: 1.5 }} />;
  };

  const totalPages = Math.ceil(totalRecords / 10);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>My Orders</Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your laundry orders
          </Typography>
        </Box>
        <Tabs 
          value={statusFilter} 
          onChange={(e, val) => { setStatusFilter(val); setPage(1); }}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, fontWeight: 600, textTransform: 'none', px: 2, fontSize: '0.9rem' } }}
        >
          <Tab value="all" label="All Orders" />
          <Tab value="pending" label="Pending" />
          <Tab value="completed" label="Completed" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={160} />)}
        </Box>
      ) : orders.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
          <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>No orders found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You haven't placed any orders matching this filter yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => {
            const serviceDesc = (order.orderItems || [])
              .map(item => item.serviceName || item.serviceId?.name || 'Laundry Service')
              .join(', ') || 'Standard Laundry Service';

            return (
              <Card key={order._id} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.200', transition: 'border-color 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                <CardContent sx={{ p: 3, pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                          Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      {getStatusChip(order.status)}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, mb: 0.5, letterSpacing: '0.05em' }}>
                        SERVICES
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {serviceDesc}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, mb: 0.5, letterSpacing: '0.05em' }}>
                        TOTAL
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {fmt(order.totalPrice)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="text" 
                    color="primary" 
                    endIcon={<ArrowForwardIosIcon sx={{ fontSize: '12px !important' }} />}
                    onClick={() => navigate(`/my/orders/${order._id}`)}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 1, px: 2, color: 'text.primary', '&:hover': { bgcolor: 'primary.50', color: 'primary.main' } }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, val) => setPage(val)} 
            color="primary" 
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
