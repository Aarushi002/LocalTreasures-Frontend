import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Rating,
  Paper,
  Grid,
  Chip,
} from '@mui/material';

const ReviewList = ({ reviews = [], ratings = null, showSummary = false }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No reviews yet. Be the first to review this product!
        </Typography>
      </Box>
    );
  }

  const getTimeAgo = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInDays = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  return (
    <Box>
      {/* Review Summary */}
      {showSummary && ratings && ratings.count > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box textAlign="center">
                <Typography variant="h3" color="primary">
                  {ratings.average.toFixed(1)}
                </Typography>
                <Rating value={ratings.average} readOnly />
                <Typography variant="body2" color="text.secondary">
                  Based on {ratings.count} reviews
                </Typography>
              </Box>
            </Grid>
            <Grid item xs>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = ratings.count > 0 ? (count / ratings.count) * 100 : 0;
                
                return (
                  <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 60 }}>
                      {star} stars
                    </Typography>
                    <Box
                      sx={{
                        flexGrow: 1,
                        height: 8,
                        backgroundColor: 'grey.200',
                        borderRadius: 1,
                        mx: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: 'primary.main',
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 30 }}>
                      {count}
                    </Typography>
                  </Box>
                );
              })}
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Reviews List */}
      <List>
        {reviews
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((review, index) => (
            <ListItem key={review._id || index} alignItems="flex-start" sx={{ px: 0, pb: 3 }}>
              <ListItemAvatar>
                <Avatar src={review.user.avatar?.url || review.user.avatar}>
                  {review.user.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {review.user.name}
                      </Typography>
                      <Chip 
                        label="Verified Purchase" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 20 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={review.rating} readOnly size="small" />
                      <Typography variant="caption" color="text.disabled">
                        {getTimeAgo(review.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                }
                secondary={
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {review.comment}
                  </Typography>
                }
              />
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default ReviewList;
