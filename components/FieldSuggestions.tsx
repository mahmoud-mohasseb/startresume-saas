"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  Copy, 
  Check, 
  Sparkles, 
  Target,
  TrendingUp,
  Award,
  Users,
  Brain,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface FieldSuggestionsProps {
  field: 'summary' | 'skills' | 'experience' | 'jobDescription'
  currentValue: string
  onApply: (suggestion: string) => void
  jobTitle?: string
  userContext?: {
    experience: string[]
    skills: string[]
    industry?: string
  }
}

// Enhanced executive-level suggestions for C-suite positions
const getExecutiveSuggestions = (jobTitle: string): string[] => {
  const title = jobTitle.toLowerCase()
  
  if (title.includes('ceo') || title.includes('chief executive')) {
    return [
      "Visionary CEO with 15+ years driving transformational growth across Fortune 500 companies, delivering $2.5B+ in shareholder value through strategic acquisitions, digital transformation, and market expansion initiatives.",
      "Transformational leader who scaled startup from $5M to $500M revenue in 7 years, orchestrating successful IPO and establishing market leadership in emerging technology sector.",
      "Board-certified executive with proven track record of turning around underperforming organizations, achieving 300% revenue growth and 45% margin improvement through operational excellence and strategic repositioning.",
      "Global CEO experienced in managing 10,000+ employees across 25 countries, driving sustainable growth through innovation, strategic partnerships, and ESG leadership initiatives.",
      "Serial entrepreneur and Fortune 100 CEO with expertise in M&A strategy, having completed $15B+ in transactions while maintaining 95%+ employee retention during integration processes."
    ]
  }
  
  if (title.includes('cfo') || title.includes('chief financial')) {
    return [
      "Strategic CFO with 12+ years optimizing financial performance for public companies, managing $3B+ P&L responsibility and delivering consistent double-digit EBITDA growth through disciplined capital allocation.",
      "Finance executive who led successful IPO raising $250M, established investor relations program, and implemented enterprise risk management framework reducing operational risk by 40%.",
      "Transformational CFO experienced in complex M&A transactions totaling $5B+, driving post-merger integration and achieving targeted synergies 18 months ahead of schedule.",
      "Results-driven financial leader with expertise in international markets, managing multi-currency operations across 15 countries and optimizing tax strategies saving $50M+ annually.",
      "Board-ready CFO with deep expertise in ESG reporting, sustainable finance, and stakeholder capitalism, establishing frameworks that improved ESG ratings by 35 percentile points."
    ]
  }
  
  if (title.includes('cto') || title.includes('chief technology')) {
    return [
      "Visionary CTO with 15+ years scaling technology organizations from startup to enterprise, leading 500+ engineers and architects in building cloud-native platforms serving 100M+ users globally.",
      "Innovation-focused technology executive who drove digital transformation initiatives resulting in 60% operational efficiency gains and $100M+ cost savings through AI/ML automation.",
      "Strategic CTO experienced in emerging technologies including blockchain, quantum computing, and edge AI, establishing technical roadmaps that positioned company as industry leader.",
      "Security-first technology leader who implemented zero-trust architecture and DevSecOps practices, achieving SOC2 Type II compliance and reducing security incidents by 90%.",
      "Product-minded CTO with expertise in platform engineering and developer experience, improving deployment frequency by 10x and reducing mean time to recovery by 75%."
    ]
  }
  
  if (title.includes('cmo') || title.includes('chief marketing')) {
    return [
      "Growth-focused CMO with 12+ years building iconic brands and driving customer acquisition, achieving 400% revenue growth and expanding market share from 5% to 25% in competitive landscape.",
      "Data-driven marketing executive who transformed traditional marketing organization into performance-driven growth engine, improving marketing ROI by 300% through advanced analytics and attribution modeling.",
      "Digital-first CMO experienced in omnichannel strategy and customer experience optimization, increasing customer lifetime value by 150% and reducing acquisition costs by 45%.",
      "Brand strategist and storyteller who repositioned company for premium market segment, achieving 80% brand awareness improvement and 200% increase in brand equity valuation.",
      "Customer-centric marketing leader with expertise in personalization and marketing automation, implementing AI-driven campaigns that improved conversion rates by 250% across all channels."
    ]
  }
  
  if (title.includes('coo') || title.includes('chief operating')) {
    return [
      "Operations excellence leader with 14+ years optimizing global supply chains and manufacturing operations, achieving 35% cost reduction and 99.8% quality scores across 50+ facilities worldwide.",
      "Transformational COO who led enterprise-wide digital transformation, implementing IoT and predictive analytics solutions that improved operational efficiency by 45% and reduced downtime by 60%.",
      "Strategic operations executive experienced in scaling high-growth organizations, building operational frameworks that supported 500% revenue growth while maintaining operational margins above 25%.",
      "Process innovation leader who implemented lean six sigma methodologies across global operations, delivering $200M+ in cost savings and improving customer satisfaction scores by 40 points.",
      "People-first COO with expertise in organizational development and change management, successfully integrating 15+ acquisitions while maintaining 92% employee retention rates."
    ]
  }
  
  if (title.includes('vp') || title.includes('vice president')) {
    if (title.includes('sales')) {
      return [
        "Revenue-driving VP of Sales with 10+ years building and scaling high-performance sales organizations, consistently exceeding targets by 25%+ and growing annual recurring revenue from $50M to $300M.",
        "Strategic sales leader who established global sales operations across 20+ countries, implementing CRM and sales enablement platforms that improved win rates by 40% and shortened sales cycles by 30%.",
        "Customer-focused VP with expertise in enterprise and channel sales, developing strategic partnerships that contributed 60% of total revenue and expanding average deal size by 200%.",
        "Performance-driven sales executive who built inside sales organization from ground up, scaling team from 10 to 200+ reps while maintaining 95%+ quota attainment across all segments.",
        "Relationship-building sales leader with deep industry expertise, securing $500M+ in multi-year contracts and achieving 98% customer retention through consultative selling approach."
      ]
    } else if (title.includes('engineering')) {
      return [
        "Technical VP of Engineering with 12+ years scaling engineering organizations, leading 200+ engineers across 15 product teams and delivering mission-critical systems serving 50M+ users.",
        "Innovation-focused engineering leader who established DevOps culture and CI/CD practices, improving deployment frequency by 20x and reducing production incidents by 85%.",
        "Architecture-minded VP with expertise in microservices and cloud-native development, leading platform modernization that improved system reliability to 99.99% uptime.",
        "People-first engineering executive who built inclusive, high-performing teams, achieving 95% employee satisfaction and reducing time-to-productivity for new hires by 50%.",
        "Product-engineering leader with deep understanding of user experience, collaborating closely with product teams to deliver features that increased user engagement by 150%."
      ]
    } else if (title.includes('marketing')) {
      return [
        "Growth-oriented VP of Marketing with 10+ years driving demand generation and brand strategy, achieving 300% increase in qualified leads and 200% improvement in marketing-sourced revenue.",
        "Digital marketing executive who transformed traditional marketing approach, implementing marketing automation and ABM strategies that improved conversion rates by 250% across all channels.",
        "Brand-building marketing leader with expertise in content strategy and thought leadership, establishing company as category leader and achieving 75% aided brand awareness in target market.",
        "Data-driven VP with deep analytics expertise, implementing attribution modeling and predictive analytics that optimized marketing spend allocation and improved ROI by 180%.",
        "Customer-centric marketing executive who developed comprehensive customer journey mapping, reducing churn by 40% and increasing customer lifetime value by 120%."
      ]
    } else {
      return [
        "Strategic VP with 10+ years driving organizational growth and operational excellence, leading cross-functional teams of 100+ professionals and delivering consistent results above industry benchmarks.",
        "Transformational leader who successfully managed $500M+ P&L responsibility, implementing strategic initiatives that improved profitability by 35% and market position significantly.",
        "Innovation-focused executive with expertise in digital transformation and process optimization, leading change management initiatives that improved operational efficiency by 40%.",
        "People-first leader with strong track record in talent development and organizational design, building high-performing teams that achieved 95%+ employee engagement scores.",
        "Results-driven VP with deep industry expertise and strategic thinking capabilities, establishing partnerships and initiatives that contributed $200M+ in incremental revenue."
      ]
    }
  }
  
  if (title.includes('director')) {
    return [
      "Strategic Director with 8+ years leading high-impact initiatives and cross-functional teams, consistently delivering projects on time and 20% under budget while exceeding quality standards.",
      "Performance-driven leader who managed $100M+ budget and 50+ direct reports, implementing operational improvements that increased efficiency by 30% and reduced costs by $15M annually.",
      "Innovation-focused Director with expertise in process optimization and technology adoption, leading digital transformation projects that improved customer satisfaction by 25 points.",
      "Collaborative executive who successfully managed complex stakeholder relationships across multiple business units, ensuring alignment and achieving 100% project success rate.",
      "Results-oriented leader with deep analytical skills and strategic thinking, developing data-driven solutions that improved key performance indicators by 40% across all metrics."
    ]
  }
  
  return []
}

