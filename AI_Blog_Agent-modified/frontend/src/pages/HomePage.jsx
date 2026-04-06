// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Sparkles, X, Plus, ArrowRight, Loader2, Zap, Lock } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { createPost } from '../utils/api'
// import { useAuth } from '../App'

// const SUGGESTIONS = ['SEO tips', 'content marketing', 'digital marketing', 'social media', 'email marketing', 'lead generation']

// export default function HomePage() {
//   const navigate = useNavigate()
//   const { user } = useAuth()

//   // Guests see a locked state; logged-in users see the form
//   const isGuest = !user || user.role === 'guest'

//   const [topic, setTopic] = useState('')
//   const [keywords, setKeywords] = useState([])
//   const [kw, setKw] = useState('')
//   const [loading, setLoading] = useState(false)

//   const addKw = (k) => {
//     const v = (k || kw).trim()
//     if (!v || keywords.includes(v)) return
//     setKeywords(p => [...p, v]); setKw('')
//   }
//   const removeKw = (k) => setKeywords(p => p.filter(x => x !== k))

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (isGuest) { toast.error('Please sign in to create a post'); navigate('/login'); return }
//     if (!topic.trim()) { toast.error('Enter a topic'); return }
//     setLoading(true)
//     try {
//       const res = await createPost({ topic: topic.trim(), target_keywords: keywords })
//       toast.success('Outline generated!')
//       navigate(`/editor/${res.data.post.id}`)
//     } catch (err) {
//       if (err?.response?.status === 401) { toast.error('Session expired — please sign in again'); navigate('/login') }
//       else { toast.error(err?.response?.data?.detail || 'Failed to generate outline') }
//     } finally { setLoading(false) }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
//       <div className="w-full max-w-xl animate-fade-up">

//         {/* Hero */}
//         <div className="text-center mb-8">
//           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-xs font-medium mb-4">
//             <Sparkles size={12} /> AI-Powered SEO Blog Writer
//           </div>
//           <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
//             From topic to<br />
//             <span className="text-violet-600 dark:text-violet-400">SEO-ready post</span>
//           </h1>
//           <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
//             Enter your topic and keywords. AI generates a structured outline, writes each section, and scores your SEO.
//           </p>
//         </div>

//         {/* ── GUEST: locked card ──────────────────────────────────────────── */}
//         {isGuest ? (
//           <div className="card p-8 shadow-sm text-center">
//             <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
//               <Lock size={22} className="text-gray-400" />
//             </div>
//             <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
//               Sign in to create posts
//             </h2>
//             <p className="text-sm text-gray-400 dark:text-gray-500 mb-5 max-w-xs mx-auto">
//               Guests can only view published posts. Create a free account to generate and save your own AI blogs.
//             </p>
//             <button onClick={() => navigate('/login')} className="btn-primary justify-center px-6 py-2.5">
//               Sign In / Register
//             </button>
//           </div>

//         ) : (
//         /* ── LOGGED IN: full form ──────────────────────────────────────────── */
//           <div className="card p-5 shadow-sm">
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                   Blog Topic <span className="text-violet-500">*</span>
//                 </label>
//                 <input className="input text-sm" placeholder="e.g. How to improve website SEO in 2025"
//                   value={topic} onChange={e => setTopic(e.target.value)} disabled={loading} autoFocus />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                   Target Keywords <span className="text-gray-400 font-normal normal-case">(press Enter to add)</span>
//                 </label>
//                 <div className="flex gap-2">
//                   <input className="input text-sm" placeholder="Type a keyword…"
//                     value={kw} onChange={e => setKw(e.target.value)}
//                     onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw() } }}
//                     disabled={loading} />
//                   <button type="button" onClick={() => addKw()} disabled={!kw.trim() || loading}
//                     className="btn-ghost flex-shrink-0 px-3">
//                     <Plus size={15} />
//                   </button>
//                 </div>

