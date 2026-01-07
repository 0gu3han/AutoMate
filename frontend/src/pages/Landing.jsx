import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Stack,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  TrendingUp as TrendingIcon,
  CheckCircle as CheckIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import { maintenanceAPI } from '../services/api';
import dayjs from 'dayjs';

function Landing() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [nextReminder, setNextReminder] = useState(null);
  const [reminderProgress, setReminderProgress] = useState(0);

  useEffect(() => {
    fetchNextReminder();
    // Refresh every hour
    const interval = setInterval(fetchNextReminder, 3600000);
    return () => clearInterval(interval);
  }, []);

  const fetchNextReminder = async () => {
    try {
      const response = await maintenanceAPI.getReminders();
      const reminders = response.data.results || response.data;
      
      // Find the next pending reminder
      const pendingReminders = reminders.filter(r => r.status === 'pending');
      if (pendingReminders.length > 0) {
        const nextReminder = pendingReminders.sort(
          (a, b) => new Date(a.reminder_date) - new Date(b.reminder_date)
        )[0];
        
        setNextReminder(nextReminder);
        // Calculate progress immediately and set it
        const today = dayjs();
        const reminderDay = dayjs(nextReminder.reminder_date);
        const daysUntilReminder = reminderDay.diff(today, 'day');
        
        let progress = 0;
        if (daysUntilReminder <= 0) {
          progress = 100;
        } else {
          const creationDay = dayjs(nextReminder.created_at);
          const totalDays = reminderDay.diff(creationDay, 'day');
          const daysElapsed = totalDays - daysUntilReminder;
          progress = totalDays > 0 ? Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100)) : 0;
        }
        setReminderProgress(progress);
      } else {
        setNextReminder(null);
        setReminderProgress(0);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const calculateProgress = (reminderDate, createdDate) => {
    const today = dayjs();
    const reminderDay = dayjs(reminderDate);
    const daysUntilReminder = reminderDay.diff(today, 'day');
    
    // If reminder is today or in the past, show 100%
    if (daysUntilReminder <= 0) {
      return 100;
    }
    
    // Calculate total days from creation to reminder
    const creationDay = createdDate ? dayjs(createdDate) : today;
    const totalDays = reminderDay.diff(creationDay, 'day');
    const daysElapsed = totalDays - daysUntilReminder;
    
    // Progress = days elapsed / total days * 100
    const progress = totalDays > 0 ? Math.max(0, Math.min(100, (daysElapsed / totalDays) * 100)) : 0;
    return progress;
  };

  // Feature data with icons and descriptions
  const features = [
    {
      icon: <CarIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'Smart Car Management',
      description: 'Track multiple vehicles in one place. Store VIN, make, model, year, and owner information.',
      gradient: 'linear-gradient(135deg, #0b2545 0%, #193a63 100%)',
    },
    {
      icon: <BuildIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'Maintenance Tracking',
      description: 'Log maintenance activities, schedule reminders, and keep detailed records of all service.',
      gradient: 'linear-gradient(135deg, #0b2545 0%, #c0392b 100%)',
    },
    {
      icon: <ImageIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      title: 'AI Car Diagnostics',
      description: 'Upload car images and get instant AI-powered analysis of damage, wear, and repair needs.',
      gradient: 'linear-gradient(135deg, #193a63 0%, #e05b4f 100%)',
    },
  ];

  const steps = [
    { step: 1, title: 'Sign Up', description: 'Create your account in seconds' },
    { step: 2, title: 'Add Cars', description: 'Add your vehicles with basic details' },
    { step: 3, title: 'Track Maintenance', description: 'Log services and set reminders' },
    { step: 4, title: 'Get AI Insights', description: 'Upload images for instant analysis' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#fafafa', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack spacing={3} alignItems="center">
            {/* Badge */}
            <Chip
              icon={<RocketIcon />}
              label="Now Available for Web & Mobile"
              sx={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                fontSize: '0.9rem',
                height: 'auto',
                padding: '8px',
              }}
            />

            {/* Main Title */}
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3.5rem' },
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              Take Control of Your <span style={{ fontStyle: 'italic' }}>Car Maintenance</span>
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: '1rem', md: '1.3rem' },
                fontWeight: 300,
                opacity: 0.95,
                maxWidth: 700,
                textAlign: 'center',
              }}
            >
              Never miss a service. Track your vehicles, manage maintenance, and get AI-powered diagnostics—all in one place.
            </Typography>

            {/* CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 3 }}
              alignItems="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'white',
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: '#f0f0f0',
                  },
                  minWidth: isMobile ? 'auto' : 140,
                }}
              >
                Get Started Free
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1rem',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white',
                  },
                  minWidth: isMobile ? 'auto' : 140,
                }}
              >
                Sign In
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={2} alignItems="center" sx={{ mb: 6 }}>
          <Typography variant="overline" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
            Why Choose AutoMate
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.8rem', md: '2.5rem' },
              textAlign: 'center',
            }}
          >
            All-in-One Car Management
          </Typography>
        </Stack>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'white',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                {/* Gradient top border */}
                <Box
                  sx={{
                    height: 4,
                    background: feature.gradient,
                  }}
                />

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ background: '#f5f5f5', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={2} alignItems="center" sx={{ mb: 8 }}>
            <Typography variant="overline" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
              How It Works
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.8rem', md: '2.5rem' },
                textAlign: 'center',
              }}
            >
              Get Started in 4 Easy Steps
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            {steps.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  {/* Step circle */}
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.5rem',
                      margin: '0 auto 16px',
                    }}
                  >
                    {item.step}
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>

                  {/* Connector line for desktop */}
                  {/* Decorative connector removed to avoid layout overflow on small screens */}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={3}>
          {[
            { value: '10,000+', label: 'Users Worldwide' },
            { value: '50,000+', label: 'Vehicles Tracked' },
            { value: '100,000+', label: 'Diagnostics Completed' },
            { value: '4.8★', label: 'App Rating' },
          ].map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    mb: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Reminder Progress Section */}
      {nextReminder && (
        <Box sx={{ background: '#f5f5f5', py: { xs: 4, md: 6 } }}>
          <Container maxWidth="lg">
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: theme.palette.primary.main,
                  }}
                >
                  🔔 Upcoming Maintenance Reminder
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {nextReminder.maintenance_event.car.year} {nextReminder.maintenance_event.car.make}{' '}
                  {nextReminder.maintenance_event.car.model} - {nextReminder.maintenance_event.get_maintenance_type_display?.()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, fontWeight: 600 }}>
                  Reminder Date: <span style={{ color: theme.palette.primary.main }}>
                    {dayjs(nextReminder.reminder_date).format('MMMM DD, YYYY')}
                  </span>
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Days Until Reminder
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {Math.max(0, dayjs(nextReminder.reminder_date).diff(dayjs(), 'day'))} days
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(nextReminder.reminder_date, nextReminder.created_at)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    },
                  }}
                />
              </Box>
            </Stack>
          </Container>
        </Box>
      )}

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          py: { xs: 6, md: 8 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.8rem', md: '2.5rem' },
              }}
            >
              Ready to Take Control?
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 300, opacity: 0.95 }}>
              Join thousands of car owners who trust AutoMate to manage their vehicles.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems={isMobile ? 'stretch' : 'center'}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'white',
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: '#f0f0f0',
                  },
                }}
              >
                Get Started Free
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ background: '#1a1a1a', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                AutoMate
              </Typography>
              <Typography variant="caption">
                © 2025 AutoMate. All rights reserved.
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

export default Landing;
