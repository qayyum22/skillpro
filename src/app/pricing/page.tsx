"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CurrencyToggle } from '@/components/pricing/CurrencyToggle';
import { BillingToggle } from '@/components/pricing/BillingToggle';
// import { useAuth } from '../../contexts/AuthContext';
// import { createCheckoutSession } from '../../lib/stripe';

const EXCHANGE_RATE = 83;

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  stripePriceId: {
    monthly: string;
    yearly: string;
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Basic',
    description: 'Ideal for individuals preparing for the IELTS',
    monthlyPrice: 15,
    yearlyPrice: 10,
    stripePriceId: {
      monthly: 'price_ielts_basic_monthly',
      yearly: 'price_ielts_basic_yearly'
    },
    features: [
      'Access to 1 full IELTS test per month',
      'Basic performance feedback',
      'Standard question types',
      'Self-assessment tools',
      'Email support'
    ]
  },
  {
    name: 'Pro',
    description: 'Perfect for those looking to improve their score with more practice',
    monthlyPrice: 25,
    yearlyPrice: 20,
    highlighted: true,
    stripePriceId: {
      monthly: 'price_ielts_pro_monthly',
      yearly: 'price_ielts_pro_yearly'
    },
    features: [
      'Access to 3 full IELTS tests per month',
      'Detailed performance analytics',
      'All question types',
      'AI-assisted writing and speaking evaluations',
      'Priority email support',
      'Progress tracking'
    ]
  },
  {
    name: 'Premium',
    description: 'Best for intensive preparation and personalized guidance',
    monthlyPrice: 50,
    yearlyPrice: 45,
    stripePriceId: {
      monthly: 'price_ielts_premium_monthly',
      yearly: 'price_ielts_premium_yearly'
    },
    features: [
      'Access to unlimited IELTS tests',
      'Comprehensive performance analytics',
      'All question types with custom difficulty settings',
      'AI-assisted and expert-reviewed evaluations for writing and speaking',
      'Dedicated support with personalized guidance',
      'Progress tracking and custom study plans',
      'Certification of completion'
    ]
  }
];


const PricingPage: React.FC = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [currency, setCurrency] = useState<'USD' | 'INR'>('USD');
  const [loading, setLoading] = useState<string | null>(null);
//   const { user } = useAuth();
  const router = useRouter();

  const formatPrice = (price: number) => {
    const value = currency === 'USD' ? price : price * EXCHANGE_RATE;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleSubscribe = async (tier: PricingTier) => {
    // if (!user) {
    //   toast.error('Please sign in to subscribe');
    //   router.push('/signin');
    //   return;
    // }

    setLoading(tier.name);
    try {
      // const priceId = isYearly ? tier.stripePriceId.yearly : tier.stripePriceId.monthly;
      // const session = await createCheckoutSession(priceId, user.uid);
      
    //   if (session.url) {
    //     window.location.href = session.url;
    //   }
    } catch (error) {
      toast.error('Failed to initiate checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">Pricing Plans</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Choose the perfect plan for your needs
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Simple, transparent pricing that grows with you
          </p>
        </div>

        <div className="flex justify-center gap-8 mb-12">
          <BillingToggle isYearly={isYearly} onChange={setIsYearly} />
          <CurrencyToggle currency={currency} onChange={setCurrency} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 ${
                tier.highlighted
                  ? 'bg-blue-600 text-white ring-4 ring-blue-600 ring-opacity-50'
                  : 'bg-white text-gray-900'
              }`}
            >
              <h3 className="text-2xl font-bold">{tier.name}</h3>
              <p className={`mt-2 ${tier.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                {tier.description}
              </p>
              <p className="mt-8">
                <span className="text-4xl font-bold">
                  {formatPrice(isYearly ? tier.yearlyPrice : tier.monthlyPrice)}
                </span>
                <span className={tier.highlighted ? 'text-blue-100' : 'text-gray-500'}>
                  /month
                </span>
              </p>
              {isYearly && (
                <p className={`mt-2 ${tier.highlighted ? 'text-blue-100' : 'text-gray-500'}`}>
                  Billed annually
                </p>
              )}
              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 ${tier.highlighted ? 'text-blue-100' : 'text-blue-600'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(tier)}
                disabled={loading === tier.name}
                className={`mt-8 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  tier.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50 disabled:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                } disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {loading === tier.name ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get started'
                )}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};


export default PricingPage;