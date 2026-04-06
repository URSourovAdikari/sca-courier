'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Truck, Globe, ShieldCheck, Phone, Mail } from 'lucide-react'

// Custom Brand Icons as Lucide-react 1.x removed them
const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
)
const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
)
const YoutubeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" /></svg>
)
const LinkedinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
)

const socialLinks = [
  { icon: <FacebookIcon size={20} />, href: '#', label: 'Facebook' },
  { icon: <InstagramIcon size={20} />, href: '#', label: 'Instagram' },
  { icon: <YoutubeIcon size={20} />, href: '#', label: 'YouTube' },
  { icon: <LinkedinIcon size={20} />, href: '#', label: 'LinkedIn' },
  { icon: <Mail size={20} />, href: 'mailto:support@scacourier.com', label: 'Email' },
]

const serviceLinks = [
  { label: 'International Shipping', href: '/services/international' },
  { label: 'Domestic Delivery', href: '/services/domestic' },
  { label: 'Express Courier', href: '/services/express' },
  { label: 'Freight & Cargo', href: '/services/freight' },
  { label: 'Warehousing', href: '/services/warehouse' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Track Shipment', href: '/track' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
  { label: 'Support Center', href: '/support' },
]

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number | null>(null)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="relative pt-20 pb-10 overflow-hidden bg-gradient-to-br from-neutral-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-indigo-950/40 border-t border-white/40 dark:border-white/10">

      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-indigo-400/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-400/20 blur-[120px]" />
      </div>

      <div className="relative container mx-auto px-4">

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14">

          {/* BRAND */}
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
                <Truck size={22} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                SCA Courier
              </span>
            </Link>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              SCA Courier is a global logistics and delivery service provider,
              offering fast, secure, and reliable shipping solutions across 200+ countries.
            </p>

            {/* FEATURES */}
            <div className="flex flex-wrap gap-4 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <Globe size={14} className="text-indigo-500" /> Global Shipping
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" /> Secure Delivery
              </span>
              <span className="flex items-center gap-1">
                <Truck size={14} className="text-fuchsia-500" /> Fast Logistics
              </span>
            </div>

            {/* SOCIAL */}
            <div className="flex gap-4 pt-4">
              {socialLinks.map((social) => (
                <Link key={social.label} href={social.href} aria-label={social.label} className="w-10 h-10 rounded-full bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 backdrop-blur-xl flex items-center justify-center text-neutral-500 hover:text-indigo-500 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          <div className="lg:col-span-3 space-y-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Services</h3>
            <nav className="flex flex-col space-y-3 text-sm">
              {serviceLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-500 transition-all hover:translate-x-1">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* COMPANY */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Company</h3>
            <nav className="flex flex-col space-y-3 text-sm">
              {companyLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-500 transition-all hover:translate-x-1">
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CONTACT CARD */}
            <div className="mt-6 p-5 rounded-2xl bg-white/60 dark:bg-white/[0.05] border border-white/40 dark:border-white/10 backdrop-blur-xl shadow-sm">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Need help with delivery?</p>
              <p className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-white">
                <Phone size={14} className="text-indigo-500" />
                +880 1234-567890
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-300/40 to-transparent dark:via-white/10 my-10" />

        {/* LEGAL */}
        <div className="mb-8 p-6 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-white/40 dark:border-white/10 backdrop-blur-xl text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            All shipments are handled under strict logistics policies.
            <Link href="/terms" className="text-indigo-500 hover:underline ml-1 font-medium">
              Read Terms & Conditions
            </Link>
          </p>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <p>© {currentYear ?? ''} <strong>SCA Courier</strong>. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-indigo-500">Privacy</Link>
            <Link href="/terms" className="hover:text-indigo-500">Terms</Link>
            <Link href="/cookies" className="hover:text-indigo-500">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}