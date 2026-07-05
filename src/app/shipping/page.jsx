import MainLayout from '@/components/MainLayout';
import { Box, Container, Typography, Divider, Paper } from '@mui/material';
import { LocalShipping, WhatsApp, AccessTime, CurrencyRupee } from '@mui/icons-material';

const highlights = [
  { icon: <LocalShipping sx={{ fontSize: 32, color: '#16A34A' }} />, title: 'Free Shipping', desc: 'On all orders above Γé╣499 across India.', bg: '#F0FDF4' },
  { icon: <AccessTime sx={{ fontSize: 32, color: '#E5501A' }} />,     title: 'Fast Delivery',  desc: '2ΓÇô5 business days to most pincodes.', bg: '#FFF0EB' },
  { icon: <WhatsApp sx={{ fontSize: 32, color: '#16A34A' }} />,       title: 'Live Tracking',  desc: 'WhatsApp delivery reminders at every step.', bg: '#F0FDF4' },
  { icon: <CurrencyRupee sx={{ fontSize: 32, color: '#E5501A' }} />,  title: 'Γé╣49 Flat Fee',   desc: 'For orders below Γé╣499. No hidden charges.', bg: '#FFF0EB' },
];

const sections = [
  {
    title: 'Delivery Timelines',
    content: `Metro cities (Mumbai, Delhi, Bengaluru, Chennai, Hyderabad, Kolkata): 2ΓÇô3 business days. Tier-2 cities: 3ΓÇô4 business days. Remote or rural areas: 4ΓÇô7 business days. Timelines are estimates and may vary during peak seasons, public holidays, or due to unforeseen circumstances.`,
  },
  {
    title: 'Order Processing',
    content: `Orders placed before 2:00 PM IST on business days are processed the same day. Orders placed after 2:00 PM or on weekends/holidays are processed the next business day. You will receive an order confirmation on WhatsApp and email within 30 minutes of placing your order.`,
  },
  {
    title: 'Shipping Partners',
    content: `We partner with leading courier services including BlueDart, Delhivery, and Ecom Express to ensure reliable and timely delivery. The carrier is selected based on your delivery location for the best possible experience.`,
  },
  {
    title: 'WhatsApp Delivery Reminders',
    content: `We send WhatsApp notifications at key delivery milestones: order confirmed, order dispatched (with tracking link), out for delivery, and delivered. You can opt out of these notifications from your profile settings.`,
  },
  {
    title: 'Failed Deliveries',
    content: `If delivery is attempted and unsuccessful, our carrier will try 2 more times. After 3 failed attempts, the order will be returned to us. For prepaid orders, a full refund will be issued. We recommend ensuring someone is available at the delivery address.`,
  },
  {
    title: 'Damaged in Transit',
    content: `If your order arrives damaged, please take photos immediately and contact us within 24 hours via WhatsApp (+91 99999 88888) or our Support page. We will arrange a replacement or refund at no additional cost.`,
  },
  {
    title: 'Pincodes & Coverage',
    content: `We deliver to 20,000+ pincodes across India. During checkout, you can verify if we deliver to your area. We are continuously expanding our delivery network.`,
  },
];

export default function ShippingPage() {
  return (
    <MainLayout>
      <Box sx={{ background: 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)', py: 6, color: '#FFFFFF', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>Shipping Policy</Typography>
          <Typography sx={{ color: 'rgba(255,248,240,0.75)', fontSize: 16 }}>
            Fast, reliable delivery across 20,000+ pincodes in India
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 7 }}>
        {/* Highlights */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2.5, mb: 6,
          }}
        >
          {highlights.map((h) => (
            <Paper key={h.title} sx={{ p: 3, borderRadius: 3, textAlign: 'center', boxShadow: '0 4px 20px rgba(22,163,74,0.08)' }}>
              <Box sx={{ width: 60, height: 60, borderRadius: 3, bgcolor: h.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                {h.icon}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#16A34A', mb: 0.5 }}>{h.title}</Typography>
              <Typography variant="caption" sx={{ color: '#4B5563', lineHeight: 1.7 }}>{h.desc}</Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 4, p: { xs: 3, md: 6 }, boxShadow: '0 4px 24px rgba(22,163,74,0.08)' }}>
          {sections.map((sec, i) => (
            <Box key={i} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#16A34A', mb: 1.5 }}>
                {sec.title}
              </Typography>
              <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.9 }}>
                {sec.content}
              </Typography>
              {i < sections.length - 1 && <Divider sx={{ mt: 4, borderColor: '#E5E7EB' }} />}
            </Box>
          ))}
        </Box>
      </Container>
    </MainLayout>
  );
}