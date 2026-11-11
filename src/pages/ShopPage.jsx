import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, Sparkles, ArrowUpDown, Tag } from 'lucide-react';
import { CATEGORIES } from '../data/products';

export const ShopPage = () => {
  const { products } = useShop();
  const [selectedCategory, setSelectedCategory] = useState('All Chocolates');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'rating'

  const filteredAndSortedProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'All Chocolates' || product.category === selectedCategory;
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.ingredients?.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return a.piecePrice - b.piecePrice;
        }
        if (sortBy === 'price-high') {
          return b.piecePrice - a.piecePrice;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return 0; // default order
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-caramel-100 text-caramel-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-caramel-600" />
          <span>Freshly Tempered Menu</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-chocolate-950">
          Artisanal Chocolate Collection
        </h1>
        <p className="text-sm text-stone-600">
          Handcrafted in small home batches with pure cocoa, natural nuts, and authentic Indian fusion flavours.
        </p>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-cream-300 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chocolate, almond, kesar..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100 border border-cream-300 text-xs text-chocolate-950 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-caramel-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-chocolate-900 text-gold-300 shadow-sm'
                  : 'bg-cream-100 text-chocolate-800 hover:bg-cream-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold bg-cream-100 border border-cream-300 rounded-xl px-3 py-2 text-chocolate-900 focus:outline-none focus:ring-2 focus:ring-caramel-400"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated (★)</option>
          </select>
        </div>

      </div>

      {/* Product Results Status */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Showing <strong>{filteredAndSortedProducts.length}</strong> delicious chocolates
        </span>
        <span className="text-caramel-700 font-medium">
          📦 Switch packaging anytime in the card below
        </span>
      </div>

      {/* Product Grid */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-cream-300 space-y-3">
          <span className="text-5xl block">🔍</span>
          <h3 className="font-serif text-lg font-bold text-chocolate-950">
            No chocolates match "{searchQuery}"
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try searching for almond, gulkand, rasmalai, oreo, or choose another category above.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Chocolates');
            }}
            className="px-4 py-2 rounded-xl bg-chocolate-900 text-gold-300 text-xs font-bold"
          >
            Show All Chocolates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Bottom custom packing info banner */}
      <div className="p-6 rounded-3xl bg-caramel-100/60 border border-caramel-200 text-chocolate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-serif font-bold text-base">
            Need Assorted Custom Gift Boxes?
          </h4>
          <p className="text-xs text-stone-600 mt-0.5">
            You can mix and match individual pieces of different flavors into a single 250g or 500g tin.
          </p>
        </div>
        <a
          href="https://wa.me/?text=Hello%20Zora%20Shop,%20I%20want%20to%20order%20an%20assorted%20custom%20chocolate%20box."
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 rounded-xl bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 text-xs font-bold shadow-sm transition whitespace-nowrap"
        >
          WhatsApp Us for Custom Box
        </a>
      </div>

    </div>
  );
};

