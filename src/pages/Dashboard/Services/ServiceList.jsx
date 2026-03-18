import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import serviceApi from '~/apis/serviceApi';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import { DataGrid } from '@mui/x-data-grid';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InboxIcon from '@mui/icons-material/Inbox';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

export default function ServiceList() {
  const { user } = useOutletContext();
  const isAdmin = user?.role === 'admin';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('kg');
  const [formCategory, setFormCategory] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formImageFile, setFormImageFile] = useState(null);
  const [formCurrentImageUrl, setFormCurrentImageUrl] = useState('');
  const [formRemoveImage, setFormRemoveImage] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [summary, setSummary] = useState({ total: 0, active: 0, hidden: 0 });
  
  const fileInputRef = useRef(null);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchServices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchServices = async () => { try { setLoading(true); const params = { limit: 500 }; if (searchQuery) params.search = searchQuery; const r = await serviceApi.getServices(params); const d = r.data; setServices(Array.isArray(d) ? d : d.services || []); if (d?.stats) setSummary(d.stats); } catch { toast.error('Failed to fetch services.'); } finally { setLoading(false); } };
  const fetchCategories = async () => { try { const r = await serviceApi.getCategories(); setCategories((r.data || []).map(c => ({ label: c, value: c }))); } catch (err) { console.error(err); } };
  const resetForm = () => { setFormName(''); setFormPrice(''); setFormUnit(''); setFormCategory(''); setFormActive(true); setFormImageFile(null); setFormCurrentImageUrl(''); setFormRemoveImage(false); setIsEdit(false); setEditId(null); };
  const openCreateDialog = () => { resetForm(); setDialogVisible(true); };
  const openEditDialog = (s) => { resetForm(); setIsEdit(true); setEditId(s._id); setFormName(s.name || ''); setFormPrice(s.price || ''); setFormUnit(s.unit || 'kg'); setFormCategory(s.category || ''); setFormActive(s.active ?? true); setFormCurrentImageUrl(s.image || ''); setFormRemoveImage(false); setDialogVisible(true); };
  const handleSave = async () => {
    if (!formName || !formPrice || !formCategory) { toast.warn('Name, Price, Category required.'); return; }
    try {
      setSaving(true); const fd = new FormData(); fd.append('name', formName); fd.append('price', formPrice); fd.append('unit', formUnit); fd.append('category', formCategory); fd.append('active', formActive); if (formImageFile) fd.append('image', formImageFile); if (formRemoveImage) fd.append('removeImage', 'true');
      if (isEdit) { await serviceApi.updateService(editId, fd); toast.success('Updated.'); } else { await serviceApi.createService(fd); toast.success('Created.'); }
      setDialogVisible(false); fetchServices();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.'); } finally { setSaving(false); }
  };
  const confirmDel = (s) => { setDeleteTarget(s); setDeleteConfirmOpen(true); };
  const handleDelete = async () => { try { await serviceApi.deleteService(deleteTarget._id); toast.success('Deleted'); setDeleteConfirmOpen(false); fetchServices(); } catch { toast.error('Failed'); } };
  
  const openViewDialog = (s) => { setViewTarget(s); setViewDialogVisible(true); };
  
  const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const columns = [
    { field: 'image', headerName: 'Image', width: 80, sortable: false, renderCell: (p) => p.value ? <Box component="img" src={p.value} alt={p.row.name} sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }} /> : <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: 'grey.200', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><InboxIcon sx={{ fontSize: 20, color: 'grey.400' }} /></Box> },
    { field: 'name', headerName: 'Service', minWidth: 150, flex: 1.5 },
    { field: 'category', headerName: 'Category', minWidth: 120, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value}</Typography> },
    { field: 'price', headerName: 'Price', minWidth: 110, flex: 0.8, renderCell: (p) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{fmt(p.value)}</Typography> },
    { field: 'unit', headerName: 'Unit', minWidth: 70, flex: 0.5, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value}</Typography> },
    { field: 'active', headerName: 'Status', minWidth: 80, flex: 0.5, renderCell: (p) => <Typography variant="body2" sx={{ color: p.value ? '#16a34a' : '#6b7280', fontWeight: 600, fontSize: '0.8rem' }}>{p.value ? 'ACTIVE' : 'HIDDEN'}</Typography> },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (p) => (<Box sx={{ display: 'flex', gap: 0.5 }}><IconButton size="small" onClick={() => openViewDialog(p.row)}><VisibilityIcon fontSize="small" /></IconButton>{isAdmin && (<><IconButton size="small" onClick={() => openEditDialog(p.row)}><EditIcon fontSize="small" /></IconButton><IconButton size="small" onClick={() => confirmDel(p.row)}><DeleteIcon fontSize="small" /></IconButton></>)}</Box>) },
  ];

  if (loading && services.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={28} /></Box>;

  const previewUrl = formImageFile ? URL.createObjectURL(formImageFile) : formCurrentImageUrl;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>Services</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage offerings, pricing, and availability.</Typography></Box>
        {isAdmin && <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={openCreateDialog} disableElevation>Add Service</Button>}
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{ l: 'Total', v: summary.total || services.length }, { l: 'Active', v: summary.active || services.filter(s => s.active).length }, { l: 'Hidden', v: summary.hidden || services.filter(s => !s.active).length }].map((s) => (
          <Grid size={{ xs: 4 }} key={s.l}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>{s.v}</Typography></Paper></Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
        <TextField placeholder="Search by valid name or category" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} size="small" sx={{ mb: 2, width: { xs: '100%', md: 350 } }} />
        <DataGrid rows={services} columns={columns} getRowId={(r) => r._id} loading={loading} pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} autoHeight disableRowSelectionOnClick density="comfortable" sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' }, '& .MuiDataGrid-cell': { borderColor: 'grey.100' } }} localeText={{ noRowsLabel: 'No services found.' }} />
      </Paper>

      <Drawer anchor="right" open={dialogVisible} onClose={() => !saving && setDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>{isEdit ? 'Edit Service' : 'New Service'}</Typography>
          <IconButton onClick={() => setDialogVisible(false)} size="small" disabled={saving}><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField label="Name *" value={formName} onChange={(e) => setFormName(e.target.value)} fullWidth size="medium" />
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Price *" type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} fullWidth size="medium" /></Grid>
            <Grid size={6}><TextField label="Unit *" value={formUnit} onChange={(e) => setFormUnit(e.target.value)} fullWidth size="medium" placeholder="e.g. kg, pcs..." /></Grid>
          </Grid>
          <Autocomplete
            freeSolo
            options={categories}
            value={categories.find(c => c.value === formCategory) || formCategory}
            onChange={(e, nv) => setFormCategory(nv?.value || nv || '')}
            onInputChange={(e, nv) => setFormCategory(nv || '')}
            renderInput={(params) => <TextField {...params} label="Category *" size="medium" placeholder="Select or type a new category" />}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}><Typography variant="body2" sx={{ fontWeight: 500 }}>{formActive ? 'Active (Visible)' : 'Hidden'}</Typography><Switch checked={formActive} onChange={(e) => setFormActive(e.target.checked)} /></Box>
          <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, borderStyle: 'dashed', bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.secondary' }}>Service Image</Typography>
              {previewUrl && <IconButton size="small" onClick={() => { setFormImageFile(null); setFormCurrentImageUrl(''); setFormRemoveImage(true); }}><CloseIcon fontSize="small" /></IconButton>}
            </Box>
            {previewUrl && <Box component="img" src={previewUrl} alt="Preview" sx={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 1, mb: 1.5 }} />}
            <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => { if (e.target.files[0]) { setFormImageFile(e.target.files[0]); setFormRemoveImage(false); } }} />
            <Button variant="outlined" fullWidth size="medium" onClick={() => fileInputRef.current?.click()} sx={{ textTransform: 'none' }}>{formImageFile ? formImageFile.name : (previewUrl ? 'Change Image' : 'Upload Image')}</Button>
          </Box>
        </Box>
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
          <Button onClick={() => setDialogVisible(false)} disabled={saving} color="inherit" sx={{ flex: 1 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} disableElevation sx={{ flex: 2, py: 1, fontSize: '1rem' }}>{saving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Service')}</Button>
        </Box>
      </Drawer>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Delete Service?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Are you sure you want to remove <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>"{deleteTarget?.name}"</Box>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disableElevation sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="right" open={viewDialogVisible} onClose={() => setViewDialogVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Service Details</Typography>
          <IconButton onClick={() => setViewDialogVisible(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
        {viewTarget && (
          <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {viewTarget.image && (
                <Box component="img" src={viewTarget.image} alt={viewTarget.name} sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 2 }} />
            )}

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Basic Info</Typography>
              <Grid container spacing={2}>
                <Grid size={12}><Typography variant="caption" color="text.secondary">Name</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.name}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Category</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.category}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Status</Typography><Typography variant="body2" sx={{ color: viewTarget.active ? '#16a34a' : '#6b7280', fontWeight: 600, fontSize: '0.8rem', mt: 0.5 }}>{viewTarget.active ? 'ACTIVE' : 'HIDDEN'}</Typography></Grid>
              </Grid>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Pricing configuration</Typography>
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Price</Typography><Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>{fmt(viewTarget.price)}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Unit</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{viewTarget.unit}</Typography></Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
