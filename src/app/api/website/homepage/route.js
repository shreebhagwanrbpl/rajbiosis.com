import { NextResponse } from 'next/server';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

const DEFAULT_TOP_BAR_CONFIG = {
  domain: 'rajbiosis.com',
  topBarSettings: {
    enabled: true,
    showBestDeals: true,
    bestDealsText: 'Best Deals',
    bestDealsBadge: 'Up to 35% Off',
    bestDealsLink: '/deals?tab=best-deals',

    showSpecialOffers: true,
    specialOffersText: 'Special Offers',
    specialOffersBadge: 'HOT',
    specialOffersLink: '/deals?tab=special-offers',

    showNewArrivals: true,
    newArrivalsText: 'New Arrivals',
    newArrivalsBadge: '2026',
    newArrivalsLink: '/deals?tab=new-arrivals',

    showDeliveryHub: true,
    deliveryHubLabel: 'Delivering to:',

    showSupportHelpline: true,
    supportLabel: '24x7 Support:',
    supportPhone: '9983333469'
  }
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || 'rajbiosis.com';

  // 1. Try fetching from central MultiTaskingAdmin API first
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002';
  try {
    const adminRes = await fetch(`${adminUrl}/api/website/homepage?domain=${domain}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    if (adminRes.ok) {
      const adminData = await adminRes.json();
      if (adminData.success && adminData.data) {
        return NextResponse.json({
          success: true,
          source: 'admin_hub',
          data: adminData.data
        });
      }
    }
  } catch (e) {
    // Admin hub fetch failed, proceed to MongoDB
  }

  // 2. Try MongoDB directly
  try {
    const db = await getDatabase();
    const collection = db.collection('homepage_config');
    const config = await collection.findOne({ domain: domain.toLowerCase() });
    if (config) {
      const { _id, ...cleanConfig } = config;
      return NextResponse.json({
        success: true,
        source: 'mongodb',
        data: cleanConfig
      });
    }
  } catch (err) {
    // MongoDB offline or bad auth
  }

  // 3. Fallback to default
  return NextResponse.json({
    success: true,
    source: 'default_fallback',
    data: DEFAULT_TOP_BAR_CONFIG
  });
}
