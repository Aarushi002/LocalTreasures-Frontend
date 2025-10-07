import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Chip } from '@mui/material';
import { MapOutlined, InfoOutlined } from '@mui/icons-material';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

const MapComponent = ({ 
  center, 
  zoom = 13, 
  markers = [], 
  onMapClick, 
  height = '400px',
  width = '100%',
  className,
  ...props 
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const markerInstancesRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: center || { lat: 37.7749, lng: -122.4194 }, // Default to SF
        zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        ...props,
      });

      setMap(newMap);

      // Add click listener
      if (onMapClick) {
        newMap.addListener('click', (event) => {
          onMapClick({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
          });
        });
      }
    }
  }, [map, center, zoom, onMapClick, props]);

  // Update map center when center prop changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center]);

  // Update markers
  useEffect(() => {
    if (map && markers && markers.length > 0) {
      // Clear existing markers
      markerInstancesRef.current.forEach(marker => {
        if (marker.setMap) {
          marker.setMap(null);
        }
      });

      // Add new markers using standard Marker
      const newMarkers = markers.map(markerData => {
        try {
          const marker = new window.google.maps.Marker({
            position: markerData.position,
            map: map,
            title: markerData.title || '',
            icon: markerData.icon,
          });

          // Add info window if content is provided
          if (markerData.infoWindow && marker) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: markerData.infoWindow,
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });
          }

          // Add click listener if provided
          if (markerData.onClick && marker) {
            marker.addListener('click', () => {
              markerData.onClick(markerData);
            });
          }

          return marker;
        } catch (error) {
          console.error('Failed to create marker:', error);
          return null;
        }
      }).filter(Boolean); // Filter out any null markers

      markerInstancesRef.current = newMarkers;
    }
  }, [map, markers]);

  // Cleanup markers on unmount
  useEffect(() => {
    return () => {
      markerInstancesRef.current.forEach(marker => {
        if (marker.setMap) {
          marker.setMap(null);
        }
      });
    };
  }, []);

  return (
    <Box
      ref={mapRef}
      sx={{
        height,
        width,
        '& > div': {
          height: '100% !important',
          width: '100% !important',
        },
      }}
      className={className}
    />
  );
};

const MapWrapper = (props) => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const render = (status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={props.height || '400px'}
          >
            <CircularProgress />
          </Box>
        );
      case Status.FAILURE:
        return (
          <Box 
            sx={{ 
              height: props.height || '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'warning.light',
              border: '1px solid',
              borderColor: 'warning.main',
              borderRadius: 2,
              p: 3
            }}
          >
            <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
              <MapOutlined 
                sx={{ 
                  fontSize: 64, 
                  color: 'warning.main',
                  mb: 2
                }} 
              />
              <Typography variant="h6" gutterBottom color="warning.dark">
                Map Service Unavailable
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Unable to load the map service. Please check your internet connection or try again later.
              </Typography>
              <Chip 
                icon={<InfoOutlined />}
                label="Core features still work"
                size="small"
                variant="outlined"
                color="warning"
              />
            </Box>
          </Box>
        );
      case Status.SUCCESS:
        return <MapComponent {...props} />;
      default:
        return null;
    }
  };

  if (!apiKey || apiKey === 'your_google_maps_api_key_here' || apiKey.length < 10) {
    return (
      <Box 
        sx={{ 
          height: props.height || '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 2,
          p: 3
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
          <MapOutlined 
            sx={{ 
              fontSize: 64, 
              color: 'grey.400',
              mb: 2
            }} 
          />
          <Typography variant="h6" gutterBottom color="text.secondary">
            Map Feature Unavailable
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Interactive maps are currently disabled. Location features and product discovery work normally without the map view.
          </Typography>
          <Chip 
            icon={<InfoOutlined />}
            label="App functions normally"
            size="small"
            variant="outlined"
            color="info"
          />
        </Box>
      </Box>
    );
  }

  return (
    <Wrapper apiKey={apiKey} render={render} libraries={['places', 'geometry']} />
  );
};

export default MapWrapper;