const getJobTitleSuggestions = (currentTitle: string): string[] => {
  const title = currentTitle.toLowerCase()
  
  // Executive-level suggestions
  const executiveSuggestions = getExecutiveSuggestions(currentTitle)
  if (executiveSuggestions.length > 0) {
    return executiveSuggestions
  }
  
  // Existing suggestions for other roles
  if (title.includes('software') || title.includes('developer') || title.includes('engineer')) {
    return [
      "Full-Stack Software Engineer with 5+ years developing scalable web applications using React, Node.js, and cloud technologies, serving 1M+ users",
      "Senior Software Developer specializing in microservices architecture and DevOps practices, improving deployment efficiency by 300%",
      "Frontend Engineer with expertise in modern JavaScript frameworks, responsive design, and performance optimization",
      "Backend Developer focused on API design, database optimization, and system scalability for high-traffic applications",
      "DevOps Engineer experienced in containerization, CI/CD pipelines, and infrastructure automation using AWS/Azure"
    ]
  }

  if (title.includes('marketing') || title.includes('digital marketing')) {
    return [
      "Digital Marketing Specialist with 4+ years driving growth through SEO, PPC, and social media campaigns, increasing organic traffic by 250%",
      "Content Marketing Manager experienced in creating compelling narratives that drive engagement and conversion across multiple channels",
      "Growth Marketing Professional focused on data-driven strategies, A/B testing, and conversion optimization",
      "Social Media Marketing Expert with proven track record of building brand communities and increasing follower engagement by 400%",
      "Email Marketing Specialist skilled in automation, segmentation, and personalization strategies that improve open rates by 150%"
    ]
  }

  if (title.includes('sales') || title.includes('account')) {
    return [
      "Sales Professional with 6+ years consistently exceeding quotas by 120%+, specializing in consultative selling and relationship building",
      "Account Manager experienced in managing enterprise clients and expanding revenue through strategic upselling and cross-selling",
      "Business Development Representative skilled in lead generation, qualification, and pipeline management",
      "Inside Sales Specialist with expertise in CRM systems, sales automation, and data-driven prospecting",
      "Customer Success Manager focused on retention, expansion, and delivering measurable value to key accounts"
    ]
  }

  if (title.includes('project') || title.includes('program')) {
    return [
      "Project Manager with 5+ years leading cross-functional teams and delivering complex projects on time and within budget",
      "Program Manager experienced in agile methodologies, risk management, and stakeholder communication",
      "Technical Project Manager with expertise in software development lifecycle and team coordination",
      "Operations Manager focused on process improvement, efficiency optimization, and team leadership",
      "Product Manager skilled in roadmap planning, user research, and feature prioritization"
    ]
  }

  if (title.includes('data') || title.includes('analyst')) {
    return [
      "Data Analyst with 4+ years transforming complex datasets into actionable business insights using Python, SQL, and Tableau",
      "Business Intelligence Analyst experienced in dashboard creation, reporting automation, and predictive modeling",
      "Data Scientist skilled in machine learning, statistical analysis, and data visualization",
      "Financial Analyst with expertise in financial modeling, forecasting, and performance analysis",
      "Marketing Analyst focused on campaign performance, customer segmentation, and ROI optimization"
    ]
  }

  if (title.includes('design') || title.includes('creative')) {
    return [
      "UX/UI Designer with 5+ years creating intuitive user experiences and visually compelling interfaces for web and mobile",
      "Graphic Designer experienced in brand identity, marketing materials, and digital asset creation",
      "Product Designer skilled in user research, prototyping, and design system development",
      "Creative Director with expertise in campaign development, brand strategy, and team leadership",
      "Web Designer focused on responsive design, user experience optimization, and conversion-driven layouts"
    ]
  }

  return [
    "Results-driven professional with proven track record of exceeding performance targets and driving organizational success",
    "Collaborative team player with strong analytical skills and ability to solve complex business challenges",
    "Detail-oriented professional with excellent communication skills and commitment to quality excellence",
    "Strategic thinker with experience in process improvement and cross-functional project leadership",
    "Customer-focused professional with expertise in relationship building and solution development"
  ]
}

