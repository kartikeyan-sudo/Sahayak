// Cleaned mock data for schemes and alerts
// Contains 8 government schemes used across the app

export const schemeCatalogue = [
  {
    id: 'scheme-1',
    name: 'National Cyber Crime Reporting Portal (NCRP)',
    description: 'Centralized portal to report cyber crimes and track complaint status.',
    link: 'https://cybercrime.gov.in',
    governmentTag: 'Central',
    objectives: ['Facilitate reporting', 'Quick police response', 'Victim support'],
    process: [
      { step: 1, description: 'Visit the portal and select complaint type' },
      { step: 2, description: 'Fill incident details and upload evidence' },
      { step: 3, description: 'Submit and note complaint ID' }
    ],
    requiredDocuments: ['Screenshots', 'Bank statement (if financial)', 'ID (optional)'],
    eligibility: ['Any citizen or resident of India'],
    dos: ['Report early', 'Keep evidence intact'],
    donts: ['Do not share sensitive details with unverified sources'],
    statistics: { beneficiaries: 1000000, amountDisbursed: 'N/A', successRate: 'System integrated' }
  },

  {
    id: 'scheme-2',
    name: 'National Cyber Helpline (1930)',
    description: 'Toll-free helpline for immediate guidance on cyber frauds and reporting.',
    link: 'https://i4c.mha.gov.in/helpline.aspx',
    governmentTag: 'Central',
    objectives: ['24/7 support', 'Help file complaints', 'Prevent fund loss'],
    process: [
      { step: 1, description: 'Dial 1930' },
      { step: 2, description: 'Explain the incident to operator' },
      { step: 3, description: 'Follow guidance for block/freeze actions' }
    ],
    requiredDocuments: ['None for call; details may be requested later'],
    eligibility: ['Available to all Indian citizens'],
    dos: ['Call quickly for financial frauds', 'Keep transaction details ready'],
    donts: ['Do not delay reporting'],
    statistics: { beneficiaries: 'Thousands daily', amountDisbursed: 'N/A', successRate: 'Linked to banks' }
  },

  {
    id: 'scheme-3',
    name: 'Citizen Financial Cyber Fraud Reporting System (I4C)',
    description: 'Coordination mechanism to report and respond to financial cyber frauds.',
    link: 'https://i4c.mha.gov.in/initiative.aspx',
    governmentTag: 'Central',
    objectives: ['Immediate intervention', 'Coordination with banks', 'Victim support'],
    process: [
      { step: 1, description: 'Report via 1930 or NCRP' },
      { step: 2, description: 'System alerts banks and police' },
      { step: 3, description: 'Track recovery via portal' }
    ],
    requiredDocuments: ['Transaction details', 'Bank account info', 'Evidence'],
    eligibility: ['Victims of financial cyber frauds'],
    dos: ['Report within 24 hours', 'Provide accurate details'],
    donts: ['Do not try to resolve with scammers directly'],
    statistics: { beneficiaries: 'N/A', amountDisbursed: '₹1000+ Cr (prevented/recovered)', successRate: 'High if timely' }
  },

  {
    id: 'scheme-4',
    name: 'Indian Cyber Crime Coordination Centre (I4C)',
    description: 'National centre to coordinate cyber crime prevention, awareness and policy.',
    link: 'https://i4c.mha.gov.in',
    governmentTag: 'Central',
    objectives: ['Strengthen cyber security', 'Inter-agency coordination', 'Run awareness programs'],
    process: [
      { step: 1, description: 'Access resources on the I4C website' },
      { step: 2, description: 'Use linked portals for reporting and training' }
    ],
    requiredDocuments: ['Not applicable for general use'],
    eligibility: ['All stakeholders including citizens and law enforcement'],
    dos: ['Use official portals', 'Attend awareness/training when available'],
    donts: ['Do not rely on unverified third parties for reporting'],
    statistics: { beneficiaries: 'Nationwide', amountDisbursed: 'N/A', successRate: 'Ongoing' }
  },

  {
    id: 'scheme-5',
    name: 'Rural Digital Literacy & Fraud Prevention',
    description: 'Awareness and simple complaint mechanisms for rural citizens affected by digital payment frauds.',
    link: '',
    governmentTag: 'Rural',
    objectives: ['Bridge digital literacy gap', 'Simplified complaint process', 'Compensation support'],
    process: [
      { step: 1, description: 'Visit nearest CSC (Common Service Center)' },
      { step: 2, description: 'CSC assists in filing FIR and claims' }
    ],
    requiredDocuments: ['Aadhaar', 'Bank passbook/receipt', 'Mobile showing fraud message'],
    eligibility: ['Residents of rural areas who are victims of UPI/banking frauds'],
    dos: ['Seek help from CSC or bank Mitra', 'Keep documents handy'],
    donts: ['Do not trust refund callers', 'Do not share OTPs'],
    statistics: { beneficiaries: 18932, amountDisbursed: '₹23.4 Cr', successRate: '85%' }
  },

  {
    id: 'scheme-6',
    name: 'Senior Citizen Cyber Protection Scheme',
    description: 'Priority assistance and higher compensation for senior citizens affected by cyber fraud.',
    link: '',
    governmentTag: 'Central',
    objectives: ['Enhanced support for elderly victims', 'Simplify complaint process', 'Doorstep services if needed'],
    process: [
      { step: 1, description: 'Call dedicated helpline or visit police station' },
      { step: 2, description: 'Assisted FIR filing and documentation' }
    ],
    requiredDocuments: ['Age proof', 'ID and address proof', 'Bank statements'],
    eligibility: ['Indian citizens aged 60+ who are victims of cyber/financial fraud'],
    dos: ['Seek help from family/trusted person', 'Use senior helpline'],
    donts: ['Do not feel pressured by urgent callers', 'Do not share banking details'],
    statistics: { beneficiaries: 6234, amountDisbursed: '₹31.7 Cr', successRate: '88%' }
  },

  {
    id: 'scheme-7',
    name: 'RBI Guidelines on Limiting Liability in Unauthorised Transactions',
    description: 'Reserve Bank of India guidelines which limit customer liability for unauthorised electronic transactions under certain conditions.',
    link: 'https://rbi.org.in/Scripts/NotificationUser.aspx?Id=11040&Mode=0',
    governmentTag: 'Finance',
    objectives: ['Protect customers', 'Define bank obligations', 'Set timelines for complaint handling'],
    process: [
      { step: 1, description: 'Report unauthorised transaction to bank immediately' },
      { step: 2, description: 'Bank investigates and credits customer if eligible' }
    ],
    requiredDocuments: ['Transaction details', 'Correspondence with bank'],
    eligibility: ['Account holders affected by unauthorised transactions'],
    dos: ['Inform bank quickly', 'Preserve evidence'],
    donts: ['Do not delay reporting to bank or police'],
    statistics: { beneficiaries: 'N/A', amountDisbursed: 'N/A', successRate: 'Depends on timeliness' }
  },

  {
    id: 'scheme-8',
    name: 'Information Technology Act, 2000 & Consumer Protection',
    description: 'Legal frameworks (IT Act and Consumer Protection Act) providing remedies and processes for cybercrimes and unfair practices.',
    link: 'https://consumeraffairs.nic.in/acts-and-rules/consumer-protection',
    governmentTag: 'Central',
    objectives: ['Provide legal remedies', 'Enable consumer grievance redressal', 'Penalize cyber offences'],
    process: [
      { step: 1, description: 'File complaint under relevant law or with Consumer Forum' },
      { step: 2, description: 'Court/forum proceedings for redressal' }
    ],
    requiredDocuments: ['Purchase receipts', 'Communication records', 'Evidence of loss'],
    eligibility: ['Consumers or citizens affected by cyber offences or unfair trade practices'],
    dos: ['Preserve digital evidence', 'Consult legal help when needed'],
    donts: ['Do not delete suspicious communications'],
    statistics: { beneficiaries: 'Millions', amountDisbursed: 'Varies', successRate: 'E-filing available' }
  }
];