//                 {keywords.length > 0 && (
//                   <div className="flex flex-wrap gap-1.5 mt-2.5">
//                     {keywords.map(k => (
//                       <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
//                         {k}
//                         <button onClick={() => removeKw(k)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 <div className="flex flex-wrap gap-1.5 mt-2.5">
//                   {SUGGESTIONS.filter(s => !keywords.includes(s)).slice(0, 5).map(s => (
//                     <button key={s} type="button" onClick={() => addKw(s)}
//                       className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
//                       + {s}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full justify-center py-2.5">
//                 {loading
//                   ? <><Loader2 size={16} className="animate-spin" /> Generating Outline…</>
//                   : <><Sparkles size={16} /> Generate Outline <ArrowRight size={14} /></>}
//               </button>
//             </form>
//           </div>
//         )}

//         <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-6">
//           {['AI Outline', 'Section Writer', 'SEO Scoring', 'Readability', 'Meta Tags', 'MD / HTML Export'].map(f => (
//             <span key={f} className="text-xs text-gray-400 dark:text-gray-600">· {f}</span>
//           ))}
//         </div>
//       </div>
//     </div>
//   )
// }

// import { useState, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Sparkles, X, Plus, ArrowRight, Loader2, Lock, Eye, ChevronDown } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { createPost } from '../utils/api'
// import { useAuth } from '../App'

// const SUGGESTIONS = ['SEO tips', 'content marketing', 'digital marketing', 'social media', 'email marketing', 'lead generation']

// export default function HomePage() {
//   const navigate = useNavigate()
//   const { user, setUser } = useAuth()

//   const isGuest = user?.role === 'guest'
//   const isLoggedIn = user && user.role !== 'guest'

//   const [topic, setTopic] = useState('')
//   const [keywords, setKeywords] = useState([])
//   const [kw, setKw] = useState('')
//   const [loading, setLoading] = useState(false)

//   // ref to scroll to the card section
//   const cardRef = useRef(null)

//   const scrollToCard = () => {
//     cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
//   }

//   const addKw = (k) => {
//     const v = (k || kw).trim()
//     if (!v || keywords.includes(v)) return
//     setKeywords(p => [...p, v]); setKw('')
//   }
//   const removeKw = (k) => setKeywords(p => p.filter(x => x !== k))

//   // Guest blog generation — no SEO scoring, no saving, no viewing others
//   const handleGuestSubmit = async (e) => {
//     e.preventDefault()
//     if (!topic.trim()) { toast.error('Enter a topic'); return }
//     setLoading(true)
//     try {
//       const res = await createPost({ topic: topic.trim(), target_keywords: keywords, guest: true })
//       toast.success('Blog generated!')
//       // Navigate to editor but with a flag that disables SEO + others' posts
//       navigate(`/editor/${res.data.post.id}?guest=true`)
//     } catch (err) {
//       if (err?.response?.status === 401) {
//         toast.error('Session expired — please sign in again'); navigate('/login')
//       } else {
//         toast.error(err?.response?.data?.detail || 'Failed to generate blog')
//       }
//     } finally { setLoading(false) }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!topic.trim()) { toast.error('Enter a topic'); return }
//     setLoading(true)
//     try {
//       const res = await createPost({ topic: topic.trim(), target_keywords: keywords })
//       toast.success('Outline generated!')
//       navigate(`/editor/${res.data.post.id}`)
//     } catch (err) {
//       if (err?.response?.status === 401) {
//         toast.error('Session expired — please sign in again'); navigate('/login')
//       } else {
//         toast.error(err?.response?.data?.detail || 'Failed to generate outline')
//       }
//     } finally { setLoading(false) }
//   }

//   const handleContinueAsGuest = () => {
//     localStorage.setItem('guestMode', 'guest')
//     setUser({ username: 'Guest', role: 'guest', id: null })
//     scrollToCard()
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

//       {/* ── HERO SECTION (full viewport height) ── */}
//       <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
//         {/* Badge */}
//         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-sm font-medium mb-6">
//           <Sparkles size={14} /> AI-Powered SEO Blog Writer
//         </div>

//         {/* Title — larger */}
//         <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
//           From topic to<br />
//           <span className="text-violet-600 dark:text-violet-400">SEO-ready post</span>
//         </h1>

