'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

// Сырсөз күчүн текшерүү (client-side)
function checkPasswordStrength(password: string) {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('8 символдон кем болбосун');
  } else {
    score++;
    if (password.length >= 12) score++;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Чоң тамга кошуңуз (A-Z)');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Кичине тамга кошуңуз (a-z)');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Сан кошуңуз (0-9)');
  } else {
    score++;
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  }

  return {
    isValid: errors.length === 0 && password.length >= 8,
    score: Math.min(5, score),
    errors
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, isReady } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [wantToSell, setWantToSell] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // SMS верификация
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // OTP таймер
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const isButtonDisabled = !mounted || !isReady;

  // Сырсөз күчү
  const passwordStrength = useMemo(() => {
    return checkPasswordStrength(formData.password);
  }, [formData.password]);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-green-400';
    return 'bg-green-600';
  };

  const getStrengthText = (score: number) => {
    if (score <= 1) return 'Өтө алсыз';
    if (score <= 2) return 'Алсыз';
    if (score <= 3) return 'Орточо';
    if (score <= 4) return 'Күчтүү';
    return 'Өтө күчтүү';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Ошол талаанын катасын тазалоо
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Аты-жөнү
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Аты-жөнү керек';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Аты-жөнү 2 символдон кем болбосун';
    }

    // Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email керек';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Туура эмес email форматы';
    }

    // Телефон (милдеттүү эмес)
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      const phoneRegex = /^(\+996|996|0)?[0-9]{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Туура эмес телефон номери';
      }
    }

    // Сырсөз
    if (!formData.password) {
      newErrors.password = 'Сырсөз керек';
    } else if (!passwordStrength.isValid) {
      newErrors.password = passwordStrength.errors[0];
    }

    // Сырсөз тастыктоо
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Сырсөздү тастыктаңыз';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Сырсөздөр дал келбейт';
    }

    // Шарттар
    if (!agreeTerms) {
      newErrors.terms = 'Колдонуу шарттарын кабыл алыңыз';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // SMS код жөнөтүү
  const handleSendOTP = async () => {
    if (!formData.phone || otpLoading) return;

    // Телефон валидация - 9 цифра керек
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) {
      setErrors({ ...errors, phone: '9 цифра киргизиңиз' });
      return;
    }

    // +996 кошуу
    const fullPhone = '+996' + cleanPhone;

    setOtpLoading(true);
    setErrors({ ...errors, phone: '', otp: '' });

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ ...errors, phone: data.error || 'SMS жөнөтүүдө ката' });
        return;
      }

      setOtpSent(true);
      setOtpTimer(60); // 60 секунд күтүү
    } catch (err: any) {
      setErrors({ ...errors, phone: 'SMS жөнөтүүдө ката' });
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP текшерүү
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setErrors({ ...errors, otp: 'Код 6 цифрадан турушу керек' });
      return;
    }

    setOtpLoading(true);
    setErrors({ ...errors, otp: '' });

    // +996 кошуу
    const fullPhone = '+996' + formData.phone.replace(/\D/g, '');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: otpCode })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ ...errors, otp: data.error || 'Код туура эмес' });
        return;
      }

      setPhoneVerified(true);
      setOtpSent(false);
    } catch (err: any) {
      setErrors({ ...errors, otp: 'Текшерүүдө ката' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!mounted || !isReady) return;

    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrors({ general: err.message || 'Google менен кирүүдө ката кетти' });
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Телефон номерин +996 менен форматтоо
      const phoneToSend = formData.phone.trim()
        ? '+996' + formData.phone.replace(/\D/g, '')
        : undefined;

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          fullName: formData.fullName.trim(),
          phone: phoneToSend,
          role: wantToSell ? 'seller' : 'client'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Катаны туура иштетүү
        if (data.error) {
          if (typeof data.error === 'string') {
            setErrors({ general: data.error });
          } else if (typeof data.error === 'object') {
            // Талаа боюнча каталар
            const fieldErrors: Record<string, string> = {};
            for (const [key, value] of Object.entries(data.error)) {
              if (typeof value === 'string') {
                fieldErrors[key] = value;
              } else {
                fieldErrors[key] = 'Ката бар';
              }
            }
            // Эгер general жок болсо, биринчи катаны general кылуу
            if (!fieldErrors.general && Object.keys(fieldErrors).length > 0) {
              const firstKey = Object.keys(fieldErrors)[0];
              fieldErrors.general = fieldErrors[firstKey];
            }
            setErrors(fieldErrors);
          } else {
            setErrors({ general: 'Катталууда ката кетти' });
          }
        } else {
          setErrors({ general: 'Катталууда ката кетти' });
        }
        return;
      }

      // Ийгиликтүү - логин кылуу
      try {
        await signUp(formData.email, formData.password, formData.fullName, phoneToSend);
      } catch (signUpErr: any) {
        // signUp катасын игнордоо - register API ийгиликтүү болду
        console.log('SignUp after register:', signUpErr);
      }

      if (wantToSell) {
        router.push('/seller/shop/create');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Катталууда ката кетти';
      setErrors({ general: typeof errorMessage === 'string' ? errorMessage : 'Катталууда ката кетти' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General Error */}
      {errors.general && typeof errors.general === 'string' && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {errors.general}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Толук аты-жөнү <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Аты-жөнүңүз"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none ${
              errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
        </div>
        {errors.fullName && (
          <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email дарек <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none ${
              errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Телефон номери <span className="text-gray-400 text-xs">(милдеттүү эмес)</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            {/* +996 prefix */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium">+996</span>
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                // Сандарды гана кабыл алуу, максимум 9 цифра
                const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                setFormData({ ...formData, phone: value });
                if (errors.phone) setErrors({ ...errors, phone: '' });
                setPhoneVerified(false);
                setOtpSent(false);
                setOtpCode('');
              }}
              placeholder="XXX XXX XXX"
              disabled={phoneVerified}
              maxLength={9}
              className={`w-full pl-14 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none ${
                errors.phone ? 'border-red-300 bg-red-50' :
                phoneVerified ? 'border-green-300 bg-green-50' : 'border-gray-200'
              } ${phoneVerified ? 'opacity-75' : ''}`}
            />
            {phoneVerified && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          {!phoneVerified && formData.phone && (
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={otpLoading || otpTimer > 0}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
            >
              {otpLoading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : otpTimer > 0 ? (
                `${otpTimer}с`
              ) : otpSent ? (
                'Кайра'
              ) : (
                'Код алуу'
              )}
            </button>
          )}
        </div>
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
        {phoneVerified && (
          <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Телефон тастыкталды
          </p>
        )}
      </div>

      {/* OTP Input */}
      {otpSent && !phoneVerified && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 mb-3">
            SMS код +996 {formData.phone.slice(0, 6)}*** номерине жөнөтүлдү
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpCode(value);
                if (errors.otp) setErrors({ ...errors, otp: '' });
              }}
              placeholder="6 орундуу код"
              maxLength={6}
              className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-lg tracking-widest font-mono ${
                errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={otpLoading || otpCode.length !== 6}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 font-medium"
            >
              {otpLoading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Текшерүү'
              )}
            </button>
          </div>
          {errors.otp && (
            <p className="text-red-500 text-xs mt-2">{errors.otp}</p>
          )}
        </div>
      )}

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Сырсөз <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Күчтүү сырсөз"
            className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none ${
              errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    level <= passwordStrength.score
                      ? getStrengthColor(passwordStrength.score)
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-xs ${
                passwordStrength.score <= 2 ? 'text-red-500' :
                passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {getStrengthText(passwordStrength.score)}
              </span>
              {passwordStrength.errors.length > 0 && (
                <span className="text-xs text-gray-500">
                  {passwordStrength.errors[0]}
                </span>
              )}
            </div>
          </div>
        )}

        {errors.password && !formData.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Сырсөздү тастыктоо <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Сырсөздү кайталаңыз"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none ${
              errors.confirmPassword ? 'border-red-300 bg-red-50' :
              formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-300 bg-green-50' :
              'border-gray-200'
            }`}
          />
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Want to Sell */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={wantToSell}
            onChange={(e) => setWantToSell(e.target.checked)}
            className="w-5 h-5 mt-0.5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <div>
            <span className="font-medium text-gray-800 flex items-center gap-2">
              Дүкөн ачкым келет
              <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">Сатуучу</span>
            </span>
            <p className="text-sm text-gray-500 mt-0.5">
              Товарларыңызды сатып, киреше табыңыз
            </p>
          </div>
        </label>
      </div>

      {/* Terms Agreement */}
      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              if (errors.terms) setErrors({ ...errors, terms: '' });
            }}
            className={`w-4 h-4 mt-1 border-gray-300 rounded focus:ring-red-500 ${
              errors.terms ? 'border-red-500' : ''
            }`}
          />
          <span className="text-sm text-gray-600">
            <Link href="/terms" className="text-red-500 hover:underline">
              Колдонуу шарттарын
            </Link>{' '}
            жана{' '}
            <Link href="/privacy" className="text-red-500 hover:underline">
              Купуялык саясатын
            </Link>{' '}
            окудум жана кабыл алам
          </span>
        </label>
        {errors.terms && (
          <p className="text-red-500 text-xs mt-1 ml-6">{errors.terms}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || isButtonDisabled}
        className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 focus:ring-4 focus:ring-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading || isButtonDisabled ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {isButtonDisabled ? 'Жүктөлүүдө...' : 'Катталууда...'}
          </>
        ) : (
          <>
            Катталуу
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </>
        )}
      </button>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Маалыматыңыз коопсуз шифрленет</span>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-400">же</span>
        </div>
      </div>

      {/* Google Sign Up */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || isButtonDisabled}
        className="w-full py-3 border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {googleLoading || isButtonDisabled ? (
          <>
            <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-600 font-medium">Күтө туруңуз...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-gray-600 font-medium">Google менен катталуу</span>
          </>
        )}
      </button>
    </form>
  );
}