const getSkillSuggestions = (jobTitle: string): string[] => {
  const title = jobTitle.toLowerCase()
  
  if (title.includes('software') || title.includes('developer') || title.includes('engineer')) {
    return [
      'JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker', 'Kubernetes',
      'Git', 'REST APIs', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Redis', 'Microservices',
      'CI/CD', 'Agile', 'Test-Driven Development', 'System Design', 'Cloud Architecture'
    ]
  }
  
  if (title.includes('marketing')) {
    return [
      'Digital Marketing', 'SEO/SEM', 'Google Analytics', 'Social Media Marketing', 'Content Marketing',
      'Email Marketing', 'PPC Advertising', 'Marketing Automation', 'A/B Testing', 'Conversion Optimization',
      'Brand Management', 'Campaign Management', 'Lead Generation', 'CRM Systems', 'Data Analysis'
    ]
  }
  
  if (title.includes('sales')) {
    return [
      'Consultative Selling', 'Relationship Building', 'Lead Generation', 'CRM Management', 'Negotiation',
      'Account Management', 'Pipeline Management', 'Sales Forecasting', 'Prospecting', 'Closing Techniques',
      'Customer Retention', 'Upselling', 'Cross-selling', 'Territory Management', 'Sales Analytics'
    ]
  }
  
  if (title.includes('data') || title.includes('analyst')) {
    return [
      'Python', 'SQL', 'R', 'Tableau', 'Power BI', 'Excel', 'Statistical Analysis', 'Data Visualization',
      'Machine Learning', 'Predictive Modeling', 'Data Mining', 'ETL Processes', 'Big Data', 'Pandas',
      'NumPy', 'Scikit-learn', 'TensorFlow', 'Business Intelligence', 'Database Management', 'A/B Testing'
    ]
  }
  
  if (title.includes('design')) {
    return [
      'Adobe Creative Suite', 'Figma', 'Sketch', 'Photoshop', 'Illustrator', 'InDesign', 'Prototyping',
      'User Experience (UX)', 'User Interface (UI)', 'Wireframing', 'Design Systems', 'Typography',
      'Color Theory', 'Brand Identity', 'Responsive Design', 'HTML/CSS', 'User Research', 'Usability Testing'
    ]
  }
  
  if (title.includes('project') || title.includes('manager')) {
    return [
      'Project Management', 'Agile/Scrum', 'Leadership', 'Team Management', 'Risk Management',
      'Budget Management', 'Stakeholder Management', 'Process Improvement', 'Strategic Planning',
      'Communication', 'Problem Solving', 'Time Management', 'Quality Assurance', 'Change Management'
    ]
  }
  
  return [
    'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration', 'Project Management',
    'Strategic Thinking', 'Analytical Skills', 'Time Management', 'Adaptability', 'Customer Service',
    'Attention to Detail', 'Critical Thinking', 'Decision Making', 'Multitasking', 'Innovation'
  ]
}

