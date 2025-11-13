import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Sparkles, Leaf, ArrowRight, Shield, Users, TrendingUp, Wheat } from 'lucide-react'
import WalletConnect from '../WalletConnect'

// Global cache to track if video has been loaded before
let videoCacheLoaded = false

const Hero = () => {
    const { isConnected } = useAccount()
    const location = useLocation()
    const [isVideoLoaded, setIsVideoLoaded] = useState(false)
    const [showContent, setShowContent] = useState(false)
    const [videoLoadingProgress, setVideoLoadingProgress] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const videoRef = useRef(null)

    useEffect(() => {
        // Check if video is already cached/ready
        const video = videoRef.current
        if (!video) {
            setIsVideoLoaded(true)
            setShowContent(true)
            setIsLoading(false)
            return
        }

        // Check global cache first
        if (videoCacheLoaded) {
            setIsVideoLoaded(true)
            setShowContent(true)
            setIsLoading(false)
            return
        }

        // Check if video is already loaded (cached)
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA or higher
            videoCacheLoaded = true
            setIsVideoLoaded(true)
            setShowContent(true)
            setIsLoading(false)
            return
        }

        // Video needs to load
        setIsLoading(true)
        setVideoLoadingProgress(0)

        const handleLoadStart = () => {
            setVideoLoadingProgress(10)
        }

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1)
                const duration = video.duration
                if (duration > 0) {
                    const progress = (bufferedEnd / duration) * 100
                    setVideoLoadingProgress(Math.min(progress, 90))
                }
            }
        }

        const handleCanPlay = () => {
            setVideoLoadingProgress(95)
        }

        const handleCanPlayThrough = () => {
            setVideoLoadingProgress(100)
            videoCacheLoaded = true // Mark as globally cached
            setIsVideoLoaded(true)
            setIsLoading(false)
            // Ensure video is actually playing before showing content
            setTimeout(() => {
                setShowContent(true)
            }, 300)
        }

        const handleLoadedData = () => {
            setVideoLoadingProgress(80)
        }

        const handleError = () => {
            console.warn('Video failed to load, showing content anyway')
            videoCacheLoaded = true // Even on error, don't show loader again
            setIsVideoLoaded(true)
            setShowContent(true)
            setIsLoading(false)
        }

        // Add all event listeners
        video.addEventListener('loadstart', handleLoadStart)
        video.addEventListener('progress', handleProgress)
        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('canplaythrough', handleCanPlayThrough)
        video.addEventListener('loadeddata', handleLoadedData)
        video.addEventListener('error', handleError)

        // Force video to start loading
        video.load()

        return () => {
            video.removeEventListener('loadstart', handleLoadStart)
            video.removeEventListener('progress', handleProgress)
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('canplaythrough', handleCanPlayThrough)
            video.removeEventListener('loadeddata', handleLoadedData)
            video.removeEventListener('error', handleError)
        }
    }, [location.pathname])

    return (
        <>
            {/* Enhanced Loading Screen */}
            {isLoading && (
                <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-800 via-emerald-700 to-teal-600 flex items-center justify-center">
                    <div className="text-center relative">
                        {/* Logo with Animation */}
                        <div className="relative mb-8 flex justify-center items-center">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Main Logo */}
                                <div className="w-24 h-24 relative z-10">
                                    <img 
                                        src="/logo.jpg" 
                                        alt="AgriChain Logo" 
                                        className="w-full h-full object-contain rounded-full shadow-2xl animate-pulse border-4 border-white/20"
                                    />
                                    {/* Glowing effect around logo */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/30 to-emerald-400/30 animate-ping"></div>
                                </div>
                                
                                {/* Rotating border rings - properly centered */}
                                <div className="absolute inset-0 w-32 h-32">
                                    <div className="absolute inset-0 border-2 border-green-400/40 rounded-full animate-spin" style={{ animationDuration: '4s' }}></div>
                                    <div className="absolute inset-2 border-2 border-emerald-400/60 rounded-full animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}></div>
                                    <div className="absolute inset-4 border-2 border-teal-400/80 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                                </div>
                                
                                {/* Additional glowing effects - properly centered */}
                                <div className="absolute inset-0 w-40 h-40 -top-4 -left-4 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full animate-ping"></div>
                                <div className="absolute inset-0 w-36 h-36 -top-2 -left-2 bg-gradient-to-br from-green-400/5 to-emerald-500/5 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                            </div>
                        </div>

                        {/* App Name */}
                        <h2 className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            AgriChain
                        </h2>
                        <p className="text-gray-300 text-sm mb-8">Loading...</p>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="w-80 bg-slate-800/50 backdrop-blur-sm rounded-full h-3 mx-auto mb-4 border border-green-500/20 shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-green-400/30"
                                style={{ width: `${videoLoadingProgress}%` }}
                            >
                                <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        
                        {/* Progress Text */}
                        <p className="text-green-400 text-sm font-medium">{Math.round(videoLoadingProgress)}% loaded</p>
                        
                        {/* Loading dots animation */}
                        <div className="flex justify-center mt-4 space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section - Perfect full screen fit */}
            <section className="relative h-[760px] lg:h-screen flex items-center justify-center overflow-hidden">
                {/* Background Video with optimized loading */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controlsList="nodownload nofullscreen noremoteplayback"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    preload="auto"
                    poster="/bg-poster.jpg"
                    className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{
                        aspectRatio: 'auto',
                        backgroundColor: '#064e3b'
                    }}
                >
                    <source src="/bg.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                {/* Fallback background */}
                <div className={`absolute inset-0 bg-gradient-to-br from-green-900 via-emerald-800 to-green-900 z-0 transition-opacity duration-700 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'
                    }`}></div>

                {/* Enhanced Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50 z-10"></div>

                {/* Floating Agriculture Elements */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="absolute top-24 left-20 animate-float">
                        <Leaf className="h-6 w-6 text-green-400/30" />
                    </div>
                    <div className="absolute top-36 right-32 animate-float-delayed">
                        <Shield className="h-5 w-5 text-emerald-400/40" />
                    </div>
                    <div className="absolute bottom-32 left-40 animate-float">
                        <Users className="h-7 w-7 text-green-300/20" />
                    </div>
                    <div className="absolute top-1/2 right-20 animate-float-delayed">
                        <TrendingUp className="h-6 w-6 text-green-500/30" />
                    </div>
                </div>

                <div className={`relative z-30 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}>
                    <div className="text-center">
                        {/* Professional Badge */}
                        <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-full px-2 py-1 border border-green-400/30 shadow-lg mb-6">
                            <span className="text-base">🌾</span>
                            <span className="text-sm font-bold text-white tracking-wide">
                                Farm To Fork Marketplace
                            </span>
                        </div>

                        {/* Responsive Hero Heading */}
                        <h1 className="text-3xl sm:text-3xl md:text-3xl lg:text-3xl font-extrabold text-white mb-3 leading-tight tracking-tight">
                            <span className="block mb-2 text-5xl sm:text-5xl md:text-6xl lg:text-7xl">
                                Fresh Crops
                            </span>
                            <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent animate-gradient mb-2">
                                Direct from Farm
                            </span>
                            <span className="block text-4xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-green-300">
                                Blockchain Secured
                            </span>
                        </h1>

                        {/* Responsive Subtitle */}
                        <p className="text-sm sm:text-lg lg:text-lg text-gray-100 mb-8 leading-relaxed max-w-2xl mx-auto font-medium">
                            Transform agriculture with <span className="text-green-400 font-bold">decentralized trading</span>. 
                            Connect your wallet to buy fresh, organic produce directly from verified farmers with 
                            <span className="text-emerald-300 font-bold"> instant payments</span> and 
                            <span className="text-teal-300 font-bold"> quality guarantees</span>.
                        </p>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-xs sm:text-sm text-gray-300">
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-green-400" />
                                <span>Secure Payments</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-emerald-400" />
                                <span>Verified Farmers</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-teal-400" />
                                <span>Fair Prices</span>
                            </div>
                        </div>


                        {/* Responsive Hero CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-2xl mx-auto">
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
                                    className="w-full sm:w-auto group bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/50 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-300 hover:shadow-lg min-w-[160px] h-[48px] sm:h-[52px]"
                                    >
                                    Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="w-full sm:w-auto">
                                        <WalletConnect />
                                    </div>
                                    <Link
                                        to="/marketplace"
                                    className="w-full sm:w-auto group flex items-center justify-center space-x-2 text-white font-bold text-sm sm:text-base bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 hover:border-white/50 px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 hover:shadow-lg min-w-[160px] h-[48px] sm:h-[52px]"
                                    >
                                        <span className="text-base sm:text-lg">🌾</span>
                                        <span>Marketplace</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(10deg); }
                    }
                    @keyframes float-delayed {
                        0%, 100% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-15px) rotate(-10deg); }
                    }
                    @keyframes gradient {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                    .animate-float-delayed {
                        animation: float-delayed 8s ease-in-out infinite;
                    }
                    .animate-gradient {
                        background-size: 200% 200%;
                        animation: gradient 3s ease infinite;
                    }
                `}</style>
            </section>
        </>
    )
}

export default Hero