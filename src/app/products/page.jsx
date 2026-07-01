'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Container, Typography, TextField, InputAdornment, Select,
  MenuItem, FormControl, InputLabel, Slider, Chip, Drawer, IconButton,
  Button, Divider, Paper, Skeleton, CircularProgress, Alert,
} from '@mui/material';
import { Search, FilterList, Close } from '@mui/icons-material';
import MainLayout from '@/components/MainLayout';
import ProductCard from '@/components/ProductCard';
import { categoriesAPI, productsAPI } from '@/lib/api';

const PAGE_SIZE = 20;

const sortOptions = [
  { value: 'default',    label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'newest',     label: 'Newest First' },
];

export default function ProductsPage() {
  const [search,        setSearch]        = useState('');
  const [category,      setCategory]      = useState(null);   // { id, name } | null = All
  const [sortBy,        setSortBy]        = useState('default');
  const [priceRange,    setPriceRange]    = useState([0, 5000]);
  const [filterOpen,    setFilterOpen]    = useState(false);

  const [products,      setProducts]      = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [prodsLoading,  setProdsLoading]  = useState(true);
  const [prodsError,    setProdsError]    = useState(null);

  const [apiCategories, setApiCategories] = useState([]);
  const [catsLoading,   setCatsLoading]   = useState(true);

  // ── Fetch categories once ──────────────────────────────────────────────────
  useEffect(() => {
    categoriesAPI.getAll({ page: 1, limit: 100 })
      .then((res) => setApiCategories(res.data?.data?.data ?? []))
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, []);

  // ── Fetch products (debounced on search) ───────────────────────────────────
  const fetchProducts = useCallback(async (searchTerm, cat, sort) => {
    setProdsLoading(true);
    setProdsError(null);
    try {
      const body = {
        page:  1,
        limit: PAGE_SIZE,
        ...(searchTerm          ? { search:      searchTerm } : {}),
        ...(cat                 ? { category_id: cat.id     } : {}),
      };
      const res  = await productsAPI.getAll(body);
      let list   = res.data?.data?.data ?? [];
      const count = res.data?.data?.count ?? 0;

      // Client-side sort (until API supports sort param)
      if (sort === 'price-asc')  list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      if (sort === 'price-desc') list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      if (sort === 'newest')     list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setProducts(list);
      setTotalProducts(count);
    } catch (err) {
      console.error('Products fetch error:', err);
      setProdsError(err?.response?.data?.message || err?.message || 'Failed to load products.');
    } finally {
      setProdsLoading(false);
    }
  }, []);

  // Debounce search; re-fetch on category / sort change immediately
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(search, category, sortBy), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search, category, sortBy, fetchProducts]);

  const categoryOptions = [{ id: 'all', name: 'All' }, ...apiCategories];

  const handleCategoryClick = (cat) => {
    setCategory(cat.id === 'all' ? null : cat);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory(null);
    setSortBy('default');
  };

  // ── Filter panel (shared between sidebar + drawer) ────────────────────────
  const FilterPanel = () => (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Categories</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mb: 3 }}>
        {catsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={36} sx={{ borderRadius: 2 }} />
            ))
          : categoryOptions.map((cat) => {
              const isActive = cat.id === 'all' ? category === null : category?.id === cat.id;
              return (
                <Box
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  sx={{
                    px: 2, py: 1, borderRadius: 2, cursor: 'pointer', fontSize: 14, fontWeight: 500,
                    bgcolor: isActive ? '#1B4332' : 'transparent',
                    color:   isActive ? '#FFF8F0' : '#1C1917',
                    '&:hover': { bgcolor: isActive ? '#0D2B1F' : '#F5F0E8' },
                    transition: 'all 0.2s',
                  }}
                >
                  {cat.name}
                </Box>
              );
            })
        }
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Price Range</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        ₹{priceRange[0]} – ₹{priceRange[1]}
      </Typography>
      <Slider
        value={priceRange} onChange={(_, v) => setPriceRange(v)}
        min={0} max={5000} step={50}
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

  return (
    <MainLayout>
      {/* Banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)', py: 5, color: '#FFF8F0' }}>
        <Container maxWidth="xl">
          <Typography variant="h4" sx={{ fontWeight: 800 }}>All Products</Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,248,240,0.75)', mt: 0.5 }}>
            {prodsLoading ? 'Loading…' : `${totalProducts} product${totalProducts !== 1 ? 's' : ''} found`}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Toolbar */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: '1 1 200px', maxWidth: 320 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Search products' },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
              {sortOptions.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <Button startIcon={<FilterList />} variant="outlined" onClick={() => setFilterOpen(true)}>
              Filters
            </Button>
          </Box>
        </Box>

        {/* Active filter chips */}
        {(category || search) && (
          <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {category && (
              <Chip label={category.name} onDelete={() => setCategory(null)} color="primary" size="small" />
            )}
            {search && (
              <Chip label={`"${search}"`} onDelete={() => setSearch('')} size="small" />
            )}
          </Box>
        )}

        {/* Sidebar + grid */}
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

          {/* Products area */}
          <Box sx={{ width: '100%', minWidth: 0 }}>
            {/* Loading */}
            {prodsLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#1B4332' }} />
              </Box>
            )}

            {/* Error */}
            {!prodsLoading && prodsError && (
              <Alert severity="error" sx={{ mb: 3 }}>{prodsError}</Alert>
            )}

            {/* Empty */}
            {!prodsLoading && !prodsError && products.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary">No products found.</Typography>
                <Button onClick={clearFilters} sx={{ mt: 2 }}>Clear Filters</Button>
              </Box>
            )}

            {/* Grid */}
            {!prodsLoading && !prodsError && products.length > 0 && (
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
                {products.map((product) => (
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
