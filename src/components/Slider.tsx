"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Truck, Globe, ArrowRight, Search } from "lucide-react";

interface SlideData {
  id: string;
  image?: StaticImageData | string;
  content?: React.ReactNode;
  bgClass?: string;
}

const originalSlides: SlideData[] = [
  {
    id: "slide-1",
    bgClass:
      "bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-indigo-950 dark:via-neutral-950 dark:to-indigo-900",
    content: (
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">
        
        {/* TEXT */}
        <div className="text-center lg:text-left max-w-xl">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-neutral-900 dark:text-white mb-6"
          >
            Global Logistics <br />
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Simplified
            </span>
          </motion.h1>

          <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 mb-10 font-medium">
            Fast, secure, and reliable delivery solutions tailored to your business needs worldwide.
          </p>

          <Link
            href="/services"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm md:text-base shadow-lg transition-all"
          >
            Explore Services
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* ICON */}
        <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
          <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-3xl" />
          <Globe className="w-28 h-28 md:w-36 md:h-36 text-indigo-500 drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]" />
        </div>
      </div>
    ),
  },

  {
    id: "slide-2",
    bgClass:
      "bg-gradient-to-bl from-white via-fuchsia-50/50 to-white dark:from-neutral-950 dark:via-fuchsia-950/40 dark:to-neutral-950",
    content: (
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">
        
        {/* TEXT */}
        <div className="text-center lg:text-left max-w-xl">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-neutral-900 dark:text-white mb-6"
          >
            Track Parcels <br />
            <span className="bg-gradient-to-r from-fuchsia-600 to-pink-500 bg-clip-text text-transparent">
              Real-Time
            </span>
          </motion.h2>

          <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 mb-10 font-medium">
            Experience complete transparency from departure to final delivery step.
          </p>

          {/* INPUT */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tracking Number"
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/70 dark:bg-white/10 backdrop-blur-md focus:ring-4 focus:ring-fuchsia-500/20 outline-none font-semibold text-sm md:text-base"
              />
            </div>

            <button className="px-8 py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold text-sm md:text-base shadow-lg">
              Track Now
            </button>
          </div>
        </div>

        {/* ICON */}
        <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
          <div className="absolute inset-0 rounded-full bg-fuchsia-500/10 blur-3xl" />
          <MapPin className="w-28 h-28 md:w-36 md:h-36 text-fuchsia-500 drop-shadow-[0_0_30px_rgba(232,121,249,0.6)]" />
        </div>
      </div>
    ),
  },

  // ✅ NEW SLIDE 3
  {
    id: "slide-3",
    bgClass:
      "bg-gradient-to-tr from-emerald-50 via-white to-teal-50 dark:from-neutral-950 dark:via-emerald-950/40 dark:to-neutral-950",
    content: (
      <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">
        
        {/* TEXT */}
        <div className="text-center lg:text-left max-w-xl">
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-3xl sm:text-5xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-neutral-900 dark:text-white mb-6"
          >
            Smart Delivery <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              Powered by AI
            </span>
          </motion.h2>

          <p className="text-sm sm:text-base md:text-lg text-neutral-600 dark:text-neutral-300 mb-10 font-medium">
            Optimize routes, reduce costs, and deliver faster using intelligent logistics technology.
          </p>

          <button className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm md:text-base shadow-lg transition-all">
            Get Started
          </button>
        </div>

        {/* ICON */}
        <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-3xl" />
          <Truck className="w-28 h-28 md:w-36 md:h-36 text-emerald-500 drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]" />
        </div>
      </div>
    ),
  },
];

