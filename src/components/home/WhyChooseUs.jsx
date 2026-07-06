import { Box, Container, Typography } from '@mui/material';
import { LocalShipping, VerifiedUser, NaturePeople, SupportAgent, Payments, Refresh } from '@mui/icons-material';

const features = [
  {
    icon: <LocalShipping sx={{ fontSize: 24 }} />,
    title: 'Fast Delivery',
    desc: "Same-day delivery in major cities. WhatsApp reminders so you're always in the loop.",
    color: '#22C55E',
    bg: '#F0FDF4',
  },
  {
    icon: <NaturePeople sx={{ fontSize: 24 }} />,
    title: '100% Natural',
    desc: 'No artificial preservatives. Made with fresh, natural ingredients for a healthier choice.',
    color: '#FF5722',
    bg: '#FFF7ED',
  },
  {
    icon: <VerifiedUser sx={{ fontSize: 24 }} />,
    title: 'Quality Assured',
    desc: 'Every product passes strict quality checks. FSSAI certified and safety tested.',
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    icon: <Payments sx={{ fontSize: 24 }} />,
    title: 'Secure Payments',
    desc: 'UPI, cards, net banking, and COD. Multiple options with 100% secure checkout.',
    color: '#9333EA',
    bg: '#FDF4FF',
  },
  {
    icon: <SupportAgent sx={{ fontSize: 24 }} />,
    title: '24/7 Support',
    desc: 'Our support team is always ready via chat, email, or phone — anytime you need.',
    color: '#0D9488',
    bg: '#F0FDFA',
  },
  {
    icon: <Refresh sx={{ fontSize: 24 }} />,
    title: 'Easy Returns',
    desc: 'Not satisfied? Return within 7 days for a full refund, no questions asked.',
    color: '#DC2626',
    bg: '#FEF2F2',
  },
];

export default function WhyChooseUs() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: { xs: 5, md: 8 } }}>
          <Box className="section-eyebrow">Why Us</Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F0F0F', mt: 0.5, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.25rem' }, maxWidth: 500 }}>
            Why Choose Protine Web?
          </Typography>
          <Box className="divider-accent" sx={{ mt: 1.5 }} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {features.map((f) => (
            <Box
              key={f.title}
              sx={{
                p: 3, borderRadius: '14px',
                border: '1px solid #E7E5E4',
                background: '#FFFFFF',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: f.color,
                  background: f.bg,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${f.color}18`,
                },
              }}
            >
              <Box
                sx={{
                  width: 48, height: 48, borderRadius: '12px',
                  bgcolor: f.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                  mb: 2.5,
                  border: `1px solid ${f.color}25`,
                }}
                aria-hidden="true"
              >
                {f.icon}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#0F0F0F', mb: 1 }}>
                {f.title}
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#525252', lineHeight: 1.7 }}>
                {f.desc}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
