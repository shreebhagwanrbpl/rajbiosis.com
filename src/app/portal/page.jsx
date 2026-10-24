'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { ShieldCheck } from 'lucide-react';

export default function PortalRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile?tab=staff');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Regional Staff &amp; Admin Desk
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Redirecting to the integrated Employee &amp; Admin desk inside your profile dashboard...
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
