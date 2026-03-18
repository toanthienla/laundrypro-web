import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import orderApi from '~/apis/orderApi';
import serviceApi from '~/apis/serviceApi';
import userApi from '~/apis/userApi';
import moment from 'moment';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import { DataGrid } from '@mui/x-data-grid';

import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import InputAdornment from '@mui/material/InputAdornment';
import RemoveIcon from '@mui/icons-material/Remove';

import OrderDetailsDrawer from './OrderDetails';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const [viewOrderId, setViewOrderId] = useState(null);

  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [addItemsDrawerVisible, setAddItemsDrawerVisible] = useState(false);
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editOrderId, setEditOrderId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([]);
  const [editStatus, setEditStatus] = useState('pending');

  const [customerQuery, setCustomerQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [summary, setSummary] = useState({ total: 0, pending: 0, completed: 0, deleted: 0 });

  const getServiceId = (service) => {
    if (!service) return null;
    if (typeof service === 'string') return service;
    if (typeof service === 'object' && service._id) return String(service._id);
    if (typeof service?.toString === 'function') {
      const value = service.toString();
      return value !== '[object Object]' ? value : null;
    }
    return null;
  };

  const normalizeOrderItem = (item) => ({
    serviceId: getServiceId(item.serviceId),
    serviceName: item.serviceName || item.serviceId?.name || 'Service',
    serviceCategory: item.serviceCategory || item.serviceId?.category || '',
    serviceUnit: item.serviceUnit || item.serviceId?.unit || 'unit',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice
  });

  const mergeServices = (baseServices, orderItems = []) => {
    const merged = new Map(baseServices.map(service => [String(service._id), service]));

    orderItems.forEach((item) => {
      const serviceId = getServiceId(item.serviceId);
      if (!serviceId || merged.has(serviceId)) return;

      merged.set(serviceId, {
        _id: serviceId,
        name: item.serviceName || item.serviceId?.name || 'Service',
        category: item.serviceCategory || item.serviceId?.category || '',
        price: item.servicePrice ?? item.unitPrice ?? 0,
        unit: item.serviceUnit || item.serviceId?.unit || 'unit',
        active: false
      });
    });

    return Array.from(merged.values());
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: paginationModel.page + 1, limit: paginationModel.pageSize };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      const res = await orderApi.getAllOrders(params);
      setOrders(res.data.orders || []);
      setTotalRecords(res.data.pagination?.total || 0);
      if (res.data.stats) setSummary(res.data.stats);
    } catch { toast.error('Failed to fetch orders.'); } finally { setLoading(false); }
  }, [paginationModel.page, paginationModel.pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchOrders]);

  const loadServices = async (orderItems = []) => {
    if (services.length > 0 && orderItems.length === 0) return;
    try {
      const res = await serviceApi.getServices({ active: true });
      const d = res.data;
      const activeServices = Array.isArray(d) ? d : d.services || [];
      setServices(mergeServices(activeServices, orderItems));
    } catch { toast.error('Could not load services'); }
  };

  const searchCustomer = async (query) => {
    if (query.length < 2) { setCustomerSuggestions([]); return; }
    try {
      const res = await userApi.getAllCustomers({ search: query, limit: 5 });
      const d = res.data;
      setCustomerSuggestions(d.customers || d || []);
    } catch { setCustomerSuggestions([]); }
  };

  const clearDraft = () => {
    setCustomerQuery(''); setCustomerPhone(''); setCustomerName(''); setCustomerAddress(''); setNote(''); setItems([]); setServiceSearchQuery('');
    setIsEdit(false); setEditOrderId(null); setEditStatus('pending');
  };

  const closeCreateDialog = () => {
    if (saving) return;
    setCreateDialogVisible(false);
    setAddItemsDrawerVisible(false);
    setConfirmCreateOpen(false);
    clearDraft();
  };

  const openCreateDialog = async () => {
    clearDraft();
    setAddItemsDrawerVisible(false);
    setConfirmCreateOpen(false);
    setCreateDialogVisible(true);
    loadServices();
  };

  const handleItemQtyChange = (svc, delta) => {
    const existingIdx = items.findIndex(i => getServiceId(i.serviceId) === svc._id);
    let newItems = [...items];
    if (existingIdx >= 0) {
      let newQty = newItems[existingIdx].quantity + delta;
      if (newQty <= 0) {
        newItems.splice(existingIdx, 1);
      } else {
        newItems[existingIdx].quantity = newQty;
        newItems[existingIdx].totalPrice = newQty * newItems[existingIdx].unitPrice;
      }
    } else if (delta > 0) {
      newItems.push({ serviceId: svc._id, quantity: 1, unitPrice: svc.price, totalPrice: svc.price });
    }
    setItems(newItems);
  };

  const grandTotal = items.reduce((a, it) => a + (it.totalPrice || 0), 0);
  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v || 0);

  const handleCreateOrder = () => {
    // For non-pending edits (status change only), skip item/customer validation
    if (isEdit && editStatus !== 'pending') {
      setConfirmCreateOpen(true);
      return;
    }
    if (!customerPhone || !customerName) { toast.warn('Customer info is required.'); return; }
    if (items.length === 0 || items.some(i => !getServiceId(i.serviceId))) { toast.warn('Add at least one valid item.'); return; }
    setConfirmCreateOpen(true);
  };

  const executeSaveOrder = async () => {
    try {
      setSaving(true);
      if (isEdit) {
        const originalOrder = orders.find(o => o._id === editOrderId);
        const isPending = originalOrder?.status === 'pending';

        if (isPending) {
          // Full update: items + customer + note
          const payload = { customerPhone: customerPhone.startsWith('0') ? customerPhone.replace(/^0/, '+84') : customerPhone, customerName, customerAddress, note, items: items.map(i => ({ serviceId: getServiceId(i.serviceId), quantity: i.quantity, unitPrice: i.unitPrice })) };
          await orderApi.updateOrder(editOrderId, payload);
        } else {
          // Non-pending: only update note
          await orderApi.updateOrder(editOrderId, { note });
        }
        // Update status if changed
        if (originalOrder && originalOrder.status !== editStatus) {
          await orderApi.updateOrderStatus(editOrderId, editStatus);
        }
        toast.success('Order updated!');
      } else {
        const payload = { customerPhone: customerPhone.startsWith('0') ? customerPhone.replace(/^0/, '+84') : customerPhone, customerName, customerAddress, note, items: items.map(i => ({ serviceId: getServiceId(i.serviceId), quantity: i.quantity, unitPrice: i.unitPrice })) };
        await orderApi.createOrder(payload);
        toast.success('Order created!');
      }
      closeCreateDialog();
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = async (row) => {
    clearDraft();
    setIsEdit(true);
    setEditOrderId(row._id);

    const phone = row.customerId?.phone?.replace(/^\+84/, '0') || '';
    setCustomerPhone(phone);
    setCustomerQuery(phone);
    setCustomerName(row.customerId?.name || '');
    setCustomerAddress(row.customerId?.address || '');
    setNote(row.note || '');
    setEditStatus(row.status || 'pending');

    if (row.orderItems) {
      const normalizedItems = row.orderItems.map(normalizeOrderItem);
      setItems(normalizedItems);
      loadServices(row.orderItems);
    } else {
      setItems([]);
      loadServices();
    }

    setCreateDialogVisible(true);
  };


  const statusStyle = (s) => ({ color: s === 'completed' ? '#16a34a' : '#d97706', fontWeight: 600, fontSize: '0.8rem' });
  const payStyle = (s) => ({ color: { paid: '#16a34a', pending: '#d97706', failed: '#dc2626', refunded: '#2563eb' }[s] || '#6b7280', fontWeight: 600, fontSize: '0.8rem' });

  const columns = [
    { field: '_id', headerName: 'Order ID', minWidth: 100, flex: 0.7, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>#{p.value.substring(p.value.length - 6).toUpperCase()}</Typography> },
    { field: 'createdAt', headerName: 'Date', minWidth: 130, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{moment(p.value).format('DD/MM/YYYY HH:mm')}</Typography> },
    { field: 'customerName', headerName: 'Customer', minWidth: 120, flex: 1, valueGetter: (value, row) => row.customerId?.name || 'Unknown' },
    { field: 'customerPhone', headerName: 'Phone', minWidth: 110, flex: 0.8, valueGetter: (value, row) => row.customerId?.phone?.replace(/^\+84/, '0') || '—', renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value}</Typography> },
    { field: 'totalPrice', headerName: 'Total', minWidth: 100, flex: 0.8, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(p.value)}</Typography> },
    { field: 'note', headerName: 'Note', minWidth: 120, flex: 1, renderCell: (p) => <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.value || '—'}</Typography> },
    { field: 'status', headerName: 'Status', minWidth: 90, flex: 0.7, renderCell: (p) => <Typography variant="body2" sx={statusStyle(p.value)}>{p.value?.toUpperCase()}</Typography> },
    { field: 'payment', headerName: 'Payment', minWidth: 90, flex: 0.7, renderCell: (p) => <Typography variant="body2" sx={payStyle(p.value?.status)}>{p.value ? p.value.status.toUpperCase() : 'UNPAID'}</Typography> },
    {
      field: 'actions', headerName: '', width: 120, sortable: false, renderCell: (p) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={() => setViewOrderId(p.row._id)}><VisibilityIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => openEditDialog(p.row)}><EditIcon fontSize="small" /></IconButton>
        </Box>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Orders</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage laundry processing and view details.</Typography>
        </Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreateDialog} disableElevation>New Order</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total', value: summary.total || totalRecords },
          { label: 'Pending', value: summary.pending || orders.filter(o => o.status === 'pending').length },
          { label: 'Completed', value: summary.completed || orders.filter(o => o.status === 'completed').length },
          { label: 'Deleted', value: summary.deleted || orders.filter(o => o.status === 'deleted').length },
        ].map((s) => (
          <Grid size={{ xs: 3 }} key={s.label}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>{s.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField placeholder="Search by name, phone, note, or order ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small" sx={{ width: { xs: '100%', md: 350 } }} />
          <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ width: { xs: '100%', sm: 150 } }}>
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="deleted">Deleted</MenuItem>
          </TextField>
        </Box>
        <DataGrid rows={orders} columns={columns} getRowId={(r) => r._id} loading={loading} paginationMode="server" rowCount={totalRecords} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]} autoHeight disableRowSelectionOnClick density="comfortable" sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' }, '& .MuiDataGrid-cell': { borderColor: 'grey.100' } }} localeText={{ noRowsLabel: 'No orders found.' }} />
      </Paper>

      {/* Create / Edit Order Drawer */}
      <Drawer anchor="right" open={createDialogVisible} onClose={closeCreateDialog} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{isEdit ? 'Edit Order' : 'Create New Order'}</Typography>
          <IconButton onClick={closeCreateDialog} size="small" disabled={saving}><CloseIcon fontSize="small" /></IconButton>
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {/* Customer & Items: only editable for pending orders or new order */}
          {(!isEdit || editStatus === 'pending') && (<>
            {/* Customer Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>1. Customer Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Autocomplete
                  freeSolo
                  options={customerSuggestions}
                  getOptionLabel={(o) => typeof o === 'string' ? o : o.phone?.replace(/^\+84/, '0') || ''}
                  filterOptions={(x) => x}
                  inputValue={customerQuery}
                  onInputChange={(e, v) => { setCustomerQuery(v); setCustomerPhone(v); searchCustomer(v); }}
                  onChange={(e, v) => {
                    if (v && typeof v !== 'string') {
                      setCustomerPhone(v.phone?.replace(/^\+84/, '0') || '');
                      setCustomerName(v.name || '');
                      setCustomerAddress(v.address || '');
                      setCustomerQuery(v.phone?.replace(/^\+84/, '0') || '');
                    }
                  }}
                  renderOption={(props, o) => (
                    <Box component="li" {...props} key={o._id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, width: '100%', py: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{o.name}</Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>{o.phone?.replace(/^\+84/, '0')}</Typography>
                    </Box>
                  )}
                  renderInput={(params) => <TextField {...params} label="Phone Number *" size="medium" placeholder="Search by phone..." helperText="Will auto-fill known customers. Edits below will update profile." />}
                />
                <Grid container spacing={2}>
                  <Grid size={12}><TextField label="Full Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} fullWidth size="small" /></Grid>
                  <Grid size={12}><TextField label="Address (Optional)" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} fullWidth size="small" placeholder="Delivery/pickup address" /></Grid>
                </Grid>
              </Box>
            </Box>

            <Divider />

            {/* Items Section */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>2. Selected Order Items</Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => setAddItemsDrawerVisible(true)} sx={{ py: 0.25, fontSize: '0.75rem' }}>
                  {items.length > 0 ? 'Edit Items' : 'Add Items'}
                </Button>
              </Box>

              {items.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 2, borderStyle: 'dashed' }}>
                  <Typography variant="body2" color="text.secondary">No items added yet.</Typography>
                  <Button variant="text" size="small" onClick={() => setAddItemsDrawerVisible(true)} sx={{ mt: 1 }}>Browse Services</Button>
                </Box>
              ) : (
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'primary.50', border: 1, borderColor: 'primary.100' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {items.map(it => {
                      const svcName = services.find(s => s._id === getServiceId(it.serviceId))?.name || it.serviceName || 'Service';
                      return (
                        <Box key={getServiceId(it.serviceId)} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{it.quantity}x {svcName}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{fmt(it.totalPrice)}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          </>)}

          <Divider />

          <Box>
            {/* Status-change-only edit: show only status select */}
            {isEdit && editStatus !== 'pending' ? (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>Change Order Status</Typography>
                <TextField
                  select
                  label="Order Status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  size="small"
                  fullWidth
                  helperText="Updating status will take effect immediately after confirmation."
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="deleted">Deleted</MenuItem>
                </TextField>
              </>
            ) : (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>3. Additional Details</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField label="Order Notes" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Special instructions or preferences..." fullWidth size="small" multiline rows={2} />
                  {isEdit && (
                    <TextField
                      select
                      label="Order Status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      size="small"
                      fullWidth
                      helperText="Change the current status of this order."
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                      <MenuItem value="deleted">Deleted</MenuItem>
                    </TextField>
                  )}
                </Box>
              </>
            )}
          </Box>

        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Grand Total</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>{fmt(grandTotal)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button onClick={closeCreateDialog} disabled={saving} color="inherit" sx={{ flex: 1 }}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateOrder} disabled={saving} disableElevation sx={{ flex: 2, py: 1, fontSize: '1rem' }}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Order'}</Button>
          </Box>
        </Box>
      </Drawer>

      {/* Nested Add Items Drawer */}
      <Drawer anchor="right" open={addItemsDrawerVisible} onClose={() => setAddItemsDrawerVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Select Services</Typography>
          <IconButton onClick={() => setAddItemsDrawerVisible(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>

        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <TextField
            placeholder="Search services..."
            value={serviceSearchQuery}
            onChange={(e) => setServiceSearchQuery(e.target.value)}
            size="small"
            fullWidth
            sx={{ mb: 3 }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {services.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Loading services...</Typography>
            ) : (
              services
                .filter(svc => svc.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || (svc.category && svc.category.toLowerCase().includes(serviceSearchQuery.toLowerCase())))
                .map(svc => {
                  const selectedItem = items.find(i => getServiceId(i.serviceId) === svc._id);
                  const qty = selectedItem ? selectedItem.quantity : 0;
                  return (
                    <Paper key={svc._id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: qty > 0 ? 'primary.main' : 'divider', bgcolor: qty > 0 ? 'primary.50' : 'background.paper', transition: 'all 0.2s' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: qty > 0 ? 'primary.main' : 'text.primary' }}>{svc.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{fmt(svc.price)} / {svc.unit || 'unit'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <IconButton size="small" onClick={() => handleItemQtyChange(svc, -1)} disabled={qty === 0} sx={{ border: 1, borderColor: qty > 0 ? 'primary.main' : 'divider', borderRadius: 1.5, p: 0.25, color: qty > 0 ? 'primary.main' : 'action.disabled' }}><RemoveIcon fontSize="small" /></IconButton>
                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 20, textAlign: 'center', color: qty > 0 ? 'primary.main' : 'text.primary' }}>{qty}</Typography>
                        <IconButton size="small" onClick={() => handleItemQtyChange(svc, 1)} color="primary" sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1.5, p: 0.25, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}><AddIcon fontSize="small" /></IconButton>
                      </Box>
                    </Paper>
                  );
                })
            )}
          </Box>
        </Box>

        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
          <Button variant="contained" fullWidth onClick={() => setAddItemsDrawerVisible(false)} disableElevation>
            Done
          </Button>
        </Box>
      </Drawer>

      <Dialog open={confirmCreateOpen} onClose={() => !saving && setConfirmCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEdit ? 'Confirm Status Change' : 'Confirm Order Details'}
        </DialogTitle>
        <DialogContent dividers>
          {isEdit ? (
            // Status-change confirmation
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DialogContentText sx={{ color: 'text.primary', fontSize: '0.9rem' }}>
                You are about to change the status of order <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>#{editOrderId?.slice(-6).toUpperCase()}</Box> for <Box component="span" sx={{ fontWeight: 600 }}>{customerName}</Box> to:
              </DialogContentText>
              <Box sx={{
                p: 2, borderRadius: 2, textAlign: 'center', border: 2,
                borderColor: editStatus === 'completed' ? 'success.main' : editStatus === 'deleted' ? 'error.main' : 'warning.main',
                bgcolor: editStatus === 'completed' ? 'success.50' : editStatus === 'deleted' ? 'error.50' : 'warning.50'
              }}>
                <Typography variant="h6" sx={{
                  fontWeight: 700,
                  color: editStatus === 'completed' ? 'success.dark' : editStatus === 'deleted' ? 'error.dark' : 'warning.dark'
                }}>
                  {editStatus.toUpperCase()}
                </Typography>
                <Typography variant="caption" sx={{
                  color: editStatus === 'completed' ? 'success.dark' : editStatus === 'deleted' ? 'error.dark' : 'warning.dark'
                }}>
                  {editStatus === 'completed' && 'Order will be marked as completed.'}
                  {editStatus === 'pending' && 'Order will be moved to pending.'}
                  {editStatus === 'deleted' && 'Order will be marked as deleted. This can be reversed.'}
                </Typography>
              </Box>
            </Box>
          ) : (
            // New order confirmation
            <>
              <DialogContentText sx={{ mb: 2, color: 'text.primary', fontSize: '0.9rem' }}>
                Please verify the order information for <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>{customerName}</Box> ({customerPhone}) before creating the order.
              </DialogContentText>
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, border: 1, borderColor: 'primary.100' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
                  {items.map(it => {
                    const svcName = services.find(s => s._id === getServiceId(it.serviceId))?.name || it.serviceName || 'Service';
                    return (
                      <Box key={getServiceId(it.serviceId)} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">{it.quantity}x {svcName}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{fmt(it.totalPrice)}</Typography>
                      </Box>
                    );
                  })}
                </Box>
                <Divider sx={{ my: 1, borderColor: 'primary.100', borderStyle: 'dashed' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Grand Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>{fmt(grandTotal)}</Typography>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setConfirmCreateOpen(false)} disabled={saving} color="inherit">Cancel</Button>
          <Button onClick={executeSaveOrder} variant="contained" disabled={saving} disableElevation
            color={isEdit && editStatus === 'deleted' ? 'error' : isEdit && editStatus === 'completed' ? 'success' : 'primary'}
          >
            {saving ? 'Saving...' : isEdit ? `Confirm ${editStatus.charAt(0).toUpperCase() + editStatus.slice(1)}` : 'Confirm & Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <OrderDetailsDrawer open={!!viewOrderId} orderId={viewOrderId} onClose={useCallback(() => setViewOrderId(null), [])} onUpdate={fetchOrders} />
    </Box>
  );
}
