// import React, { useState } from 'react';
// import { useAdminAuth } from '../context/AdminAuthContext';
// import { ShieldCheck, Lock, Phone } from 'lucide-react';

// export default function Login({ onLoginSuccess }) {
//   const { login } = useAdminAuth();
//   const [identifier, setIdentifier] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setSubmitting(true);
//     try {
//       await login(identifier, password);
//       onLoginSuccess();
//     } catch (err) {
//       setError(err?.response?.data?.message || err?.message || 'Invalid credentials');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return React.createElement(
//     'div',
//     { className: 'flex min-h-screen items-center justify-center bg-[#0D1712] p-4' },
//     React.createElement(
//       'div',
//       { className: 'w-full max-w-md rounded-2xl border border-[#1C2E24] bg-[#122219] p-8 shadow-2xl' },
//       React.createElement(
//         'div',
//         { className: 'mb-8 text-center' },
//         React.createElement(
//           'div',
//           { className: 'mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0F7B4A] text-white shadow-lg' },
//           React.createElement(ShieldCheck, { className: 'h-8 w-8 text-[#F2B705]' })
//         ),
//         React.createElement('h1', { className: 'text-2xl font-black text-white' }, 'Qinash Gebeya Admin'),
//         React.createElement('p', { className: 'mt-1 text-sm text-[#8DA396]' }, 'Wholesale Operations Portal')
//       ),
//       error ? React.createElement('div', { className: 'mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400' }, error) : null,
//       React.createElement(
//         'form',
//         { onSubmit: handleSubmit, className: 'space-y-5' },
//         React.createElement(
//           'div',
//           null,
//           React.createElement('label', { className: 'mb-2 block text-xs font-bold uppercase text-[#A5B8AC]' }, 'Phone or ID'),
//           React.createElement(
//             'div',
//             { className: 'relative' },
//             React.createElement(Phone, { className: 'absolute left-3.5 top-3.5 h-4 w-4 text-[#5F7568]' }),
//             React.createElement('input', {
//               type: 'text',
//               required: true,
//               value: identifier,
//               onChange: (e) => setIdentifier(e.target.value),
//               placeholder: '0911223344',
//               className: 'w-full rounded-xl border border-[#233A2D] bg-[#0A140F] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#0F7B4A]'
//             })
//           )
//         ),
//         React.createElement(
//           'div',
//           null,
//           React.createElement('label', { className: 'mb-2 block text-xs font-bold uppercase text-[#A5B8AC]' }, 'Password'),
//           React.createElement(
//             'div',
//             { className: 'relative' },
//             React.createElement(Lock, { className: 'absolute left-3.5 top-3.5 h-4 w-4 text-[#5F7568]' }),
//             React.createElement('input', {
//               type: 'password',
//               required: true,
//               value: password,
//               onChange: (e) => setPassword(e.target.value),
//               placeholder: '••••••••',
//               className: 'w-full rounded-xl border border-[#233A2D] bg-[#0A140F] py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#0F7B4A]'
//             })
//           )
//         ),
//         React.createElement(
//           'button',
//           {
//             type: 'submit',
//             disabled: submitting,
//             className: 'flex w-full cursor-pointer items-center justify-center rounded-xl bg-[#0F7B4A] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#0c653d] disabled:opacity-50'
//           },
//           submitting ? 'Verifying...' : 'Sign In to Portal'
//         )
//       )
//     )
//   );
// }
import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, Phone } from 'lucide-react';

// UI-only animations (no logic)
const LOGIN_CSS = `
@keyframes qg-float-a { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-40px,0) scale(1.08); } }
@keyframes qg-float-b { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-40px,30px,0) scale(1.12); } }
@keyframes qg-rise { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes qg-bob { 0%,100% { transform: translateY(0) rotateX(0deg) rotateY(0deg); } 50% { transform: translateY(-6px) rotateX(6deg) rotateY(-6deg); } }
@keyframes qg-shine { 0% { transform: translateX(-120%) skewX(-20deg); } 60%,100% { transform: translateX(260%) skewX(-20deg); } }
@keyframes qg-spin-slow { to { transform: rotate(360deg); } }
.qg-float-a { animation: qg-float-a 14s ease-in-out infinite; }
.qg-float-b { animation: qg-float-b 17s ease-in-out infinite; }
.qg-rise { animation: qg-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
.qg-bob { animation: qg-bob 6s ease-in-out infinite; transform-style: preserve-3d; }
.qg-shine { animation: qg-shine 3.4s ease-in-out infinite; }
.qg-spin-slow { animation: qg-spin-slow 18s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .qg-float-a, .qg-float-b, .qg-rise, .qg-bob, .qg-shine, .qg-spin-slow { animation: none !important; }
}
`;