//         {/* Subtitle — larger */}
//         <p className="text-gray-500 dark:text-gray-400 text-xl lg:text-2xl max-w-xl mx-auto mb-10 leading-relaxed">
//           Enter your topic and keywords. AI generates a structured outline, writes each section, and scores your SEO.
//         </p>

//         {/* CTA Buttons */}
//         {!user ? (
//           <div className="flex flex-col sm:flex-row gap-3 items-center">
//             <button
//               onClick={() => navigate('/login')}
//               className="btn-primary px-8 py-3 text-base justify-center"
//             >
//               Sign In / Register
//             </button>
//             <button
//               onClick={handleContinueAsGuest}
//               className="btn-ghost px-8 py-3 text-base justify-center gap-2"
//             >
//               <Eye size={16} />
//               Continue as Guest
//             </button>
//           </div>
//         ) : isGuest ? (
//           <div className="flex flex-col items-center gap-3">
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               Browsing as <span className="font-semibold text-violet-600 dark:text-violet-400">Guest</span> — generate blogs freely, SEO scoring disabled
//             </p>
//             <button onClick={scrollToCard} className="btn-primary px-8 py-3 text-base justify-center gap-2">
//               <Sparkles size={16} /> Generate a Blog
//             </button>
//           </div>
//         ) : (
//           <button onClick={scrollToCard} className="btn-primary px-8 py-3 text-base justify-center gap-2">
//             <Sparkles size={16} /> Get Started
//           </button>
//         )}

//         {/* Scroll hint */}
//         <button
//           onClick={scrollToCard}
//           className="mt-14 flex flex-col items-center gap-1 text-gray-400 hover:text-violet-500 transition-colors animate-bounce"
//           aria-label="Scroll to form"
//         >
//           <span className="text-xs tracking-wide uppercase">Try it now</span>
//           <ChevronDown size={20} />
//         </button>

//         {/* Features strip */}
//         <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-10">
//           {['AI Outline', 'Section Writer', 'SEO Scoring', 'Readability', 'Meta Tags', 'MD / HTML Export'].map(f => (
//             <span key={f} className="text-sm text-gray-400 dark:text-gray-600">· {f}</span>
//           ))}
//         </div>
//       </div>

//       {/* ── FORM SECTION (below the fold) ── */}
//       <div ref={cardRef} className="flex items-center justify-center px-6 pb-24 pt-8">
//         <div className="w-full max-w-xl">

//           {/* ── NOT LOGGED IN: locked card ── */}
//           {!user && (
//             <div className="card p-8 shadow-sm text-center">
//               <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
//                 <Lock size={24} className="text-gray-400" />
//               </div>
//               <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
//                 Sign in to create posts
//               </h2>
//               <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs mx-auto">
//                 Create a free account to generate, score, and save your AI blogs — or continue as a guest to generate without saving.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                 <button onClick={() => navigate('/login')} className="btn-primary justify-center px-6 py-2.5">
//                   Sign In / Register
//                 </button>
//                 <button onClick={handleContinueAsGuest} className="btn-ghost justify-center px-6 py-2.5 gap-2">
//                   <Eye size={15} /> Continue as Guest
//                 </button>
//               </div>
//               <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
//                 Guest: generate only · no SEO scoring · no saved posts
//               </p>
//             </div>
//           )}

//           {/* ── GUEST: generate-only form ── */}
//           {isGuest && (
//             <div className="card p-5 shadow-sm">
//               {/* Guest notice banner */}
//               <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-4 text-xs text-amber-700 dark:text-amber-400">
//                 <Eye size={13} className="flex-shrink-0" />
//                 <span>
//                   <strong>Guest mode:</strong> You can generate blogs freely. SEO scoring, saving, and viewing others' posts are disabled.{' '}
//                   <button onClick={() => navigate('/login')} className="underline hover:no-underline font-medium">
//                     Sign in for full access
//                   </button>
//                 </span>
//               </div>

