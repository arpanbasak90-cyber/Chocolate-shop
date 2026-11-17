import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const PaymentAnnouncementBanner = () => {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="bg-gradient-to-r from-[#220d06] via-[#3a180d] to-[#220d06] text-amber-100 border-b-2 border-amber-500/50 shadow-md py-2.5 px-4 sm:px-6 relative z-30 animate-fadeIn"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-3 text-center">
        <span className="text-base sm:text-lg shrink-0 select-none" aria-hidden="true">
          ⚠️
        </span>
        <p className="text-xs sm:text-sm font-medium leading-relaxed tracking-wide text-amber-100">
          <strong className="text-amber-300 font-bold">
            UPI Payment is Currently Unavailable.
          </strong>{' '}
          <span>
            Please select{' '}
            <strong className="text-gold-300 font-bold underline decoration-amber-400/60 underline-offset-2">
              Cash on Delivery (COD)
            </strong>{' '}
            to place your order.
          </span>{' '}
          <span className="text-stone-300 inline">
            We apologize for the inconvenience.
          </span>
        </p>
      </div>
    </div>
  );
};
