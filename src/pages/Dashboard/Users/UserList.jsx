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
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DataGrid } from '@mui/x-data-grid';
import Drawer from '@mui/material/Drawer';

import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [searchValue, setSearchValue] = useState('');

  // Create Staff dialog
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

  // Edit Details + Status Dialog
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [summary, setSummary] = useState({ total: 0, active: 0, verified: 0 });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUsers(); }, [paginationModel, searchValue]);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const r = await userApi.getAllUsers({ page: paginationModel.page + 1, limit: paginationModel.pageSize, search: searchValue || undefined, role: 'staff' });
      const d = r.data;
      setUsers(d.users || d || []);
      setTotalRecords(d.pagination?.total || 0);
      if (d?.stats) setSummary(d.stats);
    } catch { toast.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  // --- Create Staff ---
  const openCreateDialog = () => { setFormName(''); setFormPhone(''); setFormEmail(''); setCreateDialogVisible(true); };
  const handleCreateStaff = async () => {
    if (!formName || !formPhone) { toast.warn('Name and Phone are required.'); return; }
    try {
      setSaving(true);
      await userApi.createStaff({ name: formName, phone: formPhone.startsWith('0') ? formPhone.replace(/^0/, '+84') : formPhone, email: formEmail || undefined });
      toast.success('Staff account created.');
      setCreateDialogVisible(false); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setSaving(false); }
  };

  // --- Edit Staff ---
  const openEditDialog = (u) => {
    setEditTarget(u);
    setEditName(u.name || '');
    setEditPhone(u.phone?.replace(/^\+84/, '0') || '');
    setEditEmail(u.email || '');
    setEditStatus(u.status || 'active');
    setEditDialogVisible(true);
  };
  const handleSaveEdit = async () => {
    if (!editTarget) return;
    try {
      setEditSaving(true);

      const promises = [];

      // Detail updates
      promises.push(userApi.updateStaff(editTarget._id, {
        name: editName,
        phone: editPhone.startsWith('0') ? editPhone.replace(/^0/, '+84') : editPhone,
        email: editEmail || undefined
      }));

      // Status updates
      if (editStatus !== (editTarget.status || 'active')) promises.push(userApi.updateUserStatus(editTarget._id, editStatus));

      await Promise.all(promises);
      toast.success('Staff account updated.');
      setEditDialogVisible(false); fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); }
    finally { setEditSaving(false); }
  };
  
  const openViewDialog = (u) => { setViewTarget(u); setViewDialogVisible(true); };

  const columns = [
    { field: 'name', headerName: 'Name', minWidth: 140, flex: 1.2 },
    { field: 'phone', headerName: 'Phone', minWidth: 120, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value?.replace(/^\+84/, '0')}</Typography> },
    { field: 'email', headerName: 'Email', minWidth: 160, flex: 1.2, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value || '\u2014'}</Typography> },
    { field: 'isVerified', headerName: 'Verified', minWidth: 80, flex: 0.5, renderCell: (p) => <Typography variant="body2" sx={{ color: p.value ? '#16a34a' : '#6b7280', fontWeight: 600, fontSize: '0.8rem' }}>{p.value ? 'YES' : 'NO'}</Typography> },
    { field: 'status', headerName: 'Status', minWidth: 90, flex: 0.6, renderCell: (p) => <Typography variant="body2" sx={{ color: (p.value || 'active') === 'active' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.8rem' }}>{(p.value || 'ACTIVE').toUpperCase()}</Typography> },
    { field: 'lastLogin', headerName: 'Last Login', minWidth: 130, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value ? moment(p.value).format('DD/MM/YY HH:mm') : '\u2014'}</Typography> },
    { field: 'createdAt', headerName: 'Created', minWidth: 90, flex: 0.6, renderCell: (p) => <Typography variant="body2" color="text.secondary">{moment(p.value).format('DD/MM/YY')}</Typography> },
    { field: 'actions', headerName: '', width: 80, sortable: false, renderCell: (p) => (<Box sx={{ display: 'flex', gap: 0.5 }}><IconButton size="small" onClick={() => openViewDialog(p.row)}><VisibilityIcon fontSize="small" /></IconButton><IconButton size="small" onClick={() => openEditDialog(p.row)}><EditIcon fontSize="small" /></IconButton></Box>) },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>Staffs</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage staff accounts.</Typography></Box>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreateDialog} disableElevation>Add Staff</Button>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{ l: 'Total', v: summary.total || totalRecords }, { l: 'Active', v: summary.active || users.filter(u => (u.status || 'active') === 'active').length }, { l: 'Verified', v: summary.verified || users.filter(u => u.isVerified).length }].map((s) => (
          <Grid size={{ xs: 4 }} key={s.l}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>{s.v}</Typography></Paper></Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <TextField placeholder="Search by name or phone" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} size="small" sx={{ mb: 2, width: { xs: '100%', md: 350 } }} />
        <DataGrid rows={users} columns={columns} getRowId={(r) => r._id} loading={loading} paginationMode="server" rowCount={totalRecords} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]} autoHeight disableRowSelectionOnClick density="comfortable" sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' }, '& .MuiDataGrid-cell': { borderColor: 'grey.100' } }} localeText={{ noRowsLabel: 'No users found.' }} />
      </Paper>

      {/* Create Staff Dialog */}
      <Drawer anchor="right" open={createDialogVisible} onClose={() => !saving && setCreateDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Create Staff Account</Typography>
          <IconButton onClick={() => setCreateDialogVisible(false)} size="small" disabled={saving}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="Full Name *" value={formName} onChange={(e) => setFormName(e.target.value)} fullWidth size="medium" />
          <TextField label="Phone *" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} fullWidth size="medium" placeholder="0901234567" />
          <TextField label="Email (Optional)" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} fullWidth size="medium" placeholder="staff@laundrypro.com" />
        </Box>
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
          <Button onClick={() => setCreateDialogVisible(false)} disabled={saving} color="inherit" sx={{ flex: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateStaff} disabled={saving} disableElevation sx={{ flex: 2, py: 1, fontSize: '1rem' }}>{saving ? 'Creating...' : 'Create Staff'}</Button>
        </Box>
      </Drawer>

      {/* Edit Staff Dialog */}
      <Drawer anchor="right" open={editDialogVisible} onClose={() => !editSaving && setEditDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Edit Staff Account</Typography>
          <IconButton onClick={() => setEditDialogVisible(false)} size="small" disabled={editSaving}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Full Name *" value={editName} onChange={(e) => setEditName(e.target.value)} fullWidth size="medium" />
            <TextField label="Phone *" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} fullWidth size="medium" placeholder="0901234567" disabled={true} helperText="Phone number cannot be changed" />
            <TextField label="Email (Optional)" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} fullWidth size="medium" placeholder="staff@laundrypro.com" />
          </Box>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Account Status</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField select label="Status" value={editStatus} onChange={(e) => setEditStatus(e.target.value)} fullWidth size="medium">
                <MenuItem value="active">Active - Can log in</MenuItem>
                <MenuItem value="suspended">Suspended - Cannot log in</MenuItem>
              </TextField>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
          <Button onClick={() => setEditDialogVisible(false)} disabled={editSaving} color="inherit" sx={{ flex: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={editSaving} disableElevation sx={{ flex: 2, py: 1, fontSize: '1rem' }}>{editSaving ? 'Saving...' : 'Save Changes'}</Button>
        </Box>
      </Drawer>

      <Drawer anchor="right" open={viewDialogVisible} onClose={() => setViewDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Staff Details</Typography>
          <IconButton onClick={() => setViewDialogVisible(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
        {viewTarget && (
          <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Basic Details</Typography>
              <Grid container spacing={2}>
                <Grid size={12}><Typography variant="caption" color="text.secondary">Name</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.name}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.phone?.replace(/^\+84/, '0')}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.email || '\u2014'}</Typography></Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Permissions & Status</Typography>
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Role</Typography><Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', mt: 0.5, textTransform: 'uppercase' }}>{viewTarget.role}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Account Status</Typography><Typography variant="body2" sx={{ color: (viewTarget.status || 'active') === 'active' ? '#16a34a' : '#dc2626', fontWeight: 600, fontSize: '0.8rem', mt: 0.5 }}>{(viewTarget.status || 'ACTIVE').toUpperCase()}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Verification</Typography><Typography variant="body2" sx={{ color: viewTarget.isVerified ? '#16a34a' : '#6b7280', fontWeight: 600, fontSize: '0.8rem', mt: 0.5 }}>{viewTarget.isVerified ? 'VERIFIED' : 'UNVERIFIED'}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Joined</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{moment(viewTarget.createdAt).format('DD/MM/YYYY')}</Typography></Grid>
                <Grid size={12}><Typography variant="caption" color="text.secondary">Last Login</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.lastLogin ? moment(viewTarget.lastLogin).format('DD/MM/YYYY HH:mm') : '\u2014'}</Typography></Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
