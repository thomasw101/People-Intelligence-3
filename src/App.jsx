import React, { useState, useEffect } from 'react';
import { Search, Building2, Linkedin, Globe, ChevronDown, ChevronUp, Loader2, Target, Lightbulb, MessageCircle, Users, Briefcase, Download, Save, Settings, Zap, BookOpen, X, Plus, Trash2 } from 'lucide-react';

const contextOptions = [
  { id: 'meeting', label: 'Meeting Prep', icon: '🤝' },
  { id: 'sales', label: 'Sales Call', icon: '📞' },
  { id: 'partnership', label: 'Partnership', icon: '🎯' },
  { id: 'marketing', label: 'Marketing', icon: '📣' },
  { id: 'general', label: 'General Intel', icon: '👥' },
];

const PeopleIntelligence = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loginError, setLoginError] = useState('');

  const [context, setContext] = useState('general');
  const [depth, setDepth] = useState('full');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [savedPeople, setSavedPeople] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    linkedin: '',
    companyLinkedin: '',
    website: '',
    bio: '',
    additionalUrls: ''
  });

  useEffect(() => {
    // Check if already logged in
    const auth = localStorage.getItem('proptechAuth');
    if (auth === 'true') setIsAuthenticated(true);
    
    const saved = localStorage.getItem('proptechSavedPeople');
    if (saved) setSavedPeople(JSON.parse(saved));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.toLowerCase() === 'user' && accessCode === 'PTC2026') {
      setIsAuthenticated(true);
      localStorage.setItem('proptechAuth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid username or access code');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('proptechAuth');
  };

  const isFormValid = formData.name && formData.company && formData.linkedin && formData.website;

  const generateIntelligence = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    setGeneratedContent(null);
    setExpandedSections({ brief: true, background: true, intel: true, company: true, conversation: true, discovery: true, talking: true });

    const contextLabels = {
      meeting: 'preparing for a meeting with this person',
      sales: 'preparing for a sales conversation',
      partnership: 'evaluating a potential partnership',
      marketing: 'planning marketing or content outreach',
      general: 'general research and intelligence gathering'
    };

    const prompt = `You are an intelligence research assistant for PropTech Connect, helping team members understand who they're dealing with.

PERSON PROFILE:
- Name: ${formData.name}
- Role: ${formData.role || 'Not specified'}
- Company: ${formData.company}
- LinkedIn: ${formData.linkedin}
- Company LinkedIn: ${formData.companyLinkedin || 'Not provided'}
- Company Website: ${formData.website}
- Bio: ${formData.bio || 'Not provided - generate insights based on role and company'}
- Additional URLs: ${formData.additionalUrls || 'None'}

CONTEXT: The user is ${contextLabels[context]}.
DEPTH: ${depth === 'quick' ? 'Quick brief only - be very concise, 60-second read' : 'Full deep dive - be comprehensive'}

Generate an intelligence report. ${depth === 'quick' ? 'For quick brief, only populate: brief, keyIntel (2-3 points max), conversationStarters (2 max). Leave other arrays empty [].' : ''}

Return a JSON object with this structure:
{
  "brief": "2-3 sentence executive summary. Who is this person and why do they matter? Be specific where possible.",
  "background": "${depth === 'full' ? '3-4 sentences on career trajectory. If bio provided, reference specific roles/achievements. If not, make reasonable inferences from role/company.' : ''}",
  "keyIntel": [
    "${depth === 'quick' ? '2-3' : '3-5'} actionable insights. ${context === 'sales' ? 'Focus on what they likely care about, their priorities, potential pain points.' : context === 'partnership' ? 'Focus on their strategic priorities, track record, what they bring to the table.' : context === 'marketing' ? 'Focus on expertise areas, content angles, thought leadership topics.' : context === 'meeting' ? 'Focus on rapport-building angles, shared interests, what to know before walking in.' : 'Focus on what makes them notable and relevant.'}"
  ],
  "companyOverview": "${depth === 'full' ? 'What does their company do? Market position, size, recent activity if known. 2-3 sentences.' : ''}",
  "conversationStarters": [
    "${depth === 'quick' ? '2' : '3'} natural ways to open a conversation. Show you did your homework."
  ],
  "discoveryQuestions": ${depth === 'full' ? `[
    "4-5 smart questions to understand their situation. ${context === 'sales' ? 'Focus on uncovering needs, challenges, decision process.' : context === 'partnership' ? 'Focus on strategic direction, priorities, what success looks like.' : context === 'meeting' ? 'Focus on building rapport and understanding their perspective.' : 'Focus on understanding their world.'}"
  ]` : '[]'},
  "talkingPoints": ${depth === 'full' ? `[
    "3-4 topics or angles likely to resonate. ${context === 'sales' ? 'Value propositions that might appeal.' : context === 'partnership' ? 'Mutual benefits and synergies.' : context === 'marketing' ? 'Content collaboration opportunities.' : 'Common ground and shared interests.'}"
  ]` : '[]'}
}

IMPORTANT RULES:
- Be specific where you can, acknowledge when you're inferring
- No generic corporate filler - every point should be useful
- If bio is sparse, make smart inferences from role + company but note limitations
- Tailor tone to context (sales = strategic, meeting = personable, etc.)

Return ONLY valid JSON, no markdown.`;

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      if (data.content?.[0]?.text) {
        const cleanedJson = data.content[0].text.replace(/```json|```/g, '').trim();
        setGeneratedContent(JSON.parse(cleanedJson));
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Error:', error);
      setGeneratedContent({
        brief: `${formData.name} is ${formData.role || 'a professional'} at ${formData.company}. Unable to generate full report - please check API connection.`,
        background: '',
        keyIntel: ['Report generation failed - try again or check connection'],
        companyOverview: '',
        conversationStarters: [`How did you come to join ${formData.company}?`],
        discoveryQuestions: [],
        talkingPoints: []
      });
    }
    setLoading(false);
  };

  const savePerson = () => {
    const personData = { ...formData, savedAt: new Date().toISOString() };
    const newSaved = [...savedPeople.filter(p => p.name !== formData.name), personData];
    setSavedPeople(newSaved);
    localStorage.setItem('proptechSavedPeople', JSON.stringify(newSaved));
  };

  const loadPerson = (person) => {
    setFormData(person);
    setShowSaved(false);
    setGeneratedContent(null);
  };

  const deletePerson = (name) => {
    const newSaved = savedPeople.filter(p => p.name !== name);
    setSavedPeople(newSaved);
    localStorage.setItem('proptechSavedPeople', JSON.stringify(newSaved));
  };

  const exportReport = () => {
    if (!generatedContent) return;
    const exportData = { 
      person: formData, 
      intelligence: generatedContent, 
      context,
      depth,
      generatedAt: new Date().toISOString() 
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `intel-${formData.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearForm = () => {
    setFormData({ name: '', role: '', company: '', linkedin: '', companyLinkedin: '', website: '', bio: '', additionalUrls: '' });
    setGeneratedContent(null);
  };

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const Section = ({ id, title, icon: Icon, color, children }) => {
    const content = Array.isArray(children) ? children.filter(Boolean) : children;
    if (!content || (Array.isArray(content) && content.length === 0)) return null;
    
    return (
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <button onClick={() => toggleSection(id)} className={`w-full flex items-center justify-between p-4 ${color} hover:opacity-90 transition-all`}>
          <div className="flex items-center gap-3">
            <Icon size={18} className="opacity-80" />
            <span className="font-medium">{title}</span>
          </div>
          {expandedSections[id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {expandedSections[id] && <div className="p-4 border-t border-slate-700/50">{content}</div>}
      </div>
    );
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
        {/* Blurred background content preview */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 py-8 filter blur-lg opacity-20">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">People Intelligence</h1>
            </div>
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
              <div className="h-12 bg-slate-700/50 rounded-lg mb-4"></div>
              <div className="h-12 bg-slate-700/50 rounded-lg mb-4"></div>
              <div className="h-12 bg-slate-700/50 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 w-full max-w-md shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Tom's Intelligence</h2>
              <p className="text-slate-400 text-sm">Enter credentials for access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Access Code</label>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter access code"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                />
              </div>

              {loginError && (
                <p className="text-red-400 text-sm text-center">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
              >
                Access Tool
              </button>
            </form>

            <div className="text-center mt-6 pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-xs">
                Powered by <span className="text-slate-400">LearnLab Media Limited</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="fixed inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl font-bold text-white tracking-wide">PROPTECH</span>
            <span className="text-2xl font-bold text-cyan-400 tracking-wide">CONNECT</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">People Intelligence</h1>
          <p className="text-slate-400">Research anyone before your next conversation</p>
        </div>

        {/* Saved People Quick Access */}
        {savedPeople.length > 0 && (
          <div className="mb-6">
            <button 
              onClick={() => setShowSaved(!showSaved)}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-2"
            >
              <Users size={16} />
              {savedPeople.length} saved {savedPeople.length === 1 ? 'person' : 'people'}
              <ChevronDown size={14} className={`transition-transform ${showSaved ? 'rotate-180' : ''}`} />
            </button>
            {showSaved && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 space-y-2">
                {savedPeople.map((person, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                    <button onClick={() => loadPerson(person)} className="text-left flex-1">
                      <span className="text-white font-medium">{person.name}</span>
                      <span className="text-slate-500 text-sm ml-2">{person.company}</span>
                    </button>
                    <button onClick={() => deletePerson(person.name)} className="text-slate-500 hover:text-red-400 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input Form */}
        <div className="bg-slate-800/30 backdrop-blur rounded-2xl p-6 border border-slate-700/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-medium">Person Details</h2>
            {(formData.name || formData.company) && (
              <button onClick={clearForm} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
                <X size={14} /> Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Smith"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Role / Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. CEO, Head of Sales"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Company Name *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Acme Properties"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">LinkedIn URL *</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Company LinkedIn URL</label>
              <input
                type="url"
                value={formData.companyLinkedin}
                onChange={(e) => setFormData({ ...formData, companyLinkedin: e.target.value })}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Company Website URL *</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-slate-400 text-xs mb-1 block">Bio (paste from LinkedIn or other source)</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Paste their LinkedIn summary, company bio, or any relevant background info..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="text-slate-400 text-xs mb-1 block">Additional URLs (news, interviews, etc.)</label>
            <textarea
              value={formData.additionalUrls}
              onChange={(e) => setFormData({ ...formData, additionalUrls: e.target.value })}
              placeholder="One URL per line..."
              rows={2}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
            />
          </div>

          {/* Advanced Options */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-300 text-sm mb-4"
          >
            <Settings size={14} />
            {showAdvanced ? 'Hide' : 'Show'} Options
          </button>

          {showAdvanced && (
            <div className="mb-6 p-4 bg-slate-900/30 rounded-xl space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Research Context</label>
                <div className="flex flex-wrap gap-2">
                  {contextOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setContext(opt.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition-all ${
                        context === opt.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-2 block">Report Depth</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDepth('quick')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      depth === 'quick'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
                    }`}
                  >
                    <Zap size={14} /> Quick Brief
                  </button>
                  <button
                    onClick={() => setDepth('full')}
                    className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                      depth === 'full'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
                    }`}
                  >
                    <BookOpen size={14} /> Full Deep Dive
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateIntelligence}
            disabled={!isFormValid || loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
              isFormValid && !loading
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white cursor-pointer shadow-lg shadow-cyan-500/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={22} />
                Generating Intelligence...
              </>
            ) : (
              <>
                <Target size={22} />
                Generate Intelligence Report
              </>
            )}
          </button>

          {!isFormValid && (
            <p className="text-slate-500 text-xs text-center mt-2">
              Fill in required fields: Name, Company, LinkedIn URL, Company Website
            </p>
          )}
        </div>

        {/* Generated Report */}
        {generatedContent && (
          <div className="space-y-4">
            {/* Person Header */}
            <div className="bg-slate-800/30 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{formData.name}</h2>
                  {formData.role && <p className="text-cyan-400">{formData.role}</p>}
                  <p className="text-slate-400">{formData.company}</p>
                </div>
                <div className="flex gap-2">
                  {formData.linkedin && (
                    <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-400 transition-colors">
                      <Linkedin size={18} />
                    </a>
                  )}
                  {formData.website && (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-600/20 hover:bg-slate-600/30 rounded-lg text-slate-400 transition-colors">
                      <Globe size={18} />
                    </a>
                  )}
                </div>
              </div>

              {/* Brief */}
              {generatedContent.brief && (
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                  <p className="text-cyan-100 leading-relaxed">{generatedContent.brief}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button onClick={savePerson} className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
                  <Save size={16} /> Save Person
                </button>
                <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors">
                  <Download size={16} /> Export Report
                </button>
              </div>
            </div>

            {/* Report Sections */}
            {depth === 'full' && generatedContent.background && (
              <Section id="background" title="Background & Career" icon={Briefcase} color="text-white bg-slate-700/50">
                <p className="text-slate-300 leading-relaxed">{generatedContent.background}</p>
              </Section>
            )}

            {generatedContent.keyIntel?.length > 0 && (
              <Section id="intel" title="Key Intel" icon={Target} color="text-white bg-amber-600/80">
                <div className="space-y-2">
                  {generatedContent.keyIntel.map((intel, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                      <Lightbulb size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-200 text-sm">{intel}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {depth === 'full' && generatedContent.companyOverview && (
              <Section id="company" title="Company Overview" icon={Building2} color="text-white bg-blue-600/80">
                <p className="text-slate-300 leading-relaxed">{generatedContent.companyOverview}</p>
              </Section>
            )}

            {generatedContent.conversationStarters?.length > 0 && (
              <Section id="conversation" title="Conversation Starters" icon={MessageCircle} color="text-white bg-green-600/80">
                <div className="space-y-2">
                  {generatedContent.conversationStarters.map((starter, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border-l-4 border-green-500">
                      <p className="text-slate-200 text-sm italic">"{starter}"</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {depth === 'full' && generatedContent.discoveryQuestions?.length > 0 && (
              <Section id="discovery" title="Discovery Questions" icon={Search} color="text-white bg-purple-600/80">
                <div className="space-y-2">
                  {generatedContent.discoveryQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-slate-200 text-sm">"{q}"</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {depth === 'full' && generatedContent.talkingPoints?.length > 0 && (
              <Section id="talking" title="Talking Points" icon={Lightbulb} color="text-white bg-cyan-600/80">
                <div className="space-y-2">
                  {generatedContent.talkingPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                      <span className="text-slate-200 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* New Research Button */}
            <button
              onClick={clearForm}
              className="w-full py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
            >
              ← Research Another Person
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-800">
          <p className="text-slate-500 text-sm">
            Powered by <span className="text-slate-400">LearnLab Media Limited</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PeopleIntelligence;

// Also export as App for compatibility
export { PeopleIntelligence as App };
