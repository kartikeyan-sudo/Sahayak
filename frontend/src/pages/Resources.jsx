import './Resources.css';

function Resources({ onOpenBlog }) {
  const resources = [
    {
      category: 'Digital Safety Playbook',
      items: [
        {
          title: 'How to Spot UPI Scams',
          description: 'Learn to identify fake UPI payment requests and protect your money',
          icon: '💳'
        },
        {
          title: 'Phishing Email Detection',
          description: 'Recognize suspicious emails and avoid credential theft',
          icon: '📧'
        },
        {
          title: 'SIM Swap Prevention',
          description: 'Link Aadhaar with mobile and enable additional security',
          icon: '📱'
        },
        {
          title: 'Social Media Safety',
          description: 'Protect your accounts from hijacking and impersonation',
          icon: '🌐'
        }
      ]
    },
    {
      category: 'Scheme Navigation Tips',
      items: [
        {
          title: 'Understanding Eligibility',
          description: 'How to determine which schemes apply to your situation',
          icon: '✓'
        },
        {
          title: 'Document Preparation',
          description: 'Complete checklist for government applications',
          icon: '📋'
        },
        {
          title: 'Application Timeline',
          description: 'What to expect at each stage of the process',
          icon: '⏱️'
        },
        {
          title: 'Follow-up Strategy',
          description: 'How and when to check application status',
          icon: '🔍'
        }
      ]
    }
  ];

  const helplines = [
    { name: 'National Cyber Crime Helpline', number: '1930', available: '24x7' },
    { name: 'Women Helpline', number: '1091', available: '24x7' },
    { name: 'Senior Citizen Helpline', number: '14567', available: '8 AM - 8 PM' },
    { name: 'National Helpline (Centralized)', number: '155260', available: '24x7' }
  ];

  return (
    <div className="resources-page">
      <div className="page-header">
        <h2>Resources</h2>
        <p>Learn, prepare, and protect yourself</p>
      </div>

      {resources.map((section) => (
        <section key={section.category} className="resource-section card">
          <h3>{section.category}</h3>
          <div className="resource-grid">
            {section.items.map((item, idx) => (
              <div key={idx} className="resource-item">
                <div className="resource-icon">{item.icon}</div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
                  <button
                    className="resource-btn"
                    onClick={() => {
                      if (onOpenBlog) onOpenBlog(item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                  >
                    Learn More →
                  </button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="helplines-section card">
        <h3>Emergency Helplines</h3>
        <div className="helplines-grid">
          {helplines.map((helpline, idx) => (
            <div key={idx} className="helpline-item">
              <div className="helpline-header">
                <h4>{helpline.name}</h4>
                <span className="availability-badge">{helpline.available}</span>
              </div>
              <div className="helpline-number">📞 {helpline.number}</div>
            </div>
          ))}
        </div>
        <p className="helpline-note">
          Save these numbers in your phone. In case of emergency, call immediately.
        </p>
      </section>

      <section className="offline-guide card">
        <h3>Offline Guidance</h3>
        <p>
          For areas with limited internet connectivity, Sahayak plans to offer:
        </p>
        <ul className="offline-features">
          <li>SMS-based FIR draft assistance</li>
          <li>IVR (Interactive Voice Response) scheme discovery</li>
          <li>Offline PDF guides downloadable via CSC centers</li>
          <li>Regional language support for low-literacy users</li>
        </ul>
        <div className="roadmap-badge">Coming Soon</div>
      </section>
    </div>
  );
}

export default Resources;
