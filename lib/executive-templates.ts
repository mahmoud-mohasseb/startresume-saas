// Executive Resume Templates for C-Suite and Senior Leadership Positions
export interface ExecutiveTemplate {
  id: string
  name: string
  description: string
  industry: 'technology' | 'finance' | 'healthcare' | 'manufacturing' | 'consulting' | 'retail' | 'energy' | 'media' | 'general'
  level: 'c-suite' | 'vp' | 'director' | 'senior-manager'
  style: 'modern' | 'classic' | 'creative' | 'minimal' | 'bold' | 'elegant'
  colorScheme: string
  htmlContent: string
  cssStyles: string
  features: string[]
}

export const EXECUTIVE_TEMPLATES: ExecutiveTemplate[] = [
  {
    id: 'exec_ceo_modern',
    name: 'CEO Modern Leadership',
    description: 'Bold, modern template for Chief Executive Officers with emphasis on vision and results',
    industry: 'general',
    level: 'c-suite',
    style: 'modern',
    colorScheme: '#1e40af',
    features: ['Executive Summary', 'Board Experience', 'P&L Responsibility', 'Strategic Initiatives'],
    htmlContent: `
      <div class="executive-resume ceo-modern">
        <header class="exec-header">
          <div class="exec-name-section">
            <h1 class="exec-name">[Executive Name]</h1>
            <h2 class="exec-title">Chief Executive Officer</h2>
            <div class="exec-tagline">Transformational Leader | Growth Strategist | Board Advisor</div>
          </div>
          <div class="exec-contact">
            <div class="contact-item">[email@executive.com]</div>
            <div class="contact-item">[+1 (555) 123-4567]</div>
            <div class="contact-item">[LinkedIn Profile]</div>
            <div class="contact-item">[City, State]</div>
          </div>
        </header>
        
        <section class="exec-summary">
          <h3>Executive Profile</h3>
          <p class="summary-text">[Visionary CEO with 15+ years driving transformational growth...]</p>
        </section>
        
        <section class="core-competencies">
          <h3>Core Leadership Competencies</h3>
          <div class="competency-grid">
            <span class="competency">Strategic Planning</span>
            <span class="competency">P&L Management</span>
            <span class="competency">Digital Transformation</span>
            <span class="competency">Board Relations</span>
          </div>
        </section>
        
        <section class="exec-experience">
          <h3>Executive Experience</h3>
          <div class="role">
            <div class="role-header">
              <h4 class="role-title">Chief Executive Officer</h4>
              <span class="role-period">[2020 - Present]</span>
            </div>
            <div class="company-info">
              <span class="company">[Company Name]</span> | <span class="revenue">[$XXX Million Revenue]</span>
            </div>
            <ul class="achievements">
              <li>Led company through 300% revenue growth, from $50M to $200M annually</li>
              <li>Orchestrated successful IPO raising $150M in capital</li>
            </ul>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .ceo-modern {
        font-family: 'Inter', sans-serif;
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
        color: #1f2937;
        line-height: 1.6;
      }
      .exec-header {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 40px;
        margin-bottom: 40px;
        padding-bottom: 30px;
        border-bottom: 3px solid #1e40af;
      }
      .exec-name {
        font-size: 3rem;
        font-weight: 800;
        color: #1e40af;
        margin-bottom: 8px;
        letter-spacing: -1px;
      }
      .exec-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 12px;
      }
      .exec-tagline {
        font-size: 1.1rem;
        color: #6b7280;
        font-style: italic;
      }
      .competency-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        margin-top: 15px;
      }
      .competency {
        background: linear-gradient(135deg, #1e40af, #3b82f6);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
      }
    `
  },
  
  {
    id: 'exec_cfo_finance',
    name: 'CFO Financial Leadership',
    description: 'Professional template for Chief Financial Officers emphasizing financial stewardship',
    industry: 'finance',
    level: 'c-suite',
    style: 'classic',
    colorScheme: '#059669',
    features: ['Financial Metrics', 'Audit Experience', 'Risk Management', 'Investor Relations'],
    htmlContent: `
      <div class="executive-resume cfo-finance">
        <header class="exec-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Chief Financial Officer</h2>
          <div class="exec-subtitle">Strategic Financial Leader | Risk Management Expert</div>
          <div class="exec-contact">
            <span>[email@cfo.com]</span> | <span>[Phone]</span> | <span>[LinkedIn]</span>
          </div>
        </header>
        
        <section class="financial-highlights">
          <h3>Financial Leadership Highlights</h3>
          <div class="metrics-grid">
            <div class="metric">
              <div class="metric-value">$2.5B+</div>
              <div class="metric-label">Revenue Managed</div>
            </div>
            <div class="metric">
              <div class="metric-value">25%</div>
              <div class="metric-label">Cost Reduction</div>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .cfo-finance {
        font-family: 'Georgia', serif;
        max-width: 850px;
        margin: 0 auto;
        padding: 40px;
        color: #1f2937;
      }
      .exec-name {
        font-size: 2.8rem;
        font-weight: 700;
        color: #059669;
        margin-bottom: 10px;
      }
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }
      .metric {
        text-align: center;
        padding: 20px;
        background: #f0fdf4;
        border-radius: 12px;
        border: 2px solid #059669;
      }
      .metric-value {
        font-size: 2rem;
        font-weight: 800;
        color: #059669;
      }
    `
  },
  {
    id: 'exec_vp_sales',
    name: 'VP Sales Performance',
    description: 'Results-driven template for Vice Presidents of Sales',
    industry: 'general',
    level: 'vp',
    style: 'modern',
    colorScheme: '#dc2626',
    features: ['Revenue Growth', 'Team Leadership', 'Pipeline Management', 'Client Relations'],
    htmlContent: `
      <div class="executive-resume vp-sales">
        <header class="sales-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Vice President of Sales</h2>
          <div class="sales-tagline">Revenue Driver | Team Builder | Market Expansion Leader</div>
        </header>
        <section class="sales-metrics">
          <h3>Sales Performance</h3>
          <div class="performance-grid">
            <div class="perf-metric">
              <span class="perf-value">$150M+</span>
              <span class="perf-label">Annual Revenue</span>
            </div>
            <div class="perf-metric">
              <span class="perf-value">250%</span>
              <span class="perf-label">Quota Achievement</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .vp-sales {
        font-family: 'Montserrat', sans-serif;
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
        background: linear-gradient(135deg, #dc2626, #ef4444);
        color: white;
        border-radius: 20px;
      }
      .sales-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px;
        background: rgba(255,255,255,0.1);
        border-radius: 15px;
      }
      .exec-name {
        font-size: 3rem;
        font-weight: 800;
        margin-bottom: 10px;
      }
      .perf-metric {
        background: rgba(255,255,255,0.15);
        padding: 25px;
        border-radius: 12px;
        text-align: center;
      }
    `
  },

  {
    id: 'exec_ciso_security',
    name: 'CISO Security Leadership',
    description: 'Cybersecurity-focused template for Chief Information Security Officers',
    industry: 'technology',
    level: 'c-suite',
    style: 'modern',
    colorScheme: '#7c2d12',
    features: ['Security Strategy', 'Risk Assessment', 'Compliance', 'Incident Response'],
    htmlContent: `
      <div class="executive-resume ciso-security">
        <header class="security-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Chief Information Security Officer</h2>
          <div class="security-tagline">Cybersecurity Strategist | Risk Management Expert | Compliance Leader</div>
        </header>
        <section class="security-achievements">
          <h3>Security Leadership</h3>
          <ul class="security-list">
            <li>Zero security breaches in 5+ years of leadership</li>
            <li>Implemented enterprise-wide security framework</li>
          </ul>
        </section>
      </div>
    `,
    cssStyles: `
      .ciso-security {
        font-family: 'Source Code Pro', monospace;
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
        background: #0f172a;
        color: #f1f5f9;
        border: 2px solid #7c2d12;
        border-radius: 15px;
      }
      .security-header {
        border-bottom: 2px solid #7c2d12;
        padding-bottom: 25px;
        margin-bottom: 30px;
      }
      .exec-name {
        font-size: 2.8rem;
        font-weight: 700;
        color: #f59e0b;
        margin-bottom: 10px;
      }
    `
  },

  {
    id: 'exec_vp_hr',
    name: 'VP Human Resources',
    description: 'People-focused template for VP of Human Resources',
    industry: 'general',
    level: 'vp',
    style: 'classic',
    colorScheme: '#7c3aed',
    features: ['Talent Strategy', 'Culture Building', 'Employee Engagement', 'Organizational Development'],
    htmlContent: `
      <div class="executive-resume vp-hr">
        <header class="hr-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Vice President, Human Resources</h2>
          <div class="hr-tagline">People Leader | Culture Champion | Talent Strategist</div>
        </header>
        <section class="hr-impact">
          <h3>People Impact</h3>
          <div class="impact-metrics">
            <div class="impact-item">
              <span class="impact-value">95%</span>
              <span class="impact-label">Employee Retention</span>
            </div>
            <div class="impact-item">
              <span class="impact-value">4.8/5</span>
              <span class="impact-label">Culture Score</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .vp-hr {
        font-family: 'Nunito', sans-serif;
        max-width: 850px;
        margin: 0 auto;
        padding: 40px;
        background: #faf5ff;
        color: #581c87;
        border-radius: 20px;
      }
      .hr-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px;
        background: linear-gradient(135deg, #7c3aed, #a855f7);
        color: white;
        border-radius: 15px;
      }
      .exec-name {
        font-size: 2.8rem;
        font-weight: 700;
        margin-bottom: 12px;
      }
    `
  },

  {
    id: 'exec_director_healthcare',
    name: 'Healthcare Director',
    description: 'Medical leadership template for Healthcare Directors',
    industry: 'healthcare',
    level: 'director',
    style: 'classic',
    colorScheme: '#0891b2',
    features: ['Clinical Excellence', 'Patient Care', 'Regulatory Compliance', 'Team Leadership'],
    htmlContent: `
      <div class="executive-resume healthcare-director">
        <header class="healthcare-header">
          <h1 class="exec-name">[Executive Name], MD</h1>
          <h2 class="exec-title">Director of Clinical Operations</h2>
          <div class="healthcare-tagline">Clinical Leader | Patient Advocate | Quality Champion</div>
        </header>
        <section class="clinical-metrics">
          <h3>Clinical Leadership</h3>
          <div class="clinical-achievements">
            <div class="achievement">
              <span class="achievement-value">98%</span>
              <span class="achievement-label">Patient Satisfaction</span>
            </div>
            <div class="achievement">
              <span class="achievement-value">500+</span>
              <span class="achievement-label">Staff Managed</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .healthcare-director {
        font-family: 'Lato', sans-serif;
        max-width: 850px;
        margin: 0 auto;
        padding: 40px;
        background: white;
        color: #0f172a;
        border: 3px solid #0891b2;
        border-radius: 15px;
      }
      .healthcare-header {
        border-bottom: 3px solid #0891b2;
        padding-bottom: 25px;
        margin-bottom: 35px;
      }
      .exec-name {
        font-size: 2.6rem;
        font-weight: 600;
        color: #0891b2;
        margin-bottom: 8px;
      }
    `
  },

  {
    id: 'exec_vp_engineering',
    name: 'VP Engineering',
    description: 'Technical leadership template for VP of Engineering',
    industry: 'technology',
    level: 'vp',
    style: 'modern',
    colorScheme: '#059669',
    features: ['Technical Strategy', 'Team Scaling', 'Product Development', 'Architecture'],
    htmlContent: `
      <div class="executive-resume vp-engineering">
        <header class="eng-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Vice President of Engineering</h2>
          <div class="eng-tagline">Technical Visionary | Team Builder | Product Innovator</div>
        </header>
        <section class="tech-leadership">
          <h3>Engineering Leadership</h3>
          <div class="tech-stats">
            <div class="tech-stat">
              <span class="stat-value">200+</span>
              <span class="stat-label">Engineers Led</span>
            </div>
            <div class="tech-stat">
              <span class="stat-value">99.9%</span>
              <span class="stat-label">System Uptime</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .vp-engineering {
        font-family: 'JetBrains Mono', monospace;
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
        background: #064e3b;
        color: #ecfdf5;
        border-radius: 20px;
      }
      .eng-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px;
        background: rgba(5, 150, 105, 0.2);
        border-radius: 15px;
        border: 1px solid #059669;
      }
      .exec-name {
        font-size: 3rem;
        font-weight: 800;
        color: #10b981;
        margin-bottom: 10px;
      }
    `
  },

  {
    id: 'exec_cpo_product',
    name: 'CPO Product Leadership',
    description: 'Product-focused template for Chief Product Officers',
    industry: 'technology',
    level: 'c-suite',
    style: 'modern',
    colorScheme: '#8b5cf6',
    features: ['Product Strategy', 'User Experience', 'Market Research', 'Innovation'],
    htmlContent: `
      <div class="executive-resume cpo-product">
        <header class="product-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Chief Product Officer</h2>
          <div class="product-tagline">Product Visionary | User Champion | Innovation Leader</div>
        </header>
        <section class="product-impact">
          <h3>Product Leadership</h3>
          <div class="product-metrics">
            <div class="product-metric">
              <span class="metric-value">10M+</span>
              <span class="metric-label">Active Users</span>
            </div>
            <div class="product-metric">
              <span class="metric-value">4.9★</span>
              <span class="metric-label">App Store Rating</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .cpo-product {
        font-family: 'Inter', sans-serif;
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
        background: linear-gradient(135deg, #8b5cf6, #a78bfa);
        color: white;
        border-radius: 25px;
      }
      .product-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 35px;
        background: rgba(255,255,255,0.1);
        border-radius: 20px;
        backdrop-filter: blur(10px);
      }
      .exec-name {
        font-size: 3.2rem;
        font-weight: 800;
        margin-bottom: 12px;
      }
    `
  },

  {
    id: 'exec_director_finance',
    name: 'Finance Director',
    description: 'Financial management template for Finance Directors',
    industry: 'finance',
    level: 'director',
    style: 'classic',
    colorScheme: '#1e40af',
    features: ['Financial Planning', 'Budget Management', 'Analysis', 'Reporting'],
    htmlContent: `
      <div class="executive-resume finance-director">
        <header class="finance-header">
          <h1 class="exec-name">[Executive Name], CPA</h1>
          <h2 class="exec-title">Director of Finance</h2>
          <div class="finance-tagline">Financial Strategist | Budget Expert | Analysis Leader</div>
        </header>
        <section class="finance-achievements">
          <h3>Financial Leadership</h3>
          <div class="finance-stats">
            <div class="finance-stat">
              <span class="stat-value">$500M+</span>
              <span class="stat-label">Budget Managed</span>
            </div>
            <div class="finance-stat">
              <span class="stat-value">15%</span>
              <span class="stat-label">Cost Savings</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .finance-director {
        font-family: 'Times New Roman', serif;
        max-width: 850px;
        margin: 0 auto;
        padding: 40px;
        background: #f8fafc;
        color: #1e293b;
        border: 2px solid #1e40af;
        border-radius: 12px;
      }
      .finance-header {
        text-align: center;
        margin-bottom: 35px;
        padding: 25px;
        background: #1e40af;
        color: white;
        border-radius: 10px;
      }
      .exec-name {
        font-size: 2.6rem;
        font-weight: 700;
        margin-bottom: 10px;
      }
    `
  },

  {
    id: 'exec_vp_marketing',
    name: 'VP Marketing Growth',
    description: 'Growth-focused template for VP of Marketing',
    industry: 'media',
    level: 'vp',
    style: 'creative',
    colorScheme: '#f59e0b',
    features: ['Growth Marketing', 'Brand Strategy', 'Digital Campaigns', 'Analytics'],
    htmlContent: `
      <div class="executive-resume vp-marketing">
        <header class="marketing-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Vice President of Marketing</h2>
          <div class="marketing-tagline">Growth Marketer | Brand Builder | Digital Strategist</div>
        </header>
        <section class="marketing-results">
          <h3>Marketing Results</h3>
          <div class="results-grid">
            <div class="result-item">
              <span class="result-value">300%</span>
              <span class="result-label">Lead Growth</span>
            </div>
            <div class="result-item">
              <span class="result-value">$50M+</span>
              <span class="result-label">Revenue Impact</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .vp-marketing {
        font-family: 'Poppins', sans-serif;
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
        background: linear-gradient(45deg, #f59e0b, #fbbf24, #f97316);
        background-size: 200% 200%;
        animation: marketingGradient 6s ease infinite;
        color: white;
        border-radius: 25px;
      }
      .marketing-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 35px;
        background: rgba(0,0,0,0.15);
        border-radius: 20px;
      }
      .exec-name {
        font-size: 3.1rem;
        font-weight: 800;
        margin-bottom: 12px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      @keyframes marketingGradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `
  },

  {
    id: 'exec_director_operations',
    name: 'Operations Director',
    description: 'Operational excellence template for Operations Directors',
    industry: 'manufacturing',
    level: 'director',
    style: 'classic',
    colorScheme: '#dc2626',
    features: ['Process Improvement', 'Supply Chain', 'Quality Management', 'Team Leadership'],
    htmlContent: `
      <div class="executive-resume ops-director">
        <header class="ops-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Director of Operations</h2>
          <div class="ops-tagline">Operations Expert | Process Optimizer | Quality Leader</div>
        </header>
        <section class="ops-metrics">
          <h3>Operational Excellence</h3>
          <div class="ops-achievements">
            <div class="ops-achievement">
              <span class="achievement-value">40%</span>
              <span class="achievement-label">Efficiency Gain</span>
            </div>
            <div class="ops-achievement">
              <span class="achievement-value">99.5%</span>
              <span class="achievement-label">Quality Rate</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .ops-director {
        font-family: 'Arial', sans-serif;
        max-width: 850px;
        margin: 0 auto;
        padding: 40px;
        background: white;
        color: #374151;
        border: 3px solid #dc2626;
        border-radius: 15px;
      }
      .ops-header {
        border-bottom: 3px solid #dc2626;
        padding-bottom: 25px;
        margin-bottom: 35px;
        text-align: center;
      }
      .exec-name {
        font-size: 2.8rem;
        font-weight: 700;
        color: #dc2626;
        margin-bottom: 10px;
      }
    `
  },

  {
    id: 'exec_senior_manager',
    name: 'Senior Manager Executive',
    description: 'Professional template for Senior Managers transitioning to executive roles',
    industry: 'general',
    level: 'senior-manager',
    style: 'modern',
    colorScheme: '#6366f1',
    features: ['Leadership Development', 'Project Management', 'Strategic Thinking', 'Team Building'],
    htmlContent: `
      <div class="executive-resume senior-manager">
        <header class="manager-header">
          <h1 class="exec-name">[Executive Name]</h1>
          <h2 class="exec-title">Senior Manager</h2>
          <div class="manager-tagline">Emerging Leader | Strategic Thinker | Results Driver</div>
        </header>
        <section class="leadership-growth">
          <h3>Leadership Development</h3>
          <div class="growth-metrics">
            <div class="growth-item">
              <span class="growth-value">50+</span>
              <span class="growth-label">Team Members</span>
            </div>
            <div class="growth-item">
              <span class="growth-value">25%</span>
              <span class="growth-label">Performance Improvement</span>
            </div>
          </div>
        </section>
      </div>
    `,
    cssStyles: `
      .senior-manager {
        font-family: 'Roboto', sans-serif;
        max-width: 850px;
        margin: 0 auto;
        padding: 40px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border-radius: 20px;
      }
      .manager-header {
        text-align: center;
        margin-bottom: 40px;
        padding: 30px;
        background: rgba(255,255,255,0.1);
        border-radius: 15px;
      }
      .exec-name {
        font-size: 2.9rem;
        font-weight: 700;
        margin-bottom: 10px;
      }
    `
  }
]

export function getExecutiveTemplatesByIndustry(industry: string): ExecutiveTemplate[] {
  return EXECUTIVE_TEMPLATES.filter(template => 
    template.industry === industry || template.industry === 'general'
  )
}

export function getExecutiveTemplatesByLevel(level: string): ExecutiveTemplate[] {
  return EXECUTIVE_TEMPLATES.filter(template => template.level === level)
}

export function getExecutiveTemplate(id: string): ExecutiveTemplate | null {
  return EXECUTIVE_TEMPLATES.find(template => template.id === id) || null
}