const gridStyle = {
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
  backgroundSize: '44px 44px',
  WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
  maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
};

const inputCls =
  'w-full rounded-xl border border-[#233A2D] bg-[#0A140F]/80 py-3.5 pl-11 pr-4 text-base sm:text-sm text-white placeholder:text-[#4E6558] outline-none transition-all duration-200 ' +
  'shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)] hover:border-[#2F5A42] ' +
  'focus:border-[#17A06A] focus:bg-[#0B1A12] focus:ring-4 focus:ring-[#17A06A]/15 focus:shadow-[inset_0_2px_6px_rgba(0,0,0,0.45),0_0_24px_rgba(23,160,106,0.22)]';

const iconCls =
  'pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F7568] transition-colors duration-200 group-focus-within:text-[#2BD08A]';

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
    {
      className:
        'relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-[#08110C] px-4 py-8 sm:p-6 ' +
        'pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]',
    },

    // Animation styles
    React.createElement('style', null, LOGIN_CSS),

    // Background: base radial glow
    React.createElement('div', {
      className: 'pointer-events-none absolute inset-0',
      style: {
        background:
          'radial-gradient(1200px 600px at 50% -10%, rgba(15,123,74,0.35), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(242,183,5,0.10), transparent 60%), radial-gradient(800px 500px at 0% 100%, rgba(23,160,106,0.18), transparent 60%)',
      },
    }),

    // Background: grid
    React.createElement('div', { className: 'pointer-events-none absolute inset-0', style: gridStyle }),

    // Floating orbs
    React.createElement('div', {
      className: 'qg-float-a pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#17A06A]/25 blur-3xl sm:h-96 sm:w-96',
    }),
    React.createElement('div', {
      className: 'qg-float-b pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#F2B705]/15 blur-3xl sm:h-96 sm:w-96',
    }),

    // Card stack
    React.createElement(
      'div',
      { className: 'qg-rise relative w-full max-w-md', style: { perspective: '1200px' } },

      // Glow behind card
      React.createElement('div', {
        className: 'pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-b from-[#17A06A]/25 via-transparent to-[#F2B705]/15 blur-2xl',
      }),

      // Gradient border wrapper
      React.createElement(
        'div',
        {
          className:
            'relative rounded-[1.6rem] bg-gradient-to-b from-[#2BD08A]/50 via-[#1C2E24] to-[#F2B705]/35 p-px ' +
            'shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85),0_0_60px_-10px_rgba(15,123,74,0.35)]',
        },

        // Card
        React.createElement(
          'div',
          {
            className:
              'relative overflow-hidden rounded-[1.55rem] bg-gradient-to-b from-[#16291E] to-[#0E1D15] p-6 sm:p-9 backdrop-blur-xl',
          },

          // Top highlight line
          React.createElement('div', {
            className: 'pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent',
          }),

          // Inner corner glow
          React.createElement('div', {
            className: 'pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#17A06A]/15 blur-2xl',
          }),

          // Header
          React.createElement(
            'div',
            { className: 'relative mb-7 text-center sm:mb-8' },

            // 3D logo
            React.createElement(
              'div',
              { className: 'relative mx-auto mb-5 h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20', style: { perspective: '600px' } },

              // Rotating ring
              React.createElement('div', {
                className: 'qg-spin-slow pointer-events-none absolute -inset-2 rounded-[1.6rem] border border-dashed border-[#2BD08A]/35',
              }),

              // Soft glow
              React.createElement('div', {
                className: 'pointer-events-none absolute inset-0 rounded-2xl bg-[#17A06A]/60 blur-xl',
              }),

              // Tile
              React.createElement(
                'div',
                {
                  className:
                    'qg-bob relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl ' +
                    'bg-gradient-to-br from-[#2BD08A] via-[#0F7B4A] to-[#0A5A36] text-white ' +
                    'shadow-[0_18px_30px_-8px_rgba(15,123,74,0.7),inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-4px_8px_rgba(0,0,0,0.3)] ' +
                    'ring-1 ring-white/20',
                },
                React.createElement('div', {
                  className: 'pointer-events-none absolute -left-4 -top-6 h-14 w-20 rotate-12 rounded-full bg-white/25 blur-md',
                }),
                React.createElement(ShieldCheck, {
                  className: 'relative h-9 w-9 text-[#F2B705] drop-shadow-[0_3px_6px_rgba(0,0,0,0.45)] sm:h-10 sm:w-10',
                })
              )
            ),

            React.createElement(
              'h1',
              {
                className:
                  'bg-gradient-to-b from-white via-white to-[#9FD9BC] bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl',
              },
              'Qinash Gebeya Admin'
            ),
            React.createElement(
              'p',
              { className: 'mt-2 text-sm font-medium text-[#8DA396]' },
              'Wholesale Operations Portal'
            ),

            // Accent divider
            React.createElement('div', {
              className: 'mx-auto mt-5 h-1 w-14 rounded-full bg-gradient-to-r from-[#17A06A] to-[#F2B705]',
            })
          ),

          // Error
          error
            ? React.createElement(
                'div',
                {
                  role: 'alert',
                  className:
                    'relative mb-6 rounded-xl border border-red-500/25 bg-gradient-to-b from-red-500/15 to-red-500/5 p-3.5 text-sm font-medium text-red-300 ' +
                    'shadow-[0_8px_24px_-8px_rgba(239,68,68,0.35)] break-words',
                },
                error
              )
            : null,

          // Form
          React.createElement(
            'form',
            { onSubmit: handleSubmit, className: 'relative space-y-5' },

            // Identifier
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                { className: 'mb-2 block text-xs font-bold uppercase tracking-wider text-[#A5B8AC]' },
                'Phone or ID'
              ),
              React.createElement(
                'div',
                { className: 'group relative' },
                React.createElement(Phone, { className: iconCls }),
                React.createElement('input', {
                  type: 'text',
                  required: true,
                  value: identifier,
                  onChange: (e) => setIdentifier(e.target.value),
                  placeholder: '0911223344',
                  className: inputCls,
                })
              )
            ),

            // Password
            React.createElement(
              'div',
              null,
              React.createElement(
                'label',
                { className: 'mb-2 block text-xs font-bold uppercase tracking-wider text-[#A5B8AC]' },
                'Password'
              ),
              React.createElement(
                'div',
                { className: 'group relative' },
                React.createElement(Lock, { className: iconCls }),
                React.createElement('input', {
                  type: 'password',
                  required: true,
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  placeholder: '••••••••',
                  className: inputCls,
                })
              )
            ),

            // Submit
            React.createElement(
              'button',
              {
                type: 'submit',
                disabled: submitting,
                className:
                  'group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl ' +
                  'bg-gradient-to-b from-[#1DB874] via-[#0F7B4A] to-[#0A5A36] py-3.5 text-sm font-bold tracking-wide text-white ' +
                  'shadow-[0_14px_28px_-8px_rgba(15,123,74,0.75),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-3px_6px_rgba(0,0,0,0.25)] ' +
                  'ring-1 ring-[#2BD08A]/30 transition-all duration-200 ' +
                  'hover:-translate-y-0.5 hover:shadow-[0_20px_36px_-8px_rgba(23,160,106,0.8),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-3px_6px_rgba(0,0,0,0.25)] ' +
                  'active:translate-y-0 active:scale-[0.985] ' +
                  'disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none',
              },
              // Shine sweep
              !submitting
                ? React.createElement('span', {
                    className: 'qg-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent',
                  })
                : null,
              React.createElement('span', { className: 'relative' }, submitting ? 'Verifying...' : 'Sign In to Portal')
            )
          )
        )
      )
    )
  );
}