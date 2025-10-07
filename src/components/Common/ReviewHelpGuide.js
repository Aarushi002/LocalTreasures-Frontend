import React, { useState } from 'react';
import {
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  RateReview as RateReviewIcon,
  Verified as VerifiedIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const ReviewHelpGuide = ({ canReview, user, product }) => {
  const [expanded, setExpanded] = useState(false);

  if (!user) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Please <strong>log in</strong> to leave a review for this product.
        </Typography>
      </Alert>
    );
  }

  if (canReview?.canReview) {
    return null; // User can review, no need to show help
  }

  const getAlertContent = () => {
    if (canReview?.reason === 'already_reviewed') {
      return {
        severity: 'success',
        title: '✅ Review Submitted',
        message: 'You have already reviewed this product. Thank you for your feedback!'
      };
    }

    return {
      severity: 'info',
      title: '🛒 Purchase Required',
      message: 'Only verified purchasers can review products to ensure authentic feedback.'
    };
  };

  const alertContent = getAlertContent();

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity={alertContent.severity}>
        <Typography variant="subtitle2" gutterBottom>
          {alertContent.title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {alertContent.message}
        </Typography>

        {canReview?.reason === 'not_purchased' && (
          <>
            <Accordion 
              expanded={expanded} 
              onChange={() => setExpanded(!expanded)}
              sx={{ mt: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2">
                  <InfoIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                  How to become a verified purchaser
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ShoppingCartIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Purchase the Product"
                      secondary="Add this product to your cart and complete the checkout process"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocalShippingIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Receive Your Order"
                      secondary="Wait for your order to be delivered and marked as completed"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <RateReviewIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Leave Your Review"
                      secondary="Share your experience to help other customers"
                    />
                  </ListItem>
                </List>
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    <VerifiedIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                    This verification process ensures that all reviews come from genuine customers 
                    who have actually purchased and received the product.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Alert>
    </Box>
  );
};

export default ReviewHelpGuide;