//               <form onSubmit={handleGuestSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                     Blog Topic <span className="text-violet-500">*</span>
//                   </label>
//                   <input
//                     className="input text-sm"
//                     placeholder="e.g. How to improve website SEO in 2025"
//                     value={topic}
//                     onChange={e => setTopic(e.target.value)}
//                     disabled={loading}
//                     autoFocus
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                     Target Keywords <span className="text-gray-400 font-normal normal-case">(press Enter to add)</span>
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       className="input text-sm"
//                       placeholder="Type a keyword…"
//                       value={kw}
//                       onChange={e => setKw(e.target.value)}
//                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw() } }}
//                       disabled={loading}
//                     />
//                     <button type="button" onClick={() => addKw()} disabled={!kw.trim() || loading} className="btn-ghost flex-shrink-0 px-3">
//                       <Plus size={15} />
//                     </button>
//                   </div>

//                   {keywords.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5 mt-2.5">
//                       {keywords.map(k => (
//                         <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
//                           {k}
//                           <button onClick={() => removeKw(k)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
//                         </span>
//                       ))}
//                     </div>
//                   )}

//                   <div className="flex flex-wrap gap-1.5 mt-2.5">
//                     {SUGGESTIONS.filter(s => !keywords.includes(s)).slice(0, 5).map(s => (
//                       <button key={s} type="button" onClick={() => addKw(s)}
//                         className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
//                         + {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Disabled SEO hint */}
//                 <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
//                   <Lock size={12} />
//                   SEO scoring & readability analysis require a signed-in account
//                 </div>

//                 <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full justify-center py-2.5">
//                   {loading
//                     ? <><Loader2 size={16} className="animate-spin" /> Generating Blog…</>
//                     : <><Sparkles size={16} /> Generate Blog <ArrowRight size={14} /></>}
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* ── LOGGED IN: full form ── */}
//           {isLoggedIn && (
//             <div className="card p-5 shadow-sm">
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                     Blog Topic <span className="text-violet-500">*</span>
//                   </label>
//                   <input
//                     className="input text-sm"
//                     placeholder="e.g. How to improve website SEO in 2025"
//                     value={topic}
//                     onChange={e => setTopic(e.target.value)}
//                     disabled={loading}
//                     autoFocus
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                     Target Keywords <span className="text-gray-400 font-normal normal-case">(press Enter to add)</span>
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       className="input text-sm"
//                       placeholder="Type a keyword…"
//                       value={kw}
//                       onChange={e => setKw(e.target.value)}
//                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw() } }}
//                       disabled={loading}
//                     />
//                     <button type="button" onClick={() => addKw()} disabled={!kw.trim() || loading} className="btn-ghost flex-shrink-0 px-3">
//                       <Plus size={15} />
//                     </button>
//                   </div>

//                   {keywords.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5 mt-2.5">
//                       {keywords.map(k => (
//                         <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
//                           {k}
//                           <button onClick={() => removeKw(k)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
//                         </span>
//                       ))}
//                     </div>
//                   )}

//                   <div className="flex flex-wrap gap-1.5 mt-2.5">
//                     {SUGGESTIONS.filter(s => !keywords.includes(s)).slice(0, 5).map(s => (
//                       <button key={s} type="button" onClick={() => addKw(s)}
//                         className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
//                         + {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full justify-center py-2.5">
//                   {loading
//                     ? <><Loader2 size={16} className="animate-spin" /> Generating Outline…</>
//                     : <><Sparkles size={16} /> Generate Outline <ArrowRight size={14} /></>}
//                 </button>
//               </form>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   )
// }

// import { useState, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Sparkles, X, Plus, ArrowRight, Loader2, Lock, Eye, ChevronDown } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { createPost } from '../utils/api'
// import { useAuth } from '../App'

// const SUGGESTIONS = ['SEO tips', 'content marketing', 'digital marketing', 'social media', 'email marketing', 'lead generation']

// export default function HomePage() {
//   const navigate = useNavigate()
//   const { user, setUser } = useAuth()

//   const isGuest = user?.role === 'guest'
//   const isLoggedIn = user && user.role !== 'guest'

