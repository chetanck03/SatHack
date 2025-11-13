import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Twitter, Github, Linkedin } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'GitHub', icon: Github, href: 'https://github.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-6 pr-0 lg:pr-8">
            <Link to="/" className="inline-flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img
                  src="/logo.jpg"
                  alt="AgriChain Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold">AgriChain</span>
            </Link>

            <p className="text-gray-400 mb-6 text-sm sm:text-base leading-relaxed max-w-md">
              Revolutionizing agriculture with blockchain technology.
              Connecting farmers and consumers through transparent, secure supply chain tracking.
            </p>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact Info</h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start space-x-2 sm:space-x-3 text-gray-400">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base break-words">cktechhuborg@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-gray-400">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">+91 94647-43515</span>
              </div>
              <div className="flex items-start space-x-2 sm:space-x-3 text-gray-400">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm sm:text-base">Ludhiana, Punjab, India</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Follow Us</h3>
            <div className="flex space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              ))}
            </div>
            <p className="text-gray-500 text-xs sm:text-base">
              Stay connected with us for updates
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-gray-500 text-sm sm:text-base text-center sm:text-left">
              © {currentYear} AgriChain. All rights reserved.
            </p>
            <p className="text-gray-600 text-sm sm:text-base text-center sm:text-right">
              Built with ❤️ for sustainable agriculture
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer