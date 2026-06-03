import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthApi } from '../../hooks/useAuthApi';
import { apiClient } from '../../services/api';
import { 
  Visibility, 
  VisibilityOff, 
  CloudUpload, 
  Error as ErrorIcon 
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { Card } from '../../components/common/Card/Card';
import { Input } from '../../components/common/Input/Input';
import { Button } from '../../components/common/Button/Button';
import './SignupPage.css';

export const SignupPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { loading: isSubmitting, signupUser } = useAuthApi();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [industry, setIndustry] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldTouched = (field: string, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: '#e5e7eb' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (/[a-zA-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: '#dc3545' };
    if (score <= 3) return { score: 2, label: 'Medium', color: '#ffc107' };
    return { score: 3, label: 'Strong', color: '#198754' };
  };

  const passStrength = getPasswordStrength(password);

  const validateFirstName = (val: string) => !val.trim() ? 'First name is required.' : null;
  const validateLastName = (val: string) => !val.trim() ? 'Last name is required.' : null;
  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Enter a valid email address.';
    if (emailExists) return 'Email already exists.';
    return null;
  };
  const validatePassword = (val: string) => {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters long.';
    if (val.length > 20) return 'Password cannot exceed 20 characters.';
    if (!(/[a-zA-Z]/.test(val) && /[0-9]/.test(val))) return 'Password must include both letters and numbers.';
    return null;
  };
  const validateCompanyName = (val: string) => !val.trim() ? 'Company name is required.' : null;
  const validateAddress = (val: string) => !val.trim() ? 'Company address is required.' : null;
  const validateCity = (val: string) => !val.trim() ? 'City is required.' : null;
  const validateZipCode = (val: string) => {
    if (!val.trim()) return 'Zip code is required.';
    if (!/^\d{6}$/.test(val.trim())) return 'Zip must be exactly 6 digits.';
    return null;
  };
  const validateCurrency = (val: string) => !val.trim() ? 'Currency symbol is required.' : null;

  const handleEmailBlur = async () => {
    setFieldTouched('email', true);
    const emailVal = email.trim();
    if (!emailVal) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) return;

    setEmailChecking(true);
    setEmailExists(false);
    try {
      const response = await apiClient.get(`/Auth/CheckEmailExists`, {
        params: { email: emailVal }
      });
      if (response.data === true || response.data?.exists === true) {
        setEmailExists(true);
      }
    } catch (err) {
      console.log('Uniqueness email check failed or endpoint not found:', err);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Logo size exceeds 5MB limit.');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setErrorMsg('Logo must be a PNG or JPG file.');
      return;
    }

    setErrorMsg(null);
    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const isFormValid =
    !validateFirstName(firstName) &&
    !validateLastName(lastName) &&
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validateCompanyName(companyName) &&
    !validateAddress(address) &&
    !validateCity(city) &&
    !validateZipCode(zipCode) &&
    !validateCurrency(currencySymbol) &&
    !emailExists;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allFields = ['firstName', 'lastName', 'email', 'password', 'companyName', 'address', 'city', 'zipCode', 'currencySymbol'];
    const newTouched: Record<string, boolean> = {};
    allFields.forEach(f => { newTouched[f] = true; });
    setTouched(newTouched);

    if (!isFormValid) return;

    setErrorMsg(null);

    const formData = new FormData();
    formData.append('FirstName', firstName.trim());
    formData.append('LastName', lastName.trim());
    formData.append('Email', email.trim());
    formData.append('Password', password);
    formData.append('CompanyName', companyName.trim());
    formData.append('Address', address.trim());
    formData.append('City', city.trim());
    formData.append('ZipCode', zipCode.trim());
    formData.append('Industry', industry.trim());
    formData.append('CurrencySymbol', currencySymbol.trim());
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      const data = await signupUser(formData);
      const { token, user, company } = data;
      login(token, user, company, true);
      navigate('/invoices');
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed. Please check your entries.');
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-header-bar">
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#signup_clip0)">
            <path d="M0.65625 0.103132C1.05469 -0.0796808 1.52344 -0.0140558 1.85625 0.271882L3.75 1.89376L5.64375 0.271882C6.06563 -0.0890558 6.68906 -0.0890558 7.10625 0.271882L9 1.89376L10.8937 0.271882C11.3156 -0.0890558 11.9391 -0.0890558 12.3563 0.271882L14.25 1.89376L16.1437 0.271882C16.4766 -0.0140558 16.9453 -0.0796808 17.3438 0.103132C17.7422 0.285944 18 0.684382 18 1.12501V22.875C18 23.3156 17.7422 23.7141 17.3438 23.8969C16.9453 24.0797 16.4766 24.0141 16.1437 23.7281L14.25 22.1063L12.3563 23.7281C11.9344 24.0891 11.3109 24.0891 10.8937 23.7281L9 22.1063L7.10625 23.7281C6.68438 24.0891 6.06094 24.0891 5.64375 23.7281L3.75 22.1063L1.85625 23.7281C1.52344 24.0141 1.05469 24.0797 0.65625 23.8969C0.257812 23.7141 0 23.3156 0 22.875V1.12501C0 0.684382 0.257812 0.285944 0.65625 0.103132ZM4.5 6.75001C4.0875 6.75001 3.75 7.08751 3.75 7.50001C3.75 7.91251 4.0875 8.25001 4.5 8.25001H13.5C13.9125 8.25001 14.25 7.91251 14.25 7.50001C14.25 7.08751 13.9125 6.75001 13.5 6.75001H4.5ZM3.75 16.5C3.75 16.9125 4.0875 17.25 4.5 17.25H13.5C13.9125 17.25 14.25 16.9125 14.25 16.5C14.25 16.0875 13.9125 15.75 13.5 15.75H4.5C4.0875 15.75 3.75 16.0875 3.75 16.5ZM4.5 11.25C4.0875 11.25 3.75 11.5875 3.75 12C3.75 12.4125 4.0875 12.75 4.5 12.75H13.5C13.9125 12.75 14.25 12.4125 14.25 12C14.25 11.5875 13.9125 11.25 13.5 11.25H4.5Z" fill="#262626"/>
          </g>
          <defs>
            <clipPath id="signup_clip0">
              <path d="M0 0H18V24H0V0Z" fill="white"/>
            </clipPath>
          </defs>
        </svg>
        <span className="signup-logo-text">
          InvoiceApp
        </span>
      </div>

      <div className="signup-content-wrapper">
        <div className="signup-titles-container">
          <h1 className="signup-title">Create Your Account</h1>
          <p className="signup-subtitle">
            Set up your company and start invoicing in minutes.
          </p>
        </div>

        <Card className="signup-card-override">
          {}
          {errorMsg && (
            <div className="signup-alert-error" role="alert">
              <ErrorIcon fontSize="small" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="signup-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>

              <div>
                <h2 className="signup-section-header">User Information</h2>

                <div className="signup-field-wrapper">
                  <Input
                    label="First Name *"
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => setFieldTouched('firstName')}
                    disabled={isSubmitting}
                    error={touched.firstName ? validateFirstName(firstName) : null}
                  />
                </div>

                <div className="signup-field-wrapper">
                  <Input
                    label="Last Name *"
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => setFieldTouched('lastName')}
                    disabled={isSubmitting}
                    error={touched.lastName ? validateLastName(lastName) : null}
                  />
                </div>

                <div className="signup-field-wrapper">
                  <div style={{ position: 'relative' }}>
                    <Input
                      label="Email *"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailExists(false);
                      }}
                      onBlur={handleEmailBlur}
                      disabled={isSubmitting}
                      error={touched.email ? validateEmail(email) : null}
                    />
                    {emailChecking && (
                      <CircularProgress
                        size={16}
                        className="signup-email-loading"
                      />
                    )}
                  </div>
                </div>

                {}
                <div style={{ marginBottom: '8px' }}>
                  <div className="signup-password-wrapper">
                    <Input
                      label="Password *"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setFieldTouched('password')}
                      disabled={isSubmitting}
                      error={touched.password ? validatePassword(password) : null}
                      style={{ paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="signup-password-toggle"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </button>
                  </div>

                  {password && (
                    <div className="signup-strength-container">
                      <div className="signup-strength-bar-bg">
                        <div style={{
                          width: `${(passStrength.score / 3) * 100}%`,
                          height: '100%',
                          backgroundColor: passStrength.color,
                          transition: 'width 0.2s ease, background-color 0.2s ease'
                        }} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                        Password strength: <strong style={{ color: passStrength.color }}>{passStrength.label}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="signup-section-header">Company Information</h2>

                <div className="signup-field-wrapper">
                  <Input
                    label="Company Name *"
                    type="text"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onBlur={() => setFieldTouched('companyName')}
                    disabled={isSubmitting}
                    error={touched.companyName ? validateCompanyName(companyName) : null}
                  />
                </div>

                <div className="signup-field-wrapper">
                  <label className="signup-logo-label">
                    Company Logo
                  </label>
                  <div className="signup-logo-upload-wrapper">
                    <div className="signup-logo-preview-box">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <CloudUpload style={{ color: '#adb5bd', fontSize: '20px' }} />
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        accept=".png,.jpg,.jpeg"
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={triggerFileSelect}
                        disabled={isSubmitting}
                        className="signup-logo-choose-btn"
                      >
                        Choose Logo File
                      </button>
                      <span style={{ display: 'block', fontSize: '11px', color: '#adb5bd', marginTop: '4px' }}>
                        {logoFile ? logoFile.name : 'PNG or JPG. Max size 2-5 MB'}
                      </span>
                    </div>
                  </div>
                </div>

                {}
                <div className="signup-field-wrapper">
                  <Input
                    label="Company Address *"
                    isTextArea
                    rows={2}
                    placeholder="Enter company address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => setFieldTouched('address')}
                    disabled={isSubmitting}
                    error={touched.address ? validateAddress(address) : null}
                    style={{ minHeight: '60px' }}
                  />
                </div>

                {}
                <div className="signup-city-zip-grid">
                  <Input
                    label="City *"
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onBlur={() => setFieldTouched('city')}
                    disabled={isSubmitting}
                    error={touched.city ? validateCity(city) : null}
                  />
                  <Input
                    label="Zip Code *"
                    type="text"
                    placeholder="6 digit zip code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    onBlur={() => setFieldTouched('zipCode')}
                    disabled={isSubmitting}
                    error={touched.zipCode ? validateZipCode(zipCode) : null}
                    maxLength={6}
                  />
                </div>

                {}
                <div className="signup-field-wrapper">
                  <Input
                    label="Industry"
                    type="text"
                    placeholder="Industry type"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {}
                <div className="signup-field-wrapper">
                  <Input
                    label="Currency Symbol *"
                    type="text"
                    placeholder="$, ₹, €, AED"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    onBlur={() => setFieldTouched('currencySymbol')}
                    disabled={isSubmitting}
                    error={touched.currencySymbol ? validateCurrency(currencySymbol) : null}
                  />
                </div>

                {}
                <div className="signup-submit-btn-wrapper">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting || !isFormValid}
                    isLoading={isSubmitting}
                    className="signup-submit-btn"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>

            {}
            <div className="signup-login-redirect">
              <span style={{ color: '#6c757d' }}>Already have an account? </span>
              <Link to="/login" style={{ color: '#262626', fontWeight: 600, textDecoration: 'none' }}>
                Login
              </Link>
            </div>
          </form>
        </Card>
      </div>

      {}
      <div className="signup-footer-band">
        <span>© 2025 InvoiceApp. All rights reserved.</span>
      </div>
    </div>
  );
};
