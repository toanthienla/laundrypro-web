import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Avatar from '@mui/material/Avatar';
import Pagination from '@mui/material/Pagination';
import moment from 'moment';
import paymentApi from '~/apis/paymentApi';
import { toast } from 'react-toastify';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

export default function MyPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getMyPayments({
        page,
        limit
      });
      setPayments(res.data?.payments || []);
      setTotalRecords(res.data?.pagination?.total || 0);
    } catch (err) {
      toast.error('Failed to load your payment history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page]);

  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  const getStatusChip = (status) => {
    if (status === 'paid') return <Chip label="Paid" size="small" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 700, borderRadius: 1.5 }} />;
    if (status === 'failed') return <Chip label="Failed" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 700, borderRadius: 1.5 }} />;
    return <Chip label="Pending" size="small" sx={{ bgcolor: '#fff8e1', color: '#f57c00', fontWeight: 700, borderRadius: 1.5 }} />;
  };

  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>Payment History</Typography>
        <Typography variant="body2" color="text.secondary">
          View all your past transactions and payment statuses.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} />)}
        </Box>
      ) : payments.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
          <ReceiptLongIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary' }}>No payments found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You don't have any payment history yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {payments.map((payment) => (
            <Card key={payment._id} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        {fmt(payment.amount)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        {moment(payment.createdAt).format('DD/MM/YYYY HH:mm')} • {payment.method.toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                        ORDER REF: #{payment.orderId?._id?.substring(payment.orderId._id.length - 6).toUpperCase() || 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    {getStatusChip(payment.status)}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
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
