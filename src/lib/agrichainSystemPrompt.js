// AgriChain AI System Prompt - Comprehensive agricultural blockchain assistant

// Agricultural Schemes Knowledge Base
const agriculturalSchemesKB = {
  research_centers_and_certification: {
    "Andhra_Pradesh": {
      state: "Andhra Pradesh",
      centers: [
        {
          name: "Acharya N.G. Ranga Agricultural University",
          location: "Hyderabad",
          type: "Agricultural University",
          services: ["Research", "Training", "Crop guidance", "Technology transfer"],
          website: "https://angrau.ac.in/"
        },
        {
          name: "Regional Agricultural Research Station",
          location: "Tirupati",
          type: "Research Station",
          services: ["Crop research", "Variety development", "Field trials"],
          website: "http://www.rarstpt.org/"
        },
        {
          name: "KVK (ANGRAU)",
          location: "Lambasingi (Visakhapatnam)",
          type: "Krishi Vigyan Kendra",
          services: ["Training", "Demonstrations", "Farm advisory", "Soil testing"],
          website: "https://kvk.icar.gov.in/"
        },
        {
          name: "Andhra Pradesh State Seed Certification Agency",
          location: "Guntur",
          type: "Certification Agency",
          services: ["Seed certification", "Quality testing", "Field inspection"],
          website: "https://angrau.ac.in/"
        }
      ]
    },
    "Bihar": {
      state: "Bihar",
      centers: [
        {
          name: "Dr. Rajendra Prasad Central Agricultural University",
          location: "Pusa",
          type: "Agricultural University",
          services: ["Research", "Education", "Extension", "Crop technology"],
          website: "https://www.rpcau.ac.in/"
        },
        {
          name: "Bihar Agricultural University",
          location: "Bhagalpur",
          type: "Agricultural University",
          services: ["Research", "Training", "Advisory services"],
          website: "https://www.bausabour.ac.in/"
        },
        {
          name: "Bihar State Seed & Organic Certification Agency",
          location: "Patna",
          type: "Certification Agency",
          services: ["Seed certification", "Organic certification", "Quality assurance"],
          website: "https://bssca.co.in/"
        },
        {
          name: "Farm Machinery Testing Centre",
          location: "Muzaffarpur",
          type: "Testing Centre",
          services: ["Equipment testing", "Machinery certification", "Performance evaluation"],
          website: "https://www.rpcau.ac.in/"
        }
      ]
    },
    "Chhattisgarh": {
      state: "Chhattisgarh",
      centers: [
        {
          name: "Directorate of Agricultural Engineering Testing Centre",
          location: "Raipur",
          type: "Testing Centre",
          services: ["Machinery testing", "Equipment certification"],
          website: "https://agriportal.cg.nic.in/"
        },
        {
          name: "Indira Gandhi Krishi Vishwavidyalaya",
          location: "Raipur",
          type: "Agricultural University",
          services: ["Research", "Education", "Extension", "Crop advisory"],
          website: "https://www.igkv.ac.in/"
        },
        {
          name: "Chhattisgarh Certification Society (Organic)",
          location: "Raipur",
          type: "Certification Agency",
          services: ["Organic certification", "PGS certification"],
          website: "https://cgcert.com/"
        },
        {
          name: "KVK",
          location: "Bilaspur",
          type: "Krishi Vigyan Kendra",
          services: ["Training", "Demonstrations", "Farmer guidance"],
          website: "http://www.kvkbilaspur.org/"
        }
      ]
    },
    "Delhi": {
      state: "Delhi",
      centers: [
        {
          name: "Indian Agricultural Research Institute (IARI)",
          location: "New Delhi",
          type: "Premier Research Institute",
          services: ["Advanced research", "Variety development", "Training", "Patents", "Technology licensing"],
          website: "https://www.iari.res.in/"
        },
        {
          name: "National Centre of Organic Farming (NCOF)",
          location: "Ghaziabad (Delhi NCR)",
          type: "National Centre",
          services: ["Organic farming promotion", "Certification guidance", "Training"],
          website: "https://www.jaivikkheti.in/ncof"
        },
        {
          name: "Farm Machinery Training & Testing Institute",
          location: "Faridabad (NCR)",
          type: "Testing Institute",
          services: ["Machinery testing", "Training", "Certification"],
          website: "https://fmttibudni.gov.in/"
        },
        {
          name: "ICAR Headquarters Labs",
          location: "New Delhi",
          type: "Research Labs",
          services: ["Patent assistance", "Technology transfer", "Research collaboration"],
          website: "https://icar.org.in/"
        }
      ]
    }
    // Additional states would continue here...
  },
  
  central_schemes: {
    "PM-KISAN": {
      full_name: "Pradhan Mantri Kisan Samman Nidhi",
      description: "Direct income support scheme providing ₹6,000 per year to all landholding farmers in three equal installments of ₹2,000 each.",
      eligibility: "All landholding farmers families (small and marginal farmers initially, now extended to all farmers)",
      benefits: "₹6,000 per year in three installments directly to bank accounts",
      application: "Through Common Service Centers (CSCs) or online portal pmkisan.gov.in",
      launched: "February 2019"
    },
    "PMFBY": {
      full_name: "Pradhan Mantri Fasal Bima Yojana",
      description: "Comprehensive crop insurance scheme protecting farmers against crop loss due to natural calamities, pests, and diseases.",
      eligibility: "All farmers including sharecroppers and tenant farmers",
      benefits: "Insurance coverage for all stages of crop cycle. Premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural crops",
      application: "Through banks, CSCs, insurance companies, or online portal pmfby.gov.in",
      launched: "January 2016"
    },
    "ISS": {
      full_name: "Interest Subvention Scheme",
      description: "Provides short-term crop loans up to ₹3 lakh at subsidized interest rates to farmers.",
      eligibility: "Farmers availing crop loans from banks",
      benefits: "2% interest subvention + 3% prompt repayment incentive = effective 4% interest rate",
      application: "Through lending banks and cooperative societies",
      launched: "Ongoing since 2006-07"
    },
    "AIF": {
      full_name: "Agriculture Infrastructure Fund",
      description: "Financing facility for investment in post-harvest management and community farming assets.",
      eligibility: "Farmers, FPOs, Agri-entrepreneurs, Cooperatives, Self Help Groups",
      benefits: "₹1 lakh crore financing with 3% interest subvention and credit guarantee coverage",
      application: "Through banks and financial institutions",
      launched: "August 2020"
    }
    // Additional schemes would continue here...
  },
  
  state_schemes_examples: {
    "Rythu_Bandhu": {
      state: "Telangana",
      description: "Direct investment support of ₹5,000 per acre per season to farmers for agricultural inputs.",
      eligibility: "All landholding farmers in Telangana",
      benefits: "₹10,000 per acre per year (₹5,000 per season for 2 seasons)",
      launched: "2018"
    },
    "Rythu_Bharosa": {
      state: "Andhra Pradesh",
      description: "Similar to Rythu Bandhu, provides ₹13,500 per year to farmers.",
      eligibility: "All landholding farmers in Andhra Pradesh",
      benefits: "₹13,500 per year in three installments",
      launched: "2022"
    }
    // Additional state schemes would continue here...
  }
};

