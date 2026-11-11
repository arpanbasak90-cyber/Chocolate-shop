import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Plus, Minus, ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart, setQuickViewProduct } = useShop();
  const [packageType, setPackageType] = useState('pack250g'); // 'piece' or 'pack250g'
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const currentPrice = packageType === 'piece' ? product.piecePrice : product.boxPrice;

  const handleAddToCart = () => {
    if (!product.isAvailable) return;
    setIsAdding(true);
    addToCart(product, packageType, quantity);
    setTimeout(() => {
      setIsAdding(false);
      setQuantity(1);
    }, 400);
  };

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-cream-300 shadow-sm hover:shadow-xl hover:border-caramel-300 transition-all duration-300 flex flex-col">
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-chocolate-100">
        <img
          src={product.image || '/chocolate-placeholder.svg'}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/chocolate-placeholder.svg';
          }}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950/60 via-transparent to-transparent opacity-60"></div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          {product.badge && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-chocolate-950/90 text-gold-300 border border-gold-500/40 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3 h-3 text-gold-400" />
              {product.badge}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-900/90 text-emerald-200 border border-emerald-500/40 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Pure Veg
          </span>
        </div>

        {/* Quick View Button */}
        <button
          onClick={() => setQuickViewProduct(product)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-chocolate-900 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          title="Quick View Details"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Out of Stock Ribbon */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-chocolate-950/75 backdrop-blur-sm flex items-center justify-center">
            <span className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm tracking-wider uppercase shadow-lg">
              Temporarily Sold Out
            </span>
          </div>
        )}

        {/* Bottom pieces approx info */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-cream-200">
          <span className="bg-chocolate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
            {packageType === 'pack250g' ? `Box: ${product.approxPiecesPer250g || '250g Pack'}` : 'Individually wrapped'}
          </span>
          <div className="flex items-center gap-1 bg-chocolate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs text-gold-400 font-semibold">
            <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="text-[11px] font-semibold uppercase tracking-wider text-caramel-600 mb-1">
            {product.category}
          </div>

          {/* Title */}
          <h3
            onClick={() => setQuickViewProduct(product)}
            className="font-serif text-lg font-bold text-chocolate-950 group-hover:text-caramel-700 transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* Short description */}
          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* Packaging Selector Toggle */}
        <div className="mt-4 pt-3 border-t border-cream-200">
          <div className="text-[11px] font-medium text-stone-500 mb-2 flex justify-between items-center">
            <span>Select Packaging:</span>
            <span className="text-xs font-bold text-chocolate-900">
              ₹{currentPrice} {packageType === 'piece' ? '/ piece' : '/ 250g box'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-1 bg-cream-200 rounded-xl">
            <button
              type="button"
              onClick={() => setPackageType('pack250g')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                packageType === 'pack250g'
                  ? 'bg-chocolate-900 text-gold-300 shadow-sm'
                  : 'text-chocolate-800 hover:text-chocolate-950'
              }`}
            >
              250g Box (₹{product.boxPrice})
            </button>
            <button
              type="button"
              onClick={() => setPackageType('piece')}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                packageType === 'piece'
                  ? 'bg-chocolate-900 text-gold-300 shadow-sm'
                  : 'text-chocolate-800 hover:text-chocolate-950'
              }`}
            >
              Per Piece (₹{product.piecePrice})
            </button>
          </div>
        </div>

        {/* Quantity Stepper & Add to Cart Button */}
        <div className="mt-4 flex items-center gap-2">
          {/* Stepper */}
          <div className="flex items-center border border-chocolate-200 rounded-xl bg-cream-50 overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={!product.isAvailable}
              className="p-2 text-chocolate-800 hover:bg-cream-200 disabled:opacity-40 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-bold text-chocolate-950">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              disabled={!product.isAvailable}
              className="p-2 text-chocolate-800 hover:bg-cream-200 disabled:opacity-40 transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add To Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.isAvailable || isAdding}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 shadow-sm ${
              !product.isAvailable
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : isAdding
                ? 'bg-emerald-700 text-white scale-98'
                : 'bg-gradient-to-r from-chocolate-900 to-chocolate-950 hover:from-caramel-600 hover:to-caramel-700 text-cream-100 hover:text-white hover:shadow-md'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-gold-400" />
            <span>{isAdding ? 'Added!' : `Add • ₹${currentPrice * quantity}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

