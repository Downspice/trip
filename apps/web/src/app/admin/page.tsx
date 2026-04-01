'use client';

import { useRouter } from 'next/navigation';
import { BarChart3, Settings2, ArrowRight, Wallet } from 'lucide-react';

const cards = [
  {
    title: 'Dashboard',
    description: 'View live booking statistics, filter by school or type, and manage all student trips and parent visits.',
    icon: BarChart3,
    href: '/admin/dashboard',
    accent: 'from-blue-600 to-indigo-600',
    bg: 'hover:bg-blue-50/60',
    iconBg: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Platform Configuration',
    description: 'Manage schools, houses, academic programmes, and trip routes with 3-tier pricing and stop points.',
    icon: Settings2,
    href: '/admin/config',
    accent: 'from-slate-700 to-slate-900',
    bg: 'hover:bg-slate-50/60',
    iconBg: 'bg-slate-100 text-slate-700',
  },
  {
    title: 'Manage Finances',
    description: 'View live Paystack balance, review withdrawal history, and transfer funds to a bank account or mobile wallet.',
    icon: Wallet,
    href: '/admin/finances',
    accent: 'from-emerald-600 to-teal-600',
    bg: 'hover:bg-emerald-50/60',
    iconBg: 'bg-emerald-100 text-emerald-700',
  },
];

export default function AdminLandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Admin Panel</h1>
          <p className="text-gray-500">Choose a section to manage.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(({ title, description, icon: Icon, href, bg, iconBg, accent }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`group relative text-left w-full rounded-2xl border bg-white p-8 shadow-sm transition-all duration-200 ${bg} hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {/* Gradient top bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${accent}`} />

              <div className={`inline-flex items-center justify-center p-3 rounded-xl mb-5 ${iconBg}`}>
                <Icon className="h-7 w-7" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>

              <div className="mt-6 flex items-center text-sm font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
                Open <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
