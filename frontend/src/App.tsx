import { Component } from 'react';
import './App.css';
import { ApiService } from './api';

interface State {
  isLoggedIn: boolean;
  isRegistering: boolean;
  email: string;
  password: string;
  name: string;
  charities: any[];
  selectedCharity: string;
  scores: number[];
  newScore: string;
  error: string | null;
  userRole: string;
  activeSubscription: any;
  simulatedDraw: any;
  isAnimatingHoleInOne: boolean;
  winners: any[];
  myWinnings: any[];
  showAuth: boolean;
  allUsers: any[];
  analytics: any;
  newCharityName: string;
  newCharityDesc: string;
}

export default class App extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      showAuth: false,
      isLoggedIn: false,
      isRegistering: false,
      email: '',
      password: '',
      name: '',
      charities: [],
      selectedCharity: '',
      scores: [],
      newScore: '',
      error: null,
      userRole: 'User',
      activeSubscription: null,
      simulatedDraw: null,
      isAnimatingHoleInOne: false,
      winners: [],
      myWinnings: [],
      allUsers: [],
      analytics: null,
      newCharityName: '',
      newCharityDesc: ''
    };
  }

  async componentDidMount() {
    this.loadCharities();
  }

  loadCharities = async () => {
    try {
      const data = await ApiService.getCharities();
      this.setState({ charities: data || [] });
      if (data && data.length > 0) {
        this.setState({ selectedCharity: data[0]._id });
      }
    } catch (e) {
      console.error('Failed to load charities');
    }
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [e.target.name]: e.target.value } as any);
  };

  handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ error: null });
    const { isRegistering, email, password, name, selectedCharity } = this.state;
    try {
      let data;
      if (isRegistering) {
        data = await ApiService.register(name, email, password, selectedCharity);
      } else {
        data = await ApiService.login(email, password);
      }

      this.setState({
        isLoggedIn: true,
        userRole: data?.user?.role || 'User',
        selectedCharity: data?.user?.selectedCharity || selectedCharity,
      });

      if (data?.user?.role === 'Admin') {
        this.loadAllWinners();
        this.loadAdminData();
      } else {
        this.loadSubscription();
        this.loadScores();
        this.loadMyWinnings();
      }
    } catch (err: any) {
      this.setState({ error: err.message });
    }
  };

  loadAdminData = async () => {
    try {
      const [users, stats] = await Promise.all([
        ApiService.getAllUsers(),
        ApiService.getAnalytics()
      ]);
      this.setState({ allUsers: users || [], analytics: stats });
    } catch (e) { console.error('Admin API error', e); }
  }

  loadSubscription = async () => {
    try {
      const sub = await ApiService.getMySubscription();
      this.setState({ activeSubscription: sub });
    } catch (err: any) {
      this.setState({ activeSubscription: null });
    }
  };

  handleSubscribe = async (planType: string) => {
    try {
      await ApiService.subscribe(planType);
      this.loadSubscription();
    } catch (err: any) {
      this.setState({ error: err.message });
    }
  };

  loadScores = async () => {
    try {
      const data = await ApiService.getScores();
      this.setState({ scores: data.scores || [] });
    } catch (err: any) {
      // Ignored if they have no subscription
    }
  };

  handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    this.setState({ error: null });
    const parsedScore = parseInt(this.state.newScore) || 18;
    if (isNaN(parsedScore)) return;

    this.setState({ isAnimatingHoleInOne: parsedScore as any });
    
    setTimeout(async () => {
      this.setState({ isAnimatingHoleInOne: false });
      await this.submitScore(parsedScore);
    }, 3500); // Wait for the animation to finish
  };

  submitScore = async (parsedScore: number) => {
    try {
      await ApiService.addScore(parsedScore);
      this.setState({ newScore: '' });
      this.loadScores();
    } catch (err: any) {
      this.setState({ error: err.message });
    }
  }

  loadAllWinners = async () => {
    try {
      const data = await ApiService.getWinners();
      this.setState({ winners: data || [] });
    } catch (e) { console.error(e) }
  }

  loadMyWinnings = async () => {
    try {
      const data = await ApiService.getMyWinnings();
      this.setState({ myWinnings: data || [] });
    } catch (e) { console.error(e) }
  }

  handleVerifyWinner = async (id: string, status: string) => {
    try {
      await ApiService.verifyWinner(id, status);
      this.loadAllWinners();
    } catch (err: any) { alert(err.message) }
  }

  handleUploadProof = async (id: string) => {
    try {
      // Mocking an image upload by sending a dummy URL string
      await ApiService.uploadProof(id, 'https://dummyimage.com/600x400/0b552d/fff&text=Score+Card+Proof');
      alert('Proof uploaded successfully! Waiting for Admin approval.');
      this.loadMyWinnings();
    } catch (err: any) { alert(err.message) }
  }

  handleSimulate = async () => {
    try {
      this.setState({ error: null });
      const sim = await ApiService.simulateDraw('March 2026');
      this.setState({ simulatedDraw: sim });
    } catch(err: any) { this.setState({ error: err.message }) }
  }

  handleRunDraw = async () => {
     try {
       this.setState({ error: null });
       await ApiService.runDraw('March 2026');
       alert('Draw successfully published!');
       this.setState({ simulatedDraw: null });
     } catch(err: any) { this.setState({ error: err.message }) }
  }

  handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createCharity(this.state.newCharityName, this.state.newCharityDesc);
      this.setState({ newCharityName: '', newCharityDesc: '' });
      this.loadCharities();
    } catch (err: any) { alert(err.message) }
  }

  handleDeleteCharity = async (id: string) => {
    if (!window.confirm("Delete this charity?")) return;
    try {
      await ApiService.deleteCharity(id);
      this.loadCharities();
    } catch (err: any) { alert(err.message) }
  }

  renderAuth() {
    const { isRegistering, name, email, password, error, charities, selectedCharity } = this.state;
    return (
      <div className="auth-card">
        <h2>{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={this.handleAuthSubmit}>
          {isRegistering && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={name}
              onChange={this.handleInputChange}
              required
            />
          )}
          {isRegistering && charities.length > 0 && (
            <select
              name="selectedCharity"
              value={selectedCharity}
              onChange={(e: any) => this.setState({ selectedCharity: e.target.value })}
              required
              className="select-input"
            >
              {charities.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={email}
            onChange={this.handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={this.handleInputChange}
            required
          />
          <button type="submit" className="btn-primary">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <p className="toggle-text" onClick={() => this.setState({ isRegistering: !isRegistering, error: null })}>
          {isRegistering ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </p>
      </div>
    );
  }

  renderSubscriptionPanel() {
    const { error } = this.state;
    return (
      <div className="dashboard-card">
        <h2>Choose a Plan</h2>
        <p className="subtitle">Subscribe to track scores and participate in monthly charity draws!</p>
        {error && <p className="error">{error}</p>}
        <button className="btn-primary" onClick={() => this.handleSubscribe('Monthly')}>$50 / Month</button>
        <button className="btn-primary" style={{marginTop: '1rem'}} onClick={() => this.handleSubscribe('Yearly')}>$500 / Year (Save $100!)</button>
        <button className="btn-secondary" onClick={() => this.setState({ isLoggedIn: false, activeSubscription: null, scores: [] })}>Log Out</button>
      </div>
    );
  }

  renderAdminPanel() {
    const { simulatedDraw, error, winners, analytics } = this.state;
    return (
      <div className="dashboard-card" style={{ maxWidth: '800px' }}>
        <h2>Admin Dashboard</h2>
        <p className="subtitle" style={{marginBottom: '2rem'}}>Manage users, run simulated draws, and view platform metrics.</p>
        {error && <p className="error">{error}</p>}
        
        {analytics && (
          <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="step-card" style={{padding: '1.5rem'}}><h3>{analytics.totalUsers}</h3><p>Total Users</p></div>
            <div className="step-card" style={{padding: '1.5rem'}}><h3>{analytics.activeSubs}</h3><p>Active Subs</p></div>
            <div className="step-card" style={{padding: '1.5rem'}}><h3>${analytics.totalPrizePool.toFixed(2)}</h3><p>Prize Pools</p></div>
            <div className="step-card" style={{padding: '1.5rem'}}><h3>${analytics.totalCharityContributions.toFixed(2)}</h3><p>Charity Given</p></div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', textAlign: 'left' }}>
          <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h3>Registered Users ({this.state.allUsers.length})</h3>
            <ul style={{ maxHeight: '300px', overflowY: 'auto', listStyle: 'none', padding: 0, marginTop: '1rem' }}>
              {this.state.allUsers.map((u: any) => (
                <li key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 0' }}>
                  <strong>{u.name}</strong> ({u.email})<br/>
                  <small style={{ color: u.activeSubscription ? 'var(--secondary)' : 'var(--error)' }}>
                    {u.activeSubscription ? 'PRO Active' : 'No Sub'} - Supporting: {u.selectedCharity?.name || 'None'}
                  </small>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <h3>Manage Charities</h3>
            <form onSubmit={this.handleCreateCharity} style={{ marginBottom: '1.5rem' }}>
              <input type="text" name="newCharityName" placeholder="Charity Name" value={this.state.newCharityName} onChange={this.handleInputChange} required />
              <input type="text" name="newCharityDesc" placeholder="Description" value={this.state.newCharityDesc} onChange={this.handleInputChange} required />
              <button type="submit" className="btn-primary" style={{ padding: '0.8rem', fontSize: '1rem' }}>Add Charity</button>
            </form>
            <ul style={{ maxHeight: '200px', overflowY: 'auto', listStyle: 'none', padding: 0 }}>
              {this.state.charities.map((c: any) => (
                <li key={c._id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 0' }}>
                  <span>{c.name}</span>
                  <button onClick={() => this.handleDeleteCharity(c._id)} style={{ background: 'transparent', color: 'var(--error)', border: 'none', cursor: 'pointer' }}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 style={{ textAlign: 'left', marginBottom: '1rem' }}>Draw Execution System</h3>
        <button className="btn-primary" onClick={this.handleSimulate} style={{ width: '100%' }}>Simulate Next Monthly Draw</button>
        {simulatedDraw && (
           <div style={{ textAlign: 'left', marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
             <p><strong>Total Pool:</strong> ${simulatedDraw.totalPool.toFixed(2)}</p>
             <p><strong>Numbers:</strong> {simulatedDraw.winNumbersArr.join(', ')}</p>
             <hr style={{margin: '1rem 0', borderColor: '#e2e8f0'}}/>
             <p><strong>Jackpot Winners (40%):</strong> {simulatedDraw.match5Count} user(s) - Win: ${simulatedDraw.match5PrizePerUser.toFixed(2)}</p>
             <p><strong>4 Matches (35%):</strong> {simulatedDraw.match4Count} user(s) - Win: ${simulatedDraw.match4PrizePerUser.toFixed(2)}</p>
             <button className="btn-primary" style={{background: 'var(--secondary)', color: 'white', marginTop: '1.5rem'}} onClick={this.handleRunDraw}>PUBLISH DRAW RESULTS</button>
           </div>
        )}

        {winners && winners.length > 0 && (
          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1rem' }}>Winner Verifications</h3>
            {winners.map((w: any) => (
              <div key={w._id} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid var(--secondary)' }}>
                <p><strong>User:</strong> {w.user?.name} ({w.user?.email})</p>
                <p><strong>Prize:</strong> ${w.prizeAmount.toFixed(2)} ({w.matches} Matches)</p>
                <p><strong>Status:</strong> {w.paymentStatus}</p>
                {w.proofImage && <p style={{marginTop: '0.8rem'}}><a href={w.proofImage} target="_blank" rel="noreferrer" style={{color: 'var(--primary)', fontWeight: 'bold'}}>View Proof Scorecard</a></p>}
                
                {w.paymentStatus === 'Pending Approval' && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button className="btn-primary" style={{ marginTop: 0, padding: '0.5rem 1rem' }} onClick={() => this.handleVerifyWinner(w._id, 'Approved')}>Approve Payment</button>
                    <button className="btn-secondary" style={{ marginTop: 0, padding: '0.5rem 1rem', borderColor: 'var(--error)', color: 'var(--error)' }} onClick={() => this.handleVerifyWinner(w._id, 'Rejected')}>Reject Proof</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button className="btn-secondary" onClick={() => this.setState({ isLoggedIn: false })}>Log Out</button>
      </div>
    );
  }

  renderDashboard() {
    const { scores, newScore, error, activeSubscription, userRole, isAnimatingHoleInOne, myWinnings } = this.state;

    if (userRole === 'Admin') return this.renderAdminPanel();
    if (!activeSubscription) return this.renderSubscriptionPanel();

    // Calculate a factor from 0.0 to 1.0 for the distance interpolation
    const flyFactor = isAnimatingHoleInOne ? ((isAnimatingHoleInOne as any as number) / 45) : 1;
    const scoreVal = isAnimatingHoleInOne ? (isAnimatingHoleInOne as any as number) : 0;

    let shotText = "NICE SWING!";
    if (scoreVal === 45) shotText = "HOLE IN ONE!";
    else if (scoreVal >= 40) shotText = "ALMOST IN THE HOLE!";
    else if (scoreVal >= 30) shotText = "GREAT DRIVE!";
    else if (scoreVal >= 20) shotText = "SOLID SHOT!";
    else if (scoreVal >= 10) shotText = "FAIRWAY HIT!";
    else if (scoreVal > 0) shotText = "ROUGH START...";

    return (
      <div className="dashboard-card">
        {isAnimatingHoleInOne !== false && (
          <div className="animation-overlay" style={{ '--fly-factor': flyFactor } as any}>
            <div className="golf-scene">
              <div className="stick">🏌️</div>
              <div className="ball">⚪</div>
              <div className="hole">⛳</div>
            </div>
            {scoreVal === 45 ? 
              <h1 className="hole-in-one-text">HOLE IN ONE!</h1> : 
              <h1 className="nice-swing-text">{shotText}</h1>
            }
          </div>
        )}

        <h2>Your Golf Dashboard</h2>
        <p className="subtitle" style={{color: 'var(--primary-container)'}}>
          <strong>Status: Active PRO Member</strong>
        </p>

        {error && <p className="error">{error}</p>}

        {/* Phase 3: Charity & Contribution Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', margin: '1.5rem 0' }}>
          <div className="step-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Your Supported Charity</h3>
            {this.state.charities.find((c: any) => c._id === this.state.selectedCharity)
              ? <>
                  <strong style={{ fontSize: '1.1rem', color: 'white' }}>
                    {this.state.charities.find((c: any) => c._id === this.state.selectedCharity)?.name}
                  </strong>
                  <p style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                    {this.state.charities.find((c: any) => c._id === this.state.selectedCharity)?.description}
                  </p>
                </>
              : <p style={{ color: '#94a3b8' }}>No charity linked</p>
            }
            <select
              value={this.state.selectedCharity}
              onChange={async (e) => {
                const id = e.target.value;
                this.setState({ selectedCharity: id });
                try { await ApiService.selectCharity(id); } catch (err) { console.error(err); }
              }}
              style={{ marginTop: '0.8rem', width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0b3a20', color: 'white', border: '1px solid rgba(212,175,55,0.4)', fontSize: '0.95rem', cursor: 'pointer' }}
            >
              {this.state.charities.map((c: any) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="step-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--secondary)', marginBottom: '0.5rem' }}>Your Contribution</h3>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: 'white', margin: '0.2rem 0' }}>10%</p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>of your subscription fee goes directly to your chosen charity</p>
            <p style={{ marginTop: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
              {scores.length} draw ticket{scores.length !== 1 ? 's' : ''} active this month
            </p>
          </div>
        </div>

        <div className="draw-explanation">
          <h3>Lucky Draw & Charity</h3>
          <p>
            Welcome to the Charity Draw! When you subscribe, <strong>50% of your fee goes into the Prize Pool</strong>, and the rest supports your Charity.<br/><br/> Every time you submit a game, your scores between <strong>1 - 45</strong> act as your "lottery tickets"! At the end of the month, 5 lucky numbers are drawn. Match all 5 to hit the <strong>40% Grand Jackpot</strong>!
          </p>
        </div>

        <div className="scores-section">
          <h3>Your Last 5 Scores</h3>
          {scores.length === 0 ? (
            <p>No scores submitted yet.</p>
          ) : (
            <ul className="score-list">
              {scores.map((s, i) => (
                <li key={i} className="score-item">
                  {i === 0 ? <span className="badge-new">Newest Score</span> : <span className="badge-old">Past Game</span>}
                  <strong>{s}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        {myWinnings && myWinnings.length > 0 && (
          <div className="scores-section" style={{ marginTop: '2rem' }}>
            <h3>🏆 Your Prizes</h3>
            {myWinnings.map((w: any) => (
              <div key={w._id} className="score-item" style={{ flexDirection: 'column', alignItems: 'flex-start', borderLeftColor: 'gold' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <strong>Won ${w.prizeAmount.toFixed(2)}</strong>
                  <span className="badge-new" style={{ background: w.paymentStatus === 'Approved' ? 'var(--secondary)' : '#6b7280' }}>
                    {w.paymentStatus}
                  </span>
                </div>
                {w.paymentStatus === 'Pending Proof' && (
                  <button className="btn-primary" style={{ padding: '0.8rem', marginTop: '1.2rem', fontSize: '1.1rem' }} onClick={() => this.handleUploadProof(w._id)}>
                    Upload Scorecard Proof
                  </button>
                )}
                {w.paymentStatus === 'Pending Approval' && (
                  <p style={{marginTop: '1rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem'}}>Proof Submitted. Pending Review...</p>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={this.handleAddScore} className="add-score-form" style={{ marginTop: '2rem' }}>
          <h3 style={{marginBottom: '1rem'}}>Dial In Your Score</h3>
          <div className="slider-container">
            <span className="slider-value">{newScore || 18}</span>
            <input
              type="range"
              name="newScore"
              value={newScore || 18}
              onChange={this.handleInputChange}
              required
              min="1"
              max="45"
              className="interactive-slider"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem' }}>Lock In Score</button>
        </form>

        <button className="btn-secondary" onClick={() => this.setState({ isLoggedIn: false, activeSubscription: null, scores: [] })}>
          Log Out
        </button>
      </div>
    );
  }

  renderLandingPage() {
    const { charities } = this.state;
    return (
      <div className="landing-page">
        <div className="hero-section">
          <h1 className="hero-title">Play With Purpose.</h1>
          <p className="hero-subtitle">
            Turn your passion for golf into real-world impact. Join our premium subscription platform, track your scores, and automatically fund world-changing charities. 
          </p>
          <button className="btn-primary cta-btn" onClick={() => this.setState({ showAuth: true, isRegistering: true })}>
            Subscribe & Start Giving
          </button>
          <button className="btn-secondary cta-alt-btn" onClick={() => this.setState({ showAuth: true, isRegistering: false })}>
            Member Login
          </button>
        </div>

        <div className="how-it-works-section">
          <h2 style={{ color: '#d4af37', textShadow: '0 0 20px rgba(212,175,55,0.6)', fontSize: '2.8rem', textAlign: 'center', marginBottom: '3rem', fontFamily: 'Playfair Display, serif' }}>
            How It Works
          </h2>
          <div className="steps-grid">
            <div className="step-card">
              <h3 style={{ color: '#d4af37' }}>1. Subscribe</h3>
              <p>Join the platform. A minimum of 10% of your membership goes directly to your chosen charity.</p>
            </div>
            <div className="step-card">
              <h3 style={{ color: '#d4af37' }}>2. Play & Track</h3>
              <p>Log your golf scores (1-45). Your last 5 scores act as your monthly lucky numbers.</p>
            </div>
            <div className="step-card">
              <h3 style={{ color: '#d4af37' }}>3. The Monthly Draw</h3>
              <p>50% of all subscriptions form a Prize Pool. Match the drawn numbers to win big!</p>
            </div>
          </div>
        </div>

        {charities && charities.length > 0 && (
          <div className="charities-preview">
            <h2 style={{ color: '#d4af37', textShadow: '0 0 20px rgba(212,175,55,0.6)', fontSize: '2.8rem', textAlign: 'center', marginBottom: '0.5rem', fontFamily: 'Playfair Display, serif' }}>
              Supported Causes
            </h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
              Golf causes you support by being a member of our platform.
            </p>
            <div className="charity-grid">
              {charities.map((c: any) => (
                <div
                  key={c._id}
                  className="charity-card-public"
                  style={{
                    cursor: 'default',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                >
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  goToLanding = () => {
    this.setState({ showAuth: false, isLoggedIn: false, activeSubscription: null, scores: [] });
  }

  render() {
    const { isLoggedIn, showAuth } = this.state;
    const showHomeBtn = isLoggedIn || showAuth;

    return (
      <div className="app-container">
        <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.2rem 2.5rem' }}>
          <h1 style={{ margin: 0, cursor: 'pointer', fontSize: '1.8rem', letterSpacing: '3px' }} onClick={this.goToLanding}>
            Golf Charity Platform
          </h1>
          {showHomeBtn && (
            <button
              onClick={this.goToLanding}
              style={{
                background: 'rgba(212,175,55,0.15)',
                border: '2px solid var(--secondary)',
                borderRadius: '8px',
                color: 'var(--secondary)',
                padding: '0.5rem 1.2rem',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                letterSpacing: '1px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(212,175,55,0.15)')}
            >
              Home
            </button>
          )}
        </header>
        <main className="main-content">
          {isLoggedIn
            ? this.renderDashboard()
            : showAuth
              ? this.renderAuth()
              : this.renderLandingPage()
          }
        </main>
      </div>
    );
  }
}
