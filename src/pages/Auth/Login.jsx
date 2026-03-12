import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';

import { auth } from '~/config/firebase';
import { normalizeVNPhoneToE164 } from '~/utils/formatters';
import { toast } from 'react-toastify';
import authApi from '~/apis/authApi';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const PasswordField = ({ id, label, value, onChange, onKeyDown, show, setShow, autoFocus }) => (
  <TextField
    id={id}
    label={label}
    type={show ? 'text' : 'password'}
    placeholder="••••••••"
    value={value}
    onChange={onChange}
    onKeyDown={onKeyDown}
    autoFocus={autoFocus}
    fullWidth
    slotProps={{
      input: {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShow(!show)} edge="end" size="small">
              {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        )
      }
    }}
  />
);

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [confirmation, setConfirmation] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const showError = (msg) => { toast.error(msg); };

  // ================= STEP 1 =================
  const checkLoginMethod = async () => {
    setLoading(true);
    const phoneE164 = normalizeVNPhoneToE164(phone);
    if (!phoneE164) {
      showError('Invalid phone number format. Please use 0xxxxxxxxx format.');
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.checkLoginMethod(phoneE164);
      const loginMethod = res?.data?.loginMethod;
      if (loginMethod === 'otp') {
        await sendOTP(phoneE164);
      } else {
        setStep('password');
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  // ================= OTP =================
  const sendOTP = async (phoneE164) => {
    setLoading(true);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => console.log('Recaptcha verified'),
          'expired-callback': () => {
            window.recaptchaVerifier = null;
            showError('Recaptcha expired. Please try again.');
          }
        });
      }
      const result = await signInWithPhoneNumber(auth, phoneE164, window.recaptchaVerifier);
      setConfirmation(result);
      setStep('otp');
      setResendTimer(60);
    } catch (err) {
      if (err.message && err.message.includes('reCAPTCHA client element has been removed')) {
        showError('Please try again.');
      } else {
        showError(err.message || 'Failed to send OTP');
      }
      window.recaptchaVerifier = null;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length < 6) { showError('Please enter a valid 6-digit OTP'); return; }
    setLoading(true);
    try {
      const result = await confirmation.confirm(otp);
      const idToken = await result.user.getIdToken();
      await authApi.loginWithOtp(idToken);
      await loadProfile();
    } catch (err) {
      const errStr = typeof err?.message === 'string' ? err.message : JSON.stringify(err);
      if (errStr.includes('invalid-verification-code') || errStr.includes('INVALID_CODE') || errStr.includes('invalid')) {
        showError('Invalid OTP. Please try again.');
      } else if (err.code || err.message !== 'An error occurred') {
        showError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= FORGOT PASSWORD =================
  const sendForgotPasswordOTP = async () => {
    const phoneE164 = normalizeVNPhoneToE164(phone);
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => console.log('Recaptcha verified'),
          'expired-callback': () => {
            window.recaptchaVerifier = null;
            showError('Recaptcha expired. Please try again.');
          }
        });
      }
      setLoading(true);
      const result = await signInWithPhoneNumber(auth, phoneE164, window.recaptchaVerifier);
      setConfirmation(result);
      setStep('forgot-otp');
      setResendTimer(60);
    } catch (err) {
      if (err.message && err.message.includes('reCAPTCHA client element has been removed')) {
        showError('Please try again.');
      } else {
        showError(err.message || 'Failed to send OTP');
      }
      window.recaptchaVerifier = null;
    } finally {
      setLoading(false);
    }
  };

  const verifyForgotPasswordOTP = async () => {
    if (!otp || otp.length < 6) { showError('Please enter a valid 6-digit OTP'); return; }
    setLoading(true);
    try {
      const result = await confirmation.confirm(otp);
      const idToken = await result.user.getIdToken();
      setResetToken(idToken);
      setStep('reset-password');
      setOtp('');
    } catch (err) {
      const errStr = typeof err?.message === 'string' ? err.message : JSON.stringify(err);
      if (errStr.includes('invalid-verification-code') || errStr.includes('INVALID_CODE') || errStr.includes('invalid')) {
        showError('Invalid OTP. Please try again.');
      } else if (err.code || err.message !== 'An error occurred') {
        showError(err.message || 'Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async () => {
    if (!newPassword || newPassword.length < 6) { showError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { showError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      toast.success('Password reset successfully! Please sign in with your new password.');
      setStep('password');
      setPassword(''); setNewPassword(''); setConfirmPassword(''); setResetToken('');
    } catch { /* API error intercepted */ } finally { setLoading(false); }
  };

  // ================= PASSWORD =================
  const loginWithPassword = async () => {
    if (!password) { showError('Please enter your password'); return; }
    setLoading(true);
    const phoneE164 = normalizeVNPhoneToE164(phone);
    try {
      await authApi.loginWithPassword(phoneE164, password);
      await loadProfile();
    } catch { setLoading(false); }
  };

  // ================= INITIAL PASSWORD (Staff) =================
  const submitInitialPassword = async () => {
    if (!newPassword || newPassword.length < 6) { showError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { showError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await authApi.setPassword(newPassword, confirmPassword);
      toast.success('Password set successfully!');
      if (user?.role === 'customer') {
        navigate('/my');
      } else {
        navigate('/dashboard');
      }
    } catch { /* API error intercepted */ } finally { setLoading(false); }
  };

  // ================= PROFILE =================
  const loadProfile = async () => {
    try {
      const res = await authApi.getProfile().catch(() => null);
      let userData = null;
      if (res && res.data) { userData = res.data; setUser(res.data); }
      else if (res) { userData = res; setUser(res); }
      else { userData = { phone: normalizeVNPhoneToE164(phone), loggedIn: true }; setUser(userData); }

      toast.success('Successfully logged in!');

      if (!userData.hasPassword) {
        setStep('set-init-password');
      } else {
        if (userData.role === 'customer') {
          navigate('/my');
        } else {
          navigate('/dashboard');
        }
      }
    } catch { /* Handled */ }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'phone': return 0;
      case 'password': case 'otp': case 'forgot-otp': case 'reset-password': case 'set-init-password': return 1;
      case 'done': return 2;
      default: return 0;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default', p: 2, width: '100%' }}>
      <Paper elevation={4} sx={{ p: 5, width: '100%', maxWidth: 440, position: 'relative', overflow: 'hidden', borderRadius: 4 }}>

        {/* Step Indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                transition: 'all 0.3s',
                borderRadius: getStepNumber() === i ? 1 : '50%',
                width: getStepNumber() === i ? 32 : 12,
                height: 12,
                bgcolor: getStepNumber() === i ? 'primary.main' : getStepNumber() > i ? 'success.main' : 'grey.300',
              }}
            />
          ))}
        </Box>

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {step === 'phone' && 'Welcome to LaundryPro!'}
            {step === 'password' && 'Enter Password'}
            {step === 'otp' && 'Verify Phone'}
            {step === 'forgot-otp' && 'Reset Password OTP'}
            {step === 'reset-password' && 'Create New Password'}
            {step === 'set-init-password' && 'Set Your Password'}
            {step === 'done' && 'Success!'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {step === 'phone' && 'Enter your phone number to continue'}
            {step === 'password' && 'Please enter your account password'}
            {step === 'otp' && `We sent a code to ${normalizeVNPhoneToE164(phone)}`}
            {step === 'forgot-otp' && `We sent a reset code to ${normalizeVNPhoneToE164(phone)}`}
            {step === 'reset-password' && 'Enter your new secure password'}
            {step === 'set-init-password' && 'Welcome! Please set a secure password for your account'}
            {step === 'done' && 'You are now signed in'}
          </Typography>
        </Box>

        {/* STEP: PHONE */}
        {step === 'phone' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              id="phone"
              label="Phone Number"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && checkLoginMethod()}
              inputProps={{ maxLength: 11 }}
              autoFocus
              fullWidth
            />
            <Button variant="contained" size="large" fullWidth disabled={loading || phone.length < 9} onClick={checkLoginMethod} sx={{ py: 1.5, fontWeight: 700 }}>
              Continue
            </Button>
            <Button onClick={() => navigate('/')} disabled={loading} sx={{ mt: 0.5 }}>
              ← Back to Home
            </Button>
          </Box>
        )}

        {/* STEP: PASSWORD */}
        {step === 'password' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'grey.100', borderRadius: 2, fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700 }}>
              {normalizeVNPhoneToE164(phone)}
            </Box>
            <PasswordField id="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loginWithPassword()} show={showPassword} setShow={setShowPassword} autoFocus />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" onClick={sendForgotPasswordOTP} disabled={loading}>Forgot Password?</Button>
            </Box>
            <Button variant="contained" size="large" fullWidth disabled={loading} onClick={loginWithPassword} sx={{ py: 1.5, fontWeight: 700 }}>
              Sign In
            </Button>
            <Button variant="outlined" size="large" fullWidth disabled={loading} onClick={() => sendOTP(normalizeVNPhoneToE164(phone))} sx={{ py: 1.5, fontWeight: 600 }}>
              Use OTP Instead
            </Button>
            <Button onClick={() => setStep('phone')} sx={{ mt: 0.5 }}>← Back to Phone</Button>
          </Box>
        )}

        {/* STEP: OTP */}
        {step === 'otp' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              id="otp"
              label="6-Digit Code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && verifyOTP()}
              autoFocus
              fullWidth
              inputProps={{ style: { textAlign: 'center', fontFamily: 'monospace', fontSize: '1.5rem', letterSpacing: '0.3em' } }}
            />
            <Button variant="contained" size="large" fullWidth disabled={loading || otp.length !== 6} onClick={verifyOTP} sx={{ py: 1.5, fontWeight: 700 }}>
              Verify
            </Button>
            {resendTimer > 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                Resend code in {resendTimer}s
              </Typography>
            ) : (
              <Button variant="outlined" fullWidth disabled={loading} onClick={() => sendOTP(normalizeVNPhoneToE164(phone))} sx={{ py: 1.5, fontWeight: 600 }}>
                Resend Code
              </Button>
            )}
            <Button onClick={() => setStep('phone')} sx={{ mt: 0.5 }}>← Change Number</Button>
          </Box>
        )}

        {/* STEP: FORGOT OTP */}
        {step === 'forgot-otp' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              id="forgot-otp"
              label="6-Digit Reset Code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && verifyForgotPasswordOTP()}
              autoFocus
              fullWidth
              inputProps={{ style: { textAlign: 'center', fontFamily: 'monospace', fontSize: '1.5rem', letterSpacing: '0.3em' } }}
            />
            <Button variant="contained" size="large" fullWidth disabled={loading || otp.length !== 6} onClick={verifyForgotPasswordOTP} sx={{ py: 1.5, fontWeight: 700 }}>
              Verify Code
            </Button>
            {resendTimer > 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                Resend code in {resendTimer}s
              </Typography>
            ) : (
              <Button variant="outlined" fullWidth disabled={loading} onClick={sendForgotPasswordOTP} sx={{ py: 1.5, fontWeight: 600 }}>
                Resend Code
              </Button>
            )}
            <Button onClick={() => { setStep('password'); setOtp(''); }} sx={{ mt: 0.5 }}>← Back to Login</Button>
          </Box>
        )}

        {/* STEP: RESET PASSWORD */}
        {step === 'reset-password' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PasswordField id="new-password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} show={showNewPassword} setShow={setShowNewPassword} autoFocus />
            <PasswordField id="confirm-password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitNewPassword()} show={showConfirmPassword} setShow={setShowConfirmPassword} />
            <Button variant="contained" size="large" fullWidth disabled={loading} onClick={submitNewPassword} sx={{ py: 1.5, fontWeight: 700, mt: 1 }}>
              Reset Password
            </Button>
          </Box>
        )}

        {/* STEP: SET INITIAL PASSWORD (Staff) */}
        {step === 'set-init-password' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <PasswordField id="init-new-password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} show={showNewPassword} setShow={setShowNewPassword} autoFocus />
            <PasswordField id="init-confirm-password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitInitialPassword()} show={showConfirmPassword} setShow={setShowConfirmPassword} />
            <Button variant="contained" size="large" fullWidth disabled={loading} onClick={submitInitialPassword} sx={{ py: 1.5, fontWeight: 700, mt: 1 }}>
              Complete Setup
            </Button>
          </Box>
        )}

        {/* STEP: DONE */}
        {step === 'done' && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>🎉</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>Welcome back!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>You have successfully signed in</Typography>
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 3, textAlign: 'left', overflow: 'auto', maxHeight: 240 }}>
              <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </Box>
            <Button variant="contained" fullWidth onClick={() => window.location.reload()} sx={{ mt: 3, py: 1.5, fontWeight: 700 }}>
              Sign Out
            </Button>
          </Box>
        )}

        <div id="recaptcha-container" style={{ position: 'absolute', bottom: 0, opacity: 0 }}></div>
      </Paper>

      <Typography variant="body2" color="text.disabled" sx={{ mt: 4, fontWeight: 500 }}>
        Protected by Firebase Authentication
      </Typography>
    </Box>
  );
}
