import MainLayout from '@/components/MainLayout';
import { Box, Container, Typography, Divider, Paper } from '@mui/material';

const steps = [
  { step: '01', title: 'Raise a Request', desc: 'Contact us within 7 days of delivery via our Support page, WhatsApp, or email with your order ID and reason for return.' },
  { step: '02', title: 'Review & Approval', desc: 'Our team will review your request within 24 hours and notify you of approval via WhatsApp and email.' },
  { step: '03', title: 'Pickup Arranged', desc: 'We arrange a free pickup from your delivery address within 2–3 business days of approval.' },
  { step: '04', title: 'Refund Processed', desc: 'Once we receive and inspect the product, your refund is processed within 5–7 business days to your original payment method.' },
];

const sections = [
  {
    title: 'Eligible Returns',
    content: `Products are eligible for return if they are damaged, defective, or incorrect upon delivery; if the product is past its expiry date on delivery; or if the product differs significantly from its description. All return requests must be raised within 7 days of delivery.`,
  },
  {
    title: 'Non-Returnable Items',
    content: `Opened or partially used products are not eligible for return unless they are defective. Products damaged due to misuse or improper storage are not eligible. Perishable goods cannot be returned unless they arrived damaged or expired.`,
  },
  {
    title: 'Refund Methods',
    content: `Refunds are credited to your original payment method. UPI and net banking refunds typically process within 3–5 business days. Credit/debit card refunds may take 5–7 business days depending on your bank. Cash on Delivery orders will receive a bank transfer refund.`,
  },
  {
    title: 'Cancellations',
    content: `Orders can be cancelled within 2 hours of placement for a full refund. Once an order is shipped, it cannot be cancelled. For prepaid orders cancelled after 2 hours, a full refund will be issued within 5–7 business days.`,
  },
  {
    title: 'Exchange Policy',
    content: `We offer free exchanges for incorrect or defective products. Exchanges are subject to product availability. If the requested product is unavailable, a full refund will be issued.`,
  },
];

export default function RefundPage() {
  return (
    <MainLayout>
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 6, color: '#FFF8F0', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>Refund & Return Policy</Typography>
          <Typography sx={{ color: 'rgba(255,248,240,0.75)', fontSize: 16 }}>
            7-day easy returns • Free pickups • Fast refunds
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 7 }}>
        {/* Process steps */}
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#1B4332', mb: 3, textAlign: 'center' }}>
          How Our Return Process Works
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gap: 2.5, mb: 6,
          }}
        >
          {steps.map((s) => (
            <Paper key={s.step} sx={{ p: 3, borderRadius: 3, textAlign: 'center', boxShadow: '0 4px 20px rgba(27,67,50,0.08)' }}>
              <Box
                sx={{
                  width: 52, height: 52, borderRadius: '50%', bgcolor: '#1B4332',
                  color: '#FFF8F0', fontWeight: 900, fontSize: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                }}
              >
                {s.step}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1B4332', mb: 1 }}>{s.title}</Typography>
              <Typography variant="caption" sx={{ color: '#57534E', lineHeight: 1.7 }}>{s.desc}</Typography>
            </Paper>
          ))}
        </Box>

        <Box sx={{ bgcolor: '#FFF8F0', borderRadius: 4, p: { xs: 3, md: 6 }, boxShadow: '0 4px 24px rgba(27,67,50,0.08)' }}>
          {sections.map((sec, i) => (
            <Box key={i} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1B4332', mb: 1.5 }}>
                {sec.title}
              </Typography>
              <Typography variant="body1" sx={{ color: '#57534E', lineHeight: 1.9 }}>
                {sec.content}
              </Typography>
              {i < sections.length - 1 && <Divider sx={{ mt: 4, borderColor: '#E7E5E4' }} />}
            </Box>
          ))}
        </Box>
      </Container>
    </MainLayout>
  );
}
