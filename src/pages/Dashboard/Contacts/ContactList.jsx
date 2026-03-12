import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import contactApi from '~/apis/contactApi';
import moment from 'moment';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Drawer from '@mui/material/Drawer';
import { DataGrid } from '@mui/x-data-grid';

import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => { fetchContacts(); }, [paginationModel]);
  const fetchContacts = async () => {
    try { setLoading(true); const r = await contactApi.getContacts({ page: paginationModel.page + 1, limit: paginationModel.pageSize }); const d = r.data; setContacts(d.contacts || d || []); setTotalRecords(d.pagination?.total || 0); } catch { toast.error('Failed to fetch inquiries'); } finally { setLoading(false); }
  };

  const statusStyle = (s) => ({ color: { 'new': '#d97706', read: '#2563eb', replied: '#16a34a' }[s] || '#6b7280', fontWeight: 600, fontSize: '0.8rem' });

  const columns = [
    { field: 'name', headerName: 'Name', minWidth: 130, flex: 1 },
    { field: 'email', headerName: 'Email', minWidth: 170, flex: 1.3, renderCell: (p) => <Typography variant="body2" color="text.secondary">{p.value}</Typography> },
    { field: 'subject', headerName: 'Subject', minWidth: 160, flex: 1.3 },
    { field: 'createdAt', headerName: 'Received', minWidth: 130, flex: 1, renderCell: (p) => <Typography variant="body2" color="text.secondary">{moment(p.value).format('DD/MM/YYYY HH:mm')}</Typography> },
    { field: 'status', headerName: 'Status', minWidth: 80, flex: 0.6, renderCell: (p) => <Typography variant="body2" sx={statusStyle(p.value)}>{(p.value || 'new').toUpperCase()}</Typography> },
    { field: 'actions', headerName: '', width: 40, sortable: false, renderCell: (p) => <IconButton size="small" onClick={() => { setSelectedContact(p.row); setDetailVisible(true); }}><VisibilityIcon fontSize="small" /></IconButton> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Inquiries</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Customer contact messages.</Typography>
      </Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{ l: 'Total Messages', v: totalRecords }, { l: 'Showing', v: `${contacts.length} of ${totalRecords}` }].map((s) => (
          <Grid size={{ xs: 6 }} key={s.l}><Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}><Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.l}</Typography><Typography variant="h6" sx={{ fontWeight: 700, mt: 0.5 }}>{s.v}</Typography></Paper></Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <DataGrid rows={contacts} columns={columns} getRowId={(r) => r._id} loading={loading} paginationMode="server" rowCount={totalRecords} paginationModel={paginationModel} onPaginationModelChange={setPaginationModel} pageSizeOptions={[10, 25, 50]} autoHeight disableRowSelectionOnClick density="comfortable" sx={{ border: 'none', '& .MuiDataGrid-columnHeaders': { bgcolor: 'grey.50' }, '& .MuiDataGrid-cell': { borderColor: 'grey.100' } }} localeText={{ noRowsLabel: 'No inquiries.' }} />
      </Paper>

      <Drawer anchor="right" open={detailVisible} onClose={() => setDetailVisible(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Message Details</Typography>
          <IconButton onClick={() => setDetailVisible(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          {selectedContact && (
            <>
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Name</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedContact.name}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body1">{selectedContact.email}</Typography></Grid>
              </Grid>
              <Box><Typography variant="caption" color="text.secondary">Subject</Typography><Typography variant="body1" sx={{ fontWeight: 500 }}>{selectedContact.subject || 'No Subject'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Message</Typography><Paper variant="outlined" sx={{ p: 2, mt: 0.5, borderRadius: 2, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}>{selectedContact.message}</Paper></Box>
              <Grid container spacing={2}>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Received</Typography><Typography variant="body2">{moment(selectedContact.createdAt).format('MMMM Do YYYY, h:mm a')}</Typography></Grid>
                <Grid size={6}><Typography variant="caption" color="text.secondary">Status</Typography><Typography variant="body2" sx={statusStyle(selectedContact.status)}>{(selectedContact.status || 'new').toUpperCase()}</Typography></Grid>
              </Grid>
            </>
          )}
        </Box>
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'grey.50' }}>
          <Button variant="contained" onClick={() => setDetailVisible(false)} disableElevation sx={{ px: 4, py: 1 }}>Close</Button>
        </Box>
      </Drawer>
    </Box>
  );
}
