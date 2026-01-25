import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Checkbox,
  Alert,
  Stack,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NotificationsActive as ReminderIcon,
} from '@mui/icons-material';
import { maintenanceAPI, carsAPI } from '../services/api';
import dayjs from 'dayjs';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';

function Maintenance() {
  const [maintenanceEvents, setMaintenanceEvents] = useState([]);
  const [cars, setCars] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    car_id: '',
    maintenance_type: '',
    date: dayjs(),
    mileage: '',
    notes: '',
  });
  const [showReminder, setShowReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState(dayjs());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const maintenanceTypes = [
    { value: 'oil_change', label: 'Oil Change' },
    { value: 'brake_change', label: 'Brake Change' },
    { value: 'tire_rotation', label: 'Tire Rotation' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [maintenanceRes, carsRes] = await Promise.all([
        maintenanceAPI.getAll(),
        carsAPI.getAll(),
      ]);
      setMaintenanceEvents(maintenanceRes.data.results || maintenanceRes.data);
      setCars(carsRes.data.results || carsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        date: formData.date.format('YYYY-MM-DD'),
      };

      let eventId;
      if (editingEvent) {
        await maintenanceAPI.update(editingEvent.id, submitData);
        eventId = editingEvent.id;
      } else {
        const response = await maintenanceAPI.create(submitData);
        eventId = response.data.id;
      }

      // Create reminder if user enabled it
      if (showReminder && eventId) {
        try {
          await maintenanceAPI.createReminder({
            maintenance_event_id: eventId,
            reminder_date: reminderDate.format('YYYY-MM-DD'),
          });
        } catch (error) {
          console.error('Error creating reminder:', error);
          // Continue anyway - maintenance event was created
        }
      }

      setOpenDialog(false);
      setEditingEvent(null);
      setShowReminder(false);
      setFormData({
        car_id: '',
        maintenance_type: '',
        date: dayjs(),
        mileage: '',
        notes: '',
      });
      setReminderDate(dayjs());
      fetchData();
    } catch (error) {
      console.error('Error saving maintenance event:', error);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      car_id: event.car_id,
      maintenance_type: event.maintenance_type,
      date: dayjs(event.date),
      mileage: event.mileage.toString(),
      notes: event.notes,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await maintenanceAPI.delete(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting maintenance event:', error);
    }
  };

  const columns = [
    {
      field: 'car',
      headerName: 'Car',
      width: isMobile ? 150 : 200,
      flex: isMobile ? 1 : undefined,
      renderCell: (params) => {
        return params.row.car ? `${params.row.car.year} ${params.row.car.make} ${params.row.car.model}` : 'Unknown';
      },
    },
    {
      field: 'maintenance_type',
      headerName: 'Type',
      width: isMobile ? 120 : 150,
      flex: isMobile ? 1 : undefined,
      renderCell: (params) => {
        const type = maintenanceTypes.find(t => t.value === params.value);
        return type ? type.label : params.value;
      },
    },
    {
      field: 'date',
      headerName: 'Date',
      width: isMobile ? 100 : 120,
      flex: isMobile ? 1 : undefined,
      renderCell: (params) => dayjs(params.value).format('MM/DD/YYYY'),
    },
    { 
      field: 'mileage', 
      headerName: 'Mileage', 
      width: isMobile ? 80 : 120,
      flex: isMobile ? 1 : undefined,
    },
    { 
      field: 'notes', 
      headerName: 'Notes', 
      width: isMobile ? 120 : 200,
      flex: isMobile ? 1 : undefined,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: isMobile ? 80 : 150,
      flex: isMobile ? 1 : undefined,
      renderCell: (params) => (
        <Box>
          <IconButton 
            size="small"
            onClick={() => handleEdit(params.row)}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small"
            onClick={() => {
              setMaintenanceToDelete(params.row.id);
              setDeleteDialogOpen(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box 
        display="flex" 
        flexDirection={isMobile ? "column" : "row"}
        justifyContent="space-between" 
        alignItems={isMobile ? "stretch" : "center"} 
        mb={3}
        gap={isMobile ? 2 : 0}
      >
        <Typography variant="h4">Maintenance</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          fullWidth={isMobile}
        >
          Add Maintenance Record
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: isMobile ? 1 : 2 }}>
          {isMobile ? (
            // Mobile card view
            <Stack spacing={2}>
              {maintenanceEvents.map((event) => (
                <Card key={event.id} variant="outlined" sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>CAR</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {event.car ? `${event.car.year} ${event.car.make} ${event.car.model}` : 'Unknown Car'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>TYPE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {maintenanceTypes.find(t => t.value === event.maintenance_type)?.label || event.maintenance_type}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>DATE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{dayjs(event.date).format('MM/DD/YYYY')}</Typography>
                      </Box>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>MILEAGE</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.mileage} mi</Typography>
                      </Box>
                      {event.notes && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>NOTES</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.notes}</Typography>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexDirection: 'column' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(event)}
                        sx={{ color: 'primary.main' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(event.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          ) : (
            // Desktop DataGrid view
            <DataGrid
              rows={maintenanceEvents}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              disableSelectionOnClick
              autoHeight
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-columnHeader': {
                  fontSize: '0.875rem',
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingEvent ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Car</InputLabel>
                  <Select
                    value={formData.car_id}
                    onChange={(e) => setFormData({ ...formData, car_id: e.target.value })}
                    label="Car"
                  >
                    {cars.map((car) => (
                      <MenuItem key={car.id} value={car.id}>
                        {car.year} {car.make} {car.model}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Maintenance Type</InputLabel>
                  <Select
                    value={formData.maintenance_type}
                    onChange={(e) => setFormData({ ...formData, maintenance_type: e.target.value })}
                    label="Maintenance Type"
                  >
                    {maintenanceTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showReminder}
                      onChange={(e) => setShowReminder(e.target.checked)}
                    />
                  }
                  label="Set a reminder for this maintenance"
                />
              </Grid>
              {showReminder && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Choose when you'd like to be reminded about this maintenance
                  </Alert>
                  <DatePicker
                    label="Reminder Date"
                    value={reminderDate}
                    onChange={(newValue) => setReminderDate(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: showReminder,
                      },
                    }}
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingEvent ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => handleDelete(maintenanceToDelete)}
        title="Delete Maintenance Record"
        message="Are you sure you want to delete this maintenance record? This action cannot be undone."
      />
    </Box>
  );
}

export default Maintenance; 