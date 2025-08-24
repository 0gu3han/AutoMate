import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  SmartToy as AIIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { aiAssistantAPI, carsAPI } from '../services/api';

function AIAssistant() {
  const [cars, setCars] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [damageDescription, setDamageDescription] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [carsRes, diagnosesRes] = await Promise.all([
        carsAPI.getAll(),
        aiAssistantAPI.getAll(),
      ]);
      const carsData = carsRes.data.results || carsRes.data;
      const diagnosesData = diagnosesRes.data.results || diagnosesRes.data;
      
      console.log('Cars data:', carsData);
      console.log('Diagnoses data:', diagnosesData);
      
      setCars(carsData);
      setDiagnoses(diagnosesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please refresh the page.');
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setSelectedImage(file);
      setError('');
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCar || selectedCar === '') {
      setError('Please select a car');
      return;
    }
    
    if (!selectedImage) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setAiResult('');

    try {
      const formData = new FormData();
      formData.append('car_id', selectedCar.toString());
      formData.append('image', selectedImage);
      if (damageDescription.trim()) {
        formData.append('damage_description', damageDescription.trim());
      }

      const response = await aiAssistantAPI.create(formData);
      
      // Show success message with AI result
      if (response.data.ai_result) {
        setError(''); // Clear any previous errors
        setSuccess('Image uploaded successfully! AI analysis completed.');
        setAiResult(response.data.ai_result);
      }
      
      // Reset form
      setSelectedCar('');
      setSelectedImage(null);
      setImagePreview(null);
      setDamageDescription('');
      
      // Refresh diagnoses to show the new entry
      fetchData();
    } catch (error) {
      console.error('Error submitting diagnosis request:', error);
      setError('Failed to submit diagnosis request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (diagnosisId) => {
    if (window.confirm('Are you sure you want to delete this diagnosis?')) {
      try {
        await aiAssistantAPI.delete(diagnosisId);
        setSuccess('Diagnosis deleted successfully!');
        fetchData(); // Refresh the list
      } catch (error) {
        console.error('Error deleting diagnosis:', error);
        setError('Failed to delete diagnosis. Please try again.');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Assistant
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Upload a photo of your car issue and get AI-powered diagnosis and recommendations.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Submit New Diagnosis
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Select Car</InputLabel>
                      <Select
                        value={selectedCar}
                        onChange={(e) => setSelectedCar(e.target.value)}
                        label="Select Car"
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
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<UploadIcon />}
                      sx={{ height: 56 }}
                    >
                      Upload Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </Button>
                  </Grid>
                  
                  {imagePreview && (
                    <Grid item xs={12}>
                      <Paper elevation={1} sx={{ p: 1 }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: '100%',
                            maxHeight: 200,
                            objectFit: 'contain',
                          }}
                        />
                      </Paper>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Describe any damage you see (optional)"
                      multiline
                      rows={3}
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                      placeholder="Describe any damage, scratches, dents, or issues you notice in the image..."
                      variant="outlined"
                    />
                  </Grid>
                  
                  {error && (
                    <Grid item xs={12}>
                      <Alert severity="error">{error}</Alert>
                    </Grid>
                  )}
                  
                  {success && (
                    <Grid item xs={12}>
                      <Alert severity="success">{success}</Alert>
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading || !selectedCar || !selectedImage}
                      startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
                    >
                      {loading ? 'Analyzing...' : 'Get AI Diagnosis'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
              
              {/* AI Result Display */}
              {aiResult && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    AI Analysis Result
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                    <Typography 
                      variant="body2" 
                      component="pre" 
                      sx={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                        lineHeight: 1.5
                      }}
                    >
                      {aiResult}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Diagnoses
              </Typography>
              
              {diagnoses.length > 0 ? (
                diagnoses.slice(0, 5).map((diagnosis) => (
                  <Paper key={diagnosis.id} sx={{ p: 2, mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Box display="flex" alignItems="center">
                        <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="subtitle2">
                          {(() => {
                            console.log('Diagnosis car data:', diagnosis.car);
                            return diagnosis.car ? `${diagnosis.car.year} ${diagnosis.car.make} ${diagnosis.car.model}` : 'Unknown Car';
                          })()}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(diagnosis.id)}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(diagnosis.created_at).toLocaleDateString()}
                    </Typography>
                    {diagnosis.ai_result ? (
                      <Typography 
                        variant="body2" 
                        sx={{ mt: 1 }}
                        component="pre"
                        style={{
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'inherit',
                          fontSize: '0.875rem',
                          lineHeight: 1.5,
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}
                      >
                        {diagnosis.ai_result}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Analysis in progress...
                      </Typography>
                    )}
                  </Paper>
                ))
              ) : (
                <Typography color="textSecondary">
                  No diagnoses yet. Upload an image to get started!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AIAssistant; 