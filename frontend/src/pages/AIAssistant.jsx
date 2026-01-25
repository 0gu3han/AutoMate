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
  Stack,
  Chip,
  Divider,
  Fade,
  Zoom,
  alpha,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  SmartToy as AIIcon,
  Delete as DeleteIcon,
  PhotoCamera as CameraIcon,
  AutoAwesome as SparkleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
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
      {/* Header */}
      <Box 
        sx={{ 
          mb: 4,
          p: 3,
          borderRadius: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SparkleIcon sx={{ fontSize: 40 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              AI Car Diagnostics
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Upload images and get instant AI-powered analysis of damage, wear, and repair recommendations
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} lg={5}>
          <Card 
            elevation={0}
            sx={{ 
              border: `2px solid ${theme.palette.divider}`,
              height: '100%',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CameraIcon /> Upload for Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Select a car and upload an image to get AI diagnostics
                  </Typography>
                </Box>

                <Divider />

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2.5}>
                    {/* Car Selection */}
                    <FormControl fullWidth required>
                      <InputLabel>Select Vehicle</InputLabel>
                      <Select
                        value={selectedCar}
                        onChange={(e) => setSelectedCar(e.target.value)}
                        label="Select Vehicle"
                      >
                        {cars.map((car) => (
                          <MenuItem key={car.id} value={car.id}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography>{car.year} {car.make} {car.model}</Typography>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Image Upload */}
                    <Box>
                      <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        startIcon={<UploadIcon />}
                        sx={{ 
                          height: 56,
                          borderStyle: 'dashed',
                          borderWidth: 2,
                          '&:hover': {
                            borderWidth: 2,
                            borderStyle: 'dashed',
                          }
                        }}
                      >
                        {selectedImage ? 'Change Image' : 'Choose Image'}
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Max size: 5MB • Formats: JPG, PNG, WEBP
                      </Typography>
                    </Box>

                    {/* Image Preview */}
                    {imagePreview && (
                      <Zoom in={!!imagePreview}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2,
                            border: `2px solid ${theme.palette.primary.main}`,
                            borderRadius: 2,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              borderRadius: 1,
                              overflow: 'hidden',
                              background: '#f5f5f5',
                            }}
                          >
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{
                                width: '100%',
                                maxHeight: 300,
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          </Box>
                          <Chip
                            icon={<CheckIcon />}
                            label="Image ready"
                            color="primary"
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Paper>
                      </Zoom>
                    )}

                    {/* Description */}
                    <TextField
                      fullWidth
                      label="Additional Notes (Optional)"
                      multiline
                      rows={3}
                      value={damageDescription}
                      onChange={(e) => setDamageDescription(e.target.value)}
                      placeholder="Describe any damage, scratches, or issues you notice..."
                      variant="outlined"
                    />

                    {/* Alerts */}
                    {error && (
                      <Fade in={!!error}>
                        <Alert severity="error" icon={<WarningIcon />}>{error}</Alert>
                      </Fade>
                    )}

                    {success && (
                      <Fade in={!!success}>
                        <Alert severity="success" icon={<CheckIcon />}>{success}</Alert>
                      </Fade>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading || !selectedCar || !selectedImage}
                      startIcon={loading ? <CircularProgress size={20} /> : <SparkleIcon />}
                      sx={{
                        height: 56,
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: loading ? undefined : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        }
                      }}
                    >
                      {loading ? 'Analyzing with AI...' : 'Get AI Diagnosis'}
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} lg={7}>
          <Stack spacing={3}>
            {/* Latest AI Result */}
            {aiResult && (
              <Fade in={!!aiResult}>
                <Card 
                  elevation={0}
                  sx={{ 
                    border: `2px solid ${theme.palette.success.main}`,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <SparkleIcon sx={{ color: theme.palette.success.main }} />
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          AI Analysis Complete
                        </Typography>
                      </Box>
                      <Divider />
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 2.5, 
                          backgroundColor: 'white',
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          component="div" 
                          sx={{ 
                            whiteSpace: 'pre-wrap', 
                            lineHeight: 1.8,
                            color: 'text.primary',
                            '& strong': {
                              color: theme.palette.primary.main,
                              fontWeight: 700,
                            }
                          }}
                        >
                          {aiResult}
                        </Typography>
                      </Paper>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            )}

            {/* Recent Diagnoses */}
            <Card 
              elevation={0}
              sx={{ 
                border: `2px solid ${theme.palette.divider}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <AIIcon /> Recent Diagnoses
                </Typography>

                {diagnoses.length > 0 ? (
                  <Stack spacing={2}>
                    {diagnoses.slice(0, 5).map((diagnosis) => (
                      <Paper 
                        key={diagnosis.id} 
                        elevation={0}
                        sx={{ 
                          p: 2.5,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                          }
                        }}
                      >
                        <Stack spacing={1.5}>
                          {/* Header */}
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                icon={<AIIcon />}
                                label={diagnosis.car ? `${diagnosis.car.year} ${diagnosis.car.make} ${diagnosis.car.model}` : 'Unknown Car'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(diagnosis.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </Typography>
                            </Stack>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(diagnosis.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {/* Result */}
                          {diagnosis.ai_result ? (
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                                borderRadius: 1,
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                component="div"
                                sx={{
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: 1.6,
                                  maxHeight: '150px',
                                  overflow: 'auto',
                                  color: 'text.secondary',
                                }}
                              >
                                {diagnosis.ai_result}
                              </Typography>
                            </Paper>
                          ) : (
                            <Alert severity="info" icon={<InfoIcon />}>
                              Analysis in progress...
                            </Alert>
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      borderRadius: 2,
                    }}
                  >
                    <AIIcon sx={{ fontSize: 64, color: theme.palette.primary.light, mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Diagnoses Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Upload your first image to get started with AI diagnostics
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AIAssistant; 