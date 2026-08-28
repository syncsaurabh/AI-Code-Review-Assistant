import React, { useState, useEffect } from 'react';
import './App.css';

interface CodeReviewIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'bug' | 'security' | 'performance' | 'code-quality' | 'maintainability' | 'best-practice';
  title: string;
  description: string;
  line: number | null;
  suggestion: string;
}

interface ReviewResponse {
  score: number;
  summary: string;
  issues: CodeReviewIssue[];
  security: CodeReviewIssue[];
  performance: CodeReviewIssue[];
  best_practices: CodeReviewIssue[];
  improved_code: string;
}

interface LanguagePreset {
  id: string;
  name: string;
  sampleCode: string;
}

const LANGUAGE_PRESETS: LanguagePreset[] = [
  {
    id: 'python',
    name: 'Python',
    sampleCode: `def getUserData(userId):\n    # Security issue: hardcoded API token\n    token = "secret-token-xyz123"\n    \n    # Security issue: potential SQL Injection\n    query = "SELECT * FROM users WHERE id = '" + userId + "'"\n    print(f"Executing database query: {query}")\n    \n    # Performance issue: inefficient nested loops\n    results = []\n    for i in range(1000):\n        for j in range(100):\n            results.append(i * j)\n            \n    return results`
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    sampleCode: `function processUser(userData) {\n  // Security: hardcoded secrets\n  var secretKey = "supersecret123";\n  \n  // Security: SQL injection hazard\n  var sql = "SELECT * FROM accounts WHERE email = '" + userData.email + "'";\n  \n  // Security & Performance: eval usage\n  eval("console.log('Processing user ' + userData.name)");\n  \n  // Performance: duplicate work in loop\n  for (var i = 0; i < 10000; i++) {\n    var len = userData.items.length;\n    for (var j = 0; j < len; j++) {\n      // do some operations\n    }\n  }\n  \n  return { sql: sql };\n}`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    sampleCode: `// Type safety: any everywhere, no safety\nfunction checkAccess(user: any): any {\n  // Security: Hardcoded credential\n  const superAdminKey = "ADMIN_API_KEY_999";\n  \n  if (user.role === 'admin' || user.token === superAdminKey) {\n    // Best practice: unsafe console log\n    console.log("AUTHORIZED ACCESS FOR USER: " + JSON.stringify(user));\n    return true;\n  }\n  \n  return false;\n}`
  },
  {
    id: 'java',
    name: 'Java',
    sampleCode: `public class UserManager {\n    // Security: Hardcoded password\n    private static final String DB_PASS = "DbPassword456!";\n    \n    public void saveUser(String name, String password) {\n        // Security: logging raw sensitive data\n        System.out.println("Saving user: " + name + " with pass: " + password);\n        \n        // Performance: unnecessary string concatenation in loop\n        String logMsg = "";\n        for (int i = 0; i < 500; i++) {\n            logMsg += "UserItem-" + i + ", ";\n        }\n    }\n}`
  },
  {
    id: 'c++',
    name: 'C++',
    sampleCode: `#include <iostream>\n#include <cstring>\n\nvoid handleInput(char* userInput) {\n    // Security: Buffer overflow risk\n    char buffer[50];\n    strcpy(buffer, userInput);\n    \n    // Bug/Safety: Unused variable and pointer leak\n    int* rawPointer = new int(100);\n    \n    std::cout << "Buffer: " << buffer << std::endl;\n    // Missing delete rawPointer -> Memory leak!\n}`
  },
  {
    id: 'go',
    name: 'Go',
    sampleCode: `package main\n\nimport "fmt"\n\nfunc processRecords(records []string) {\n    // Performance: re-slicing causing allocations\n    // Best practice: shadowing variables\n    for i, r := range records {\n        go func() {\n            // Bug: Goroutine captures loop variable 'r'\n            fmt.Println("Processing record:", r)\n        }()\n    }\n}`
  }
];

