import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle, Sparkles } from 'lucide-react'
import ContactFormModal from '../ContactFormModal'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  const faqs = [
    {
      question: "What is AgriChain and how does it work?",
      answer: "AgriChain is a blockchain-based platform that connects farmers directly with consumers. It uses smart contracts to ensure transparent, secure transactions and provides complete supply chain tracking from farm to table."
    },
    {
      question: "How do I get started as a farmer?",
      answer: "To get started as a farmer, connect your wallet, register your profile, and list your produce. You can set prices, manage inventory, and track orders through your dashboard. All transactions are secured by blockchain technology."
    },
    {
      question: "What are the benefits for consumers?",
      answer: "Consumers get access to fresh, traceable produce directly from farmers. You can verify the origin, quality certifications, and farming practices. Plus, you support local farmers while getting better prices by eliminating middlemen."
    },
    {
      question: "How are payments processed?",
      answer: "All payments are processed through secure smart contracts on the blockchain. Funds are held in escrow until delivery is confirmed, ensuring both farmers and consumers are protected."
    },
    {
      question: "What cryptocurrencies do you accept?",
      answer: "Currently, we accept ETH and major stablecoins like USDC and USDT. We're continuously adding support for more cryptocurrencies based on user demand."
    },
    {
      question: "How is food quality ensured?",
      answer: "We work with certified inspectors and use IoT sensors to monitor growing conditions. All quality certifications are stored on the blockchain and can be verified by consumers before purchase."
    },
    {
      question: "What happens if there's a dispute?",
      answer: "Our smart contracts include dispute resolution mechanisms. If issues arise, our mediation system helps resolve conflicts fairly, with funds held in escrow until resolution."
    },
    {
      question: "Is my data secure on the platform?",
      answer: "Yes, we use blockchain technology and advanced encryption to protect your data. Personal information is stored securely, and transaction data is immutable and transparent on the blockchain."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-green-50/30 overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_50%_50%_at_50%_0%,rgba(34,197,94,0.06),rgba(255,255,255,0))]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-green-400/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/8 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-tl from-purple-400/5 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full px-6 py-3 mb-8 shadow-lg">
            <HelpCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-semibold text-green-700">FAQ</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 bg-clip-text text-transparent mb-6 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
            Everything you need to know about <span className="text-green-600 font-bold">AgriChain</span> and how it's revolutionizing agriculture
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-gray-200/80 hover:border-green-400/60 transition-all duration-500 hover:scale-[1.01] hover:shadow-xl hover:shadow-green-500/15 overflow-hidden shadow-lg"
            >
              <button
                className="w-full px-6 py-6 text-left flex justify-between items-center hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-all duration-300 group"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300 pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <ChevronUp className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 group-hover:from-green-500 group-hover:to-emerald-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <ChevronDown className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                  <div className="border-t border-gradient-to-r from-green-200 to-emerald-200 pt-6">
                    <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl p-4 border border-green-100/50">
                      <p className="text-gray-700 leading-relaxed font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Enhanced Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-green-200/50 shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you get started with AgriChain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 flex items-center justify-center space-x-2"
              >
                <HelpCircle className="h-5 w-5" />
                <span>Contact Support</span>
              </button>
              <button className="w-full sm:w-auto bg-white text-green-600 px-8 py-3 rounded-xl font-semibold border-2 border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
                <span>View Documentation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </section>
  )
}

export default FAQ