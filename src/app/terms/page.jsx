import MainLayout from '@/components/MainLayout';
import { Box, Container, Typography, Divider } from '@mui/material';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Protine Web platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to modify these terms at any time.`,
  },
  {
    title: '2. Account Registration',
    content: `To use certain features of our platform, you must create an account. You agree to provide accurate, current, and complete information during registration and to keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials.`,
  },
  {
    title: '3. Orders & Payments',
    content: `When you place an order, you agree to pay the listed price plus applicable taxes and delivery charges. All payments are processed securely. We reserve the right to cancel orders in cases of pricing errors, fraud, or unavailability of products. You will be notified and refunded promptly in such cases.`,
  },
  {
    title: '4. Product Information',
    content: `We strive to display accurate product descriptions, images, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free. All products are subject to availability. We reserve the right to limit quantities.`,
  },
  {
    title: '5. Delivery',
    content: `Delivery timelines are estimates and may vary due to factors beyond our control. We are not liable for delays caused by courier partners, weather conditions, or other circumstances. You will receive WhatsApp and email updates about your order status.`,
  },
  {
    title: '6. Intellectual Property',
    content: `All content on the Protine Web platform, including logos, product images, text, and software, is the exclusive property of Protine Web and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written consent.`,
  },
  {
    title: '7. Prohibited Activities',
    content: `You agree not to use our platform for any unlawful purpose, to submit false or misleading information, to interfere with the platform's operation, to attempt to gain unauthorized access to any part of the platform, or to engage in any conduct that could harm other users or Protine Web.`,
  },
  {
    title: '8. Limitation of Liability',
    content: `Protine Web shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our platform or products. Our maximum liability shall not exceed the amount paid by you for the specific order giving rise to the claim.`,
  },
  {
    title: '9. Governing Law',
    content: `These terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.`,
  },
  {
    title: '10. Contact',
    content: `For any questions about these Terms, contact us at legal@protineweb.com or call +91 99999 88888.`,
  },
];

export default function TermsPage() {
  return (
    <MainLayout>
      <Box sx={{ background: 'linear-gradient(135deg, #16A34A 0%, #4ADE80 100%)', py: 6, color: '#FFFFFF', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>Terms of Service</Typography>
          <Typography sx={{ color: 'rgba(255,248,240,0.75)', fontSize: 16 }}>
            Last updated: June 20, 2026
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 7 }}>
        <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 4, p: { xs: 3, md: 6 }, boxShadow: '0 4px 24px rgba(22,163,74,0.08)' }}>
          <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.9, mb: 5 }}>
            Please read these Terms of Service carefully before using the Protine Web platform. These terms govern your access to and use of our website, mobile application, and services.
          </Typography>

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