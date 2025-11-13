import React, { useState, useRef, useEffect } from 'react'
import { Wallet, UserPlus, ShoppingCart, Truck, CheckCircle, Star, ArrowRight, Sparkles, Leaf, Zap, Shield, Globe } from 'lucide-react'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Link } from 'react-router-dom'

// Step card component with enhanced styling and animations
const StepCard = ({ step, index, isActive, isHovered, onHover, onLeave }) => {
  const [isCardHovered, setIsCardHovered] = useState(false)

  return (
    <div
      className="relative flex-shrink-0 w-70 h-70 bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200/80 hover:border-green-400/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-green-500/20 group cursor-pointer overflow-visible shadow-lg md:shadow-md"
      onMouseEnter={() => {
        setIsCardHovered(true)
        onHover(index)
      }}
      onMouseLeave={() => {
        setIsCardHovered(false)
        onLeave()
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-green-50/30 rounded-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-transparent to-blue-50/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Step number with enhanced styling */}
        <div className="absolute -top-4 -right-4 z-20">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 border-4 border-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            <span className="text-sm font-bold text-white">{index + 1}</span>
          </div>
        </div>

        {/* Icon with enhanced styling */}
        <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
          <step.icon className="h-6 w-6 text-white" />
        </div>
        
        {/* Title with better typography */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300 leading-tight">
          {step.title}
        </h3>
        
        {/* Description with improved spacing */}
        <p className="text-gray-600 leading-relaxed flex-grow text-sm">
          {step.description}
        </p>

        {/* Enhanced decorative elements */}
        <div className="absolute top-6 right-6 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-125"></div>
        <div className="absolute bottom-6 left-6 w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"></div>
        <div className="absolute top-1/2 right-4 w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-150"></div>
      </div>

      {/* Enhanced hover glow effect */}
      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/20 via-blue-400/15 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`}></div>
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-green-300/30 transition-all duration-500"></div>
      
      {/* Mobile-specific border enhancement */}
      <div className="absolute inset-0 rounded-3xl border border-gray-300/40 md:border-0 transition-all duration-300"></div>
    </div>
  )
}

const HowItWorks = () => {
  const { isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const [isHovered, setIsHovered] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const scrollContainerRef = useRef(null)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      await open()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const steps = [
    {
      icon: Wallet,
      title: 'Connect Wallet',
      description: 'Connect your crypto wallet to get started with secure blockchain transactions and access the decentralized marketplace',
      color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600'
    },
    {
      icon: UserPlus,
      title: 'Create Profile',
      description: 'Register as a farmer or consumer and complete your profile verification with KYC compliance for trusted transactions',
      color: 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600'
    },
    {
      icon: ShoppingCart,
      title: 'Browse & Trade',
      description: 'Explore fresh produce from verified farms, place orders, or list your farm products for sale with smart contracts',
      color: 'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700'
    },
    {
      icon: Truck,
      title: 'Track Delivery',
      description: 'Monitor your order in real-time from farm to your doorstep with blockchain tracking and IoT sensors',
      color: 'bg-gradient-to-br from-orange-500 via-amber-500 to-red-500'
    },
    {
      icon: CheckCircle,
      title: 'Confirm Receipt',
      description: 'Confirm delivery to release payment from escrow and complete the transaction with automated smart contracts',
      color: 'bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600'
    },
    {
      icon: Star,
      title: 'Rate & Review',
      description: 'Leave feedback to help build trust and improve the community marketplace with verified quality ratings',
      color: 'bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500'
    }
  ]

  // Auto-scroll effect with smooth animation
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollSpeed = 0.5 // pixels per frame
    let animationId

    const autoScroll = () => {
      if (!isHovered && !isScrolling && container) {
        container.scrollLeft += scrollSpeed

        // Reset scroll position when we've scrolled through one set of steps
        const maxScroll = container.scrollWidth / 2 // Since we have 2 copies
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0
        }
      }
      animationId = requestAnimationFrame(autoScroll)
    }

    animationId = requestAnimationFrame(autoScroll)
    return () => cancelAnimationFrame(animationId)
  }, [isHovered, isScrolling])

  // Update current index based on scroll position
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const updateCurrentIndex = () => {
      const cardWidth = 280 + 24 // card width + gap
      const scrollLeft = container.scrollLeft
      const newIndex = Math.round(scrollLeft / cardWidth) % steps.length
      setCurrentIndex(newIndex)
    }

    const handleScroll = () => {
      updateCurrentIndex()
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [steps.length])

  // Navigate to specific card by index
  const scrollToCard = (index) => {
    const container = scrollContainerRef.current
    if (container) {
      setIsScrolling(true)
      const cardWidth = 280 + 24 // card width + gap
      const targetScroll = index * cardWidth
      container.scrollTo({ left: targetScroll, behavior: 'smooth' })
      setCurrentIndex(index)
      setTimeout(() => setIsScrolling(false), 500)
    }
  }

  // Duplicate steps for seamless infinite scroll
  const duplicatedSteps = [...steps, ...steps]

  return (
    <section id="how-it-works" className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-green-50/30 overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(34,197,94,0.06),rgba(255,255,255,0))]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-400/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/8 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tl from-purple-400/5 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-3 mb-8 shadow-lg">
            <Sparkles className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">How It Works</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 bg-clip-text text-transparent mb-6 tracking-tight">
            Simple Steps to Get Started
          </h2>
          <p className="text-sm sm:text-lg lg:text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto font-medium">
            Experience the future of farming with <span className="text-green-600 font-bold">blockchain-powered transparency</span>, 
            <span className="text-emerald-600 font-bold"> instant payments</span>, and 
            <span className="text-teal-600 font-bold"> direct farm-to-table connections</span> that benefit everyone.
          </p>
        </div>

        {/* Enhanced Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Enhanced Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide px-4 py-4 md:px-6"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {duplicatedSteps.map((step, index) => (
              <StepCard 
                key={`${step.title}-${index}`} 
                step={step} 
                index={index % steps.length}
                isActive={index === currentIndex}
                isHovered={isHovered}
                onHover={setCurrentIndex}
                onLeave={() => setCurrentIndex(0)}
              />
            ))}
                  </div>

          {/* Enhanced Gradient fade effects on sides */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent pointer-events-none z-10"></div>
                  </div>

        {/* Enhanced Dots indicator */}
        <div className="flex justify-center mt-12 space-x-3">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 scale-125 shadow-lg shadow-green-500/40' 
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
              }`}
            />
          ))}
                </div>

        {/* Call to Action Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-green-200/50 shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="/logo.jpg" 
                  alt="AgriChain Logo" 
                  className="w-20 h-20 object-contain rounded-lg"
                />
              </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 bg-clip-text text-transparent mb-6 tracking-tight">
              Ready to Transform Agriculture?
            </h3>
            <p className="text-sm md:text-base text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the future of farming with <span className="text-green-600 font-bold">blockchain-powered transparency</span>, 
              <span className="text-emerald-600 font-bold"> instant payments</span>, and 
              <span className="text-teal-600 font-bold"> direct farm-to-table connections</span> that benefit everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <>
                  <Link
                    to="/marketplace"
                    className="w-full sm:w-auto group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 min-w-[160px] h-[48px] sm:h-[52px]"
                  >
                    <span className="text-base sm:text-lg">🌾</span>
                    <span>Start Trading</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto group bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 border border-gray-300 hover:border-gray-400 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:scale-105 min-w-[160px] h-[48px] sm:h-[52px]"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-2 disabled:hover:scale-100 disabled:opacity-70"
                  >
                    <Wallet className="h-5 w-5" />
                    <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                  </button>
                  <button 
                    onClick={() => {
                      // Scroll to features section
                      const featuresSection = document.getElementById('features');
                      if (featuresSection) {
                        featuresSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-white text-green-600 px-8 py-4 rounded-2xl font-semibold border-2 border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Globe className="h-5 w-5" />
                    <span>Learn More</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  )
}

export default HowItWorks