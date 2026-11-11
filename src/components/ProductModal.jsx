import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Star, ShoppingBag, Plus, Minus, Check, Sparkles, Clock, ShieldAlert } from 'lucide-react';

export const ProductModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useShop();
  const [packageType, setPackageType] = useState('pack250g');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!quickViewProduct) return null;

  const currentPrice = packageType === 'piece' ? quickViewProduct.piecePrice : quickViewProduct.boxPrice;

  const handleAdd = () => {
    if (!quickViewProduct.isAvailable) return;
    setIsAdded(true);
    addToCart(quickViewProduct, packageType, quantity);
    setTimeout(() => {
      setIsAdded(false);
      setQuickViewProduct(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-chocolate-950/80 backdrop-blur-md animate-fadeIn">
      {/* Click outside backdrop */}
      <div
        className="absolute inset-0"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="relative z-10 bg-cream-50 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-cream-300 max-h-[90vh] flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-chocolate-900/80 text-white flex items-center justify-center hover:bg-chocolate-950 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image */}
        <div className="md:w-1/2 relative bg-chocolate-900 aspect-square md:aspect-auto">
          <img
            src={quickViewProduct.image || '/chocolate-placeholder.svg'}
            alt={quickViewProduct.name}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/chocolate-placeholder.svg';
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-chocolate-950/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 text-cream-100">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-gold-500/90 text-chocolate-950 mb-1">
              {quickViewProduct.badge || 'Artisanal'}
            </span>
            <p className="text-xs text-cream-200">
              Freshly handcrafted in small batches.
            </p>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-caramel-600">
                {quickViewProduct.category}
              </span>
              <div className="flex items-center gap-1 text-gold-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-gold-500" />
                <span>{quickViewProduct.rating} ({quickViewProduct.reviewsCount} reviews)</span>
              </div>
            </div>

            <h2 className="font-serif text-2xl font-bold text-chocolate-950">
              {quickViewProduct.name}
            </h2>

            <p className="text-sm text-stone-700 mt-2 leading-relaxed">
              {quickViewProduct.fullDescription || quickViewProduct.shortDescription}
            </p>

            {/* Ingredients & Dietary tags */}
            <div className="mt-4 pt-4 border-t border-cream-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-chocolate-900 mb-2">
                Ingredients & Highlights
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {quickViewProduct.ingredients?.map((ing, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-cream-200 text-chocolate-800 font-medium"
                  >
                    {ing}
                  </span>
                ))}
              </div>

              <div className="text-xs text-stone-600 space-y-1">
                <p>🟢 <strong className="text-stone-800">Dietary:</strong> {quickViewProduct.dietary}</p>
                <p>⏳ <strong className="text-stone-800">Shelf Life:</strong> {quickViewProduct.shelfLife}</p>
                <p>✨ <strong className="text-stone-800">Preparation:</strong> {quickViewProduct.prepTime || 'Freshly made on order'}</p>
              </div>
            </div>

            {/* Packaging Choice */}
            <div className="mt-4 pt-3 border-t border-cream-200">
              <label className="block text-xs font-bold text-chocolate-900 uppercase tracking-wide mb-2">
                Choose Packaging
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPackageType('pack250g')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    packageType === 'pack250g'
                      ? 'border-caramel-500 bg-caramel-100/50 text-chocolate-950 ring-2 ring-caramel-400'
                      : 'border-cream-300 bg-white hover:bg-cream-100 text-stone-700'
                  }`}
                >
                  <div className="text-xs font-bold">250g Luxury Box</div>
                  <div className="text-sm font-extrabold text-chocolate-900 mt-0.5">₹{quickViewProduct.boxPrice}</div>
                  <div className="text-[10px] text-stone-500">{quickViewProduct.approxPiecesPer250g || '~20-25 pcs'}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPackageType('piece')}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    packageType === 'piece'
                      ? 'border-caramel-500 bg-caramel-100/50 text-chocolate-950 ring-2 ring-caramel-400'
                      : 'border-cream-300 bg-white hover:bg-cream-100 text-stone-700'
                  }`}
                >
                  <div className="text-xs font-bold">Per Piece</div>
                  <div className="text-sm font-extrabold text-chocolate-900 mt-0.5">₹{quickViewProduct.piecePrice}</div>
                  <div className="text-[10px] text-stone-500">Individually wrapped</div>
                </button>
              </div>
            </div>
          </div>

          {/* Stepper + Add to Cart */}
          <div className="mt-6 pt-4 border-t border-cream-200 flex items-center gap-3">
            <div className="flex items-center border border-chocolate-300 rounded-xl bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 text-chocolate-800 hover:bg-cream-200 rounded-l-xl transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-chocolate-950">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2.5 text-chocolate-800 hover:bg-cream-200 rounded-r-xl transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!quickViewProduct.isAvailable}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all ${
                !quickViewProduct.isAvailable
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-chocolate-900 hover:bg-chocolate-950 text-gold-300 hover:text-white'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-gold-400" />
                  <span>Add to Cart • ₹{currentPrice * quantity}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

