import { Box, Container, Typography, Paper } from '@mui/material';
import { LocalShipping, VerifiedUser, NaturePeople, SupportAgent, Payments, Refresh } from '@mui/icons-material';

const features = [
  { icon: <LocalShipping sx={{ fontSize: 40 }} />, title: 'Fast Delivery',    color: '#16A34A', desc: "Same-day delivery available in major cities. WhatsApp delivery reminders so you're always updated." },
  { icon: <NaturePeople  sx={{ fontSize: 40 }} />, title: '100% Natural',     color: '#FF6B35', desc: 'No artificial preservatives. Made with fresh, natural ingredients for a healthier choice.' },
  { icon: <VerifiedUser  sx={{ fontSize: 40 }} />, title: 'Quality Assured',  color: '#16A34A', desc: 'Every product passes strict quality checks. FSSAI certified and safety tested.' },
  { icon: <Payments      sx={{ fontSize: 40 }} />, title: 'Secure Payments',  color: '#FF6B35', desc: 'Multiple payment options including UPI, cards, net banking, and COD. 100% secure checkout.' },
  { icon: <SupportAgent  sx={{ fontSize: 40 }} />, title: '24/7 Support',     color: '#16A34A', desc: 'Our customer support team is always ready to help via chat, email, or phone.' },
  { icon: <Refresh       sx={{ fontSize: 40 }} />, title: 'Easy Returns',     color: '#FF6B35', desc: 'Not satisfied? Return within 7 days for a full refund, no questions asked.' },
];

export default function WhyChooseUs() {
  return (
    <Box sx={{ py: 8, bgcolor: '#FFFFFF' }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#FF6B35', fontWeight: 700, letterSpacing: 2 }}>
            Why Us
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#16A34A', mt: 1 }}>
            Why Choose Protine Web?
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 3,
            width: '100%',
          }}
        >
          {features.map((f) => (
            <Paper
              key={f.title}
              className="card-3d"
              sx={{ p: 4, width: '100%', textAlign: 'center' }}
            >
                <Box
                  sx={{
                    width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2,
                    bgcolor: f.color === '#16A34A' ? '#F0FDF4' : '#FFF0EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: f.color,
                    boxShadow: `0 4px 18px ${f.color}22`,
                  }}
                  aria-hidden="true"
                >
                  {f.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#111827' }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.8 }}>
                  {f.desc}
                </Typography>
              </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
