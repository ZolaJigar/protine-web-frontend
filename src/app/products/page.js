'use client';

import { useState } from 'react';
import {
  Box, Container, Typography, TextField, InputAdornment, Select,
  MenuItem, FormControl, InputLabel, Slider, Chip, Drawer, IconButton,
  Button, Divider, Paper,
} from '@mui/material';
import { Search, FilterList, Close } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import ProductCard from '@/components/ProductCard';

const allProducts = [
  { id: 1,  name: 'Classic Tomato Ketchup',  category: 'Ketchup',         price: 149, discountPercent: 10, rating: 4.8, reviewCount: 234, stock: 50 },
  { id: 2,  name: 'Garlic Mayonnaise',        category: 'Mayonnaise',       price: 199, discountPercent: 0,  rating: 4.6, reviewCount: 189, stock: 30 },
  { id: 3,  name: 'Spicy Chilli Sauce',       category: 'Hot Sauces',       price: 129, discountPercent: 15, rating: 4.7, reviewCount: 312, stock: 45 },
  { id: 4,  name: 'Honey Mustard Dressing',   category: 'Salad Dressings',  price: 179, discountPercent: 5,  rating: 4.5, reviewCount: 98,  stock: 25 },
  { id: 5,  name: 'Smoky BBQ Sauce',          category: 'Hot Sauces',       price: 159, discountPercent: 20, rating: 4.9, reviewCount: 445, stock: 60 },
  { id: 6,  name: 'Eggless Mayo',             category: 'Mayonnaise',       price: 219, discountPercent: 0,  rating: 4.4, reviewCount: 167, stock: 20 },
  { id: 7,  name: 'Italian Herb Dressing',    category: 'Salad Dressings',  price: 189, discountPercent: 10, rating: 4.6, reviewCount: 203, stock: 35 },
  { id: 8,  name: 'Mango Habanero Sauce',     category: 'Hot Sauces',       price: 169, discountPercent: 0,  rating: 4.3, reviewCount: 78,  stock: 15 },
  { id: 9,  name: 'Mint Chutney',             category: 'Spreads',          price: 99,  discountPercent: 0,  rating: 4.7, reviewCount: 132, stock: 40 },
  { id: 10, name: 'Schezwan Sauce',           category: 'Hot Sauces',       price: 139, discountPercent: 12, rating: 4.8, reviewCount: 267, stock: 55 },
  { id: 11, name: 'Cheese Spread',            category: 'Spreads',          price: 249, discountPercent: 5,  rating: 4.5, reviewCount: 90,  stock: 18 },
  { id: 12, name: 'Low-Fat Mayo',             category: 'Mayonnaise',       price: 189, discountPercent: 0,  rating: 4.2, reviewCount: 56,  stock: 22 },
];

const categories  = ['All', 'Ketchup', 'Mayonnaise', 'Hot Sauces', 'Salad Dressings', 'Spreads', 'Healthy Snacks'];
const sortOptions = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest First' },
];

export default function ProductsPage() {
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState('All');
  const [sortBy,     setSortBy]     = useState('default');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = allProducts
    .filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat    = category === 'All' || p.category === category;
      const matchPrice  = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchSearch && matchCat && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating')     return b.rating - a.rating;
      return 0;
    });

  const FilterPanel = () => (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Categories</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 3 }}>
        {categories.map((cat) => (
          <Box
            key={cat}
            onClick={() => setCategory(cat)}
            sx={{
              px: 2, py: 1, borderRadius: 2, cursor: 'pointer', fontSize: 14, fontWeight: 500,
              bgcolor: category === cat ? '#1B4332' : 'transparent',
              color:   category === cat ? '#FFF8F0' : '#1C1917',
              '&:hover': { bgcolor: category === cat ? '#0D2B1F' : '#F5F0E8' },
              transition: 'all 0.2s',
            }}
          >
            {cat}
          </Box>
        ))}
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Price Range</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        ₹{priceRange[0]} – ₹{priceRange[1]}
      </Typography>
      <Slider
        value={priceRange} onChange={(_, v) => setPriceRange(v)}
        min={0} max={500} step={10}
        valueLabelDisplay="auto"
        valueLabelFormat={(v) => `₹${v}`}
        sx={{
          mb: 2,
          color: '#1B4332',
          '& .MuiSlider-thumb': { bgcolor: '#F59E0B' },
          '& .MuiSlider-track': { bgcolor: '#1B4332' },
        }}
      />
    </Box>
  );

  /* ── Derived data ── */

  return (
    <MainLayout>
      {/* ── Page banner ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
          py: 5, color: '#FFF8F0',
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>All Products</Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* ── Toolbar ── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search products..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: '1 1 200px', maxWidth: 320 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" color="action" /></InputAdornment> }}
            inputProps={{ 'aria-label': 'Search products' }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
              {sortOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Mobile filter button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <Button startIcon={<FilterList />} variant="outlined" onClick={() => setFilterOpen(true)}>
              Filters
            </Button>
          </Box>

          {/* View toggle — removed, grid only */}
        </Box>

        {/* Active filter chip */}
        {category !== 'All' && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Chip label={category} onDelete={() => setCategory('All')} color="primary" size="small" />
          </Box>
        )}

        {/* ── Sidebar + product grid (CSS grid) ── */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '220px 1fr' },
            gap: 3,
            alignItems: 'start',
            width: '100%',
          }}
        >
          {/* Sidebar */}
          <Paper
            sx={{
              p: 2.5, borderRadius: 3,
              position: { md: 'sticky' }, top: { md: 88 },
              display: { xs: 'none', md: 'block' },
            }}
          >
            <FilterPanel />
          </Paper>

          {/* Products */}
          <Box sx={{ width: '100%', minWidth: 0 }}>
            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">No products found.</Typography>
                <Button onClick={() => { setSearch(''); setCategory('All'); }} sx={{ mt: 2 }}>
                  Clear Filters
                </Button>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 2.5,
                  width: '100%',
                }}
              >
                {filtered.map((product) => (
                  <Box key={product.id} sx={{ display: 'flex', minWidth: 0 }}>
                    <ProductCard product={product} />
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* Mobile filter drawer */}
      <Drawer anchor="left" open={filterOpen} onClose={() => setFilterOpen(false)}>
        <Box sx={{ width: 280, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Filters</Typography>
            <IconButton onClick={() => setFilterOpen(false)} aria-label="Close filters"><Close /></IconButton>
          </Box>
          <FilterPanel />
          <Button fullWidth variant="contained" onClick={() => setFilterOpen(false)} sx={{ mt: 2 }}>
            Apply Filters
          </Button>
        </Box>
      </Drawer>
    </MainLayout>
  );
}