// Helper functions for agricultural schemes
const findCentersByState = (state, centerType = null) => {
  const stateKey = state.replace(/\s+/g, '_');
  const stateData = agriculturalSchemesKB.research_centers_and_certification[stateKey];
  
  if (!stateData) {
    return { error: "State not found. Please check the state name." };
  }
  
  if (centerType) {
    return stateData.centers.filter(center => 
      center.type.toLowerCase().includes(centerType.toLowerCase())
    );
  }
  
  return stateData.centers;
};

const getCenterRecommendation = (state, need) => {
  const centers = findCentersByState(state);
  
  if (centers.error) return centers;
  
  const recommendations = {
    'crop_info': centers.filter(c => c.type.includes('University') || c.type.includes('KVK')),
    'certification_seed': centers.filter(c => c.type.includes('Certification')),
    'certification_organic': centers.filter(c => c.services.includes('Organic certification')),
    'machinery_testing': centers.filter(c => c.type.includes('Testing')),
    'training': centers.filter(c => c.type.includes('KVK')),
    'patent': centers.filter(c => c.type.includes('University') || c.type.includes('Institute')),
    'research': centers.filter(c => c.type.includes('Research') || c.type.includes('University'))
  };
  
  return recommendations[need] || centers;
};

// Function to get certificate guidance using agriculturalSchemesKB
const getCertificateGuidance = (state, certificateType) => {
  const stateKey = state.replace(/\s+/g, '_');
  const stateData = agriculturalSchemesKB.research_centers_and_certification[stateKey];
  
  if (!stateData) {
    return {
      error: "State not found. Please provide a valid Indian state name.",
      suggestion: "Try states like: Andhra Pradesh, Bihar, Chhattisgarh, Delhi, Gujarat, Haryana, etc."
    };
  }
  
  let relevantCenters = [];
  let guidance = "";
  
  switch (certificateType.toLowerCase()) {
    case 'organic':
      relevantCenters = stateData.centers.filter(center => 
        center.services.some(service => 
          service.toLowerCase().includes('organic certification') || 
          service.toLowerCase().includes('pgs certification')
        )
      );
      guidance = `🌱 **Organic Certification Process in ${state}:**\n\n` +
                `**Steps to Get Organic Certification:**\n` +
                `1. Contact the certification agency below\n` +
                `2. Apply for PGS (Participatory Guarantee System) - Free for small farmers\n` +
                `3. Maintain 3-year conversion period without synthetic chemicals\n` +
                `4. Keep detailed farming records\n` +
                `5. Allow field inspection by certification team\n\n` +
                `**Benefits:**\n` +
                `• 20-30% premium price for organic produce\n` +
                `• Support under PKVY scheme (₹50,000/hectare)\n` +
                `• Access to organic markets\n\n`;
      break;
      
    case 'seed':
      relevantCenters = stateData.centers.filter(center => 
        center.services.some(service => 
          service.toLowerCase().includes('seed certification') || 
          service.toLowerCase().includes('quality testing')
        )
      );
      guidance = `🌾 **Seed Certification Process in ${state}:**\n\n` +
                `**Steps to Get Seed Certification:**\n` +
                `1. Contact the seed certification agency below\n` +
                `2. Apply for field inspection during crop growth\n` +
                `3. Maintain field standards and isolation distances\n` +
                `4. Submit samples for laboratory testing\n` +
                `5. Get certification tags for certified seeds\n\n` +
                `**Benefits:**\n` +
                `• Higher price for certified seeds\n` +
                `• Quality assurance for buyers\n` +
                `• Access to government seed programs\n\n`;
      break;
      
    case 'machinery':
      relevantCenters = stateData.centers.filter(center => 
        center.services.some(service => 
          service.toLowerCase().includes('equipment testing') || 
          service.toLowerCase().includes('machinery certification')
        )
      );
      guidance = `🚜 **Machinery Certification Process in ${state}:**\n\n` +
                `**Steps to Get Machinery Certified:**\n` +
                `1. Contact the testing centre below\n` +
                `2. Submit machinery for performance evaluation\n` +
                `3. Provide technical specifications and drawings\n` +
                `4. Allow testing for safety and efficiency standards\n` +
                `5. Receive certification for subsidy eligibility\n\n` +
                `**Benefits:**\n` +
                `• Eligible for government subsidies (40-50%)\n` +
                `• Quality assurance for buyers\n` +
                `• Market credibility\n\n`;
      break;
      
    default:
      relevantCenters = stateData.centers.filter(center => 
        center.type.includes('Certification') || 
        center.services.some(service => service.toLowerCase().includes('certification'))
      );
      guidance = `📋 **General Certification Information in ${state}:**\n\n` +
                `Available certification types:\n` +
                `• Organic Certification (PGS/Third-party)\n` +
                `• Seed Certification\n` +
                `• Machinery Testing & Certification\n\n`;
  }
  
  return {
    guidance,
    centers: relevantCenters,
    state: state,
    certificateType
  };
};

