// Service to map company similarities, industries, and similar peer companies

const COMPANY_KNOWLEDGE_BASE = {
  swiggy: {
    canonicalName: 'Swiggy',
    industry: 'FoodTech & Quick Commerce',
    website: 'https://www.swiggy.com',
    similar: ['Zomato', 'Zepto', 'Blinkit', 'Dunzo', 'Instamart']
  },
  zomato: {
    canonicalName: 'Zomato',
    industry: 'FoodTech & Quick Commerce',
    website: 'https://www.zomato.com',
    similar: ['Swiggy', 'Zepto', 'Blinkit', 'Magicpin', 'Eatsure']
  },
  zepto: {
    canonicalName: 'Zepto',
    industry: 'Quick Commerce & Dark Stores',
    website: 'https://www.zeptonow.com',
    similar: ['Blinkit', 'Swiggy', 'Zomato', 'BigBasket', 'Dunzo']
  },
  razorpay: {
    canonicalName: 'Razorpay',
    industry: 'Fintech & Payment Gateway',
    website: 'https://razorpay.com',
    similar: ['PhonePe', 'CRED', 'Paytm', 'Cashfree', 'Groww']
  },
  phonepe: {
    canonicalName: 'PhonePe',
    industry: 'Fintech & UPI Infrastructure',
    website: 'https://www.phonepe.com',
    similar: ['Razorpay', 'CRED', 'Paytm', 'Google Pay', 'BharatPe']
  },
  cred: {
    canonicalName: 'CRED',
    industry: 'Fintech & Rewards Platform',
    website: 'https://cred.club',
    similar: ['Razorpay', 'PhonePe', 'Groww', 'Zerodha', 'Jupiter']
  },
  google: {
    canonicalName: 'Google',
    industry: 'Big Tech, Cloud & AI',
    website: 'https://about.google',
    similar: ['Microsoft', 'Amazon', 'Meta', 'Apple', 'Atlassian']
  },
  microsoft: {
    canonicalName: 'Microsoft',
    industry: 'Enterprise Software & Cloud Platforms',
    website: 'https://www.microsoft.com',
    similar: ['Google', 'Amazon', 'Apple', 'Meta', 'Salesforce']
  },
  amazon: {
    canonicalName: 'Amazon',
    industry: 'Cloud Computing (AWS) & E-Commerce',
    website: 'https://www.amazon.jobs',
    similar: ['Flipkart', 'Google', 'Microsoft', 'Meesho', 'Myntra']
  },
  flipkart: {
    canonicalName: 'Flipkart',
    industry: 'E-Commerce & Supply Chain Tech',
    website: 'https://www.flipkart.com',
    similar: ['Amazon', 'Myntra', 'Meesho', 'Nykaa', 'Swiggy']
  },
  tcs: {
    canonicalName: 'Tata Consultancy Services (TCS)',
    industry: 'IT Services & Digital Transformation',
    website: 'https://www.tcs.com',
    similar: ['Infosys', 'Wipro', 'HCLTech', 'Cognizant', 'Tech Mahindra']
  },
  infosys: {
    canonicalName: 'Infosys',
    industry: 'IT Services & Enterprise Consulting',
    website: 'https://www.infosys.com',
    similar: ['TCS', 'Wipro', 'HCLTech', 'Cognizant', 'LTIMindtree']
  },
  atlassian: {
    canonicalName: 'Atlassian',
    industry: 'Developer Productivity & SaaS',
    website: 'https://www.atlassian.com',
    similar: ['GitHub', 'GitLab', 'Notion', 'Slack', 'Linear']
  },
  'urban company': {
    canonicalName: 'Urban Company',
    industry: 'On-Demand Home & Beauty Services',
    website: 'https://www.urbancompany.com',
    similar: ['Swiggy', 'Zomato', 'NoBroker', 'Dunzo', 'Housejoy']
  },
  'clear (cleartax)': {
    canonicalName: 'Clear (ClearTax)',
    industry: 'Fintech, Compliance & Tax SaaS',
    website: 'https://cleartax.in',
    similar: ['Razorpay', 'Zoho', 'Freshworks', 'KhataBook', 'QuickBooks']
  }
};

const getCompanyMetadata = (companyName = '') => {
  const normalized = companyName.toLowerCase().trim();

  // Direct match
  if (COMPANY_KNOWLEDGE_BASE[normalized]) {
    return COMPANY_KNOWLEDGE_BASE[normalized];
  }

  // Substring match
  for (const [key, data] of Object.entries(COMPANY_KNOWLEDGE_BASE)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return data;
    }
  }

  // Dynamic fallback
  return {
    canonicalName: companyName,
    industry: 'Technology & Software Engineering',
    website: `https://www.${normalized.replace(/\s+/g, '')}.com`,
    similar: ['Google', 'Microsoft', 'Swiggy', 'Razorpay', 'TCS']
  };
};

module.exports = {
  COMPANY_KNOWLEDGE_BASE,
  getCompanyMetadata
};

