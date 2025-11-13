import React, { useRef, useEffect, useState } from 'react'
import { Shield, Truck, Users, Leaf, Zap, Globe, Award, TrendingUp, ChevronLeft, ChevronRight, Lock, Route, Handshake, Sprout, Cpu, MapPin, Star, DollarSign } from 'lucide-react'

// Feature card component with individual hover state
const FeatureCard = ({ feature, index }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative flex-shrink-0 w-72 h-72 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-gray-200/80 hover:border-green-400/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/15 group cursor-pointer overflow-hidden shadow-lg md:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-green-50/30 rounded-2xl"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 via-transparent to-blue-50/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        {/* Icon with enhanced styling */}
        <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-xl`}>
          <feature.icon className="h-8 w-8 text-white" />
        </div>
        
        {/* Title with better typography */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300 leading-tight">
          {feature.title}
        </h3>
        
        {/* Description with improved spacing */}
        <p className="text-gray-600 leading-relaxed flex-grow text-sm">
          {feature.description}
        </p>

        {/* Enhanced decorative elements */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-125"></div>
        <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125"></div>
        <div className="absolute top-1/2 right-3 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-150"></div>
      </div>

      {/* Enhanced hover glow effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 via-blue-400/15 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`}></div>
      
      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-green-300/30 transition-all duration-500"></div>
      
      {/* Mobile-specific border enhancement */}
      <div className="absolute inset-0 rounded-2xl border border-gray-300/40 md:border-0 transition-all duration-300"></div>
    </div>
  )
}

const Features = () => {
  const scrollContainerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  const features = [
    {
      icon: Lock,
      title: 'Blockchain Security',
      description: 'Every transaction is secured and verified on the blockchain with immutable records ensuring complete transparency and trust',
      color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600'
    },
    {
      icon: Route,
      title: 'Supply Chain Tracking',
      description: 'Track your produce from farm to table with complete transparency and real-time updates throughout the entire journey',
      color: 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600'
    },
    {
      icon: Handshake,
      title: 'Direct Connection',
      description: 'Connect farmers directly with consumers, eliminating middlemen and reducing costs while building stronger relationships',
      color: 'bg-gradient-to-br from-purple-500 via-violet-600 to-purple-700'
    },
    {
      icon: Leaf,
      title: 'Sustainable Agriculture',
      description: 'Promote sustainable farming practices and organic produce with verified certifications for environmental responsibility',
      color: 'bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600'
    },
    {
      icon: Cpu,
      title: 'Smart Contracts',
      description: 'Automated payments and escrow services ensure secure and timely transactions with zero human intervention required',
      color: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500'
    },
    {
      icon: MapPin,
      title: 'Global Marketplace',
      description: 'Access a worldwide network of farmers and consumers on a single platform breaking geographical barriers',
      color: 'bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-600'
    },
    {
      icon: Star,
      title: 'Quality Assurance',
      description: 'Verified quality certifications and ratings system for trusted transactions ensuring the highest standards',
      color: 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500'
    },
    {
      icon: DollarSign,
      title: 'Fair Pricing',
      description: 'Dynamic pricing based on market conditions ensures fair value for all participants in the ecosystem',
      color: 'bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500'
    }
  ]

  // Auto-scroll effect with smooth animation
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollSpeed = 0.8 // pixels per frame
    let animationId

    const autoScroll = () => {
      if (!isHovered && !isScrolling && container) {
        container.scrollLeft += scrollSpeed

        // Reset scroll position when we've scrolled through one set of features
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
      const cardWidth = 288 + 24 // card width + gap
      const scrollLeft = container.scrollLeft
      const newIndex = Math.round(scrollLeft / cardWidth) % features.length
      setCurrentIndex(newIndex)
    }

    const handleScroll = () => {
      updateCurrentIndex()
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [features.length])


  // Navigate to specific card by index
  const scrollToCard = (index) => {
    const container = scrollContainerRef.current
    if (container) {
      setIsScrolling(true)
      const cardWidth = 288 + 24 // card width + gap
      const targetScroll = index * cardWidth
      container.scrollTo({ left: targetScroll, behavior: 'smooth' })
      setCurrentIndex(index)
      setTimeout(() => setIsScrolling(false), 500)
    }
  }

  // Triple the features for seamless infinite scroll
  const duplicatedFeatures = [...features, ...features]

  return (
    <section id="features" className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-green-50/30 overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(34,197,94,0.06),rgba(255,255,255,0))]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-400/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/8 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 bg-clip-text text-transparent mb-6 tracking-tight">
            Why Choose AgriChain?
          </h2>
          <p className="text-sm md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our platform combines cutting-edge blockchain technology with agricultural expertise 
            to create the most transparent and efficient farming ecosystem
          </p>
        </div>
        
        {/* Enhanced Carousel Container */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Enhanced Navigation Buttons */}
      

          {/* Enhanced Scrollable container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide px-4 py-4 md:px-6"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {duplicatedFeatures.map((feature, index) => (
              <FeatureCard key={`${feature.title}-${index}`} feature={feature} index={index} />
          ))}
        </div>

          {/* Enhanced Gradient fade effects on sides */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-r from-gray-50 via-gray-50/90 to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-20 bg-gradient-to-l from-gray-50 via-gray-50/90 to-transparent pointer-events-none z-10"></div>
        </div>

        {/* Enhanced Dots indicator */}
        <div className="flex justify-center mt-12 space-x-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex 
                  ? 'bg-green-500 scale-125 shadow-md shadow-green-500/40' 
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features