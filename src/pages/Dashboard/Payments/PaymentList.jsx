import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import paymentApi from '~/apis/paymentApi';
import moment from 'moment';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { DataGrid } from '@mui/x-data-grid';
import Drawer from '@mui/material/Drawer';

import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');

  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trxRef, setTrxRef] = useState('');
  const [updating, setUpdating] = useState(false);

  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [summary, setSummary] = useState({ total: 0, paid: 0, pending: 0, failed: 0, refunded: 0 });

  const navigate = useNavigate();

  // Define allowed state transitions
  const allowedTransitions = {
    pending: ['paid', 'failed'],
    failed: ['pending'],
    paid: ['refunded'],
    refunded: []
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPayments();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, searchQuery]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = { page: paginationModel.page + 1, limit: paginationModel.pageSize };
      if (searchQuery) params.search = searchQuery;
      const r = await paymentApi.getAllPayments(params);
      setPayments(r.data.payments || []);
      setTotalRecords(r.data.pagination?.total || 0);
      if (r.data.stats) setSummary(r.data.stats);
    } catch {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const openStatusDialog = (p) => {
    setSelectedPayment(p);
    setNewStatus(p.status); // Default to current status
    setTrxRef(p.transactionRef || '');
    setStatusDialogVisible(true);
  };

  const submitStatusUpdate = async () => {
    try {
      setUpdating(true);
      await paymentApi.updatePaymentStatus(selectedPayment._id, { status: newStatus, transactionRef: trxRef });
      toast.success('Updated');
      setStatusDialogVisible(false);
      fetchPayments();
    } catch {
      toast.error('Failed');
    } finally {
      setUpdating(false);
    }
  };

  const openViewDialog = (p) => { setViewTarget(p); setViewDialogVisible(true); };

  const statusStyle = (s) => ({ color: { paid: '#16a34a', pending: '#d97706', failed: '#dc2626', refunded: '#2563eb' }[s] || '#6b7280', fontWeight: 600, fontSize: '0.8rem' });
  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const columns = [
    { field: '_id', headerName: 'Txn ID', minWidth: 100, flex: 0.8, renderCell: (p) => <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.8rem' }}>{p.value.substring(p.value.length - 8).toUpperCase()}</Typography> },
    { field: 'orderId', headerName: 'Order', minWidth: 90, flex: 0.7, renderCell: (p) => { const v = p.value?._id || p.value; return v ? <Button size="small" onClick={() => navigate(`/dashboard/orders/${v}`)} sx={{ fontWeight: 600, p: 0, minWidth: 0 }}>#{String(v).substring(String(v).length - 6).toUpperCase()}</Button> : null; } },
    { field: 'createdAt', headerName: 'Date', minWidth: 130, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{moment(p.value).format('DD/MM/YYYY HH:mm')}</Typography> },
    { field: 'amount', headerName: 'Amount', minWidth: 100, flex: 0.8, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(p.value)}</Typography> },
    { field: 'method', headerName: 'Method', minWidth: 80, flex: 0.6, renderCell: (p) => <Typography variant="body2" sx={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{p.value}</Typography> },
    { field: 'status', headerName: 'Status', minWidth: 90, flex: 0.7, renderCell: (p) => <Typography variant="body2" sx={statusStyle(p.value)}>{p.value?.toUpperCase()}</Typography> },
    {
      field: 'actions', headerName: '', width: 80, sortable: false, renderCell: (p) => {
        const canEdit = allowedTransitions[p.row.status]?.length > 0;
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => openViewDialog(p.row)}><VisibilityIcon fontSize="small" /></IconButton>
            {canEdit && <IconButton size="small" onClick={() => openStatusDialog(p.row)}><EditIcon fontSize="small" /></IconButton>}
          </Box>
        );
      }
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>Payments</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Transaction history and payment records.</Typography></Box>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { l: 'Total', v: summary.total || totalRecords },
          { l: 'Paid', v: summary.paid || payments.filter(p => p.status === 'paid').length },
          { l: 'Pending', v: summary.pending || payments.filter(p => p.status === 'pending').length },
          { l: 'Failed', v: summary.failed || payments.filter(p => p.status === 'failed').length },
          { l: 'Refunded', v: summary.refunded || payments.filter(p => p.status === 'refunded').length }
        ].map((s) => (
          <Grid size={{ xs: 4 }} key={s.l}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}
              >
                {s.l}
              </Typography>

              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>
                {s.v}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <TextField placeholder="Search by transaction ref, or order ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small" sx={{ mb: 2, width: { xs: '100%', md: 350 } }} />
        <DataGrid rows={payments} columns={columns} getRowId={(r) => r._id} loading={loading} paginationMode="server" rowCount={totalRecords} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]} autoHeight disableRowSelectionOnClick density="comfortable" sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' }, '& .MuiDataGrid-cell': { borderColor: 'grey.100' } }} localeText={{ noRowsLabel: 'No payments.' }} />
      </Paper>

      <Drawer anchor="right" open={statusDialogVisible} onClose={() => !updating && setStatusDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Update Status</Typography>
          <IconButton onClick={() => setStatusDialogVisible(false)} size="small" disabled={updating}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField select label="Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} fullWidth size="medium">
            {/* Inject the current status into the menu items so it displays properly as the default */}
            {selectedPayment && [selectedPayment.status, ...allowedTransitions[selectedPayment.status]].map(s => (
              <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
            ))}
          </TextField>
          {(newStatus === 'paid' || newStatus === 'refunded') && <TextField label="Transaction Ref" value={trxRef} onChange={(e) => setTrxRef(e.target.value)} fullWidth size="medium" />}
        </Box>
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
          <Button onClick={() => setStatusDialogVisible(false)} disabled={updating} color="inherit" sx={{ flex: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={submitStatusUpdate} disabled={updating || newStatus === selectedPayment?.status} disableElevation sx={{ flex: 2, py: 1, fontSize: '1rem' }}>{updating ? 'Saving...' : 'Save Changes'}</Button>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={viewDialogVisible} onClose={() => setViewDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Payment Details</Typography>
          <IconButton onClick={() => setViewDialogVisible(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
        {viewTarget && (
          <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Transaction Info</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}><Typography variant="caption" color="text.secondary">Transaction ID</Typography><Typography variant="body1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>{viewTarget._id}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{moment(viewTarget.createdAt).format('DD/MM/YYYY HH:mm')}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Amount</Typography><Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>{fmt(viewTarget.amount)}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Method</Typography><Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'uppercase' }}>{viewTarget.method}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Status </Typography><Typography variant="body2" sx={{ ...statusStyle(viewTarget.status), display: 'inline-block', mt: 0.5 }}>{viewTarget.status?.toUpperCase()}</Typography></Grid>
                {viewTarget.transactionRef && <Grid item xs={12}><Typography variant="caption" color="text.secondary">Reference Note</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.transactionRef}</Typography></Grid>}
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Order Related</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Order ID</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Button variant="outlined" size="small" onClick={() => navigate(`/dashboard/orders/${viewTarget.orderId?._id || viewTarget.orderId}`)} sx={{ fontWeight: 600, fontFamily: 'monospace' }}>#{String(viewTarget.orderId?._id || viewTarget.orderId).substring(String(viewTarget.orderId?._id || viewTarget.orderId).length - 6).toUpperCase()}</Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
