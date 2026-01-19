import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Switch, FormControlLabel, Button, Grid, Alert } from '@mui/material';
import { authAPI } from '../services/api';

function Profile() {
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile: {
      phone_number: '',
      bio: '',
      email_notifications: true,
      sms_notifications: false,
      reminder_advance_days: 3,
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.getProfile();
      setProfile(data);
      setError('');
    } catch (err) {
      setError('Failed to load profile');
      console.error('Error loading profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (field, value) => {
    setProfile((prev) => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Flatten payload to match backend serializer fields
      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone_number: profile.profile?.phone_number,
        bio: profile.profile?.bio,
        email_notifications: profile.profile?.email_notifications,
        sms_notifications: profile.profile?.sms_notifications,
        reminder_advance_days: profile.profile?.reminder_advance_days,
      };
      await authAPI.updateProfile(payload);
      setSuccess('Profile updated successfully');
      
      // Refresh profile data from server
      setTimeout(() => {
        fetchProfile();
      }, 500);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Profile & Settings</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profile.first_name || ''}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profile.last_name || ''}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profile.profile?.phone_number || ''}
                      onChange={(e) => handleNestedChange('phone_number', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      minRows={3}
                      value={profile.profile?.bio || ''}
                      onChange={(e) => handleNestedChange('bio', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!profile.profile?.email_notifications}
                          onChange={(e) => handleNestedChange('email_notifications', e.target.checked)}
                        />
                      }
                      label="Email Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!profile.profile?.sms_notifications}
                          onChange={(e) => handleNestedChange('sms_notifications', e.target.checked)}
                        />
                      }
                      label="SMS Notifications"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Reminder Advance Days"
                      type="number"
                      inputProps={{ min: 0, max: 30 }}
                      value={profile.profile?.reminder_advance_days ?? 3}
                      onChange={(e) => handleNestedChange('reminder_advance_days', parseInt(e.target.value, 10) || 0)}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    Save Changes
                  </Button>
                </Box>
              </Box>
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Profile;
