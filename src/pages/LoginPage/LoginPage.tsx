import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthApi } from '../../hooks/useAuthApi';
import { 
  Visibility, 
  VisibilityOff, 
  Error as ErrorIcon 
} from '@mui/icons-material';
import { Card } from '../../components/common/Card/Card';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import { Checkbox } from '../../components/common/Checkbox/Checkbox';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loading: isSubmitting, loginUser } = useAuthApi();

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setErrorMsg('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  const validateEmail = (val: string) => {
    if (!val) return 'Please enter your email.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Enter a valid email address.';
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Enter your password.';
    if (val.length < 8 || val.length > 20) return 'Password must be between 8 and 20 characters.';
    return null;
  };

  const emailError = emailTouched ? validateEmail(email) : null;
  const passwordError = passwordTouched ? validatePassword(password) : null;

  const isFormValid = !validateEmail(email) && !validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isFormValid) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await loginUser({
        email: email.trim(),
        password: password,
        rememberMe: rememberMe
      });

      const { token, user, company } = data;
      
      login(token, user, company, rememberMe);
      setSuccessMsg('Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/invoices');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="login-page-container">
      {}
      <div className="login-header-bar">
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_3_492)">
            <path d="M0.65625 0.103132C1.05469 -0.0796808 1.52344 -0.0140558 1.85625 0.271882L3.75 1.89376L5.64375 0.271882C6.06563 -0.0890558 6.68906 -0.0890558 7.10625 0.271882L9 1.89376L10.8937 0.271882C11.3156 -0.0890558 11.9391 -0.0890558 12.3563 0.271882L14.25 1.89376L16.1437 0.271882C16.4766 -0.0140558 16.9453 -0.0796808 17.3438 0.103132C17.7422 0.285944 18 0.684382 18 1.12501V22.875C18 23.3156 17.7422 23.7141 17.3438 23.8969C16.9453 24.0797 16.4766 24.0141 16.1437 23.7281L14.25 22.1063L12.3563 23.7281C11.9344 24.0891 11.3109 24.0891 10.8937 23.7281L9 22.1063L7.10625 23.7281C6.68438 24.0891 6.06094 24.0891 5.64375 23.7281L3.75 22.1063L1.85625 23.7281C1.52344 24.0141 1.05469 24.0797 0.65625 23.8969C0.257812 23.7141 0 23.3156 0 22.875V1.12501C0 0.684382 0.257812 0.285944 0.65625 0.103132ZM4.5 6.75001C4.0875 6.75001 3.75 7.08751 3.75 7.50001C3.75 7.91251 4.0875 8.25001 4.5 8.25001H13.5C13.9125 8.25001 14.25 7.91251 14.25 7.50001C14.25 7.08751 13.9125 6.75001 13.5 6.75001H4.5ZM3.75 16.5C3.75 16.9125 4.0875 17.25 4.5 17.25H13.5C13.9125 17.25 14.25 16.9125 14.25 16.5C14.25 16.0875 13.9125 15.75 13.5 15.75H4.5C4.0875 15.75 3.75 16.0875 3.75 16.5ZM4.5 11.25C4.0875 11.25 3.75 11.5875 3.75 12C3.75 12.4125 4.0875 12.75 4.5 12.75H13.5C13.9125 12.75 14.25 12.4125 14.25 12C14.25 11.5875 13.9125 11.25 13.5 11.25H4.5Z" fill="#262626"/>
          </g>
          <defs>
            <clipPath id="clip0_3_492">
              <path d="M0 0H18V24H0V0Z" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        <span className="login-logo-text">
          InvoiceApp
        </span>
      </div>

      {}
      <div className="login-viewport-wrapper">
        {}
        <div className="login-titles-container">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Log in to your account.</p>
        </div>

        <Card className="login-card-override">

          {}
          {errorMsg && (
            <div className="login-alert-error" role="alert">
              <ErrorIcon fontSize="small" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="login-alert-success" role="status">
              <span>{successMsg}</span>
            </div>
          )}

          {}
          <form onSubmit={handleSubmit} noValidate className="login-form">
            {}
            <Input
              id="email-input"
              label="Email Address*"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailTouched) setEmailTouched(false);
              }}
              onBlur={() => setEmailTouched(true)}
              disabled={isSubmitting}
              autoComplete="email"
              error={emailError}
            />

            {}
            <div className="login-password-wrapper">
              <Input
                id="password-input"
                label="Password*"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordTouched) setPasswordTouched(false);
                }}
                onBlur={() => setPasswordTouched(true)}
                disabled={isSubmitting}
                autoComplete="current-password"
                error={passwordError}
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </button>
            </div>

            {}
            <div className="login-actions-container">
              <Checkbox
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !isFormValid}
                isLoading={isSubmitting}
                className="login-submit-btn"
              >
                Login
              </Button>
            </div>

            {}
            <div className="login-signup-link-wrapper">
              <Link to="/signup" className="login-signup-link">
                Create account
              </Link>
            </div>
          </form>
        </Card>
      </div>

      {}
      <div className="login-footer-band">
        <span>© 2025 InvoiceApp. All rights reserved.</span>
        <div className="login-footer-links">
          <Link to="#" className="login-footer-link">Privacy Policy</Link>
          <Link to="#" className="login-footer-link">Terms of Service</Link>
          <Link to="#" className="login-footer-link">Support</Link>
        </div>
      </div>
    </div>
  );
};
