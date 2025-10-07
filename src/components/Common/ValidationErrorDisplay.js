import React from 'react';
import { Alert, Box, Typography } from '@mui/material';

/**
 * Component to display validation errors in a consistent format
 * @param {Object} props
 * @param {Object} props.validationErrors - Object containing field-specific validation errors
 * @param {string} props.generalMessage - General error message
 * @param {string} props.severity - Alert severity (error, warning, info, success)
 */
const ValidationErrorDisplay = ({ 
  validationErrors = {}, 
  generalMessage = '', 
  severity = 'error' 
}) => {
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const hasGeneralMessage = generalMessage && generalMessage.trim() !== '';

  if (!hasValidationErrors && !hasGeneralMessage) {
    return null;
  }

  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {hasGeneralMessage && (
        <Typography variant="body2" gutterBottom={hasValidationErrors}>
          {generalMessage}
        </Typography>
      )}
      
      {hasValidationErrors && (
        <Box>
          {Object.entries(validationErrors).map(([field, message]) => (
            <Typography 
              key={field} 
              variant="body2" 
              sx={{ 
                '&:not(:last-child)': { mb: 0.5 },
                fontWeight: field === 'general' ? 'normal' : 500 
              }}
            >
              {field !== 'general' && (
                <Box component="span" sx={{ textTransform: 'capitalize', mr: 1 }}>
                  {field}:
                </Box>
              )}
              {message}
            </Typography>
          ))}
        </Box>
      )}
    </Alert>
  );
};

export default ValidationErrorDisplay;
