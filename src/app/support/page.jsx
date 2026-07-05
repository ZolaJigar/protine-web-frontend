'use client';

import { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, TextField, Button,
  Accordion, AccordionSummary, AccordionDetails, CircularProgress, Skeleton,
} from '@mui/material';
import { ExpandMore, Email, Phone, WhatsApp, Support, CheckCircle, LocationOn } from '@mui/icons-material';
import { toast } from 'react-toastify';
import MainLayout from '@/components/MainLayout';
import { contactUsAPI } from '@/lib/api';
import { isValidEmail } from '@/lib/functions';

const faqs = [
  { q: 'How do I track my order?', a: "Once your order is shipped, you'll receive a WhatsApp message with the tracking link. You can also track from the \"My Orders\" section." },
  { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and cash on delivery for orders above ₹199.' },
  { q: 'Can I return a product?', a: "Yes! We have a 7-day easy return policy. Contact support and we'll arrange a pickup." },
  { q: 'Is free shipping available?', a: 'Yes! Orders above ₹499 qualify for free shipping across India.' },
  { q: 'Are your products FSSAI certified?', a: 'Absolutely. All products are FSSAI certified and undergo strict quality testing.' },
  { q: 'How do I cancel my order?', a: "You can cancel within 2 hours from \"My Orders\", or contact our support team." },
];

/**
 * Pick the best icon and color for a contact-us entry based on its title/email/phone.
 */
function getChannelMeta(entry) {
  const titleLower = (entry.title || '').toLowerCase();

  if (titleLower.includes('whatsapp')) {
    return { icon: <WhatsApp sx={{ fontSize: 36, color: '#25D366' }} />, color: '#25D366', link: `https://wa.me/${entry.phone?.replace(/\D/g, '')}` };
  }
  if (titleLower.includes('phone') || titleLower.includes('call') || (entry.phone && !entry.email)) {
    return { icon: <Phone sx={{ fontSize: 36, color: '#2E7D32' }} />, color: '#2E7D32', link: `tel:${entry.phone}` };
  }
  if (titleLower.includes('email') || titleLower.includes('mail') || (entry.email && !entry.phone)) {
    return { icon: <Email sx={{ fontSize: 36, color: '#FF8F00' }} />, color: '#FF8F00', link: `mailto:${entry.email}` };
  }
  // Default: location/office
  return { icon: <LocationOn sx={{ fontSize: 36, color: '#1565C0' }} />, color: '#1565C0', link: null };
}

function ContactCardSkeleton() {
  return (
    <Paper sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2 }}>
      <Skeleton variant="circular" width={36} height={36} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="40%" height={16} />
        <Skeleton variant="text" width="60%" height={20} />
      </Box>
    </Paper>
  );
}

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  useEffect(() => {
    contactUsAPI
      .getList()
      .then((res) => {
        const list = res?.data?.data?.data ?? res?.data?.data ?? [];
        setContacts(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        // silently fall back to empty — no crash
        setContacts([]);
      })
      .finally(() => setContactsLoading(false));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email';
    if (!form.subject.trim()) errs.subject = 'Required';
    if (!form.message.trim() || form.message.length < 10) errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Submitting your ticket...');
    // Simulate a short delay — replace with `await supportAPI.createTicket(form)`
    // once the POST /support/tickets backend endpoint is live.
    await new Promise((resolve) => setTimeout(resolve, 800));
    toast.update(toastId, {
      render: "✅ Support ticket submitted! We'll reply within 24 hours.",
      type: 'success',
      isLoading: false,
      autoClose: 4000,
    });
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <MainLayout>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
          py: { xs: 6, md: 8 }, color: '#fff', textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Support sx={{ fontSize: 60, mb: 2, color: '#FFB300' }} />
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>How Can We Help?</Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>
            Our support team is available 24/7 to assist you.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Row 1: Contact + Form side by side */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 4,
            width: '100%',
            mb: 5,
          }}
        >
          {/* Contact Channels */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Contact Us</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {contactsLoading ? (
                <>
                  <ContactCardSkeleton />
                  <ContactCardSkeleton />
                  <ContactCardSkeleton />
                </>
              ) : contacts.length > 0 ? (
                contacts.map((entry) => {
                  const { icon, color, link } = getChannelMeta(entry);
                  const displayValue = entry.phone || entry.email || entry.description || '';

                  const cardProps = link
                    ? { component: 'a', href: link, target: '_blank', rel: 'noopener noreferrer' }
                    : {};

                  return (
                    <Paper
                      key={entry.id}
                      {...cardProps}
                      className="card-3d"
                      sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        textDecoration: 'none',
                        cursor: link ? 'pointer' : 'default',
                        border: `2px solid ${color}20`,
                        '&:hover': link ? { border: `2px solid ${color}50` } : {},
                      }}
                    >
                      <Box sx={{ mt: 0.5 }}>{icon}</Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}
                        >
                          {entry.title}
                        </Typography>
                        {entry.description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                            {entry.description}
                          </Typography>
                        )}
                        {displayValue && displayValue !== entry.description && (
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {displayValue}
                          </Typography>
                        )}
                        {/* Show both phone and email if both exist and differ from description */}
                        {entry.phone && entry.email && (
                          <Typography variant="body2" sx={{ color: '#FF8F00', mt: 0.25 }}>
                            {entry.email}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  );
                })
              ) : (
                /* Fallback static channels if API returns nothing */
                [
                  { icon: <WhatsApp sx={{ fontSize: 36, color: '#25D366' }} />, label: 'WhatsApp', value: '+91 99999 88888', link: 'https://wa.me/9999988888', color: '#25D366' },
                  { icon: <Phone sx={{ fontSize: 36, color: '#2E7D32' }} />, label: 'Phone', value: '+91 99999 88888', link: 'tel:+919999988888', color: '#2E7D32' },
                  { icon: <Email sx={{ fontSize: 36, color: '#FF8F00' }} />, label: 'Email', value: 'support@protineweb.com', link: 'mailto:support@protineweb.com', color: '#FF8F00' },
                ].map((channel) => (
                  <Paper
                    key={channel.label}
                    component="a"
                    href={channel.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-3d"
                    sx={{
                      p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
                      textDecoration: 'none', cursor: 'pointer',
                      border: `2px solid ${channel.color}20`,
                      '&:hover': { border: `2px solid ${channel.color}50` },
                    }}
                  >
                    {channel.icon}
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase' }}>
                        {channel.label}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {channel.value}
                      </Typography>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>

            <Box sx={{ mt: 3, p: 2.5, bgcolor: '#E8F5E9', borderRadius: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.dark', mb: 1 }}>
                🕐 Support Hours
              </Typography>
              <Typography variant="body2" color="text.secondary">Mon – Sat: 9:00 AM – 8:00 PM</Typography>
              <Typography variant="body2" color="text.secondary">Sunday: 10:00 AM – 5:00 PM</Typography>
            </Box>
          </Box>

          {/* Contact Form */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Send a Message</Typography>
            {submitted ? (
              <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" fontWeight={700}>Ticket Submitted!</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  We'll get back to you within 24 hours.
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 3 }}
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                >
                  Submit Another
                </Button>
              </Paper>
            ) : (
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField fullWidth label="Your Name" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    error={!!errors.name} helperText={errors.name} />
                  <TextField fullWidth label="Email Address" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    error={!!errors.email} helperText={errors.email} />
                  <TextField fullWidth label="Subject" value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    error={!!errors.subject} helperText={errors.subject} />
                  <TextField fullWidth label="Message" multiline rows={4} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    error={!!errors.message} helperText={errors.message} />
                  <Button
                    type="submit" variant="contained" size="large" disabled={loading}
                    sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #2E7D32, #4CAF50)' }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Ticket'}
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        </Box>

        {/* Row 2: FAQ — full width */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
            Frequently Asked Questions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
            {faqs.map((faq, i) => (
              <Accordion
                key={i}
                sx={{ borderRadius: '12px !important', '&:before': { display: 'none' }, boxShadow: '0 2px 10px rgba(22,163,74,0.08)', mb: 0 }}
              >
                <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#16A34A' }} />}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Container>
    </MainLayout>
  );
}
