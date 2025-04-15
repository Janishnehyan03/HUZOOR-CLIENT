import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white w-full border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Logo and App Name */}
          <div className="flex flex-col items-center gap-4">
            <img
              src="/logo.png"
              alt="Shuhood Logo"
              className="h-14 w-14 object-contain"
            />
            <h1 className="text-2xl font-semibold text-gray-900">
              SHUHOOD
            </h1>
          </div>

          {/* Description */}
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-600 text-base leading-relaxed">
              Modern attendance management system for educational institutions, 
              streamlining student tracking and daily reporting.
            </p>
          </div>

          {/* Copyright and Credits */}
          <div className="mt-8 border-t border-gray-100 w-full pt-8 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
              <span>&copy; {currentYear} Shuhood</span>
              <span className="hidden sm:inline-block">•</span>
              <span>All rights reserved</span>
              <span className="hidden sm:inline-block">•</span>
              <span className="inline-flex items-center">
                Crafted with <Heart className="mx-1 h-4 w-4 text-rose-500" /> by
                <Link
                  to="https://digitiostack.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-600 hover:text-blue-500 transition-colors"
                >
                  DigitioStack
                </Link>
              </span>
            </div>
            <p className="text-gray-400 text-sm">Have a productive day</p>
          </div>
        </div>
      </div>
    </footer>
  );
}