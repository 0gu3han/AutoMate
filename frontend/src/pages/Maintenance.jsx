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
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { maintenanceAPI, carsAPI } from '../services/api';
import dayjs from 'dayjs';

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

      if (editingEvent) {
        await maintenanceAPI.update(editingEvent.id, submitData);
      } else {
        await maintenanceAPI.create(submitData);
      }
      setOpenDialog(false);
      setEditingEvent(null);
      setFormData({
        car_id: '',
        maintenance_type: '',
        date: dayjs(),
        mileage: '',
        notes: '',
      });
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
    if (window.confirm('Are you sure you want to delete this maintenance record?')) {
      try {
        await maintenanceAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting maintenance event:', error);
      }
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
            onClick={() => handleDelete(params.row.id)}
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
          <DataGrid
            rows={maintenanceEvents}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            disableSelectionOnClick
            autoHeight
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              },
              '& .MuiDataGrid-columnHeader': {
                fontSize: isMobile ? '0.75rem' : '0.875rem',
              },
            }}
          />
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
                        {car.year} {car.make} {car.model} ({car.vin})
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
    </Box>
  );
}

export default Maintenance; 