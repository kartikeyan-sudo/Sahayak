import { useState, useEffect } from 'react';
import { sessionStorage, activityStorage } from '../utils/localStorage';
import './Login.css';

function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [credentials, setCredentials] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    name: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if session already exists
    if (sessionStorage.isActive()) {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isRegistering) {
      // Registration validation
      if (!credentials.name || credentials.name.length < 2) {
        setError('Please enter your full name');
        setIsLoading(false);
        return;
      }
      if (!credentials.email || !/\S+@\S+\.\S+/.test(credentials.email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }
      if (!credentials.phone || !/^[0-9]{10}$/.test(credentials.phone)) {
        setError('Please enter a valid 10-digit phone number');
        setIsLoading(false);
        return;
      }
      if (credentials.password !== credentials.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      if (credentials.password.length < 6) {
        setError('Password must be at least 6 characters');
        setIsLoading(false);
        return;
      }
      
      // Save user to localStorage (demo)
      localStorage.setItem('sahayak_user_' + credentials.username, JSON.stringify({
        username: credentials.username,
        password: credentials.password,
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone
      }));
      
      setTimeout(() => {
        setIsLoading(false);
        setIsRegistering(false);
        setCredentials({ username: '', password: '', confirmPassword: '', name: '', email: '', phone: '' });
        alert('Account created successfully! Please login.');
      }, 800);
    } else {
      // Login logic
      const storedUser = localStorage.getItem('sahayak_user_' + credentials.username);
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.password === credentials.password) {
          const sessionData = {
            userId: credentials.username,
            username: credentials.username,
            name: user.name || credentials.username,
            loginTime: new Date().toISOString(),
            isActive: true
          };
          
          sessionStorage.set(sessionData);
          activityStorage.add({ type: 'login', description: 'Session started' });
          
          setTimeout(() => {
            setIsLoading(false);
            onLoginSuccess();
          }, 800);
          return;
        }
      }
      
      // Demo credentials
      if (credentials.username === 'sahayak' && credentials.password === 'sahayak2026') {
        const sessionData = {
          userId: 'demo-user',
          username: credentials.username,
          loginTime: new Date().toISOString(),
          isActive: true
        };
        
        sessionStorage.set(sessionData);
        activityStorage.add({ type: 'login', description: 'Session started' });
        
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess();
        }, 800);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setError('Invalid credentials');
        }, 800);
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sahayak</h1>
          <p className="tagline">Scam Prevention & Policy Navigator</p>
          <div className="dev-notice">
            <p>Preview Access • Under Development</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegistering && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={credentials.name}
                onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                placeholder="Enter your full name"
                required
                autoFocus
              />
            </div>
          )}

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
          )}

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={credentials.phone}
                onChange={(e) => setCredentials({ ...credentials, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="Enter 10-digit phone number"
                required
                maxLength="10"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Enter username"
              required
              autoFocus={!isRegistering}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Enter password"
              required
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={credentials.confirmPassword}
                onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Login')}
          </button>

          <div className="toggle-mode">
            <button 
              type="button"
              className="toggle-link"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setCredentials({ username: '', password: '', confirmPassword: '', name: '', email: '', phone: '' });
              }}
            >
              {isRegistering ? 'Already have an account? Login' : 'Create new account'}
            </button>
          </div>

          {!isRegistering && (
            <div className="demo-hint">
              <p><strong>Demo Credentials:</strong></p>
              <p>Username: <code>sahayak</code> | Password: <code>sahayak2026</code></p>
            </div>
          )}
        </form>

        <div className="login-footer">
          <p className="privacy-note">
            Privacy-First Design • All data stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
