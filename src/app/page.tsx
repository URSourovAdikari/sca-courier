'use client'

import ImageSlider from "@/components/Slider"
import Footer from "@/components/Footer"
import Link from "next/link"
import { Package, Truck, MapPin, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <>
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">

      {/* HERO SLIDER */}
      <ImageSlider />

      {/* TRACKING SECTION */}
      <section className="py-10 bg-background/50">
        <div className="container mx-auto px-4">
          <div className="bg-background p-6 md:p-10 rounded-3xl shadow-outset-md text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Track Your Parcel</h2>
            <p className="text-muted-foreground mb-6">
              Enter your tracking number to get real-time delivery updates.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter Tracking ID"
                className="flex-1 h-14 px-4 rounded-2xl bg-background shadow-inset-sm outline-none"
              />
              <button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-outset-md hover:scale-105 transition">
                Track Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Parcels Delivered', value: '50k+', icon: <Package size={32} /> },
              { label: 'Active Couriers', value: '1,200+', icon: <Truck size={32} /> },
              { label: 'Coverage Areas', value: '100+', icon: <MapPin size={32} /> },
              { label: 'Successful Deliveries', value: '99%', icon: <CheckCircle size={32} /> },
            ].map((stat, idx) => (
              <div key={idx} className="bg-background rounded-3xl p-6 shadow-outset-md text-center hover:-translate-y-1 transition">
                <div className="w-16 h-16 mx-auto rounded-full bg-background shadow-outset-sm flex items-center justify-center text-primary mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-10 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">Our Courier Services</h2>
            <p className="text-lg text-muted-foreground">
              Fast, reliable, and secure delivery solutions tailored to your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Same Day Delivery", desc: "Get your parcels delivered within the same day." },
              { title: "Nationwide Shipping", desc: "We deliver across the entire country." },
              { title: "Cash on Delivery", desc: "Secure COD service for businesses." },
              { title: "Real-Time Tracking", desc: "Track parcels anytime with live updates." },
              { title: "Secure Packaging", desc: "Your items are safely packed and handled." },
              { title: "24/7 Support", desc: "Support team available anytime." },
            ].map((service, i) => (
              <div key={i} className="bg-background p-8 rounded-[2rem] shadow-outset-md hover:shadow-outset-lg transition">
                <div className="w-14 h-14 rounded-2xl bg-background shadow-outset-sm flex items-center justify-center mb-6 text-primary">
                  <CheckCircle />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-muted-foreground">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="bg-background rounded-[3rem] p-10 lg:p-20 shadow-outset-xl text-center">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">Send a Parcel Today</h2>
            <p className="text-xl text-muted-foreground mb-10">
              Fast pickup, safe delivery, and real-time tracking at your fingertips.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create-shipment">
                <button className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-outset-md hover:scale-105 transition">
                  Book Shipment
                </button>
              </Link>

              <Link href="/pricing">
                <button className="h-14 px-10 rounded-2xl bg-background text-foreground font-bold text-lg shadow-outset-sm hover:scale-105 transition">
                  View Pricing
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  </>
  )
}