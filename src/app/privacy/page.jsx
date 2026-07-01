import MainLayout from '@/components/MainLayout';
import { Box, Container, Typography, Divider } from '@mui/material';

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us when you create an account, place an order, or contact our support team. This includes your name, email address, phone number, delivery address, and payment information. We also automatically collect certain information when you use our platform, such as your IP address, browser type, device information, and pages visited.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `We use the information we collect to process and fulfil your orders, send order confirmations and delivery updates via WhatsApp and email, provide customer support, improve our products and services, send promotional communications (only with your consent), and comply with legal obligations.`,
  },
  {
    title: '3. Information Sharing',
    content: `We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except to trusted partners who assist us in operating our platform (such as payment processors and delivery partners). These partners are bound by confidentiality agreements and are only provided information necessary to perform their services.`,
  },
  {
    title: '4. Data Security',
    content: `We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits to protect your personal information. However, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your account credentials confidential.`,
  },
  {
    title: '5. Cookies',
    content: `We use cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyse site traffic. You can control cookie settings through your browser. Disabling cookies may affect certain features of our platform.`,
  },
  {
    title: '6. Your Rights',
    content: `You have the right to access, correct, or delete your personal information at any time. You may also opt out of promotional communications. To exercise any of these rights, please contact us at privacy@protineweb.com or through our Support page.`,
  },
  {
    title: '7. Children\'s Privacy',
    content: `Our platform is not directed at children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.`,
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a prominent notice on our platform. Your continued use of Protine Web after such changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '9. Contact Us',
    content: `If you have any questions about this Privacy Policy, please contact us at: privacy@protineweb.com | +91 99999 88888 | Protine Web, Mumbai, Maharashtra, India.`,
  },
];

export default function PrivacyPage() {
  return (
    <MainLayout>
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 6, color: '#FFF8F0', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>Privacy Policy</Typography>
          <Typography sx={{ color: 'rgba(255,248,240,0.75)', fontSize: 16 }}>
            Last updated: June 20, 2026
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 7 }}>
        <Box sx={{ bgcolor: '#FFF8F0', borderRadius: 4, p: { xs: 3, md: 6 }, boxShadow: '0 4px 24px rgba(27,67,50,0.08)' }}>
          <Typography variant="body1" sx={{ color: '#57534E', lineHeight: 1.9, mb: 5 }}>
            At Protine Web, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you use our platform.
          </Typography>

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