export default function App() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [reviewResult, setReviewResult] = useState<ReviewResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<{ title: string; desc: string } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'issues' | 'code'>('issues');
  const [activeFilter, setActiveFilter] = useState<'all' | 'security' | 'performance' | 'best_practices'>('all');
  const [expandedIssues, setExpandedIssues] = useState<{ [key: number]: boolean }>({});
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const preset = LANGUAGE_PRESETS.find(p => p.id === language);
    if (preset) {
      setCode(preset.sampleCode);
    }
  }, [language]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep(step => {
          if (step < 3) return step + 1;
          return step;
        });
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setReviewResult(null);
    setErrorMsg(null);
    setActiveFilter('all');
    setExpandedIssues({});

    try {
      const response = await fetch('http://localhost:8000/api/v1/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 412) {
          throw {
            title: 'Gemini Configuration Error',
            desc: data.detail || 'Your Gemini API key is missing or invalid. Please check backend/.env file.'
          };
        } else if (response.status === 422) {
          throw {
            title: 'Code Validation Error',
            desc: data.detail?.[0]?.msg || 'Your code could not be verified by the backend. Ensure it is correct.'
          };
        } else {
          throw {
            title: 'Code Analysis Failed',
            desc: data.detail || 'The server encountered an issue while reviewing your code.'
          };
        }
      }

      setReviewResult(data);
      setActiveTab('issues');
    } catch (err: any) {
      if (err.title) {
        setErrorMsg(err);
      } else {
        setErrorMsg({
          title: 'Connection Refused',
          desc: 'Could not reach the backend code reviewer. Make sure your FastAPI backend is running on port 8000.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!reviewResult) return;
    navigator.clipboard.writeText(reviewResult.improved_code);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const toggleIssueExpand = (index: number) => {
    setExpandedIssues(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getFilteredIssues = (): CodeReviewIssue[] => {
    if (!reviewResult) return [];
    
    let list: CodeReviewIssue[] = [...reviewResult.issues];

    list = [...list, ...reviewResult.security, ...reviewResult.performance, ...reviewResult.best_practices];

    if (activeFilter === 'security') {
      return list.filter(i => i.category === 'security');
    } else if (activeFilter === 'performance') {
      return list.filter(i => i.category === 'performance');
    } else if (activeFilter === 'best_practices') {
      return list.filter(i => i.category === 'best-practice' || i.category === 'code-quality');
    }

    return list;
  };

  const filteredIssues = getFilteredIssues();

  const score = reviewResult?.score || 0;
  const strokeDashoffset = 220 - (220 * score) / 100;
  
  const getScoreColor = (val: number) => {
    if (val >= 80) return '#10b981';
    if (val >= 50) return '#eab308';
    return '#f43f5e';
  };

  return (
    <>
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">C</div>
          <span className="logo-text">AI Code Reviewer</span>
        </div>
      </header>

      <main className="app-container">
        
        <div className="panel">
          <div className="panel-title">
            <span>Source Code Input</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Provide your script below
            </span>
          </div>

          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="editor-controls">
              <div className="select-wrapper">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="custom-select"
                  disabled={loading}
                >
                  {LANGUAGE_PRESETS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  <>
                    <span className="connected-pulse" style={{ backgroundColor: 'white' }}></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Review Code
                  </>
                )}
              </button>
            </div>

            <div className="editor-container">
              <div className="editor-line-numbers">
                {code.split('\n').map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your source code here..."
                className="editor-textarea"
                disabled={loading}
              />
            </div>
          </form>
        </div>

        <div className="panel">
          <div className="panel-title">Analysis & Feedback</div>

          {!loading && !reviewResult && !errorMsg && (
            <div className="empty-state">
              <div className="empty-state-icon">🤖</div>
              <h3 className="empty-state-title">Ready for Review</h3>
              <p className="empty-state-desc">
                Select your programming language, paste your code, and run the analysis to receive suggestions, security scans, and improved code.
              </p>
            </div>
          )}

          {loading && (
            <div className="loading-container">
              <div className="spinner-ring"></div>
              <h3 className="loading-title">Analyzing Code Quality</h3>
              <div className="loading-steps">
                <div className={`loading-step ${loadingStep === 1 ? 'active' : loadingStep > 1 ? 'completed' : ''}`}>
                  <span className="step-indicator">{loadingStep > 1 ? '✓' : '1'}</span>
                  <span>Connecting to Gemini LLM...</span>
                </div>
                <div className={`loading-step ${loadingStep === 2 ? 'active' : loadingStep > 2 ? 'completed' : ''}`}>
                  <span className="step-indicator">{loadingStep > 2 ? '✓' : '2'}</span>
                  <span>Scanning bugs & vulnerabilities...</span>
                </div>
                <div className={`loading-step ${loadingStep === 3 ? 'active' : ''}`}>
                  <span className="step-indicator">3</span>
                  <span>Refactoring code optimizations...</span>
                </div>
              </div>
            </div>
          )}

          {!loading && errorMsg && (
            <div className="results-container">
              <div className="error-card">
                <span className="error-icon">⚠️</span>
                <div>
                  <h4 className="error-title">{errorMsg.title}</h4>
                  <p className="error-desc">{errorMsg.desc}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && reviewResult && (
            <div className="results-container">
              
              <div className="dashboard-header">
                <div className="score-circle-container">
                  <svg className="score-circle" viewBox="0 0 80 80">
                    <circle className="score-circle-bg" cx="40" cy="40" r="35" />
                    <circle
                      className="score-circle-val"
                      cx="40"
                      cy="40"
                      r="35"
                      stroke={getScoreColor(score)}
                      strokeDasharray="220"
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="score-text">
                    <span className="score-num">{score}</span>
                    <span className="score-lbl">Score</span>
                  </div>
                </div>

                <div className="dashboard-summary-text">
                  <h4 className="dashboard-summary-title">Quality Rating</h4>
                  <p className="dashboard-summary-desc">{reviewResult.summary}</p>
                </div>
              </div>

              <div className="filters-grid">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`filter-btn issues-btn ${activeFilter === 'all' ? 'active' : ''}`}
                >
                  <span className="filter-count">
                    {reviewResult.issues.length + reviewResult.security.length + reviewResult.performance.length + reviewResult.best_practices.length}
                  </span>
                  <span className="filter-lbl">All Findings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('security')}
                  className={`filter-btn security-btn ${activeFilter === 'security' ? 'active' : ''}`}
                >
                  <span className="filter-count">{reviewResult.security.length}</span>
                  <span className="filter-lbl">Security</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('performance')}
                  className={`filter-btn performance-btn ${activeFilter === 'performance' ? 'active' : ''}`}
                >
                  <span className="filter-count">{reviewResult.performance.length}</span>
                  <span className="filter-lbl">Performance</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveFilter('best_practices')}
                  className={`filter-btn best-practices-btn ${activeFilter === 'best_practices' ? 'active' : ''}`}
                >
                  <span className="filter-count">{reviewResult.best_practices.length}</span>
                  <span className="filter-lbl">Best Practices</span>
                </button>
              </div>

              <div className="tabs-container">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'issues' ? 'active' : ''}`}
                  onClick={() => setActiveTab('issues')}
                >
                  Findings ({filteredIssues.length})
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`}
                  onClick={() => setActiveTab('code')}
                >
                  Refactored Code
                </button>
              </div>

              {activeTab === 'issues' ? (
                <div className="issues-list">
                  {filteredIssues.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      No findings found for this category!
                    </div>
                  ) : (
                    filteredIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`issue-card ${expandedIssues[idx] ? 'expanded' : ''}`}
                      >
                        <div className="issue-card-header" onClick={() => toggleIssueExpand(idx)}>
                          <div className="issue-card-title-group">
                            <span className={`severity-badge ${issue.severity}`}>
                              {issue.severity}
                            </span>
                            <span className="issue-title">{issue.title}</span>
                          </div>
                          
                          <div className="issue-card-meta">
                            {issue.line && (
                              <span className="line-indicator">Line {issue.line}</span>
                            )}
                            <span className="arrow-toggle">▼</span>
                          </div>
                        </div>

                        <div className="issue-card-body">
                          <p className="issue-desc">{issue.description}</p>
                          <div className="suggestion-box">
                            <h5 className="suggestion-lbl">Suggestion</h5>
                            <div className="suggestion-code">{issue.suggestion}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="improved-code-container">
                  <div className="improved-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={handleCopyCode}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                      Copy Improved Code
                    </button>
                  </div>

                  <div className="code-viewer-panel">
                    <pre><code>{reviewResult.improved_code}</code></pre>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

      <div className={`copy-toast ${showToast ? 'show' : ''}`}>
        ✓ Code copied to clipboard!
      </div>
    </>
  );
}