const extendedSlides: SlideData[] = [
  originalSlides[originalSlides.length - 1],
  ...originalSlides,
  originalSlides[0],
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const mouseDownX = useRef<number | null>(null);
  const mouseUpX = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);

  const slideDuration = 6000;

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex - 1);
  }, [isAnimating]);

  useEffect(() => {
    if (!isTransitioning && (currentIndex === 0 || currentIndex === extendedSlides.length - 1)) {
      const timeoutId = setTimeout(() => {
        if (currentIndex === extendedSlides.length - 1) {
          setCurrentIndex(1);
        } else if (currentIndex === 0) {
          setCurrentIndex(originalSlides.length);
        }
        setIsAnimating(false);
      }, 0);

      return () => clearTimeout(timeoutId);
    } else if (isTransitioning && isAnimating) {
      const sliderElement = document.querySelector(".image-slider-track");
      const handleTransitionEnd = () => {
        if (currentIndex === extendedSlides.length - 1 || currentIndex === 0) {
          setIsTransitioning(false);
        } else {
          setIsAnimating(false);
        }
      };

      if (sliderElement) {
        sliderElement.addEventListener("transitionend", handleTransitionEnd);
      }

      return () => {
        if (sliderElement) {
          sliderElement.removeEventListener("transitionend", handleTransitionEnd);
        }
      };
    }
  }, [currentIndex, isTransitioning, isAnimating]);

  useEffect(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    setProgress(0);

    if (!isAnimating) {
      const startTime = Date.now();

      progressIntervalRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const newProgress = (elapsedTime / slideDuration) * 100;
        setProgress(Math.min(newProgress, 100));
      }, 50);

      autoplayRef.current = setInterval(() => {
        nextSlide();
      }, slideDuration);
    }

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isAnimating, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;

    if (distance > 50) nextSlide();
    else if (distance < -50) prevSlide();

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownX.current = e.clientX;
    isDragging.current = true;
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    mouseUpX.current = e.clientX;
  }, []);

  const handleMouseUp = useCallback(() => {
    if (
      mouseDownX.current === null ||
      mouseUpX.current === null ||
      !isDragging.current
    ) {
      isDragging.current = false;
      return;
    }

    const distance = mouseDownX.current - mouseUpX.current;

    if (Math.abs(distance) > 50) {
      distance > 0 ? nextSlide() : prevSlide();
    }

    mouseDownX.current = null;
    mouseUpX.current = null;
    isDragging.current = false;
  }, [nextSlide, prevSlide]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-full h-screen min-h-[500px] overflow-hidden shadow-lg border-y border-neutral-200 dark:border-white/5 bg-white dark:bg-neutral-900 transition-colors duration-500">
      <div
        className={`image-slider-track relative h-full flex ${
          isTransitioning ? "transition-transform duration-1000 cubic-bezier(0.16, 1, 0.3, 1)" : "transition-none"
        }`}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {extendedSlides.map((slide, index) => (
          <div key={`${slide.id}-${index}`} className={`relative w-full h-full object-cover object-center flex-shrink-0 flex items-center justify-center ${slide.bgClass || 'bg-white dark:bg-neutral-900'}`}>
            {slide.image && (
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={slide.image}
                  alt={`Slide ${index}`}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                  priority={index === 1}
                />
                <div className="absolute inset-0 bg-neutral-900/10 dark:bg-neutral-950/40" />
              </div>
            )}
            {slide.content && (
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                {slide.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Buttons - Hidden on small mobile */}
      <button
        className="hidden md:flex absolute left-8 top-1/2 transform -translate-y-1/2 bg-white/20 dark:bg-white/5 backdrop-blur-md text-neutral-900 dark:text-white p-4 lg:p-5 rounded-full hover:bg-white/40 dark:hover:bg-white/20 border border-neutral-300 dark:border-white/10 transition-all duration-300 z-30 group shadow-2xl"
        onClick={prevSlide}
        aria-label="Previous slide"
        disabled={isAnimating}
      >
        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        className="hidden md:flex absolute right-8 top-1/2 transform -translate-y-1/2 bg-white/20 dark:bg-white/5 backdrop-blur-md text-neutral-900 dark:text-white p-4 lg:p-5 rounded-full hover:bg-white/40 dark:hover:bg-white/20 border border-neutral-300 dark:border-white/10 transition-all duration-300 z-30 group shadow-2xl"
        onClick={nextSlide}
        aria-label="Next slide"
        disabled={isAnimating}
      >
        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Progress Bar Container */}
      <div className="absolute top-0 left-0 w-full h-1 z-40">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-emerald-500 transition-all ease-linear"
          style={{ width: `${progress}%`, transitionDuration: "50ms" }}
        ></div>
      </div>

      {/* Dots and Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-full border border-neutral-200 dark:border-white/5 z-30 shadow-xl transition-colors duration-500">
        {originalSlides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              if (isAnimating) return;
              setIsAnimating(true);
              setIsTransitioning(true);
              setCurrentIndex(index + 1);
            }}
            className={`group relative h-1 md:h-1.5 rounded-full transition-all duration-500 ease-in-out ${
              currentIndex === index + 1 ||
              (currentIndex === 0 && index === originalSlides.length - 1) ||
              (currentIndex === extendedSlides.length - 1 && index === 0)
                ? "w-8 md:w-14 bg-indigo-600 dark:bg-white"
                : "w-2 md:w-6 bg-neutral-900/20 dark:bg-white/20 hover:bg-neutral-900/40 dark:hover:bg-white/40"
            }`}
            aria-current={currentIndex === index + 1}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isAnimating}
          >
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none shadow-xl transform translate-y-2 group-hover:translate-y-0">
              0{index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