//   const [topic, setTopic] = useState('')
//   const [keywords, setKeywords] = useState([])
//   const [kw, setKw] = useState('')
//   const [loading, setLoading] = useState(false)

//   // ref to scroll to the card section
//   const cardRef = useRef(null)

//   const scrollToCard = () => {
//     cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
//   }

//   const addKw = (k) => {
//     const v = (k || kw).trim()
//     if (!v || keywords.includes(v)) return
//     setKeywords(p => [...p, v]); setKw('')
//   }
//   const removeKw = (k) => setKeywords(p => p.filter(x => x !== k))

//   // Guest blog generation — no SEO scoring, no saving, no viewing others
//   const handleGuestSubmit = async (e) => {
//     e.preventDefault()
//     if (!topic.trim()) { toast.error('Enter a topic'); return }
//     setLoading(true)
//     try {
//       const res = await createPost({ topic: topic.trim(), target_keywords: keywords, guest: true })
//       toast.success('Blog generated!')
//       // Navigate to editor but with a flag that disables SEO + others' posts
//       navigate(`/editor/${res.data.post.id}?guest=true`)
//     } catch (err) {
//       if (err?.response?.status === 401) {
//         toast.error('Session expired — please sign in again'); navigate('/login')
//       } else {
//         toast.error(err?.response?.data?.detail || 'Failed to generate blog')
//       }
//     } finally { setLoading(false) }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!topic.trim()) { toast.error('Enter a topic'); return }
//     setLoading(true)
//     try {
//       const res = await createPost({ topic: topic.trim(), target_keywords: keywords })
//       toast.success('Outline generated!')
//       navigate(`/editor/${res.data.post.id}`)
//     } catch (err) {
//       if (err?.response?.status === 401) {
//         toast.error('Session expired — please sign in again'); navigate('/login')
//       } else {
//         toast.error(err?.response?.data?.detail || 'Failed to generate outline')
//       }
//     } finally { setLoading(false) }
//   }

//   const handleContinueAsGuest = () => {
//     localStorage.setItem('guestMode', 'guest')
//     setUser({ username: 'Guest', role: 'guest', id: null })
//     scrollToCard()
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

//       {/* ── HERO SECTION (full viewport height) ── */}
//       <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
//         {/* Badge */}
//         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-sm font-medium mb-6">
//           <Sparkles size={14} /> AI-Powered SEO Blog Writer
//         </div>

//         {/* Title — larger */}
//         <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
//           From topic to<br />
//           <span className="text-violet-600 dark:text-violet-400">SEO-ready post</span>
//         </h1>

//         {/* Subtitle — larger */}
//         <p className="text-gray-500 dark:text-gray-400 text-xl lg:text-2xl max-w-xl mx-auto mb-10 leading-relaxed">
//           Enter your topic and keywords. AI generates a structured outline, writes each section, and scores your SEO.
//         </p>

//         {/* Scroll hint */}
//         <button
//           onClick={scrollToCard}
//           className="mt-14 flex flex-col items-center gap-1 text-gray-400 hover:text-violet-500 transition-colors animate-bounce"
//           aria-label="Scroll to form"
//         >
//           <span className="text-xs tracking-wide uppercase">Try it now</span>
//           <ChevronDown size={20} />
//         </button>

//         {/* Features strip */}
//         <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-10">
//           {['AI Outline', 'Section Writer', 'SEO Scoring', 'Readability', 'Meta Tags', 'MD / HTML Export'].map(f => (
//             <span key={f} className="text-sm text-gray-400 dark:text-gray-600">· {f}</span>
//           ))}
//         </div>
//       </div>

//       {/* ── FORM SECTION (below the fold) ── */}
//       <div ref={cardRef} className="flex items-center justify-center px-6 pb-24 pt-8">
//         <div className="w-full max-w-xl">

