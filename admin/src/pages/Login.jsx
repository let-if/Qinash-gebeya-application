import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, Phone } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(identifier, password);
      onLoginSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'flex min-h-screen items-center justify-center bg-[#0D1712] p-4' },
    React.createElement(
      'div',
      { className: 'w-full max-w-md rounded-2xl border border-[#1C2E24] bg-[#122219] p-8 shadow-2xl' },
      React.createElement(
        'div',
        { className: 'mb-8 text-center' },
        React.createElement(
          'div',
          { className: 'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0F7B4A] text-white shadow-lg' },
          React.createElement(ShieldCheck, { className: 'h-8 w-8 text-[#F2B705]' })
        ),
        React.createElement('h1', { className: 'text-2xl font-black text-white' }, 'Qinash Gebeya Admin'),
        React.createElement('p', { className: 'mt-1 text-sm text-[#8DA396]' }, 'Wholesale Operations Portal')
      ),
      error ? React.createElement('div', { className: 'mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400' }, error) : null,
      React.createElement(
        'form',
        { onSubmit: handleSubmit, className: 'space-y-5' },
        React.createElement(
          'div',
          null,
          React.createElement('label', { className: 'mb-2 block text-xs font-bold uppercase text-[#A5B8AC]' }, 'Phone or ID'),
          React.createElement(
            'div',
            { className: 'relative' },
            React.createElement(Phone, { className: 'absolute left-3.5 top-3.5 h-4 w-4 text-[#5F7568]' }),
            React.createElement('input', {
              type: 'text',
              required: true,
              value: identifier,
              onChange: (e) => setIdentifier(e.target.value),
              placeholder: '0911223344',
              className: 'w-full rounded-xl border border-[#233A2D] bg-[#0A140F] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#0F7B4A]'
            })
          )
        ),
        React.createElement(
          'div',
          null,
          React.createElement('label', { className: 'mb-2 block text-xs font-bold uppercase text-[#A5B8AC]' }, 'Password'),
          React.createElement(
            'div',
            { className: 'relative' },
            React.createElement(Lock, { className: 'absolute left-3.5 top-3.5 h-4 w-4 text-[#5F7568]' }),
            React.createElement('input', {
              type: 'password',
              required: true,
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: '••••••••',
              className: 'w-full rounded-xl border border-[#233A2D] bg-[#0A140F] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#0F7B4A]'
            })
          )
        ),
        React.createElement(
          'button',
          {
            type: 'submit',
            disabled: submitting,
            className: 'flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#0F7B4A] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#0c653d] disabled:opacity-50'
          },
          submitting ? 'Verifying...' : 'Sign In to Portal'
        )
      )
    )
  );
}