export const AGRICHAIN_SYSTEM_PROMPT = `
You are AgriChain AI, an intelligent assistant for the AgriChain blockchain-based agricultural supply chain platform. You are knowledgeable, helpful, and specialized in revolutionizing agriculture through blockchain technology.

You are also an expert agricultural schemes advisor for India, specializing in both central and state-level farming schemes, subsidies, support programs, research centers, and certification agencies.

Your primary role includes:
1. Help farmers understand and access various agricultural schemes
2. Provide accurate information about eligibility, benefits, and application processes
3. Guide farmers to nearest research stations, KVKs, and certification agencies
4. Assist with crop information, patents, and certification processes
5. Explain schemes in simple, farmer-friendly language (Hindi/English/Regional languages)
6. Direct farmers to appropriate centers for technical support and innovation
7. Assist with documentation and application procedures

## CORE EXPERTISE:
\u{1F33E} **Agricultural Knowledge**: Farming practices, crop management, harvest timing, soil health, pest control, organic farming, sustainable agriculture, seasonal planning
\u{1F517} **Blockchain Technology**: Smart contracts, supply chain transparency, traceability, decentralized systems, escrow payments
\u{1F4E6} **Supply Chain Management**: Farm-to-consumer tracking, logistics, quality control, certification, delivery management
\u{1F4B0} **Marketplace Operations**: Direct farmer-consumer connections, pricing strategies, order management, secure transactions
\u{1F69A} **Delivery & Logistics**: Real-time tracking, delivery confirmation, address management, quality assurance
\u{1F4CA} **Government Data Integration**: Real-time agricultural data from Ministry of Agriculture, weather patterns, market prices
\u{1F69C} **Machinery Rental**: Agricultural equipment marketplace, tractor rentals, farming tool sharing
\u{1F4AC} **Real-time Communication**: Direct farmer-consumer chat, instant messaging, order discussions

## AGRICULTURAL SCHEMES KNOWLEDGE BASE:

### 🏛️ **RESEARCH CENTERS & CERTIFICATION AGENCIES (State-wise)**:
Each state has Agricultural Universities, Research Stations, Krishi Vigyan Kendras (KVKs), Seed Certification Agencies, and Farm Machinery Testing Centres where farmers can:
- Get crop-specific information and guidance
- Access latest agricultural research and technologies
- Apply for patents on agricultural innovations
- Obtain seed and organic certifications
- Test and certify farm machinery and equipment
- Receive training and demonstrations
- Get soil testing and advisory services

### 🏛️ **CENTRAL GOVERNMENT SCHEMES**:
- **PM-KISAN**: ₹6,000/year direct income support to all landholding farmers
- **PM-Fasal Bima Yojana**: Comprehensive crop insurance with low premiums
- **Interest Subvention Schemes**: Subsidized agricultural credit at 4% effective rate
- **Agriculture Infrastructure Fund**: ₹1 lakh crore for agri-infrastructure development
- **National Beekeeping & Honey Mission**: Beekeeping promotion and support
- **FPO Promotion**: ₹18 lakh support per Farmer Producer Organization over 5 years
- **NMEO-OP**: Oil palm cultivation support with price assurance
- **PKVY**: Organic farming promotion with ₹50,000/hectare support
- **RKVY**: State-level agriculture development programs
- **NFSM**: Food security and production enhancement initiatives
- **NMSA**: Sustainable agriculture practices promotion
- **Matsya Sampada**: Fisheries sector development
- **Agricultural Mechanization**: 40-50% subsidy on farm equipment

### 🏛️ **STATE SCHEMES EXAMPLES**:
- **Rythu Bandhu (Telangana)**: ₹10,000/acre/year direct investment support
- **Rythu Bharosa (Andhra Pradesh)**: ₹13,500/year to farmers
- **State input subsidies**: Seeds, fertilizers, irrigation equipment
- **Micro-irrigation subsidies**: 40-55% on drip/sprinkler systems
- **Soil health and testing programs**: Free soil testing and recommendations
- **Farm mechanization state subsidies**: Equipment purchase support
- **Organic farming certification subsidies**: PGS and third-party certification
- **Post-harvest infrastructure support**: Storage and processing facilities

## COMPREHENSIVE AGRICHAIN PLATFORM FEATURES:

### \u{1F3EA} **MARKETPLACE ECOSYSTEM**:
- **Direct Farm-to-Consumer Sales**: Eliminate middlemen, better prices for farmers and consumers
- **Quality Verified Produce**: Lab certificates, grading systems, IPFS-stored documentation
- **Multi-Network Support**: Ethereum Sepolia, Polygon Amoy, Base Sepolia blockchain networks
- **Secure Escrow Payments**: Blockchain-based payment protection until delivery confirmation
- **Real-time Inventory**: Live produce availability, quantity tracking, automatic updates
- **Advanced Search & Filtering**: Find produce by type, location, price, quality grade, harvest date
- **Machinery Rental Marketplace**: Rent tractors, harvesters, irrigation systems, farming equipment
- **Seasonal Produce Calendar**: Know what's in season, plan purchases and farming activities

### \u{1F4CA} **GOVERNMENT DATA INTEGRATION**:
- **Ministry of Agriculture API**: Real-time crop prices, weather forecasts, agricultural advisories
- **Market Price Intelligence**: Live commodity prices, demand forecasting, price trend analysis
- **Weather Integration**: Rainfall data, temperature monitoring, seasonal predictions
- **Crop Advisory Services**: Government recommendations, pest alerts, farming best practices
- **Subsidy Information**: Agricultural scheme details, eligibility criteria, application processes
- **Soil Health Data**: Government soil testing results, nutrient recommendations

### \u{1F4B3} **ESCROW-BASED PAYMENT SYSTEM**:
- **Secure Transactions**: Payments held in smart contract until delivery confirmation
- **Multi-Currency Support**: ETH, MATIC, and other blockchain native currencies
- **Automatic Refunds**: Instant refunds for rejected or cancelled orders
- **Payment Protection**: Both farmers and consumers protected from fraud
- **Transaction History**: Complete blockchain-recorded payment trail
- **Gas Fee Optimization**: Efficient smart contract design to minimize transaction costs

### \u{1F69A} **ADVANCED DELIVERY SYSTEM**:
- **Real-time GPS Tracking**: Live delivery location updates
- **Delivery Address Management**: Multiple address support, delivery preferences
- **Quality Assurance**: Photo verification at delivery, condition reporting
- **Delivery Confirmation**: Blockchain-recorded delivery proof
- **Delivery Partner Network**: Integration with logistics providers
- **Cold Chain Monitoring**: Temperature-controlled delivery for perishables

### \u{1F69C} **MACHINERY RENTAL PLATFORM**:
- **Equipment Marketplace**: Browse available tractors, harvesters, irrigation systems
- **Rental Scheduling**: Book equipment by date, duration, location
- **Equipment Verification**: Maintenance records, operator certification, insurance details
- **Peer-to-Peer Sharing**: Farmers can rent out their unused equipment
- **Rental Payments**: Secure blockchain-based rental transactions
- **Equipment Tracking**: GPS monitoring of rented machinery
- **Maintenance Alerts**: Automated service reminders, breakdown reporting

### \u{1F4AC} **REAL-TIME COMMUNICATION**:
- **Direct Farmer-Consumer Chat**: Instant messaging within the platform
- **Order Discussions**: Chat about specific orders, delivery preferences, quality questions
- **Group Channels**: Community discussions, farming tips, market updates
- **Voice Messages**: Audio communication for complex discussions
- **Image Sharing**: Share photos of produce, farming conditions, delivery status
- **Translation Support**: Multi-language communication capabilities
- **Notification System**: Real-time alerts for messages, orders, deliveries

## USER ROLES & CAPABILITIES:

### \u{1F468}\u{200D}\u{1F33E} **FOR FARMERS**:
- Register and manage multiple produce listings with IPFS image storage
- Set competitive prices based on real-time market data
- Accept/reject orders with detailed reasoning
- Track delivery status and confirm completions
- Access government agricultural data and advisories
- List machinery for rental to other farmers
- Chat directly with consumers about orders and produce
- View comprehensive dashboard with earnings, orders, and analytics

### \u{1F6D2} **FOR CONSUMERS**:
- Browse verified produce with complete traceability
- View lab certificates, farm details, and quality grades
- Place secure orders with escrow payment protection
- Track orders in real-time from farm to doorstep
- Access government price data for informed purchasing
- Rent agricultural machinery for home farming
- Chat with farmers about produce quality and delivery
- Manage order history and delivery addresses

## PRODUCE TYPES & CATEGORIES:
- **Vegetables**: Tomatoes, Onions, Potatoes, Leafy Greens, Root Vegetables
- **Fruits**: Seasonal fruits, Citrus, Berries, Tropical fruits
- **Grains**: Rice, Wheat, Millets, Pulses, Cereals
- **Dairy**: Fresh milk, Cheese, Yogurt, Butter (where applicable)
- **Herbs & Spices**: Fresh herbs, Dried spices, Medicinal plants
- **Nuts & Seeds**: Almonds, Walnuts, Sunflower seeds, Pumpkin seeds
- **Other**: Honey, Organic products, Specialty crops

## COMMUNICATION STYLE:
- Professional yet warm and approachable
- Use appropriate agricultural and blockchain terminology
- Provide practical, actionable advice with step-by-step guidance
- Include relevant Unicode emojis for visual appeal
- Be comprehensive but concise
- Always prioritize food safety, quality, and fair trade
- Emphasize the benefits of blockchain transparency and direct trade

## RESPONSE GUIDELINES:
- **Farming Questions**: Provide seasonal advice, sustainable practices, government scheme information
- **Marketplace Queries**: Explain direct trade benefits, pricing strategies, quality standards
- **Blockchain Questions**: Simplify complex concepts, focus on transparency and security benefits
- **Technical Issues**: Offer clear step-by-step solutions with screenshots when helpful
- **Government Data**: Reference real-time agricultural data, weather patterns, market prices
- **Machinery Rental**: Guide users through equipment selection, booking, and usage
- **Communication Features**: Help users connect with farmers/consumers effectively
- **Scheme Queries**: Always ask about farmer's location (state/district) to provide relevant schemes AND nearest centers
- **Research/Certification Needs**: Direct farmers to appropriate research centers, KVKs, or certification agencies
- **Patent/Innovation Support**: Guide to IARI Delhi, CIAE Bhopal, or state agricultural universities
- **Certificate Queries**: When someone asks about certificates, ALWAYS use the agriculturalSchemesKB to provide specific state-wise certification agency details, complete contact information, websites, and step-by-step certification processes. IMMEDIATELY provide website links and contact details when state is mentioned.
- **Proactive Information**: Don't just ask for information - when users mention their state, immediately provide relevant centers with complete details including website links, locations, and services.
- **Link Provision**: ALWAYS include website links from the knowledge base when providing center information. Users specifically request links, so provide them prominently.

## CENTER REFERRAL GUIDELINES:
When farmers need:
🔍 **Crop information** → Direct to nearest Agricultural University or KVK
📜 **Patents/Innovation** → Refer to IARI Delhi, CIAE Bhopal, or state agricultural university
✅ **Seed Certification** → State Seed Certification Agency
🌱 **Organic Certification** → State Organic Certification Agency or NCOF
🚜 **Machinery Testing** → Farm Machinery Testing Centre in their state
🎓 **Training** → Nearest Krishi Vigyan Kendra (KVK)
🧪 **Soil Testing** → KVK or District Agriculture Office

## SAMPLE RESPONSES:
- "Excellent question about tomato harvesting! \u{1F345} Based on current weather data from the Ministry of Agriculture, the optimal harvest time in your region is..."
- "AgriChain's blockchain traceability ensures every step from farm to table is recorded. You can see the complete journey of your produce including..."
- "For machinery rental, we have several tractors available in your area. Here's how to book and what to expect..."
- "Our escrow payment system protects both farmers and consumers. Here's how it works step-by-step..."
- "I can help you with income support schemes! Which state are you farming in? Based on your location, you may be eligible for PM-KISAN (₹6,000/year) plus state schemes like Rythu Bandhu..."
- "For organic certification, I need to know your state to direct you to the nearest certification agency. You can also get support under PKVY scheme with ₹50,000/hectare..."
- "For your agricultural innovation, contact the nearest Agricultural University in your state. They have IPR cells that can help with patent filing and technology licensing..."
- "For seed certification in Bihar, contact Bihar State Seed & Organic Certification Agency in Patna. Website: https://bssca.co.in/ - They handle seed certification, organic certification, and quality assurance. You can apply online or visit their office directly!"
- "Since you're in Andhra Pradesh, for seed certification contact: Andhra Pradesh State Seed Certification Agency, Guntur. Website: https://angrau.ac.in/ - They provide seed certification, quality testing, and field inspection services."

Always maintain a helpful, knowledgeable tone while being specific to agricultural, blockchain, marketplace, and government schemes contexts. Emphasize AgriChain's unique value proposition of connecting farmers directly with consumers through secure, transparent blockchain technology while also providing comprehensive support for accessing government schemes and research centers.
`

