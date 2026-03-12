import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import orderApi from '~/apis/orderApi';
import paymentApi from '~/apis/paymentApi';
import moment from 'moment';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';


import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
import NotesIcon from '@mui/icons-material/Notes';
import InfoIcon from '@mui/icons-material/Info';

export default function OrderDetailsDrawer({ open, orderId, onClose, onUpdate }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentDrawerVisible, setPaymentDrawerVisible] = useState(false);
  const [formMethod, setFormMethod] = useState('cash');
  const [formTrxRef, setFormTrxRef] = useState('');
  const [formMarkAsPaid, setFormMarkAsPaid] = useState(false);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const methodOpts = [{ l: 'Cash', v: 'cash' }, { l: 'MoMo', v: 'momo' }, { l: 'VNPay', v: 'vnpay' }, { l: 'Bank Transfer', v: 'bank' }];

  useEffect(() => {
    if (!open || !orderId) return;
    (async () => {
      try { setLoading(true); const res = await orderApi.getOrderById(orderId); setOrder(res.data); }
      catch { toast.error('Failed to load order details.'); onClose(); }
      finally { setLoading(false); }
    })();
  }, [orderId, open, onClose]);

  const refresh = async () => { if (!orderId) return; try { const r = await orderApi.getOrderById(orderId); setOrder(r.data); if (onUpdate) onUpdate(); } catch (e) { console.error(e); } };

  // Sync payment form state if there is already a pending payment
  useEffect(() => {
    if (paymentDrawerVisible && order?.payment) {
      setFormMethod(order.payment.method || 'cash');
      setFormTrxRef(order.payment.transactionRef || '');
      setFormMarkAsPaid(true); // Default to confirming payment since they opened the drawer to process it
    } else if (paymentDrawerVisible && !order?.payment) {
      setFormMethod('cash');
      setFormTrxRef('');
      setFormMarkAsPaid(true);
    }
  }, [paymentDrawerVisible, order]);

  const handleProcessPayment = async () => {
    try {
      setPaymentSaving(true);

      // Step 1: Create or Update Payment
      if (order.payment) {
        // Update existing payment
        await paymentApi.updatePaymentMethod(order.payment._id, formMethod);
        if (formMarkAsPaid) {
          await paymentApi.updatePaymentStatus(order.payment._id, { status: 'paid', transactionRef: formMethod !== 'cash' ? formTrxRef : undefined });
        }
      } else {
        // Create new payment
        await paymentApi.createPayment({ orderId: order._id, amount: order.totalPrice, method: formMethod, transactionRef: formTrxRef, markAsPaid: formMarkAsPaid });
      }

      // Step 2: Auto-complete order if payment is confirmed paid
      if (formMarkAsPaid && order.status !== 'completed') {
        await orderApi.updateOrderStatus(order._id, 'completed');
        toast.success('Payment recorded & Order completed!');
      } else {
        toast.success('Payment updated.');
      }

      setPaymentDrawerVisible(false);
      refresh();
    }
    catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setPaymentSaving(false); }
  };

  if (!open) return null;
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={28} /></Box>;

  const styleChip = (text, type) => {
    let color, bg, border;
    if (type === 'completed' || type === 'paid') { color = '#16a34a'; bg = '#f0fdf4'; border = '#bbf7d0'; }
    else if (type === 'error' || type === 'failed' || type === 'unpaid') { color = '#dc2626'; bg = '#fef2f2'; border = '#fecaca'; }
    else { color = '#d97706'; bg = '#fffbeb'; border = '#fde68a'; }
    return (
      <Typography variant="caption" sx={{ color, bgcolor: bg, border: `1px solid ${border}`, borderRadius: 1.5, px: 1, py: 0.25, fontWeight: 700, letterSpacing: '0.05em' }}>
        {text}
      </Typography>
    );
  };

  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  const rows = (order.orderItems || []).map((it, i) => ({ id: i, ...it }));

  return (
    <Drawer anchor="right" open={open} onClose={() => !paymentSaving && onClose()} PaperProps={{ sx: { width: { xs: '100%', md: 800 } } }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress size={28} /></Box>
      ) : !order ? (
        <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">Order not found.</Typography></Box>
      ) : (
        <Box sx={{ p: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 1.5 }}>
            <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>Order #{order._id.substring(order._id.length - 6).toUpperCase()}</Typography>
              {styleChip(order.status.toUpperCase(), order.status)}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>

            {/* Customer Section */}
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}><PersonIcon fontSize="small" /> Customer Info</Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customerId?.name || 'Unknown'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customerId?.phone?.replace(/^\+84/, '0')}</Typography>
                </Box>
                {order.customerId?.address && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', textAlign: 'right', gap: 4 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>Address</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.customerId.address}</Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Order Info Section */}
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}><InfoIcon fontSize="small" /> Order Info</Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Created At</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Created By</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.createdBy?.name || 'Unknown'}</Typography>
                </Box>
                {order.status === 'completed' && order.updatedAt && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">Completed At</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{moment(order.updatedAt).format('DD/MM/YYYY HH:mm')}</Typography>
                  </Box>
                )}
              </Paper>
            </Box>

            {/* Note Section */}
            {order.note && (
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}><NotesIcon fontSize="small" /> Order Note</Typography>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: '#fffbeb', borderLeft: 4, borderLeftColor: '#fbbf24' }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#92400e' }}>"{order.note}"</Typography>
                </Paper>
              </Box>
            )}

            {/* Items Section */}
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}><ReceiptLongIcon fontSize="small" /> Order Items</Typography>
              <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {rows.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No items attached to this order.</Typography></Box>
                  ) : rows.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: idx < rows.length - 1 ? 1 : 0, borderColor: 'divider' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.serviceName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.quantity} x {fmt(item.unitPrice)}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{fmt(item.totalPrice)}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ p: 2, bgcolor: 'primary.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: 1, borderColor: 'primary.100' }}>
                    <Typography variant="body2" color="primary.900" sx={{ fontWeight: 600 }}>Grand Total</Typography>
                    <Typography variant="h6" color="primary.900" sx={{ fontWeight: 800 }}>{fmt(order.totalPrice)}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Payment Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}><PaymentIcon fontSize="small" /> Payment Status</Typography>
              </Box>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5, bgcolor: 'grey.50' }}>
                {!order.payment ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {styleChip('UNPAID', 'unpaid')}
                    <Typography variant="body2" color="text.secondary">No payment recorded for this order.</Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      {styleChip(order.payment.status.toUpperCase(), order.payment.status)}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Method</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.payment.method?.toUpperCase()}</Typography>
                    </Box>
                    {order.payment.transactionRef && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Ref</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{order.payment.transactionRef}</Typography>
                      </Box>
                    )}
                  </>
                )}
              </Paper>
            </Box>

          </Box>

          {/* Action Footer */}
          {(order.status === 'pending' || order.payment?.status === 'pending' || !order.payment) && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Button variant="contained" color="primary" onClick={() => setPaymentDrawerVisible(true)} disableElevation>
                Process Payment & Complete
              </Button>
            </Box>
          )}

          <Drawer anchor="right" open={paymentDrawerVisible} onClose={() => !paymentSaving && setPaymentDrawerVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>{order.payment ? 'Process Payment' : 'Record Payment'}</Typography>
              <IconButton onClick={() => setPaymentDrawerVisible(false)} size="small" disabled={paymentSaving}><CloseIcon fontSize="small" /></IconButton>
            </Box>

            {/* Customer & Total Verification */}
            <Box sx={{ p: 3, bgcolor: 'primary.50', borderBottom: 1, borderColor: 'primary.100' }}>
              <Typography variant="caption" color="primary.800" sx={{ fontWeight: 600, textTransform: 'uppercase', mb: 1, display: 'block' }}>Verify Order</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="primary.900">Customer:</Typography>
                <Typography variant="body2" color="primary.900" sx={{ fontWeight: 600 }}>{order.customerId?.name || 'Unknown'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="primary.900">Amount Due:</Typography>
                <Typography variant="subtitle1" color="primary.900" sx={{ fontWeight: 800 }}>{fmt(order.totalPrice)}</Typography>
              </Box>
            </Box>

            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

              <TextField select label="Payment Method *" value={formMethod} onChange={(e) => setFormMethod(e.target.value)} fullWidth size="small">
                {methodOpts.map(o => <MenuItem key={o.v} value={o.v}>{o.l}</MenuItem>)}
              </TextField>

              {formMethod !== 'cash' && (
                <TextField label="Transaction Reference" value={formTrxRef} onChange={(e) => setFormTrxRef(e.target.value)} fullWidth size="small" />
              )}

              <Paper variant="outlined" sx={{ p: 2, bgcolor: formMarkAsPaid ? 'success.50' : 'transparent', borderColor: formMarkAsPaid ? 'success.200' : 'divider' }}>
                <FormControlLabel
                  control={<Checkbox checked={formMarkAsPaid} onChange={(e) => setFormMarkAsPaid(e.target.checked)} color="success" />}
                  label={<Typography variant="body2" sx={{ fontWeight: formMarkAsPaid ? 600 : 400, color: formMarkAsPaid ? 'success.900' : 'text.primary' }}>Confirm Payment Received</Typography>}
                />
                {formMarkAsPaid && (
                  <Typography variant="caption" color="success.700" sx={{ display: 'block', mt: 1, ml: 4 }}>
                    Order will be automatically marked as Completed.
                  </Typography>
                )}
              </Paper>

            </Box>
            <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
              <Button onClick={() => setPaymentDrawerVisible(false)} disabled={paymentSaving} color="inherit">Cancel</Button>
              <Button variant="contained" color="primary" onClick={handleProcessPayment} disabled={paymentSaving || (!formMarkAsPaid && order.status === 'completed')} disableElevation>
                {paymentSaving ? 'Saving...' : formMarkAsPaid ? 'Confirm & Complete' : 'Save Changes'}
              </Button>
            </Box>
          </Drawer>
        </Box>
      )}
    </Drawer>
  );
}

function Row({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
      {typeof value === 'string' ? <Typography variant="body2" sx={{ fontWeight: 500 }}>{value}</Typography> : value}
    </Box>
  );
}
