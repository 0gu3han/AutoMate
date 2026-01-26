import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  useTheme,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Build as MaintenanceIcon,
  SmartToy as AIIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { carsAPI, maintenanceAPI, aiAssistantAPI } from '../services/api';
import dayjs from 'dayjs';

function Dashboard() {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalCars: 0,
    totalMaintenance: 0,
    totalDiagnoses: 0,
    recentMaintenance: [],
  });
  const [nextReminder, setNextReminder] = useState(null);
  const [reminderProgress, setReminderProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [carsRes, maintenanceRes, diagnosesRes, remindersRes] = await Promise.all([
          carsAPI.getAll(),
          maintenanceAPI.getAll(),
          aiAssistantAPI.getAll(),
          maintenanceAPI.getReminders(),
        ]);

        setStats({
          totalCars: (carsRes.data.results || carsRes.data || []).length,
          totalMaintenance: (maintenanceRes.data.results || maintenanceRes.data || []).length,
          totalDiagnoses: (diagnosesRes.data.results || diagnosesRes.data || []).length,
          recentMaintenance: (maintenanceRes.data.results || maintenanceRes.data || []).slice(0, 5),
        });

        // Get next reminder
        const reminders = remindersRes.data.results || remindersRes.data || [];
        const pendingReminders = reminders.filter(r => r.status === 'pending');
        if (pendingReminders.length > 0) {
          const nextReminder = pendingReminders.sort(
            (a, b) => new Date(a.reminder_date) - new Date(b.reminder_date)
          )[0];
          
          setNextReminder(nextReminder);
          // Calculate progress immediately and set it
          const progress = calculateProgress(nextReminder.reminder_date);
          setReminderProgress(progress);
        } else {
          setNextReminder(null);
          setReminderProgress(0);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats({
          totalCars: 0,
          totalMaintenance: 0,
          totalDiagnoses: 0,
          recentMaintenance: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const calculateProgress = (reminderDate) => {
    const today = dayjs();
    const reminderDay = dayjs(reminderDate);
    const daysUntilReminder = reminderDay.diff(today, 'day');
    
    // If reminder is today or in the past, show 100% (overdue/due today)
    if (daysUntilReminder <= 0) {
      return 100;
    }
    
    // Define a standard time window (e.g., 30 days)
    // Progress increases as we get closer to the reminder date
    const maxDays = 30;
    const daysFromStart = Math.max(0, maxDays - daysUntilReminder);
    
    // Progress = how far through the 30-day window we are
    const progress = Math.min(100, (daysFromStart / maxDays) * 100);
    return Math.round(progress);
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}20`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: 'text.primary' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '16px',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your car management overview
        </Typography>
      </Box>
      
      <Box sx={{ mb: 4, p: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome to AutoMate!
        </Typography>
        <Typography variant="body1">
          Your car management dashboard is ready. Start by adding your first car or explore the features below.
        </Typography>
      </Box>
      
            {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Typography variant="h6" color="text.secondary">
            Loading dashboard data...
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Cars"
                value={stats.totalCars}
                subtitle="Vehicles in fleet"
                icon={<CarIcon sx={{ color: 'white', fontSize: 28 }} />}
                color="#2563eb"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Maintenance Records"
                value={stats.totalMaintenance}
                subtitle="Service history"
                icon={<MaintenanceIcon sx={{ color: 'white', fontSize: 28 }} />}
                color="#7c3aed"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="AI Diagnoses"
                value={stats.totalDiagnoses}
                subtitle="Smart analysis"
                icon={<AIIcon sx={{ color: 'white', fontSize: 28 }} />}
                color="#10b981"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Cars"
                value={stats.totalCars}
                subtitle="Currently operational"
                icon={<TrendingUpIcon sx={{ color: 'white', fontSize: 28 }} />}
                color="#f59e0b"
              />
            </Grid>
          </Grid>

          {nextReminder && (
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <Card sx={{ 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}10 0%, ${theme.palette.secondary.main}05 100%)`,
                  border: `1px solid ${theme.palette.primary.main}20`
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: theme.palette.primary.main }}>
                          🔔 Next Maintenance Reminder
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {nextReminder.maintenance_event.car.year} {nextReminder.maintenance_event.car.make}{' '}
                          {nextReminder.maintenance_event.car.model} • {nextReminder.maintenance_event.maintenance_type.replace('_', ' ')}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Reminder Progress
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                            {Math.max(0, dayjs(nextReminder.reminder_date).diff(dayjs(), 'day'))} days remaining
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={reminderProgress}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: reminderProgress >= 80 
                                ? `linear-gradient(90deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`
                                : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {reminderProgress >= 80 ? '⚠️ Reminder approaching soon' : 'On track'}
                        </Typography>
                      </Box>

                      <Typography variant="caption" color="text.secondary">
                        Reminder Date: {dayjs(nextReminder.reminder_date).format('MMMM DD, YYYY')}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Recent Maintenance
              </Typography>
              {stats.recentMaintenance.length > 0 ? (
                stats.recentMaintenance.map((maintenance) => (
                  <Box key={maintenance.id} sx={{ 
                    mb: 2, 
                    p: 2, 
                    borderRadius: 2,
                    backgroundColor: 'white',
                    border: '1px solid #f1f5f9',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }
                  }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {maintenance.car?.make} {maintenance.car?.model}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(maintenance.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={maintenance.maintenance_type.replace('_', ' ')}
                        size="small"
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          fontWeight: 500,
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {maintenance.date} - {maintenance.mileage} miles
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="textSecondary">
                  No recent maintenance records
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography color="textSecondary" paragraph>
                Welcome to AutoMate! Your car maintenance companion.
              </Typography>
              <Typography variant="body2" color="textSecondary">
                • Add your first car to get started
                <br />
                • Track maintenance schedules
                <br />
                • Use AI to diagnose issues
                <br />
                • Keep detailed records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
        </>
      )}
    </Box>
  );
}

export default Dashboard; 