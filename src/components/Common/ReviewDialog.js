import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Typography,
  Box,
  Avatar,
} from '@mui/material';

const ReviewDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  product, 
  isSubmitting = false 
}) => {
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const handleSubmit = () => {
    if (!reviewData.rating || !reviewData.comment.trim()) {
      return;
    }
    
    onSubmit(reviewData);
    setReviewData({ rating: 5, comment: '' });
  };

  const handleClose = () => {
    setReviewData({ rating: 5, comment: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar 
            src={product?.images?.[0]?.url} 
            sx={{ width: 40, height: 40 }}
          >
            {product?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h6">Write a Review</Typography>
            <Typography variant="body2" color="text.secondary">
              {product?.name}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" gutterBottom>
            How would you rate this product?
          </Typography>
          <Rating
            value={reviewData.rating}
            onChange={(e, newValue) => setReviewData(prev => ({ ...prev, rating: newValue }))}
            size="large"
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Share your experience"
            multiline
            rows={4}
            value={reviewData.comment}
            onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Tell others about your experience with this product..."
            helperText={`${reviewData.comment.length}/500 characters`}
            inputProps={{ maxLength: 500 }}
            error={reviewData.comment.length > 500}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Your review will help other customers make informed decisions.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!reviewData.rating || !reviewData.comment.trim() || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;