export const alertFeed = [
  {
    id: 'alert-1',
    title: 'New UPI Scam Alert',
    description: 'Fraudsters posing as bank officials asking for UPI PIN. Never share your PIN or OTP.',
    category: 'UPI Scam',
    severity: 'High',
    blogSlug: 'how-to-spot-upi-scams'
  },
  {
    id: 'alert-2',
    title: 'SIM Swap Fraud Surge',
    description: 'Increase in SIM swap attacks. Link Aadhaar with mobile immediately. Call *400# to check.',
    category: 'SIM Swap',
    severity: 'Critical',
    blogSlug: 'sim-swap-prevention'
  },
  {
    id: 'alert-3',
    title: 'Fake Police Call Warning',
    description: 'Scammers impersonating cyber police. Real police never ask for money over phone.',
    category: 'General Warning',
    severity: 'High',
    blogSlug: 'phishing-email-detection'
  },
  {
    id: 'alert-4',
    title: 'Investment App Scam',
    description: 'Fraudulent trading apps promising high returns. Verify SEBI registration before investing.',
    category: 'Banking Fraud',
    severity: 'Medium',
    blogSlug: 'understanding-eligibility'
  },
  {
    id: 'alert-5',
    title: 'WhatsApp Account Hijacking',
    description: 'Don\'t share 6-digit WhatsApp verification code with anyone, even if they claim to be support.',
    category: 'Phishing',
    severity: 'High',
    blogSlug: 'social-media-safety'
  }
];

export const incidentTypes = [
  'UPI Fraud',
  'Banking Fraud',
  'Phishing',
  'Identity Theft',
  'SIM Swap',
  'Investment Scam',
  'Social Media Hacking',
  'Online Shopping Fraud',
  'Loan App Harassment',
  'Job Offer Scam',
  'Other'
];

export const safetyTips = [
  'Never share OTP, PIN, or CVV with anyone',
  'Verify caller identity before sharing information',
  'Enable two-factor authentication on all accounts',
  'Check URL before entering credentials',
  'Report suspicious activity within 24 hours',
  'Save National Cyber Crime Helpline: 1930',
  'Review bank statements regularly',
  'Use strong, unique passwords for each account'
];

export default {
  schemeCatalogue,
  alertFeed,
  incidentTypes,
  safetyTips
};
