import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, Box, Button, Grid, Divider } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { format } from 'date-fns';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderDetails } = location.state || {};

  useEffect(() => {
    // If no order details, redirect to home
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderDetails) {
    return null; // Will redirect in useEffect
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Order Confirmed!
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary">
            Thank you for your order. Your order has been received and is being processed.
          </Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Order #{orderId}
          </Typography>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Delivery Information
            </Typography>
            <Typography variant="body1">
              {orderDetails.customer.name}
            </Typography>
            <Typography variant="body1">
              {typeof orderDetails.delivery.address === 'object' 
                ? orderDetails.delivery.address.line1 
                : orderDetails.delivery.address}
            </Typography>
            <Typography variant="body1">
              {orderDetails.delivery.city}, {orderDetails.delivery.state} {orderDetails.delivery.zipCode}
            </Typography>
            <Box mt={2}>
              <Typography variant="body1">
                <strong>Delivery Date:</strong> {formatDate(orderDetails.delivery.date)}
              </Typography>
              <Typography variant="body1">
                <strong>Delivery Time:</strong> {orderDetails.delivery.time}
              </Typography>
              {orderDetails.delivery.instructions && (
                <Typography variant="body1">
                  <strong>Instructions:</strong> {orderDetails.delivery.instructions}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box mb={2}>
              {orderDetails.items.map((item, index) => (
                <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body1">
                    {item.quantity} x {item.name}
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Subtotal</Typography>
              <Typography variant="body1">{formatCurrency(orderDetails.pricing.subtotal)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Delivery Fee</Typography>
              <Typography variant="body1">{formatCurrency(orderDetails.pricing.deliveryFee)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body1">Tax</Typography>
              <Typography variant="body1">{formatCurrency(orderDetails.pricing.tax)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">{formatCurrency(orderDetails.pricing.total)}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="center" mt={4}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConfirmationPage;
