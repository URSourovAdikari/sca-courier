import Link from "next/link";
import { Metadata } from "next";
import { ThemeToggle } from "@/components/Header";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Sign Up to SCA Universe",
};

export default function SignupLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative min-h-screen">
            {/* App-like Floating Navigation Pill */}
            <div className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4 sm:pt-6 pointer-events-none transition-all">
                <div className="pointer-events-auto flex items-center justify-between w-full max-w-sm sm:max-w-2xl mx-auto p-1.5 sm:p-2 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-2xl border border-white/50 dark:border-neutral-800 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)] rounded-full transition-all">
                    
                    {/* Left: Back / Home */}
                    <Link
                        href="/"
                        className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 gap-2 rounded-full text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        aria-label="Go to Home"
                    >
                        <ArrowLeft className="w-5 h-5 flex-shrink-0" />
                        <span className="hidden sm:inline font-semibold text-sm">Home</span>
                    </Link>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            href="/login"
                            className="flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold shadow-md border border-transparent dark:border-neutral-200/10 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Log In
                        </Link>

                        <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-700/60 mx-1 sm:mx-2 flex-shrink-0" />

                        <div className="flex-shrink-0 flex items-center justify-center -ml-1 sm:ml-0">
                           <ThemeToggle />
                        </div>
                    </div>

                </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 w-full flex flex-col">
                {children}
            </div>
        </div>
    );
}