// Intelligent fallback responses for when API is unavailable
export const getFallbackResponse = (userMessage) => {
  const message = userMessage.toLowerCase()
  
  // Farming and Agriculture
  if (message.includes('farm') || message.includes('crop') || message.includes('plant') || message.includes('grow')) {
    return "\u{1F33E} I'd love to help with your farming questions! AgriChain integrates real-time data from the Ministry of Agriculture including weather patterns, soil conditions, and crop advisories. For specific crop advice, soil management, or harvest timing, I can provide detailed guidance based on government data and your location. What specific farming challenge are you facing?"
  }
  
  // Marketplace and Trading
  if (message.includes('sell') || message.includes('buy') || message.includes('price') || message.includes('market')) {
    return "\u{1F4B0} The AgriChain marketplace revolutionizes direct farm-to-consumer trade! Farmers can list produce with quality certifications, access real-time government price data, and connect directly with consumers. We also offer machinery rental services. Are you looking to sell your harvest, buy fresh produce, or rent farming equipment?"
  }
  
  // Orders and Delivery
  if (message.includes('order') || message.includes('deliver') || message.includes('track') || message.includes('ship')) {
    return "\u{1F4E6} AgriChain's advanced order system features secure escrow payments and real-time GPS tracking! Orders flow: Pending \u{2192} Accepted \u{2192} In Delivery \u{2192} Delivered. You can track every step on the blockchain with live location updates. Need help with a specific order or delivery?"
  }
  
  // Blockchain and Technology
  if (message.includes('blockchain') || message.includes('smart contract') || message.includes('trace') || message.includes('verify')) {
    return "\u{1F517} AgriChain uses cutting-edge blockchain technology across Ethereum Sepolia, Polygon Amoy, and Base Sepolia networks! Every produce item has complete traceability from farm to table, including origin farm, harvest time, quality certifications, and ownership transfers. This ensures food safety, authenticity, and fair trade!"
  }
  
  // Quality and Certification
  if (message.includes('quality') || message.includes('certificate') || message.includes('lab') || message.includes('grade')) {
    return "\u{1F3C6} Quality assurance is our top priority! All produce requires lab certifications stored on IPFS before listing. We support various grades and quality standards with photo verification. Farmers can upload multiple images and certificates to showcase their produce quality. What quality standards are you interested in?"
  }
  
  // Certificate-related queries - Use agriculturalSchemesKB
  if (message.includes('certification') || message.includes('certify') || message.includes('organic certificate') || message.includes('seed certificate')) {
    return "\u{1F4DC} I can help you get the right certifications! To provide specific guidance, I need to know:\n\n1. Which state are you in?\n2. What type of certification do you need?\n   - \u{1F331} Organic Certification (for organic farming)\n   - \u{1F33E} Seed Certification (for seed production)\n   - \u{1F69C} Machinery Certification (for equipment testing)\n\nBased on your location, I'll direct you to the exact certification agency in your state with complete contact details, website, and application process from our comprehensive database of research centers and certification agencies across India!, type of certification do you need?\n   - \u{1F331} Organic Certification (for organic farming)\n   - \u{1F33E} Seed Certification (for seed production)\n   - \u{1F69C} Machinery Certification (for equipment testing)\n\nBased on your location, I'll direct you to the exact certification agency in your state with complete contact details, website, and application process from our comprehensive database of research centers and certification agencies across India!"
  }
  
  // Wallet and Payments
  if (message.includes('wallet') || message.includes('payment') || message.includes('eth') || message.includes('crypto') || message.includes('escrow')) {
    return "\u{1F4B3} AgriChain uses secure blockchain escrow payments across multiple networks! Payments are held in smart contracts until delivery confirmation, protecting both farmers and consumers. We support ETH, MATIC, and automatic refunds for rejected orders. Need help connecting your wallet or understanding escrow?"
  }
  
  // Machinery and Equipment
  if (message.includes('machine') || message.includes('tractor') || message.includes('equipment') || message.includes('rent') || message.includes('tool')) {
    return "\u{1F69C} Our machinery rental marketplace connects farmers with agricultural equipment! Rent tractors, harvesters, irrigation systems, and farming tools from verified owners. Features include GPS tracking, maintenance records, and secure blockchain payments. Looking to rent equipment or list your machinery?"
  }
  
  // Government Data and Weather
  if (message.includes('government') || message.includes('ministry') || message.includes('weather') || message.includes('data') || message.includes('price')) {
    return "\u{1F4CA} AgriChain integrates real-time government data from the Ministry of Agriculture! Access live crop prices, weather forecasts, soil health data, agricultural advisories, and subsidy information. This helps farmers make informed decisions and consumers understand fair pricing. What government data do you need?"
  }
  
  // Communication and Chat
  if (message.includes('chat') || message.includes('message') || message.includes('talk') || message.includes('communicate')) {
    return "\u{1F4AC} AgriChain features real-time communication between farmers and consumers! Direct chat about orders, produce quality, delivery preferences, and farming practices. Includes voice messages, image sharing, and group channels for community discussions. Want to know how to start chatting with farmers or consumers?"
  }
  
  // Seasonal and Weather
  if (message.includes('season') || message.includes('climate') || message.includes('harvest') || message.includes('planting')) {
    return "\u{1F324}\u{FE0F} Seasonal planning is crucial for successful farming! AgriChain provides government weather data, seasonal crop calendars, and market demand forecasting. Plan your crop calendar, understand optimal planting/harvesting times, and connect with buyers at the right season. What season or crop are you planning for?"
  }
  
  // General Help
  if (message.includes('help') || message.includes('how') || message.includes('what') || message.includes('guide')) {
    return "\u{1F33E} Welcome to AgriChain - Revolutionizing Agriculture Through Blockchain! I can help you with:\n\n\u{2022} **Direct Marketplace**: Farm-to-consumer sales with quality verification\n\u{2022} **Government Data**: Real-time agricultural data from Ministry of Agriculture\n\u{2022} **Escrow Payments**: Secure blockchain transactions with delivery protection\n\u{2022} **Machinery Rental**: Agricultural equipment marketplace\n\u{2022} **Real-time Chat**: Direct farmer-consumer communication\n\u{2022} **Delivery Tracking**: GPS-enabled order tracking\n\u{2022} **Blockchain Traceability**: Complete supply chain transparency\n\nWhat would you like to explore first?"
  }
  
  // State-specific certification queries with immediate response
  const stateNames = ['andhra pradesh', 'bihar', 'chhattisgarh', 'delhi', 'gujarat', 'haryana', 'jammu', 'kashmir', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh', 'maharashtra', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'uttar pradesh', 'west bengal'];
  const detectedState = stateNames.find(state => message.includes(state));
  
  if (detectedState && (message.includes('seed') || message.includes('certification') || message.includes('certificate'))) {
    const stateKey = detectedState.replace(/\s+/g, '_');
    const stateData = agriculturalSchemesKB.research_centers_and_certification[stateKey];
    
    if (stateData) {
      const seedCenters = stateData.centers.filter(center => 
        center.services.some(service => 
          service.toLowerCase().includes('seed certification') || 
          service.toLowerCase().includes('quality testing')
        )
      );
      
      if (seedCenters.length > 0) {
        let response = `\u{1F33E} **Seed Certification in ${stateData.state}:**\n\n`;
        
        seedCenters.forEach((center, index) => {
          response += `**${index + 1}. ${center.name}**\n`;
          response += `📍 Location: ${center.location}\n`;
          response += `🌐 Website: ${center.website}\n`;
          response += `📋 Services: ${center.services.join(', ')}\n\n`;
        });
        
        response += `**Steps to Get Seed Certification:**\n`;
        response += `1. Visit the website above or contact the agency directly\n`;
        response += `2. Apply for field inspection during crop growth\n`;
        response += `3. Maintain field standards and isolation distances\n`;
        response += `4. Submit samples for laboratory testing\n`;
        response += `5. Get certification tags for certified seeds\n\n`;
        response += `**Benefits:** Higher prices, quality assurance, access to government programs!`;
        
        return response;
      }
    }
  }
  
  // Default response
  return "\u{1F33E} Hello! I'm your AgriChain AI assistant, here to revolutionize your agricultural experience! \n\nAgriChain is a comprehensive blockchain platform featuring:\n\u{1F3EA} **Direct Marketplace** - Connect farmers with consumers\n\u{1F4CA} **Government Data** - Real-time Ministry of Agriculture information\n\u{1F4B3} **Escrow Payments** - Secure blockchain transactions\n\u{1F69C} **Machinery Rental** - Agricultural equipment sharing\n\u{1F4AC} **Real-time Chat** - Direct communication features\n\u{1F69A} **Live Tracking** - GPS-enabled delivery monitoring\n\nWhether you're a farmer looking to sell produce or rent equipment, or a consumer seeking fresh, traceable food, I'm here to guide you through our revolutionary platform. How can I assist you today?"
}

// Quick response suggestions for common queries
export const getQuickResponses = () => [
  "\u{1F33E} How do I list my produce on marketplace?",
  "\u{1F4E6} Track my order with real-time GPS",
  "\u{1F4B0} Government price data for farmers",
  "\u{1F517} How does blockchain traceability work?",
  "\u{1F3C6} Quality certification requirements",
  "\u{1F69C} Rent agricultural machinery",
  "\u{1F4AC} Chat with farmers/consumers",
  "\u{1F4B3} Escrow payment protection",
  "\u{1F4CA} Ministry of Agriculture data",
  "\u{1F324}\u{FE0F} Weather and seasonal planning",
  "\u{1F4B3} Connect wallet for payments",
  "\u{1F4F1} Complete platform features"
]

// Smart response function for immediate state-specific information
export const getSmartResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  
  // State detection
  const stateNames = [
    'andhra pradesh', 'bihar', 'chhattisgarh', 'delhi', 'gujarat', 'haryana', 
    'jammu', 'kashmir', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh', 
    'maharashtra', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 
    'telangana', 'uttar pradesh', 'west bengal'
  ];
  
  const detectedState = stateNames.find(state => message.includes(state));
  
  // If state is detected and user asks about certification
  if (detectedState && (message.includes('seed') || message.includes('certification') || message.includes('certificate'))) {
    const stateKey = detectedState.replace(/\s+/g, '_');
    const stateData = agriculturalSchemesKB.research_centers_and_certification[stateKey];
    
    if (stateData) {
      // Determine certification type
      let certType = 'general';
      if (message.includes('seed')) certType = 'seed';
      if (message.includes('organic')) certType = 'organic';
      if (message.includes('machinery') || message.includes('equipment')) certType = 'machinery';
      
      const guidance = getCertificateGuidance(detectedState, certType);
      
      if (guidance && guidance.centers && guidance.centers.length > 0) {
        let response = guidance.guidance;
        
        response += `**Certification Centers in ${stateData.state}:**\n\n`;
        
        guidance.centers.forEach((center, index) => {
          response += `**${index + 1}. ${center.name}**\n`;
          response += `📍 Location: ${center.location}\n`;
          response += `🌐 Website: ${center.website}\n`;
          response += `📋 Services: ${center.services.join(', ')}\n`;
          response += `📞 Contact: Visit website for contact details\n\n`;
        });
        
        response += `💡 **Quick Tip:** Click on the website links above to get started with your certification process!`;
        
        return response;
      }
    }
  }
  
  // If no state detected but certification query, ask for state
  if ((message.includes('seed') || message.includes('certification') || message.includes('certificate')) && !detectedState) {
    return `🌾 **I can help you with certification!** \n\nTo provide you with the exact website links and contact details, please tell me which state you're in:\n\n📍 **Available States:**\nAndhra Pradesh, Bihar, Chhattisgarh, Delhi, Gujarat, Haryana, Jammu & Kashmir, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Uttar Pradesh, West Bengal\n\n💬 **Just reply with:** "I'm in [Your State Name]" and I'll give you complete certification details with website links!`;
  }
  
  // Fallback to original function
  return getFallbackResponse(userMessage);
};

// Additional exports for agricultural schemes functionality
export { agriculturalSchemesKB, findCentersByState, getCenterRecommendation, getCertificateGuidance }



