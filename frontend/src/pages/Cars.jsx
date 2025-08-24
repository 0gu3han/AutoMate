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
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { carsAPI } from '../services/api';

function Cars() {
  const [cars, setCars] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    vin: '',
    make: '',
    model: '',
    year: '',
    owner: '',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      console.log('Fetching cars...');
      const response = await carsAPI.getAll();
      console.log('Cars response:', response.data);
      setCars(response.data.results || response.data);
      console.log('Cars set:', response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCar) {
        await carsAPI.update(editingCar.id, formData);
      } else {
        await carsAPI.create(formData);
      }
      setOpenDialog(false);
      setEditingCar(null);
      setFormData({ vin: '', make: '', model: '', year: '', owner: '' });
      fetchCars();
    } catch (error) {
      console.error('Error saving car:', error);
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      vin: car.vin,
      make: car.make,
      model: car.model,
      year: car.year.toString(),
      owner: car.owner,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await carsAPI.delete(id);
        fetchCars();
      } catch (error) {
        console.error('Error deleting car:', error);
      }
    }
  };

  const columns = [
    { 
      field: 'vin', 
      headerName: 'VIN', 
      width: isMobile ? 120 : 200,
      flex: isMobile ? 1 : undefined,
    },
    { 
      field: 'make', 
      headerName: 'Make', 
      width: isMobile ? 100 : 150,
      flex: isMobile ? 1 : undefined,
    },
    { 
      field: 'model', 
      headerName: 'Model', 
      width: isMobile ? 100 : 150,
      flex: isMobile ? 1 : undefined,
    },
    { 
      field: 'year', 
      headerName: 'Year', 
      width: isMobile ? 80 : 100,
      flex: isMobile ? 1 : undefined,
    },
    { 
      field: 'owner', 
      headerName: 'Owner', 
      width: isMobile ? 120 : 200,
      flex: isMobile ? 1 : undefined,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: isMobile ? 100 : 150,
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
        <Typography variant="h4">Cars</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          fullWidth={isMobile}
        >
          Add Car
        </Button>
      </Box>

      <Card>
        <CardContent sx={{ p: isMobile ? 1 : 2 }}>
          <DataGrid
            rows={cars}
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
          {editingCar ? 'Edit Car' : 'Add New Car'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="VIN"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Owner"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCar ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Cars; 