//           {/* ── NOT LOGGED IN: locked card ── */}
//           {!user && (
//             <div className="card p-8 shadow-sm text-center">
//               <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
//                 <Lock size={24} className="text-gray-400" />
//               </div>
//               <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
//                 Sign in to create posts
//               </h2>
//               <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs mx-auto">
//                 Create a free account to generate, score, and save your AI blogs — or continue as a guest to generate without saving.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                 <button onClick={() => navigate('/login')} className="btn-primary justify-center px-6 py-2.5">
//                   Sign In / Register
//                 </button>
//                 <button onClick={handleContinueAsGuest} className="btn-ghost justify-center px-6 py-2.5 gap-2">
//                   <Eye size={15} /> Continue as Guest
//                 </button>
//               </div>
//               <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
//                 Guest: generate only · no SEO scoring · no saved posts
//               </p>
//             </div>
//           )}

//           {/* ── GUEST: generate-only form ── */}
//           {isGuest && (
//             <div className="card p-5 shadow-sm">
//               {/* Guest notice banner */}
//               <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-4 text-xs text-amber-700 dark:text-amber-400">
//                 <Eye size={13} className="flex-shrink-0" />
//                 <span>
//                   <strong>Guest mode:</strong> You can generate blogs freely. SEO scoring, saving, and viewing others' posts are disabled.{' '}
//                   <button onClick={() => navigate('/login')} className="underline hover:no-underline font-medium">
//                     Sign in for full access
//                   </button>
//                 </span>
//               </div>

//               <form onSubmit={handleGuestSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                     Blog Topic <span className="text-violet-500">*</span>
//                   </label>
//                   <input
//                     className="input text-sm"
//                     placeholder="e.g. How to improve website SEO in 2025"
//                     value={topic}
//                     onChange={e => setTopic(e.target.value)}
//                     disabled={loading}
//                     autoFocus
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                     Target Keywords <span className="text-gray-400 font-normal normal-case">(press Enter to add)</span>
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       className="input text-sm"
//                       placeholder="Type a keyword…"
//                       value={kw}
//                       onChange={e => setKw(e.target.value)}
//                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw() } }}
//                       disabled={loading}
//                     />
//                     <button type="button" onClick={() => addKw()} disabled={!kw.trim() || loading} className="btn-ghost flex-shrink-0 px-3">
//                       <Plus size={15} />
//                     </button>
//                   </div>

//                   {keywords.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5 mt-2.5">
//                       {keywords.map(k => (
//                         <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
//                           {k}
//                           <button onClick={() => removeKw(k)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
//                         </span>
//                       ))}
//                     </div>
//                   )}

//                   <div className="flex flex-wrap gap-1.5 mt-2.5">
//                     {SUGGESTIONS.filter(s => !keywords.includes(s)).slice(0, 5).map(s => (
//                       <button key={s} type="button" onClick={() => addKw(s)}
//                         className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
//                         + {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Disabled SEO hint */}
//                 <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
//                   <Lock size={12} />
//                   SEO scoring & readability analysis require a signed-in account
//                 </div>

//                 <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full justify-center py-2.5">
//                   {loading
//                     ? <><Loader2 size={16} className="animate-spin" /> Generating Blog…</>
//                     : <><Sparkles size={16} /> Generate Blog <ArrowRight size={14} /></>}
//                 </button>
//               </form>
//             </div>
//           )}

//           {/* ── LOGGED IN: full form ── */}
//           {isLoggedIn && (
//             <div className="card p-5 shadow-sm">
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                     Blog Topic <span className="text-violet-500">*</span>
//                   </label>
//                   <input
//                     className="input text-sm"
//                     placeholder="e.g. How to improve website SEO in 2025"
//                     value={topic}
//                     onChange={e => setTopic(e.target.value)}
//                     disabled={loading}
//                     autoFocus
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
//                     Target Keywords <span className="text-gray-400 font-normal normal-case">(press Enter to add)</span>
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       className="input text-sm"
//                       placeholder="Type a keyword…"
//                       value={kw}
//                       onChange={e => setKw(e.target.value)}
//                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw() } }}
//                       disabled={loading}
//                     />
//                     <button type="button" onClick={() => addKw()} disabled={!kw.trim() || loading} className="btn-ghost flex-shrink-0 px-3">
//                       <Plus size={15} />
//                     </button>
//                   </div>

