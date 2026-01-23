'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'password' | 'success'>('phone');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // OTP таймер
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // 1. Телефон киргизүү жана SMS жөнөтүү
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Телефон валидация - 9 цифра керек
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 9) {
      setError('9 цифра киргизиңиз');
      return;
    }

    // +996 кошуу
    const fullPhone = '+996' + cleanPhone;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = typeof data.error === 'string' ? data.error : 'SMS жөнөтүүдө ката';
        setError(errorMsg);
        return;
      }

      setStep('otp');
      setOtpTimer(60);
    } catch (err) {
      setError('Байланыш катасы');
    } finally {
      setLoading(false);
    }
  };

  // 2. OTP текшерүү
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 6) {
      setError('6 орундуу кодду киргизиңиз');
      return;
    }

    // +996 кошуу
    const fullPhone = '+996' + phone.replace(/\D/g, '');

    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, code: otpCode })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = typeof data.error === 'string' ? data.error : 'Код туура эмес';
        setError(errorMsg);
        return;
      }

      setStep('password');
    } catch (err) {
      setError('Байланыш катасы');
    } finally {
      setLoading(false);
    }
  };

  // 3. Жаңы сырсөз коюу
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Жаңы сырсөз киргизиңиз');
      return;
    }

    if (newPassword.length < 8) {
      setError('Сырсөз 8 символдон кем болбосун');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Сырсөздөр дал келбейт');
      return;
    }

    // +996 кошуу
    const fullPhone = '+996' + phone.replace(/\D/g, '');

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, newPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = typeof data.error === 'string' ? data.error : 'Сырсөздү өзгөртүүдө ката';
        setError(errorMsg);
        return;
      }

      setStep('success');
    } catch (err) {
      setError('Байланыш катасы');
    } finally {
      setLoading(false);
    }
  };

  // Кайра SMS жөнөтүү
  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    await handleSendOTP({ preventDefault: () => {} } as React.FormEvent);
  };

  // STEP 1: Телефон киргизүү
  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOTP} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Сырсөздү калыбына келтирүү</h2>
          <p className="text-gray-500 text-sm mt-1">
            Телефон номериңизди киргизиңиз, SMS код жөнөтөбүз
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Телефон номери
          </label>
          <div className="relative">
            {/* +996 prefix */}
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium">+996</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                // Сандарды гана кабыл алуу, максимум 9 цифра
                const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                setPhone(value);
              }}
              placeholder="XXX XXX XXX"
              maxLength={9}
              className="w-full pl-14 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              SMS код алуу
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>

        <div className="text-center pt-4">
          <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700">
            ← Кирүү барагына кайтуу
          </Link>
        </div>
      </form>
    );
  }

  // STEP 2: OTP киргизүү
  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOTP} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">SMS кодду киргизиңиз</h2>
          <p className="text-gray-500 text-sm mt-1">
            +996 {phone.slice(0, 6)}*** номерине код жөнөтүлдү
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full px-4 py-4 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otpCode.length !== 6}
          className="w-full py-3.5 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'Текшерүү'
          )}
        </button>

        <div className="text-center">
          {otpTimer > 0 ? (
            <p className="text-sm text-gray-500">
              Кайра жөнөтүү: {otpTimer} сек
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Кайра код жөнөтүү
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setStep('phone')}
          className="w-full text-sm text-gray-500 hover:text-gray-700"
        >
          ← Артка
        </button>
      </form>
    );
  }

  // STEP 3: Жаңы сырсөз
  if (step === 'password') {
    return (
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Жаңы сырсөз коюу</h2>
          <p className="text-gray-500 text-sm mt-1">
            Күчтүү сырсөз тандаңыз
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Жаңы сырсөз
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Мин. 8 символ"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 pr-12"
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
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Сырсөздү тастыктоо
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Сырсөздү кайталаңыз"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 ${
              confirmPassword && newPassword === confirmPassword
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200'
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <>
              Сырсөздү өзгөртүү
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </>
          )}
        </button>
      </form>
    );
  }

  // STEP 4: Ийгилик
  return (
    <div className="text-center space-y-4">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Сырсөз өзгөртүлдү!</h2>
      <p className="text-gray-600">
        Жаңы сырсөз менен кирсеңиз болот
      </p>
      <Link
        href="/auth/login"
        className="inline-block w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-orange-600 mt-4"
      >
        Кирүү барагына өтүү
      </Link>
    </div>
  );
}