const getSuggestionsByField = (
  field: string, 
  jobTitle: string = '', 
  currentValue: string = ''
): Array<{ id: string; content: string; category: string; icon: any; preview: string }> => {
  switch (field) {
    case 'summary':
      return getJobTitleSuggestions(jobTitle).map((suggestion, index) => ({
        id: `summary-${index}`,
        content: suggestion,
        category: 'Professional Summary',
        icon: Target,
        preview: 'Compelling professional overview'
      }))
    
    case 'skills':
      return getSkillSuggestions(jobTitle).map((skill, index) => ({
        id: `skill-${index}`,
        content: skill,
        category: 'Technical Skills',
        icon: Brain,
        preview: 'Industry-relevant skill'
      }))
    
    case 'experience':
      return [
        {
          id: 'exp-1',
          content: 'Led cross-functional team of 12 engineers to deliver mission-critical platform upgrade, resulting in 40% performance improvement and 99.9% uptime',
          category: 'Leadership',
          icon: Users,
          preview: 'Team leadership achievement'
        },
        {
          id: 'exp-2',
          content: 'Architected and implemented scalable microservices solution that reduced system response time by 60% and supported 10x user growth',
          category: 'Technical',
          icon: Zap,
          preview: 'Technical accomplishment'
        },
        {
          id: 'exp-3',
          content: 'Drove revenue growth of 150% through strategic product initiatives and market expansion, exceeding annual targets by $2.5M',
          category: 'Business Impact',
          icon: TrendingUp,
          preview: 'Revenue generation result'
        },
        {
          id: 'exp-4',
          content: 'Established DevOps culture and CI/CD pipeline, improving deployment frequency by 300% and reducing production incidents by 85%',
          category: 'Process Improvement',
          icon: Award,
          preview: 'Process optimization'
        }
      ]
    
    default:
      return []
  }
}

export default function FieldSuggestions({ 
  field, 
  currentValue, 
  onApply, 
  jobTitle = '',
  userContext 
}: FieldSuggestionsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const suggestions = getSuggestionsByField(field, jobTitle, currentValue)
  
  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(id)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }
  
  const handleApply = (content: string) => {
    onApply(content)
    toast.success('Applied successfully!')
  }
  
  if (suggestions.length === 0) return null
  
  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
      >
        <Lightbulb className="w-4 h-4" />
        <span>AI Suggestions ({suggestions.length})</span>
        <Sparkles className="w-4 h-4" />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 space-y-3 overflow-hidden"
          >
            {suggestions.slice(0, field === 'skills' ? 10 : 5).map((suggestion) => {
              const Icon = suggestion.icon
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                      <Icon className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded-full">
                          {suggestion.category}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {suggestion.preview}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {suggestion.content}
                      </p>
                      
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => handleApply(suggestion.content)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          <span>Apply</span>
                        </button>
                        
                        <button
                          onClick={() => handleCopy(suggestion.content, suggestion.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {copiedId === suggestion.id ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>{copiedId === suggestion.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
