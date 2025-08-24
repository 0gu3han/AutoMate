import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function TestPage() {
  const { user, logout } = useAuth();

  console.log('TestPage rendered, user:', user);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        This is a test page to debug routing issues.
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        User: {user ? JSON.stringify(user) : 'No user'}
      </Typography>
      <Button variant="contained" onClick={logout}>
        Logout
      </Button>
    </Box>
  );
}

export default TestPage; 