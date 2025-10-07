import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert, Slide } from '@mui/material';
import { removeNotification } from '../../store/slices/notificationSlice';

const SlideTransition = (props) => {
  return <Slide {...props} direction="up" />;
};

const NotificationContainer = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.notifications);

  const handleClose = (id) => {
    dispatch(removeNotification(id));
  };

  return (
    <>
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.autoHideDuration}
          onClose={() => handleClose(notification.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          TransitionComponent={SlideTransition}
          sx={{
            mb: index * 7, // Stack notifications
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.severity}
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationContainer;