//                   {keywords.length > 0 && (
//                     <div className="flex flex-wrap gap-1.5 mt-2.5">
//                       {keywords.map(k => (
//                         <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
//                           {k}
//                           <button onClick={() => removeKw(k)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
//                         </span>
//                       ))}
//                     </div>
//                   )}

//                   <div className="flex flex-wrap gap-1.5 mt-2.5">
//                     {SUGGESTIONS.filter(s => !keywords.includes(s)).slice(0, 5).map(s => (
//                       <button key={s} type="button" onClick={() => addKw(s)}
//                         className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
//                         + {s}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full justify-center py-2.5">
//                   {loading
//                     ? <><Loader2 size={16} className="animate-spin" /> Generating Outline…</>
//                     : <><Sparkles size={16} /> Generate Outline <ArrowRight size={14} /></>}
//                 </button>
//               </form>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   )
// }

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, Plus, ArrowRight, Loader2, Lock, Eye, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { createPost, createGuestSession } from '../utils/api'
import { useAuth } from '../App'

const SUGGESTIONS = ['SEO tips', 'content marketing', 'digital marketing', 'social media', 'email marketing', 'lead generation']

export default function HomePage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()

  const isGuest = user?.role === 'guest'
  const isLoggedIn = user && user.role !== 'guest'

  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState([])
  const [kw, setKw] = useState('')
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)

  const cardRef = useRef(null)
  const scrollToCard = () => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const addKw = (k) => {
    const v = (k || kw).trim()
    if (!v || keywords.includes(v)) return
    setKeywords(p => [...p, v]); setKw('')
  }
  const removeKw = (k) => setKeywords(p => p.filter(x => x !== k))

  // When clicking "Continue as Guest" — auto-create a real backend session
  const handleContinueAsGuest = async () => {
    setGuestLoading(true)
    try {
      const guestUser = await createGuestSession()
      // Handle both 'token' and 'access_token' field names from backend
      const token = guestUser.token || guestUser.access_token
      if (token) localStorage.setItem('session', token)
      localStorage.setItem('guestMode', 'guest')
      setUser({ ...guestUser, role: 'guest', username: 'Guest' })
      scrollToCard()
    } catch {
      toast.error('Failed to start guest session. Please try signing in.')
    } finally {
      setGuestLoading(false)
    }
  }

  // Guest submit — has real token now so createPost will succeed
  const handleGuestSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) { toast.error('Enter a topic'); return }
    setLoading(true)
    try {
      const res = await createPost({ topic: topic.trim(), target_keywords: keywords })
      toast.success('Blog generated!')
      navigate(`/editor/${res.data.post.id}?guest=true`)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to generate blog')
    } finally { setLoading(false) }
  }

  // Logged-in submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) { toast.error('Enter a topic'); return }
    setLoading(true)
    try {
      const res = await createPost({ topic: topic.trim(), target_keywords: keywords })
      toast.success('Outline generated!')
      navigate(`/editor/${res.data.post.id}`)
    } catch (err) {
      if (err?.response?.status === 401) {
        toast.error('Session expired — please sign in again'); navigate('/login')
      } else {
        toast.error(err?.response?.data?.detail || 'Failed to generate outline')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── HERO SECTION ── */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-sm font-medium mb-6">
          <Sparkles size={14} /> AI-Powered SEO Blog Writer
        </div>

        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
          From topic to<br />
          <span className="text-violet-600 dark:text-violet-400">SEO-ready post</span>
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-xl lg:text-2xl max-w-xl mx-auto mb-10 leading-relaxed">
          Enter your topic and keywords. AI generates a structured outline, writes each section, and scores your SEO.
        </p>

        {/* Scroll hint */}
        <button
          onClick={scrollToCard}
          className="mt-4 flex flex-col items-center gap-1 text-gray-400 hover:text-violet-500 transition-colors animate-bounce"
          aria-label="Scroll to form"
        >
          <span className="text-xs tracking-wide uppercase">Try it now</span>
          <ChevronDown size={20} />
        </button>

        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-10">
          {['AI Outline', 'Section Writer', 'SEO Scoring', 'Readability', 'Meta Tags', 'MD / HTML Export'].map(f => (
            <span key={f} className="text-sm text-gray-400 dark:text-gray-600">· {f}</span>
          ))}
        </div>
      </div>

      {/* ── FORM SECTION ── */}
      <div ref={cardRef} className="flex items-center justify-center px-6 pb-24 pt-8">
        <div className="w-full max-w-xl">

          {/* Not logged in — locked card */}
          {!user && (
            <div className="card p-8 shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Get started with BlogForge
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-xs mx-auto">
                Create a free account for full access, or continue as a guest to generate blogs without signing up.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/login')} className="btn-primary justify-center px-6 py-2.5">
                  Sign In / Register
                </button>
                <button
                  onClick={handleContinueAsGuest}
                  disabled={guestLoading}
                  className="btn-ghost justify-center px-6 py-2.5 gap-2"
                >
                  {guestLoading ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                  Continue as Guest
                </button>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
                Guest: generate blogs · no SEO scoring · no history · no downloads
              </p>
            </div>
          )}

          {/* Guest form */}
          {isGuest && (
            <div className="card p-5 shadow-sm">
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-4 text-xs text-amber-700 dark:text-amber-400">
                <Eye size={13} className="flex-shrink-0" />
                <span>
                  <strong>Guest mode:</strong> Generate blogs freely. SEO scoring, history, and downloads require an account.{' '}
                  <button onClick={() => navigate('/login')} className="underline hover:no-underline font-medium">
                    Sign in for full access
                  </button>
                </span>
              </div>

              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Blog Topic <span className="text-violet-500">*</span>
                  </label>
                  <input
                    className="input text-sm"
                    placeholder="e.g. How to improve website SEO in 2025"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Target Keywords <span className="text-gray-400 font-normal normal-case">(press Enter to add)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="input text-sm"
                      placeholder="Type a keyword…"
                      value={kw}
                      onChange={e => setKw(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw() } }}
                      disabled={loading}
                    />
                    <button type="button" onClick={() => addKw()} disabled={!kw.trim() || loading} className="btn-ghost flex-shrink-0 px-3">
                      <Plus size={15} />
                    </button>
                  </div>

                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {keywords.map(k => (
                        <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          {k}
                          <button onClick={() => removeKw(k)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {SUGGESTIONS.filter(s => !keywords.includes(s)).slice(0, 5).map(s => (
                      <button key={s} type="button" onClick={() => addKw(s)}
                        className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <Lock size={12} />
                  SEO scoring, history &amp; downloads are locked in guest mode
                </div>

                <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full justify-center py-2.5">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Generating Blog…</>
                    : <><Sparkles size={16} /> Generate Blog <ArrowRight size={14} /></>}
                </button>
              </form>
            </div>
          )}

          {/* Logged-in form */}
          {isLoggedIn && (
            <div className="card p-5 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Blog Topic <span className="text-violet-500">*</span>
                  </label>
                  <input
                    className="input text-sm"
                    placeholder="e.g. How to improve website SEO in 2025"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Target Keywords <span className="text-gray-400 font-normal normal-case">(press Enter to add)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      className="input text-sm"
                      placeholder="Type a keyword…"
                      value={kw}
                      onChange={e => setKw(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw() } }}
                      disabled={loading}
                    />
                    <button type="button" onClick={() => addKw()} disabled={!kw.trim() || loading} className="btn-ghost flex-shrink-0 px-3">
                      <Plus size={15} />
                    </button>
                  </div>

                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {keywords.map(k => (
                        <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          {k}
                          <button onClick={() => removeKw(k)} className="hover:text-red-500 transition-colors"><X size={11} /></button>
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {SUGGESTIONS.filter(s => !keywords.includes(s)).slice(0, 5).map(s => (
                      <button key={s} type="button" onClick={() => addKw(s)}
                        className="text-xs px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full justify-center py-2.5">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Generating Outline…</>
                    : <><Sparkles size={16} /> Generate Outline <ArrowRight size={14} /></>}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
