import { Box, Container, Typography, Card, CardContent, Avatar, Rating } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

const testimonials = [
  { id: 1, name: 'Priya Sharma',  role: 'Food Blogger',      rating: 5, avatar: 'PS', color: '#16A34A', text: "Protine Web's ketchup is absolutely incredible! The flavour is so rich and natural. I've replaced all store-bought sauces with their products." },
  { id: 2, name: 'Raj Patel',     role: 'Home Chef',          rating: 5, avatar: 'RP', color: '#FF6B35', text: "The mayonnaise is creamy and perfect for my sandwiches. Fast delivery and excellent packaging. Highly recommend to everyone!" },
  { id: 3, name: 'Anita Desai',   role: 'Nutritionist',       rating: 4, avatar: 'AD', color: '#4ADE80', text: "Finally a brand that cares about ingredients! No artificial preservatives and great taste. My clients love the healthy options." },
  { id: 4, name: 'Vikram Mehta',  role: 'Restaurant Owner',   rating: 5, avatar: 'VM', color: '#E5501A', text: "Been ordering in bulk for my restaurant. Consistent quality, great price, and WhatsApp delivery updates are super convenient." },
  { id: 5, name: 'Sneha Kumar',   role: 'Fitness Coach',      rating: 5, avatar: 'SK', color: '#16A34A', text: "Love the eggless mayo! Perfect for my high-protein meal preps. The brand truly stands for health and quality." },
  { id: 6, name: 'Arjun Nair',    role: 'Tech Professional',  rating: 4, avatar: 'AN', color: '#FF6B35', text: "Ordered for the first time and I'm already a repeat customer. The app is smooth, delivery was on time, and the products are just great." },
];

export default function Testimonials() {
  return (
    <Box sx={{ py: 8, bgcolor: '#FFF0DC' }}>
      <Container maxWidth="xl">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="overline" sx={{ color: '#FF6B35', fontWeight: 700, letterSpacing: 2 }}>
            Testimonials
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#16A34A', mt: 1 }}>
            What Our Customers Say
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
          {testimonials.map((t) => (
            <Card key={t.id} className="card-3d" sx={{ width: '100%', position: 'relative', overflow: 'visible' }}>
                <FormatQuote
                  sx={{ position: 'absolute', top: -16, left: 20, fontSize: 52, color: t.color, opacity: 0.25 }}
                  aria-hidden="true"
                />
                <CardContent sx={{ pt: 4 }}>
                  <Rating value={t.rating} size="small" readOnly sx={{ mb: 2, '& .MuiRating-iconFilled': { color: '#FF6B35' } }} />
                  <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.85, mb: 3, fontStyle: 'italic' }}>
                    "{t.text}"
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: t.color, color: t.color === '#FF6B35' ? '#111827' : '#FFFFFF', fontWeight: 700 }}>
                      {t.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#111827' }}>{t.name}</Typography>
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{t.role}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
