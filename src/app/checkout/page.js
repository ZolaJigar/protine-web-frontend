'use client';

import { useState } from 'react';
import {
  Box, Container, Grid, Typography, Paper, TextField, Button, Divider,
  Radio, RadioGroup, FormControlLabel, FormControl, Stepper,
  Step, StepLabel, CircularProgress,
} from '@mui/material';
import {
  LocationOn, Payment, CheckCircle, CreditCard, AccountBalance, PhoneAndroid,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { useApp } from '@/context/AppContext';
import { formatCurrency, calculateGST } from '@/lib/functions';

const steps = ['Delivery Address', 'Payment', 'Confirm Order'];

const paymentMethods = [
  { value: 'upi',        label: 'UPI',                 icon: <PhoneAndroid /> },
  { value: 'card',       label: 'Credit / Debit Card', icon: <CreditCard /> },
  { value: 'netbanking', label: 'Net Banking',          icon: <AccountBalance /> },
  { value: 'cod',        label: 'Cash on Delivery',     icon: <Payment /> },
];

export default function CheckoutPage() {
  const { state, dispatch, cartTotal } = useApp();
  const { cart } = state;
  const [activeStep, setActiveStep]     = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading]           = useState(false);
  const [ordered, setOrdered]           = useState(false);
  const [orderId, setOrderId]           = useState('');

  const [address, setAddress] = useState({
    fullName: state.user?.name || '', phone: state.user?.phone || '',
    line1: '', line2: '', city: '', state: '', pincode: '',
  });
  const [addrErrors, setAddrErrors] = useState({});

  const gst       = calculateGST(cartTotal);
  const shipping  = cartTotal >= 499 ? 0 : 49;
  const grandTotal = cartTotal + gst + shipping;

  const validateAddress = () => {
    const errs = {};
    if (!address.fullName.trim())                      errs.fullName = 'Required';
    if (!address.phone || address.phone.length !== 10) errs.phone    = 'Enter valid 10-digit number';
    if (!address.line1.trim())                         errs.line1    = 'Required';
    if (!address.city.trim())                          errs.city     = 'Required';
    if (!address.state.trim())                         errs.state    = 'Required';
    if (!address.pincode || address.pincode.length !== 6) errs.pincode = 'Enter valid 6-digit pincode';
    return errs;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      const errs = validateAddress();
      if (Object.keys(errs).length) { setAddrErrors(errs); toast.error('Please fill all required address fields.'); return; }
      toast.success('📍 Address saved!', { autoClose: 1500 });
    }
    if (activeStep === 1) {
      toast.success(`💳 Payment: ${paymentMethods.find(m => m.value === paymentMethod)?.label}`, { autoClose: 1500 });
    }
    setActiveStep((s) => s + 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const toastId = toast.loading('Placing your order...');
    try {
      await new Promise((r) => setTimeout(r, 1500));
      const newOrderId = `ORD-2026-${Math.floor(Math.random() * 900 + 100)}`;
      setOrderId(newOrderId);
      dispatch({ type: 'CLEAR_CART' });
      toast.update(toastId, { render: `🎉 Order ${newOrderId} placed!`, type: 'success', isLoading: false, autoClose: 4000 });
      setOrdered(true);
    } catch {
      toast.update(toastId, { render: 'Something went wrong. Please try again.', type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <MainLayout>
        <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <CheckCircle sx={{ fontSize: 100, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Order Placed Successfully! 🎉</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Your order is confirmed. A WhatsApp update will be sent shortly.
            </Typography>
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, mb: 3 }}>
              Order ID: {orderId}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button href="/orders" variant="contained">Track Order</Button>
              <Button href="/products" variant="outlined">Continue Shopping</Button>
            </Box>
          </Box>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Checkout</Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stepper — full width */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Paper>

        {/* Two-column layout: form | summary */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 340px' },
            gap: 3,
            alignItems: 'start',
            width: '100%',
          }}
        >
          {/* ── Left: step content ── */}
          <Box sx={{ width: '100%', minWidth: 0 }}>

            {/* Step 0: Address */}
            {activeStep === 0 && (
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <LocationOn sx={{ color: '#1B4332' }} />
                  <Typography variant="h6" fontWeight={700}>Delivery Address</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 2.5,
                    width: '100%',
                  }}
                >
                  <TextField fullWidth label="Full Name *" value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    error={!!addrErrors.fullName} helperText={addrErrors.fullName} />

                  <TextField fullWidth label="Phone Number *" value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    error={!!addrErrors.phone} helperText={addrErrors.phone} />

                  <TextField fullWidth label="Address Line 1 *" value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    error={!!addrErrors.line1} helperText={addrErrors.line1}
                    sx={{ gridColumn: { sm: '1 / -1' } }} />

                  <TextField fullWidth label="Address Line 2 (Optional)" value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    sx={{ gridColumn: { sm: '1 / -1' } }} />

                  <TextField fullWidth label="City *" value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    error={!!addrErrors.city} helperText={addrErrors.city} />

                  <TextField fullWidth label="State *" value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    error={!!addrErrors.state} helperText={addrErrors.state} />

                  <TextField fullWidth label="Pincode *" value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    error={!!addrErrors.pincode} helperText={addrErrors.pincode} />
                </Box>
              </Paper>
            )}

            {/* Step 1: Payment */}
            {activeStep === 1 && (
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Payment sx={{ color: '#1B4332' }} />
                  <Typography variant="h6" fontWeight={700}>Payment Method</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {paymentMethods.map((method) => (
                    <Paper
                      key={method.value}
                      onClick={() => setPaymentMethod(method.value)}
                      sx={{
                        p: 2.5, border: '2px solid', cursor: 'pointer',
                        borderColor: paymentMethod === method.value ? '#1B4332' : '#E7E5E4',
                        borderRadius: 3, bgcolor: paymentMethod === method.value ? '#D8F3DC' : '#fff',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#1B4332' },
                      }}
                    >
                      <FormControlLabel
                        value={method.value}
                        control={<Radio checked={paymentMethod === method.value} sx={{ color: '#1B4332', '&.Mui-checked': { color: '#1B4332' } }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ color: '#1B4332' }}>{method.icon}</Box>
                            <Typography fontWeight={600}>{method.label}</Typography>
                          </Box>
                        }
                        sx={{ m: 0, width: '100%' }}
                      />
                    </Paper>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Step 2: Confirm */}
            {activeStep === 2 && (
              <Paper sx={{ p: 3, borderRadius: 3, width: '100%' }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>Confirm Your Order</Typography>

                <Box sx={{ p: 2, bgcolor: '#D8F3DC', borderRadius: 2, mb: 3 }}>
                  <Typography variant="body2" sx={{ color: '#1B4332', fontWeight: 600 }}>
                    📱 A WhatsApp confirmation will be sent to {address.phone} after ordering.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography variant="overline" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: 1.5 }}>
                      Delivery To
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5 }}>{address.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">{address.phone}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {address.line1}{address.line2 && `, ${address.line2}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {address.city}, {address.state} — {address.pincode}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="overline" sx={{ color: '#F59E0B', fontWeight: 700, letterSpacing: 1.5 }}>
                      Payment Method
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5 }}>
                      <Box sx={{ color: '#1B4332' }}>{paymentMethods.find((m) => m.value === paymentMethod)?.icon}</Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {paymentMethods.find((m) => m.value === paymentMethod)?.label}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0} onClick={() => setActiveStep((s) => s - 1)}
                variant="outlined" sx={{ px: 4 }}
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext} sx={{ px: 5 }}>
                  Continue
                </Button>
              ) : (
                <Button
                  variant="contained" onClick={handlePlaceOrder} disabled={loading}
                  sx={{ px: 5, background: 'linear-gradient(135deg, #1B4332, #2D6A4F)', '&:hover': { background: 'linear-gradient(135deg, #0D2B1F, #1B4332)' } }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
                </Button>
              )}
            </Box>
          </Box>

          {/* ── Right: order summary (sticky) ── */}
          <Paper sx={{ p: 3, borderRadius: 3, position: { md: 'sticky' }, top: { md: 88 }, width: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Order Summary</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {cart.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ flex: 1, color: '#57534E' }}>
                    {item.name} <Typography component="span" variant="caption" sx={{ color: '#A8A29E' }}>× {item.quantity}</Typography>
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>{formatCurrency(item.price * item.quantity)}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography fontWeight={600}>{formatCurrency(cartTotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">GST (18%)</Typography>
                <Typography fontWeight={600}>{formatCurrency(gst)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Shipping</Typography>
                <Typography fontWeight={600} color={shipping === 0 ? 'success.main' : 'text.primary'}>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6" fontWeight={700}>Total</Typography>
              <Typography variant="h6" fontWeight={900} sx={{ color: '#1B4332' }}>
                {formatCurrency(grandTotal)}
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </MainLayout>
  );
}
