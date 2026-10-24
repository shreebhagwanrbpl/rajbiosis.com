import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import BackToTop from '../components/BackToTop';
import MobileBottomNav from '../components/MobileBottomNav';
import PromotionalModals from '../components/PromotionalModals';
import ProductEnquiryModal from '../components/ProductEnquiryModal';
import GlobalTooltip from '../components/GlobalTooltip';
import CartDrawer from '../components/CartDrawer';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0f172a',
};

export const metadata = {
  metadataBase: new URL('https://rajbiosis.com'),
  title: {
    default: 'Raj Biosis Pvt. Ltd. | Biomedical & Hospital Equipment Manufacturer',
    template: '%s | Raj Biosis Pvt. Ltd.',
  },
  description: "Raj Biosis Pvt. Ltd. is a premier direct-from-manufacturer biomedical equipment and hospital life-support systems company. Supplying ICU ventilators, patient monitors, digital radiography, and surgical suites across India with ISO 13485 & CDSCO registration.",
  keywords: [
    'Raj Biosis Pvt. Ltd.',
    'Raj Biosis',
    'biomedical equipment',
    'hospital equipment manufacturer',
    'ICU ventilator price',
    'multipara patient monitor',
    'digital radiography x-ray',
    'surgical OT light',
    'biomedical engineering India',
    'GeM medical tender'
  ],
  authors: [{ name: 'Raj Biosis Pvt. Ltd.' }],
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Raj Biosis',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://rajbiosis.com',
    siteName: 'Raj Biosis Pvt. Ltd.',
    title: 'Raj Biosis Pvt. Ltd. | Biomedical Equipment & Hospital Systems',
    description: 'Direct-from-manufacturer critical care ventilators, patient monitors, digital X-rays, and surgical equipment with full CDSCO & ISO 13485 compliance.',
    images: [
      {
        url: '/logo.png',
        width: 383,
        height: 302,
        alt: 'Raj Biosis Pvt. Ltd. Official Logo',
      }
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        {/* Official Raj Biosis Pvt. Ltd. Favicon */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${plusJakartaSans.className} bg-neutral-50 text-neutral-900 font-sans selection:bg-brand-600 selection:text-white pb-14 lg:pb-0`}>
        {children}
        <ProductEnquiryModal />
        <CartDrawer />
        <PromotionalModals />
        <BackToTop />
        <MobileBottomNav />
        <GlobalTooltip />
      </body>
    </html>
  );
}
