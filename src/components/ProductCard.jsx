'use client';

import Link from 'next/link';
import {
  Card, CardMedia, CardContent, Typography, Box,
} from '@mui/material';

export default function ProductCard({ product }) {
  // Normalize API shape
  const categoryName = product.category?.name ?? product.category ?? '';
  const rawImage     = product.images?.[0]?.image || product.image;

  // Image may be a relative path (e.g. "products/xyz.jpg") — prefix with storage base URL
  const storageBase  = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';
  const imageUrl     =
    rawImage && typeof rawImage === 'string' && rawImage.trim() !== ''
      ? rawImage.startsWith('http')
        ? rawImage
        : `${storageBase}/${rawImage}`
      : null;

  return (
    <Card
      className="card-3d"
      sx={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Image / placeholder */}
      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
        {imageUrl ? (
          <CardMedia
            component="img"
            height="200"
            image={imageUrl}
            alt={product.name}
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            sx={{ objectFit: 'cover', transition: 'transform 0.4s ease', '&:hover': { transform: 'scale(1.06)' } }}
          />
        ) : null}
        <Box
          sx={{
            height: 200,
            display: imageUrl ? 'none' : 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #CCEFDB, #E8F5E9)',
            borderRadius: '16px 16px 0 0',
            fontSize: 64,
          }}
          role="img" aria-label={product.name}
        >
          🛍️
        </Box>
      </Link>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        {categoryName && (
          <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, textTransform: 'uppercase' }}>
            {categoryName}
          </Typography>
        )}
        <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700, color: 'text.primary', mt: 0.5, lineHeight: 1.3,
              '&:hover': { color: 'primary.main' },
            }}
          >
            {product.name}
          </Typography>
        </Link>
        {product.short_description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.6 }}
            noWrap
          >
            {product.short_description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
