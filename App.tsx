
import React, { useState, useEffect } from 'react';
import { 
  FUNDAMENTAL_CONDITIONS, 
  TECHNICAL_CONDITIONS, 
  COMBOS, 
  EXTERNAL_LINKS 
} from './constants';
import { Combo, GroundingSource, SavedAnalysis } from './types';
import { analyzeCombo } from './geminiService';
import { marked } from 'marked';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'conditions' | 'combos' | 'analysis' | 'users' | 'saved'>('combos');
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Admin Check Logic
  const isAdmin = currentUser?.name?.toLowerCase().includes('shailendra jain') || 
                  currentUser?.email?.toLowerCase() === 'shailendra@jain.com';

  // Check for existing session
  useEffect(() => {
    const session = localStorage.getItem('screener_session');
    if (session) {
      const parsedUser = JSON.parse(session);
      setIsAuthenticated(true);
      setCurrentUser(parsedUser);
    }
    
    const saved = localStorage.getItem('screener_saved_analyses');
    if (saved) {
      setSavedAnalyses(JSON.parse(saved));
    }
  }, []);

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
  const validateMobile = (mobile: string) => /^[0-9]{10}$/.test(mobile);

  const handleRegisterRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.mobile) {
      setError('All fields are required.');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validateMobile(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('screener_users') || '[]');
    const userExists = users.find((u: any) => u.email === formData.email || u.mobile === formData.mobile);
    
    if (userExists) {
      setError('User with this email or mobile already exists.');
      return;
    }

    // Trigger OTP Phase
    setIsVerifyingOtp(true);
    setError('');
    setSuccessMsg(`OTP sent to +91 ${formData.mobile}. For demo, use 123456.`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      const users = JSON.parse(localStorage.getItem('screener_users') || '[]');
      users.push(formData);
      localStorage.setItem('screener_users', JSON.stringify(users));
      
      localStorage.setItem('screener_session', JSON.stringify(formData));
      setCurrentUser(formData);
      setIsAuthenticated(true);
      setIsVerifyingOtp(false);
      setError('');
      setSuccessMsg('');
    } else {
      setError('Invalid OTP. Please enter 123456 to continue.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('screener_users') || '[]');
    const user = users.find((u: any) => u.email === formData.email && u.mobile === formData.mobile);

    if (user) {
      localStorage.setItem('screener_session', JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials. Please register first.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('screener_session');
    setFormData({ name: '', email: '', mobile: '' });
    setOtp('');
    setIsVerifyingOtp(false);
    setActiveTab('combos');
  };

  const handleAnalyze = async (combo: Combo) => {
    setSelectedCombo(combo);
    setActiveTab('analysis');
    setLoading(true);
    const result = await analyzeCombo(combo);
    setAnalysisResult(result);
    setLoading(false);
  };

  const handleSaveAnalysis = () => {
    if (!analysisResult || !selectedCombo) return;

    const newSave: SavedAnalysis = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      comboName: selectedCombo.name,
      text: analysisResult.text,
      sources: analysisResult.sources
    };

    const updated = [newSave, ...savedAnalyses];
    setSavedAnalyses(updated);
    localStorage.setItem('screener_saved_analyses', JSON.stringify(updated));
    alert('Analysis saved successfully!');
  };

  const deleteSavedAnalysis = (id: string) => {
    const updated = savedAnalyses.filter(a => a.id !== id);
    setSavedAnalyses(updated);
    localStorage.setItem('screener_saved_analyses', JSON.stringify(updated));
  };

  const exportUsersToCsv = () => {
    const users = JSON.parse(localStorage.getItem('screener_users') || '[]');
    if (users.length === 0) {
      alert("No users found to export.");
      return;
    }
    
    const headers = ['Index', 'Full Name', 'Email', 'Mobile'];
    const rows = users.map((u: any, i: number) => [i + 1, u.name, u.email, u.mobile]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registered_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getHtmlContent = (text: string) => {
    try {
      let html = marked.parse(text) as string;
      // Highlight rows that contain the star symbol
      html = html.replace(/<tr>\s*<td><strong>⭐/g, '<tr class="highlight-row"><td><strong>⭐');
      html = html.replace(/<tr>\s*<td>⭐/g, '<tr class="highlight-row"><td>⭐');
      return html;
    } catch (e) {
      console.error("Markdown parsing error", e);
      return text;
    }
  };

  const getRegisteredUsers = () => {
    return JSON.parse(localStorage.getItem('screener_users') || '[]');
  };

  // Login/Registration/OTP View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-md w-full mx-4 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl shadow-2xl shadow-indigo-500/40 mb-4">
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase mb-1">Shailu's Screener</h1>
            <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-[0.4em]">Enterprise Access Portal</p>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
            {isVerifyingOtp ? (
              <div className="animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-8 bg-amber-500 rounded-full"></div>
                  <h2 className="text-white font-black text-xs uppercase tracking-widest">Mobile Verification</h2>
                </div>
                
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <p className="text-indigo-200/70 text-xs font-semibold mb-4 leading-relaxed">
                      We've sent a 6-digit verification code to <span className="text-white font-bold">{formData.mobile}</span>.
                    </p>
                    <label className="block text-indigo-200/50 text-[10px] font-black uppercase tracking-widest mb-2">Verification Code</label>
                    <input 
                      type="text" 
                      value={otp}
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-2xl font-black tracking-[0.5em] text-white placeholder-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    />
                  </div>

                  {error && <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider bg-rose-400/10 p-3 rounded-lg text-center">{error}</p>}
                  {successMsg && <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider bg-emerald-400/10 p-3 rounded-lg text-center">{successMsg}</p>}

                  <button 
                    type="submit"
                    className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-amber-600/20 active:scale-[0.98]"
                  >
                    Verify & Create Account <i className="fas fa-check-circle ml-2 text-[10px]"></i>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setIsVerifyingOtp(false)}
                    className="w-full text-white/30 hover:text-white/50 text-[9px] font-black uppercase tracking-widest"
                  >
                    Change Details
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-8 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-white font-black text-xs uppercase tracking-widest">
                    {isRegistering ? 'Account Registration' : 'Secure Authorization'}
                  </h2>
                </div>

                <form onSubmit={isRegistering ? handleRegisterRequest : handleLogin} className="space-y-4">
                  {isRegistering && (
                    <div>
                      <label className="block text-indigo-200/50 text-[10px] font-black uppercase tracking-widest mb-2">Full Name</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                          <i className="fas fa-user"></i>
                        </span>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="John Doe"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-indigo-200/50 text-[10px] font-black uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                        <i className="fas fa-envelope"></i>
                      </span>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="name@company.com"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-indigo-200/50 text-[10px] font-black uppercase tracking-widest mb-2">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                        <i className="fas fa-phone"></i>
                      </span>
                      <input 
                        type="tel" 
                        value={formData.mobile}
                        onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                        placeholder="10-digit number"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {error && <p className="text-rose-400 text-[10px] font-bold uppercase tracking-wider bg-rose-400/10 p-2 rounded-lg text-center">{error}</p>}

                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] mt-2"
                  >
                    {isRegistering ? 'Next: Verify OTP' : 'Authorized Access'} <i className="fas fa-chevron-right ml-2 text-[10px]"></i>
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button 
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setError('');
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest"
                  >
                    {isRegistering ? 'Already have an account? Login' : 'Need institutional access? Register'}
                  </button>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-8 text-center text-white/20 text-[8px] font-bold uppercase tracking-[0.5em]">
            Institutional Grade Security • 256-Bit SSL
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <header className="bg-[#0f172a] text-white shadow-xl sticky top-0 z-50 border-b border-indigo-500/20">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20">
              <i className="fas fa-chart-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none uppercase">Shailu's Screener</h1>
              <p className="text-[10px] text-indigo-300 uppercase tracking-[0.3em] font-bold mt-1">Fundamental & Technical Edge</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="flex bg-slate-800/50 rounded-full p-1 border border-slate-700/50 backdrop-blur-xl">
              <button 
                onClick={() => setActiveTab('combos')}
                className={`px-6 py-2 rounded-full text-xs font-black transition-all uppercase tracking-wider ${activeTab === 'combos' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Strategies
              </button>
              <button 
                onClick={() => setActiveTab('conditions')}
                className={`px-6 py-2 rounded-full text-xs font-black transition-all uppercase tracking-wider ${activeTab === 'conditions' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Checklist
              </button>
              <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-2 rounded-full text-xs font-black transition-all uppercase tracking-wider ${activeTab === 'analysis' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                AI Insights
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`px-6 py-2 rounded-full text-xs font-black transition-all uppercase tracking-wider ${activeTab === 'saved' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
              >
                Saved
              </button>
              {isAdmin && (
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-2 rounded-full text-xs font-black transition-all uppercase tracking-wider ${activeTab === 'users' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/40' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
                >
                  Admin Panel
                </button>
              )}
            </nav>
            
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
               <button 
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all border border-slate-700"
                title="Logout Session"
              >
                <i className="fas fa-power-off"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'conditions' && (
          <div className="space-y-12 animate-fadeIn max-w-7xl mx-auto">
            <section>
              <div className="flex items-center gap-3 mb-8 border-l-4 border-emerald-500 pl-4">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Fundamental Quality Filters</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {FUNDAMENTAL_CONDITIONS.map(c => (
                  <div key={c.id} className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                    <div className="text-emerald-600 font-black text-lg mb-1">{c.title}</div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8 border-l-4 border-amber-500 pl-4">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Technical Bullish Momentum</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {TECHNICAL_CONDITIONS.map(c => (
                  <div key={c.id} className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300">
                    <div className="text-amber-600 font-black text-lg mb-1">{c.title}</div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{c.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'combos' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Professional Combos</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Multi-Condition strategies for superior performance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {COMBOS.map(combo => (
                <div key={combo.id} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden flex flex-col hover:-translate-y-2 transition-all duration-500">
                  <div className="p-8 flex-grow">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">{combo.name}</h3>
                      <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 text-xs font-black">
                        {combo.id.toUpperCase()}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm font-semibold mb-8 leading-relaxed italic">"{combo.description}"</p>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <i className="fas fa-shield-heart text-emerald-500 text-xs"></i>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quality Base</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {combo.fundamentals.map((f, i) => (
                            <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-100 uppercase">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <i className="fas fa-chart-line text-amber-500 text-xs"></i>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trend Overlay</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {combo.technicals.map((t, i) => (
                            <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 text-[10px] font-black rounded-xl border border-amber-100 uppercase">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 pt-0 space-y-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 group transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Screener.in Query</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(combo.screenerQuery);
                            alert('Query copied to clipboard!');
                          }}
                          className="text-xs text-indigo-600 hover:underline font-black flex items-center gap-1"
                        >
                          <i className="fas fa-copy"></i> COPY
                        </button>
                      </div>
                      <code className="text-[11px] text-slate-700 break-all font-mono leading-relaxed block bg-white p-2 rounded border border-slate-100">{combo.screenerQuery}</code>
                    </div>

                    <button 
                      onClick={() => handleAnalyze(combo)}
                      className="w-full py-5 bg-[#0f172a] hover:bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm transition-all shadow-xl shadow-slate-300 flex items-center justify-center gap-3 active:scale-[0.97]"
                    >
                      <i className="fas fa-microchip"></i>
                      EXECUTE AI SCREENER
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="max-w-6xl mx-auto animate-fadeIn">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-8">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-[6px] border-slate-100"></div>
                  <div className="absolute top-0 h-24 w-24 rounded-full border-[6px] border-indigo-600 border-t-transparent animate-spin"></div>
                  <i className="fas fa-bolt absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-indigo-600 animate-pulse"></i>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Analyzing Indian Equities</p>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Generating SWOT & Market Data Matrix...</p>
                </div>
              </div>
            ) : selectedCombo ? (
              <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/50">
                <div className="bg-[#0f172a] p-10 text-white border-b border-indigo-500/30">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4 text-indigo-300 border border-indigo-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Intelligence
                      </div>
                      <h2 className="text-4xl font-black mb-2 tracking-tighter">{selectedCombo.name}</h2>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Matched Candidates & Performance Metrics</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={handleSaveAnalysis}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black shadow-xl hover:bg-emerald-500 transition-all flex items-center gap-3 uppercase tracking-widest"
                      >
                        <i className="fas fa-save"></i> Save Analysis
                      </button>
                      <button 
                        onClick={() => handleAnalyze(selectedCombo)}
                        className="px-8 py-4 bg-white text-[#0f172a] rounded-2xl text-xs font-black shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-3 uppercase tracking-widest"
                      >
                        <i className="fas fa-sync-alt"></i> Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-10 lg:p-14">
                  <div 
                    className="prose prose-slate max-w-none 
                      prose-table:border prose-table:border-slate-200 prose-table:rounded-2xl prose-table:overflow-hidden
                      prose-th:bg-slate-50 prose-th:p-4 prose-th:text-[11px] prose-th:font-black prose-th:uppercase prose-th:tracking-widest prose-th:text-slate-600 prose-th:border-b-2 prose-th:border-slate-200
                      prose-td:p-4 prose-td:text-sm prose-td:font-bold prose-td:text-slate-700 prose-td:border-b prose-td:border-slate-100
                      prose-tr:hover:bg-slate-50/50 transition-colors overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: getHtmlContent(analysisResult?.text || '') }} 
                  />

                  {analysisResult?.sources && analysisResult.sources.length > 0 && (
                    <div className="mt-16 pt-10 border-t-2 border-slate-50">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                        <i className="fas fa-fingerprint text-indigo-500"></i>
                        Verification Sources
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {analysisResult.sources.map((src, i) => src.web && (
                          <a 
                            key={i} 
                            href={src.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 text-xs font-black text-slate-600 rounded-2xl border border-slate-200 transition-all group"
                          >
                            <span className="truncate max-w-[200px]">{src.web.title}</span>
                            <i className="fas fa-external-link-alt text-[10px] text-slate-300 group-hover:text-indigo-500"></i>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                <div className="bg-indigo-50 w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto mb-8 rotate-12">
                  <i className="fas fa-terminal text-indigo-400 text-4xl -rotate-12"></i>
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 uppercase tracking-tighter">System Ready</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-10">Select a strategy from the combos dashboard</p>
                <button 
                  onClick={() => setActiveTab('combos')}
                  className="px-10 py-4 bg-[#0f172a] text-white rounded-[1.25rem] font-black text-xs hover:bg-indigo-600 shadow-2xl shadow-slate-300 transition-all uppercase tracking-[0.2em]"
                >
                  Browse Strategies
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Saved Analyses</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your historical market intelligence reports</p>
            </div>

            {savedAnalyses.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {savedAnalyses.map((save) => (
                  <div key={save.id} className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-black tracking-tight uppercase">{save.comboName}</h3>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Generated on {save.timestamp}</p>
                      </div>
                      <button 
                        onClick={() => deleteSavedAnalysis(save.id)}
                        className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center border border-rose-500/20"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                    <div className="p-10">
                      <div 
                        className="prose prose-slate max-w-none 
                          prose-table:border prose-table:border-slate-200 prose-table:rounded-2xl prose-table:overflow-hidden
                          prose-th:bg-slate-50 prose-th:p-4 prose-th:text-[11px] prose-th:font-black prose-th:uppercase prose-th:tracking-widest prose-th:text-slate-600 prose-th:border-b-2 prose-th:border-slate-200
                          prose-td:p-4 prose-td:text-sm prose-td:font-bold prose-td:text-slate-700 prose-td:border-b prose-td:border-slate-100
                          prose-tr:hover:bg-slate-50/50 transition-colors overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: getHtmlContent(save.text) }} 
                      />
                      
                      {save.sources && save.sources.length > 0 && (
                        <div className="mt-10 pt-8 border-t border-slate-100">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Sources</h4>
                          <div className="flex flex-wrap gap-2">
                            {save.sources.map((src, i) => src.web && (
                              <a 
                                key={i} 
                                href={src.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-slate-50 text-[10px] font-bold text-slate-600 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                              >
                                {src.web.title}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                <div className="bg-slate-50 w-28 h-28 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
                  <i className="fas fa-folder-open text-slate-300 text-4xl"></i>
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">No Saved Reports</h3>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Run an analysis and click 'Save' to see them here</p>
              </div>
            )}
          </div>
        )}

        {/* Admin Panel: Registered Users List */}
        {activeTab === 'users' && isAdmin && (
          <div className="max-w-5xl mx-auto animate-fadeIn">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/50">
              <div className="bg-rose-600 p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <i className="fas fa-users-gear"></i>
                    Administrative Access: User Registry
                  </h2>
                  <p className="text-rose-100 text-xs font-bold uppercase tracking-widest mt-2">confidential database of authorized terminal users</p>
                </div>
                <button 
                  onClick={exportUsersToCsv}
                  className="flex items-center gap-3 px-6 py-3 bg-white text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
                >
                  <i className="fas fa-file-export"></i> Export Users
                </button>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-100">
                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Index</th>
                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</th>
                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</th>
                        <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Mobile</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {getRegisteredUsers().map((user: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-xs font-black text-slate-300">{idx + 1}</td>
                          <td className="p-5 text-sm font-black text-slate-800 uppercase">{user.name}</td>
                          <td className="p-5 text-sm font-semibold text-slate-600">{user.email}</td>
                          <td className="p-5 text-sm font-mono text-indigo-600 font-bold">{user.mobile}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {getRegisteredUsers().length === 0 && (
                    <div className="p-20 text-center text-slate-400">
                      <i className="fas fa-inbox text-4xl mb-4 block opacity-20"></i>
                      <p className="font-bold uppercase tracking-widest text-xs">No users registered yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-16">
            {EXTERNAL_LINKS.map(link => (
              <a 
                key={link.name} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 bg-white hover:bg-indigo-600 text-slate-700 hover:text-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/30 transition-all group"
              >
                <i className={`fas ${link.icon} text-xl mb-3 transition-transform group-hover:scale-125`}></i>
                <span className="text-[10px] font-black uppercase tracking-widest text-center">{link.name}</span>
              </a>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-100 text-[10px] font-black text-slate-400 gap-8 uppercase tracking-[0.3em]">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-xl">
                <i className="fas fa-shield-halved text-indigo-600"></i>
              </div>
              <p>&copy; {new Date().getFullYear()} Shailu's Screener • Copy right to Shailendra Jain • Quant Edge Engine</p>
            </div>
            <div className="flex items-center gap-10">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> NSE LIVE</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> GEMINI FLASH 3.0</span>
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        .prose table {
          display: block;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .prose thead th {
          white-space: nowrap;
          background-color: #f1f5f9 !important;
        }
        .prose tbody td {
          white-space: nowrap;
        }
        .prose tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        .prose div::-webkit-scrollbar {
          height: 6px;
        }
        .prose div::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .prose div::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .prose div::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .prose tr.highlight-row {
          background-color: #fffbeb !important; /* amber-50 */
          border-left: 4px solid #f59e0b !important; /* amber-500 */
        }
        .prose tr.highlight-row td {
          color: #92400e !important; /* amber-900 */
        }
        .prose tr.highlight-row td a {
          color: #b45309 !important; /* amber-700 */
          text-decoration-color: #f59e0b !important; /* amber-500 */
        }
        .prose tr.highlight-row td a:hover {
          color: #78350f !important; /* amber-800 */
        }
      `}} />
    </div>
  );
};

export default App;
