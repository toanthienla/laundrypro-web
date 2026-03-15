import { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
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
import Drawer from '@mui/material/Drawer';
import { DataGrid } from '@mui/x-data-grid';

import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = useState('');

  const [dialogVisible, setDialogVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formPhone, setFormPhone] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNote, setFormNote] = useState('');
  const [formStatus, setFormStatus] = useState('active');

  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);


  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchCustomers(); }, [paginationModel, searchValue]);
  const fetchCustomers = async () => {
    try { setLoading(true); const r = await userApi.getAllCustomers({ page: paginationModel.page + 1, limit: paginationModel.pageSize, search: searchValue || undefined }); const d = r.data; setCustomers(d.customers || d || []); setTotalRecords(d.pagination?.total || 0); } catch { toast.error('Failed to fetch customers'); } finally { setLoading(false); }
  };
  const resetForm = () => { setFormPhone(''); setFormName(''); setFormEmail(''); setFormAddress(''); setFormNote(''); setFormStatus('active'); setIsEdit(false); setEditId(null); };
  const openCreateDialog = () => { resetForm(); setDialogVisible(true); };
  const openEditDialog = (c) => { resetForm(); setIsEdit(true); setEditId(c._id); setFormPhone(c.phone?.replace(/^\+84/, '0') || ''); setFormName(c.name || ''); setFormEmail(c.email || ''); setFormAddress(c.address || ''); setFormNote(c.note || ''); setFormStatus(c.status || 'active'); setDialogVisible(true); };
  const handleSave = async () => {
    if (!formPhone || !formName) { toast.warn('Phone and Name are required.'); return; }
    try { 
      setSaving(true); 
      if (isEdit) { 
        const promises = [];
        promises.push(userApi.updateCustomer(editId, { name: formName, email: formEmail, address: formAddress, note: formNote }));
        const originalCustomer = customers.find(c => c._id === editId);
        if (originalCustomer && formStatus !== (originalCustomer.status || 'active')) {
          promises.push(userApi.updateUserStatus(editId, formStatus));
        }
        await Promise.all(promises);
        toast.success('Customer updated'); 
      } else { 
        await userApi.createCustomer({ phone: formPhone.startsWith('0') ? formPhone.replace(/^0/, '+84') : formPhone, name: formName, email: formEmail, address: formAddress, note: formNote }); 
        toast.success('Customer created'); 
      } 
      setDialogVisible(false); fetchCustomers(); 
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } 
    finally { setSaving(false); }
  };
  
  const openViewDialog = (c) => { setViewTarget(c); setViewDialogVisible(true); };

  const columns = [
    { field: 'name', headerName: 'Name', minWidth: 150, flex: 1.2 },
    { field: 'phone', headerName: 'Phone', minWidth: 120, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value?.replace(/^\+84/, '0')}</Typography> },
    { field: 'address', headerName: 'Address', minWidth: 160, flex: 1.2, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value || '\u2014'}</Typography> },
    { field: 'email', headerName: 'Email', minWidth: 160, flex: 1.2, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value || '\u2014'}</Typography> },
    { field: 'isVerified', headerName: 'Verified', minWidth: 80, flex: 0.5, renderCell: (p) => <Typography variant="body2" sx={{ color: p.value ? '#16a34a' : '#6b7280', fontWeight: 600, fontSize: '0.8rem' }}>{p.value ? 'YES' : 'NO'}</Typography> },
    { field: 'lastLogin', headerName: 'Last Login', minWidth: 130, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value ? moment(p.value).format('DD/MM/YY HH:mm') : '\u2014'}</Typography> },
    { field: 'status', headerName: 'Status', minWidth: 90, flex: 0.6, renderCell: (p) => <Typography variant="body2" sx={{ color: (p.value || 'active') === 'active' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>{(p.value || 'ACTIVE').toUpperCase()}</Typography> },
    { field: 'note', headerName: 'Note', minWidth: 150, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value || '\u2014'}</Typography> },
    { field: 'createdAt', headerName: 'Created', minWidth: 90, flex: 0.6, renderCell: (p) => <Typography variant="body2" color="text.secondary">{moment(p.value).format('DD/MM/YY')}</Typography> },
    { field: 'actions', headerName: '', width: 80, sortable: false, renderCell: (p) => (<Box sx={{ display: 'flex', gap: 0.5 }}><IconButton size="small" onClick={() => openViewDialog(p.row)}><VisibilityIcon fontSize="small" /></IconButton><IconButton size="small" onClick={() => openEditDialog(p.row)}><EditIcon fontSize="small" /></IconButton></Box>) },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>Customers</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage customer profiles and history.</Typography></Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreateDialog} disableElevation>New Customer</Button>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{ l: 'Total', v: totalRecords }, { l: 'Active', v: customers.filter(c => (c.status || 'active') === 'active').length }, { l: 'Verified', v: customers.filter(c => c.isVerified).length }].map((s) => (
          <Grid size={{ xs: 4 }} key={s.l}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>{s.v}</Typography></Paper></Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <TextField placeholder="Search by name or phone" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} size="small" sx={{ mb: 2, width: { xs: '100%', md: 350 } }} />
        <DataGrid rows={customers} columns={columns} getRowId={(r) => r._id} loading={loading} paginationMode="server" rowCount={totalRecords} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]} autoHeight disableRowSelectionOnClick density="comfortable" sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' }, '& .MuiDataGrid-cell': { borderColor: 'grey.100' } }} localeText={{ noRowsLabel: 'No customers found.' }} />
      </Paper>

      <Drawer anchor="right" open={dialogVisible} onClose={() => !saving && setDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{isEdit ? 'Edit Customer' : 'New Customer'}</Typography>
          <IconButton onClick={() => setDialogVisible(false)} size="small" disabled={saving}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="Phone *" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} fullWidth size="medium" disabled={isEdit} helperText={isEdit ? 'Phone number cannot be changed' : ''} />
          <TextField label="Name *" value={formName} onChange={(e) => setFormName(e.target.value)} fullWidth size="medium" />
          <TextField label="Email (Optional)" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} fullWidth size="medium" />
          <TextField label="Address (Optional)" value={formAddress} onChange={(e) => setFormAddress(e.target.value)} fullWidth size="medium" />
          <TextField label="Notes" value={formNote} onChange={(e) => setFormNote(e.target.value)} multiline rows={3} fullWidth size="medium" />
          
          {isEdit && (
             <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
               <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Account Status</Typography>
               <TextField select label="Status" value={formStatus} onChange={(e) => setFormStatus(e.target.value)} fullWidth size="medium">
                 <MenuItem value="active">Active - Can log in</MenuItem>
                 <MenuItem value="suspended">Suspended - Cannot log in</MenuItem>
               </TextField>
             </Paper>
          )}
        </Box>
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
          <Button onClick={() => setDialogVisible(false)} disabled={saving} color="inherit" sx={{ flex: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} disableElevation sx={{ flex: 2, py: 1, fontSize: '1rem' }}>{saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Customer')}</Button>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={viewDialogVisible} onClose={() => setViewDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Customer Details</Typography>
          <IconButton onClick={() => setViewDialogVisible(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
        {viewTarget && (
          <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Profile Info</Typography>
              <Grid container spacing={2}>
                <Grid size={12}><Typography variant="caption" color="text.secondary">Name</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.name}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.phone?.replace(/^\+84/, '0')}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.email || '\u2014'}</Typography></Grid>
                <Grid size={12}><Typography variant="caption" color="text.secondary">Address</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.address || '\u2014'}</Typography></Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Account Status</Typography>
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Overall Status</Typography><Typography variant="body2" sx={{ color: (viewTarget.status || 'active') === 'active' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.8rem', mt: 0.5 }}>{(viewTarget.status || 'ACTIVE').toUpperCase()}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Verification</Typography><Typography variant="body2" sx={{ color: viewTarget.isVerified ? '#16a34a' : '#6b7280', fontWeight: 600, fontSize: '0.8rem', mt: 0.5 }}>{viewTarget.isVerified ? 'VERIFIED' : 'UNVERIFIED'}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Joined</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{moment(viewTarget.createdAt).format('DD/MM/YYYY')}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Last Login</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.lastLogin ? moment(viewTarget.lastLogin).format('DD/MM/YYYY HH:mm') : '\u2014'}</Typography></Grid>
              </Grid>
            </Paper>
            
            {(viewTarget.note) && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Notes</Typography>
                <Typography variant="body1">{viewTarget.note}</Typography>
              </Paper>
            )}
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
