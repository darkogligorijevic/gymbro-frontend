// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/hooks/useAuth';
// import Link from 'next/link';
// import { useToast } from '@/hooks/useToast';
// import { Zap } from 'lucide-react';

// export default function RegisterPage() {
//   const router = useRouter();
//   const { register, isLoading } = useAuth();
//   const [email, setEmail] = useState('');
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const toast = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (password !== confirmPassword) {
//       toast.error('Passwords do not match');
//       return;
//     }

//     if (password.length < 6) {
//       toast.error('Password must be at least 6 characters');
//       return;
//     }

//     try {
//       await register({
//         email,
//         username,
//         password,
//         firstName: firstName || undefined,
//         lastName: lastName || undefined,
//       });
//       toast.success('Welcome to Gymbro! 🎉');
//       router.push('/dashboard');
//     } catch (err: any) {
//       toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-dark bg-gym-pattern px-4 py-8 relative overflow-hidden">
//       {/* Background Gradient */}
//       <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-orange-500/10"></div>
      
//       <div className="relative z-10 w-full max-w-md">
//         {/* Logo */}
//         <div className="text-center mb-8">
//           <Link href="/" className="inline-flex items-center gap-3 group">
//             <Zap className="w-12 h-12 text-primary-500 group-hover:rotate-12 transition-transform" />
//             <span className="text-3xl md:text-4xl font-bold gradient-text">Gymbro</span>
//           </Link>
//           <p className="text-gray-400 mt-2">Start your fitness journey today!</p>
//         </div>

//         {/* Register Card */}
//         <div className="card">
//           <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-gray-300 font-semibold mb-2">First Name</label>
//                 <input
//                   type="text"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   className="input-field"
//                   placeholder="John"
//                 />
//               </div>
//               <div>
//                 <label className="block text-gray-300 font-semibold mb-2">Last Name</label>
//                 <input
//                   type="text"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   className="input-field"
//                   placeholder="Doe"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-gray-300 font-semibold mb-2">Email</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="input-field"
//                 placeholder="your.email@example.com"
//                 required
//                 autoComplete="email"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-300 font-semibold mb-2">Username</label>
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="input-field"
//                 placeholder="johndoe"
//                 required
//                 autoComplete="username"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-300 font-semibold mb-2">Password</label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="input-field pr-12"
//                   placeholder="Create a password"
//                   required
//                   autoComplete="new-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
//                 >
//                   {showPassword ? (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                     </svg>
//                   ) : (
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
//             </div>

//             <div>
//               <label className="block text-gray-300 font-semibold mb-2">Confirm Password</label>
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className="input-field"
//                 placeholder="Confirm your password"
//                 required
//                 autoComplete="new-password"
//               />
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="btn-primary w-full py-4 text-lg"
//             >
//               {isLoading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
//                   Creating Account...
//                 </>
//               ) : (
//                 <>
//                   <Zap className="w-5 h-5 inline mr-2" />
//                   Create Account
//                 </>
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-gray-400">
//               Already have an account?{' '}
//               <Link href="/login" className="text-primary-500 hover:text-primary-400 font-semibold transition">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }