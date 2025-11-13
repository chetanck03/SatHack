import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import WalletConnect from './WalletConnect'
import NetworkSwitcher from './NetworkSwitcher'

const Navbar = () => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/orders', label: 'Orders' },
    { path: '/dashboard', label: 'Dashboard' },
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white shadow-md border-b border-gray-100'
        : 'bg-white/95 backdrop-blur-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              {/* Logo Image */}
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <img 
                  src="/logo.jpg" 
                  alt="AgriChain Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 leading-tight bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 bg-clip-text text-transparent  tracking-tight">
                AgriChain
              </span>
              <span className="text-xs text-gray-500 leading-tight">
                Farm to Fork
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`relative text-sm font-medium transition-all duration-300 ${location.pathname === path
                    ? 'text-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600'
                  }`}
              >
                {label}
                {location.pathname === path && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Right side - Network Switcher + Wallet + Mobile menu */}
          <div className="flex items-center space-x-3">
            {/* Network Switcher */}
            <NetworkSwitcher />
            
            {/* Wallet Connection */}
            <div className="hidden sm:block">
              <WalletConnect />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden transition-all duration-300 ${isMobileMenuOpen
          ? 'max-h-96 opacity-100'
          : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
        <div className="bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-2">
            {navItems.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${location.pathname === path
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
              >
                {label}
              </Link>
            ))}

            {/* Mobile Network Switcher & Wallet Connection */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-center">
                <NetworkSwitcher />
              </div>
              <WalletConnect />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar