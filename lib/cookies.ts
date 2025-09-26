// Cookie utility functions for managing user preferences and state

export interface CookieOptions {
  expires?: Date | number;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  templateStyle?: string;
  autoSave?: boolean;
  language?: string;
  fontSize?: 'small' | 'medium' | 'large';
  lastUsedTemplate?: string;
  recentJobDescriptions?: string[];
}

export interface ResumeState {
  lastEditedResume?: string;
  draftContent?: string;
  formProgress?: number;
  lastSavedAt?: string;
}

// Set a cookie with options
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    if (typeof options.expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    } else {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
  }

  if (options.maxAge) {
    cookieString += `; max-age=${options.maxAge}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += `; secure`;
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

// Get a cookie value by name
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;

  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    let c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }

  return null;
}

// Delete a cookie
export function deleteCookie(name: string, path?: string, domain?: string): void {
  setCookie(name, '', {
    expires: new Date(0),
    path,
    domain
  });
}

// Get all cookies as an object
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const cookies: Record<string, string> = {};
  const cookieArray = document.cookie.split(';');

  for (let cookie of cookieArray) {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  }

  return cookies;
}

// User preferences management
export function setUserPreferences(preferences: Partial<UserPreferences>): void {
  const existing = getUserPreferences();
  const updated = { ...existing, ...preferences };
  
  setCookie('user_preferences', JSON.stringify(updated), {
    expires: 365, // 1 year
    path: '/',
    sameSite: 'lax'
  });
}

export function getUserPreferences(): UserPreferences {
  const cookie = getCookie('user_preferences');
  if (!cookie) return {};

  try {
    return JSON.parse(cookie);
  } catch {
    return {};
  }
}

export function clearUserPreferences(): void {
  deleteCookie('user_preferences', '/');
}

// Resume state management
export function setResumeState(state: Partial<ResumeState>): void {
  const existing = getResumeState();
  const updated = { ...existing, ...state };
  
  setCookie('resume_state', JSON.stringify(updated), {
    expires: 7, // 1 week
    path: '/',
    sameSite: 'lax'
  });
}

export function getResumeState(): ResumeState {
  const cookie = getCookie('resume_state');
  if (!cookie) return {};

  try {
    return JSON.parse(cookie);
  } catch {
    return {};
  }
}

export function clearResumeState(): void {
  deleteCookie('resume_state', '/');
}

// Session management
export function setSessionData(key: string, value: any, maxAge?: number): void {
  setCookie(`session_${key}`, JSON.stringify(value), {
    maxAge: maxAge || 3600, // 1 hour default
    path: '/',
    sameSite: 'lax'
  });
}

export function getSessionData(key: string): any {
  const cookie = getCookie(`session_${key}`);
  if (!cookie) return null;

  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
}

export function clearSessionData(key: string): void {
  deleteCookie(`session_${key}`, '/');
}

// Recent job descriptions management
export function addRecentJobDescription(description: string): void {
  const preferences = getUserPreferences();
  const recent = preferences.recentJobDescriptions || [];
  
  // Remove if already exists and add to beginning
  const filtered = recent.filter(desc => desc !== description);
  const updated = [description, ...filtered].slice(0, 5); // Keep only 5 recent
  
  setUserPreferences({ recentJobDescriptions: updated });
}

export function getRecentJobDescriptions(): string[] {
  const preferences = getUserPreferences();
  return preferences.recentJobDescriptions || [];
}

// Auto-save functionality
export function enableAutoSave(): void {
  setUserPreferences({ autoSave: true });
}

export function disableAutoSave(): void {
  setUserPreferences({ autoSave: false });
}

export function isAutoSaveEnabled(): boolean {
  const preferences = getUserPreferences();
  return preferences.autoSave !== false; // Default to true
}

// Theme management
export function setTheme(theme: 'light' | 'dark' | 'system'): void {
  setUserPreferences({ theme });
}

export function getTheme(): 'light' | 'dark' | 'system' {
  const preferences = getUserPreferences();
  return preferences.theme || 'system';
}

// Template management
export function setLastUsedTemplate(template: string): void {
  setUserPreferences({ lastUsedTemplate: template });
}

export function getLastUsedTemplate(): string | null {
  const preferences = getUserPreferences();
  return preferences.lastUsedTemplate || null;
}

// Template designs management for CKEditor
export interface TemplateDesign {
  id: string;
  name: string;
  description: string;
  htmlContent: string;
  cssStyles: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal' | 'professional';
  colorScheme: string;
  preview?: string;
}

export function saveTemplateDesign(design: TemplateDesign): void {
  const designs = getTemplateDesigns();
  const updated = designs.filter(d => d.id !== design.id);
  updated.push(design);
  
  setCookie('template_designs', JSON.stringify(updated), {
    expires: 365, // 1 year
    path: '/',
    sameSite: 'lax'
  });
}

export function getTemplateDesigns(): TemplateDesign[] {
  const cookie = getCookie('template_designs');
  if (!cookie) return getDefaultTemplateDesigns();

  try {
    const designs = JSON.parse(cookie);
    return [...getDefaultTemplateDesigns(), ...designs];
  } catch {
    return getDefaultTemplateDesigns();
  }
}

export function getTemplateDesign(id: string): TemplateDesign | null {
  const designs = getTemplateDesigns();
  return designs.find(d => d.id === id) || null;
}

export function deleteTemplateDesign(id: string): void {
  const designs = getTemplateDesigns().filter(d => d.id !== id && !d.id.startsWith('default_'));
  const customDesigns = designs.filter(d => !d.id.startsWith('default_'));
  
  setCookie('template_designs', JSON.stringify(customDesigns), {
    expires: 365,
    path: '/',
    sameSite: 'lax'
  });
}

function getDefaultTemplateDesigns(): TemplateDesign[] {
  return [
    {
      id: 'default_modern',
      name: 'Modern Professional',
      description: 'Clean, modern design with blue accents',
      category: 'modern',
      colorScheme: '#2563eb',
      htmlContent: `
        <div class="resume-container modern-template">
          <header class="resume-header">
            <h1 class="name">[Your Name]</h1>
            <div class="contact-info">
              <span class="email">[email@example.com]</span>
              <span class="phone">[+1 (555) 123-4567]</span>
              <span class="location">[City, State]</span>
            </div>
          </header>
          
          <section class="summary-section">
            <h2>Professional Summary</h2>
            <p>[Your professional summary goes here...]</p>
          </section>
          
          <section class="experience-section">
            <h2>Experience</h2>
            <div class="job">
              <h3 class="job-title">[Job Title]</h3>
              <div class="company-info">
                <span class="company">[Company Name]</span>
                <span class="duration">[Start Date - End Date]</span>
              </div>
              <ul class="achievements">
                <li>[Achievement or responsibility]</li>
                <li>[Achievement or responsibility]</li>
              </ul>
            </div>
          </section>
          
          <section class="education-section">
            <h2>Education</h2>
            <div class="education">
              <h3 class="degree">[Degree Name]</h3>
              <div class="school-info">
                <span class="school">[University Name]</span>
                <span class="graduation">[Graduation Year]</span>
              </div>
            </div>
          </section>
          
          <section class="skills-section">
            <h2>Skills</h2>
            <div class="skills-grid">
              <span class="skill">[Skill 1]</span>
              <span class="skill">[Skill 2]</span>
              <span class="skill">[Skill 3]</span>
            </div>
          </section>
        </div>
      `,
      cssStyles: `
        .modern-template {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          line-height: 1.6;
          color: #1f2937;
        }
        .resume-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #2563eb;
        }
        .name {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
        }
        .contact-info {
          display: flex;
          justify-content: center;
          gap: 20px;
          flex-wrap: wrap;
          color: #6b7280;
        }
        .resume-header h2 {
          color: #2563eb;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 30px 0 15px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .job-title, .degree {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
        }
        .company-info, .school-info {
          display: flex;
          justify-content: space-between;
          color: #6b7280;
          margin-bottom: 10px;
        }
        .achievements {
          margin: 10px 0;
          padding-left: 20px;
        }
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .skill {
          background: #eff6ff;
          color: #2563eb;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }
      `
    },
    {
      id: 'default_classic',
      name: 'Classic Professional',
      description: 'Traditional resume format with elegant typography',
      category: 'classic',
      colorScheme: '#374151',
      htmlContent: `
        <div class="resume-container classic-template">
          <header class="resume-header">
            <h1 class="name">[Your Name]</h1>
            <div class="contact-info">
              <div>[email@example.com] | [+1 (555) 123-4567] | [City, State]</div>
            </div>
          </header>
          
          <section class="objective-section">
            <h2>Objective</h2>
            <p>[Your career objective goes here...]</p>
          </section>
          
          <section class="experience-section">
            <h2>Professional Experience</h2>
            <div class="job">
              <div class="job-header">
                <h3 class="job-title">[Job Title]</h3>
                <span class="duration">[Start Date - End Date]</span>
              </div>
              <div class="company">[Company Name], [Location]</div>
              <ul class="responsibilities">
                <li>[Key responsibility or achievement]</li>
                <li>[Key responsibility or achievement]</li>
              </ul>
            </div>
          </section>
          
          <section class="education-section">
            <h2>Education</h2>
            <div class="education">
              <div class="education-header">
                <h3 class="degree">[Degree Name]</h3>
                <span class="graduation">[Graduation Year]</span>
              </div>
              <div class="school">[University Name], [Location]</div>
            </div>
          </section>
          
          <section class="skills-section">
            <h2>Core Competencies</h2>
            <div class="skills-list">
              [Skill 1] • [Skill 2] • [Skill 3] • [Skill 4]
            </div>
          </section>
        </div>
      `,
      cssStyles: `
        .classic-template {
          font-family: 'Times New Roman', serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          line-height: 1.5;
          color: #374151;
        }
        .resume-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .name {
          font-size: 2.2rem;
          font-weight: bold;
          color: #374151;
          margin-bottom: 8px;
        }
        .contact-info {
          font-size: 1rem;
          color: #6b7280;
        }
        .classic-template h2 {
          color: #374151;
          font-size: 1.2rem;
          font-weight: bold;
          margin: 25px 0 10px 0;
          text-transform: uppercase;
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 5px;
        }
        .job-header, .education-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
        }
        .job-title, .degree {
          font-size: 1.1rem;
          font-weight: bold;
          color: #374151;
        }
        .company, .school {
          font-style: italic;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .responsibilities {
          margin: 8px 0;
          padding-left: 20px;
        }
        .skills-list {
          font-size: 1rem;
          line-height: 1.6;
        }
      `
    },
    {
      id: 'default_minimal',
      name: 'Minimal Clean',
      description: 'Minimalist design focusing on content',
      category: 'minimal',
      colorScheme: '#000000',
      htmlContent: `
        <div class="resume-container minimal-template">
          <header class="resume-header">
            <h1 class="name">[Your Name]</h1>
            <div class="contact-info">
              [email@example.com] • [+1 (555) 123-4567] • [City, State]
            </div>
          </header>
          
          <section class="section">
            <h2>Summary</h2>
            <p>[Your professional summary...]</p>
          </section>
          
          <section class="section">
            <h2>Experience</h2>
            <div class="item">
              <div class="item-header">
                <strong>[Job Title]</strong> — [Company Name]
                <span class="date">[Start Date - End Date]</span>
              </div>
              <ul>
                <li>[Achievement or responsibility]</li>
                <li>[Achievement or responsibility]</li>
              </ul>
            </div>
          </section>
          
          <section class="section">
            <h2>Education</h2>
            <div class="item">
              <div class="item-header">
                <strong>[Degree Name]</strong> — [University Name]
                <span class="date">[Graduation Year]</span>
              </div>
            </div>
          </section>
          
          <section class="section">
            <h2>Skills</h2>
            <p>[Skill 1], [Skill 2], [Skill 3], [Skill 4]</p>
          </section>
        </div>
      `,
      cssStyles: `
        .minimal-template {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          max-width: 700px;
          margin: 0 auto;
          padding: 40px;
          line-height: 1.6;
          color: #000000;
        }
        .resume-header {
          margin-bottom: 40px;
        }
        .name {
          font-size: 2rem;
          font-weight: 300;
          color: #000000;
          margin-bottom: 5px;
        }
        .contact-info {
          font-size: 0.9rem;
          color: #666666;
        }
        .minimal-template h2 {
          font-size: 1rem;
          font-weight: 600;
          color: #000000;
          margin: 30px 0 15px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .item {
          margin-bottom: 20px;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }
        .date {
          font-size: 0.9rem;
          color: #666666;
        }
        .minimal-template ul {
          margin: 5px 0;
          padding-left: 20px;
        }
        .minimal-template li {
          margin-bottom: 3px;
        }
      `
    }
  ];
}
