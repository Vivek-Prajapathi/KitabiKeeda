
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, CheckCircle, BookOpen, ArrowRight, Lock } from 'lucide-react';

const ActivateAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activateAccount } = useAuth();

  const { activationToken, email, activationCode: generatedCode } =
    location.state || {};
  const generatedCodeDigits = String(generatedCode || '').replace(/\D/g, '');
  const expectedCodeLength = generatedCodeDigits.length;

  const [activationCode, setActivationCode] = useState(generatedCodeDigits);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isActivationCodeComplete = expectedCodeLength
    ? activationCode.length === expectedCodeLength
    : [4, 6].includes(activationCode.length);
  const codeLengthLabel = expectedCodeLength
    ? `${expectedCodeLength}-digit`
    : '4- or 6-digit';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isActivationCodeComplete) {
      setError(`Please enter the complete ${codeLengthLabel} activation code.`);
      return;
    }

    try {
      setLoading(true);

      const result = await activateAccount(
        activationToken,
        activationCode
      );

      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || 'Activation failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!activationToken) {
    return (
      <div className="activation-page">
        <div className="activation-card text-center">
          <Shield size={42} className="mx-auto mb-4 text-violet-600" />
          <h2 className="text-2xl font-bold">No Activation Token</h2>
          <p className="my-4">Please register first to activate your account.</p>
          <Link to="/register" className="activation-button">
            Go to Registration <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="activation-page">
      <div className="activation-wrapper">

        <Link to="/" className="activation-logo">
          <BookOpen size={34} />
          <span>KitabiKeeda</span>
        </Link>

        <div className="activation-card">

          <div className="activation-heading">
            <div className="activation-icon">
              <Shield size={34} />
            </div>

            <h1>Activate Your Account</h1>
            <p>Complete your registration with your activation code.</p>

            {email && (
              <div className="activation-email">
                <Lock size={17} />
                <span>{email}</span>
              </div>
            )}
          </div>

          {generatedCode && (
            <div className="generated-code">
              <span>Your Activation Code</span>
              <strong>{generatedCode}</strong>
              <p>Use this code to activate your account.</p>
            </div>
          )}

          {error && (
            <div className="activation-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="activationCode">
              Enter Activation Code
            </label>

            <input
              id="activationCode"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={activationCode}
              onChange={(e) =>
                setActivationCode(e.target.value.replace(/\D/g, ''))
              }
              placeholder={`Enter ${codeLengthLabel} code`}
            />

            <p className="activation-hint">
              Enter the {codeLengthLabel} code shown above.
            </p>

            <button
              type="submit"
              disabled={loading || !isActivationCodeComplete}
              className="activation-button"
            >
              {loading ? 'Activating...' : 'Activate Account'}
              {!loading && <ArrowRight size={19} />}
            </button>
          </form>

          <div className="activation-note">
            <CheckCircle size={21} />
            <div>
              <strong>Almost there!</strong>
              <p>Activate your account to access courses and track your learning progress.</p>
            </div>
          </div>

          <p className="activation-login">
            Already activated? <Link to="/login">Sign in</Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;

// import { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { Shield, CheckCircle, BookOpen, ArrowRight } from 'lucide-react';

// const ActivateAccount = () => {
//   const [activationCode, setActivationCode] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const { activateAccount } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { activationToken, email } = location.state || {};

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     const result = await activateAccount(activationToken, activationCode);

//     setLoading(false);

//     if (result.success) {
//       navigate('/login');
//     } else {
//       setError(result.message || 'Activation failed');
//     }
//   };

//   if (!activationToken) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full text-center">
//           <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">No Activation Token</h2>
//           <p className="text-gray-600 mb-6">Please register first to activate your account.</p>
//           <Link
//             to="/register"
//             className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
//           >
//             <span>Go to Registration</span>
//             <ArrowRight className="h-5 w-5" />
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <Link to="/" className="inline-flex items-center space-x-2">
//             <BookOpen className="h-10 w-10 text-indigo-600" />
//             <span className="text-2xl font-bold text-gray-900">KitabiKeeda</span>
//           </Link>
//         </div>

//         <div className="bg-white rounded-lg shadow-sm p-8">
//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <Shield className="h-8 w-8 text-indigo-600" />
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900">Activate Your Account</h2>
//             <p className="text-gray-600 mt-2">
//               Enter the 4-digit activation code sent to <span className="font-medium">{email}</span>
//             </p>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-sm text-red-600">{error}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="activationCode" className="block text-sm font-medium text-gray-700 mb-2">
//                 Activation Code
//               </label>
//               <input
//                 id="activationCode"
//                 type="text"
//                 required
//                 maxLength={4}
//                 value={activationCode}
//                 onChange={(e) => setActivationCode(e.target.value.replace(/\D/g, ''))}
//                 className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                 placeholder="0000"
//               />
//               <p className="mt-2 text-sm text-gray-500 text-center">
//                 Enter the 4-digit code from your email
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={loading || activationCode.length !== 4}
//               className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Activating...' : 'Activate Account'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               Didn't receive the code?{' '}
//               <button className="text-indigo-600 font-medium hover:text-indigo-700">
//                 Resend
//               </button>
//             </p>
//           </div>

//           <div className="mt-6 pt-6 border-t border-gray-200">
//             <div className="flex items-start space-x-3">
//               <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
//               <div className="text-sm text-gray-600">
//                 <p className="font-medium text-gray-900">Note:</p>
//                 <p>
//                   If you didn't receive the email, check your spam folder or contact support at
//                   support@kitabikeeda.com
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ActivateAccount;
