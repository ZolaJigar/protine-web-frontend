import { Box, Container, Typography, Avatar, Rating } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

const testimonials = [
  { id: 1, name: 'Priya Sharma',  role: 'Food Blogger',      rating: 5, avatar: 'PS', text: "Protine Web's ketchup is absolutely incredible! The flavour is so rich and natural. I've replaced all store-bought sauces with their products." },
  { id: 2, name: 'Raj Patel',     role: 'Home Chef',          rating: 5, avatar: 'RP', text: "The mayonnaise is creamy and perfect for my sandwiches. Fast delivery and excellent packaging. Highly recommend to everyone!" },
  { id: 3, name: 'Anita Desai',   role: 'Nutritionist',       rating: 4, avatar: 'AD', text: "Finally a brand that cares about ingredients! No artificial preservatives and great taste. My clients love the healthy options." },
  { id: 4, name: 'Vikram Mehta',  role: 'Restaurant Owner',   rating: 5, avatar: 'VM', text: "Been ordering in bulk for my restaurant. Consistent quality, great price, and WhatsApp delivery updates are super convenient." },
  { id: 5, name: 'Sneha Kumar',   role: 'Fitness Coach',      rating: 5, avatar: 'SK', text: "Love the eggless mayo! Perfect for my high-protein meal preps. The brand truly stands for health and quality." },
  { id: 6, name: 'Arjun Nair',    role: 'Tech Professional',  rating: 4, avatar: 'AN', text: "Ordered for the first time and I'm already a repeat customer. The app is smooth, delivery was on time, and the products are just great." },
];

export default function Testimonials() {
  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#FAFAF9' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: { xs: 5, md: 8 } }}>
          <Box className="section-eyebrow">Reviews</Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F0F0F', mt: 0.5, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            What Our Customers Say
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
          {testimonials.map((t) => (
            <Box
              key={t.id}
              sx={{
                p: 3, borderRadius: '14px',
                background: '#FFFFFF',
                border: '1px solid #E7E5E4',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#D4D4D4',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
                  transform: 'translateY(-2px)',
                },
                position: 'relative',
              }}
            >
              {/* Quote icon */}
              <FormatQuote sx={{ position: 'absolute', top: 16, right: 16, fontSize: 32, color: '#FF5722', opacity: 0.15 }} aria-hidden="true" />

              <Rating
                value={t.rating}
                size="small"
                readOnly
                sx={{ mb: 2, '& .MuiRating-iconFilled': { color: '#FF5722' } }}
              />
              <Typography sx={{ fontSize: '0.9rem', color: '#525252', lineHeight: 1.8, mb: 3 }}>
                &ldquo;{t.text}&rdquo;
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 2, borderTop: '1px solid #F5F5F4' }}>
                <Avatar sx={{ bgcolor: '#0F0F0F', color: '#FFFFFF', fontWeight: 700, width: 36, height: 36, fontSize: '0.8rem' }}>
                  {t.avatar}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0F0F0F' }}>{t.name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#737373' }}>{t.role}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
