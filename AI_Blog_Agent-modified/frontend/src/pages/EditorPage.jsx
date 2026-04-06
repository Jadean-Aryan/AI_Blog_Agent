// import { useState, useEffect, useCallback } from 'react'
// import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
// import { ArrowLeft, FileText, FileCode, Loader2, PanelRight, PanelRightClose, Edit3, Check, X, Lock } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { getPost, updatePost, exportMarkdown, exportHTML } from '../utils/api'
// import { downloadBlob, scoreBg } from '../utils/helpers'
// import OutlinePanel from '../components/editor/OutlinePanel'
// import SEOSidebar from '../components/seo/SEOSidebar'
// import { useAuth } from '../App'

// export default function EditorPage() {
//   const { postId } = useParams()
//   const [searchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const { user } = useAuth()

//   // Guest mode: came from ?guest=true OR user role is guest
//   const isGuest = user?.role === 'guest' || searchParams.get('guest') === 'true'

//   const [data, setData] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [sidebar, setSidebar] = useState(!isGuest) // hide sidebar for guests by default
//   const [editTitle, setEditTitle] = useState(false)
//   const [titleVal, setTitleVal] = useState('')
//   const [exporting, setExporting] = useState(null)

//   const refresh = useCallback(async () => {
//     try {
//       const res = await getPost(postId)
//       setData(res.data)
//       setTitleVal(res.data.post.title)
//     } catch { toast.error('Failed to load post') }
//   }, [postId])

//   useEffect(() => {
//     setLoading(true)
//     refresh().finally(() => setLoading(false))
//   }, [refresh])

//   const saveTitle = async () => {
//     if (isGuest) { toast.error('Sign in to save changes'); return }
//     if (!titleVal.trim()) return
//     try {
//       await updatePost(postId, { title: titleVal.trim() })
//       await refresh(); setEditTitle(false); toast.success('Title updated')
//     } catch { toast.error('Update failed') }
//   }

//   const handleExport = async (format) => {
//     if (isGuest) {
//       toast.error('Sign in to download your blog')
//       return
//     }
//     setExporting(format)
//     try {
//       const res = format === 'md' ? await exportMarkdown(postId) : await exportHTML(postId)
//       const slug = data?.post?.title?.toLowerCase().replace(/\s+/g, '-').slice(0, 40) || 'post'
//       downloadBlob(res.data, `${slug}.${format}`)
//       toast.success(`Exported .${format}`)
//     } catch { toast.error('Export failed') }
//     finally { setExporting(null) }
//   }

//   if (loading) return (
//     <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
//       <Loader2 size={28} className="animate-spin text-violet-500" />
//     </div>
//   )
//   if (!data) return null

//   const { post, outline, seo, meta } = data

//   return (
//     <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
//       {/* Top Bar */}
//       <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
//         <button onClick={() => navigate('/')} className="btn-ghost py-1.5 px-2.5 text-sm">
//           <ArrowLeft size={15} />
//         </button>

//         {/* Title */}
//         <div className="flex-1 min-w-0">
//           {editTitle && !isGuest ? (
//             <div className="flex items-center gap-1.5">
//               <input className="input text-sm py-1 max-w-lg" value={titleVal}
//                 onChange={e => setTitleVal(e.target.value)}
//                 onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditTitle(false) }}
//                 autoFocus />
//               <button onClick={saveTitle} className="text-emerald-500"><Check size={14} /></button>
//               <button onClick={() => setEditTitle(false)} className="text-gray-400"><X size={14} /></button>
//             </div>
//           ) : (
//             <div className="flex items-center gap-2 group">
//               <h1 className="font-semibold text-gray-900 dark:text-white text-base truncate max-w-lg">{post.title}</h1>
//               {!isGuest && (
//                 <button onClick={() => setEditTitle(true)}
//                   className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity">
//                   <Edit3 size={13} />
//                 </button>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Guest badge */}
//         {isGuest && (
//           <span className="tag text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
//             Guest
//           </span>
//         )}

//         {/* SEO badge — hidden for guests */}
//         {!isGuest && seo?.overall_seo_score != null && (
//           <span className={`tag text-xs font-semibold ${scoreBg(seo.overall_seo_score)}`}>
//             SEO {Math.round(seo.overall_seo_score)}
//           </span>
//         )}

//         {/* Export */}
//         <button
//           onClick={() => handleExport('md')}
//           disabled={isGuest || !!exporting}
//           title={isGuest ? 'Sign in to download Markdown' : 'Download Markdown'}
//           className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {exporting === 'md' ? <Loader2 size={12} className="animate-spin" /> : <FileText size={13} />} .md
//         </button>
//         <button
//           onClick={() => handleExport('html')}
//           disabled={isGuest || !!exporting}
//           title={isGuest ? 'Sign in to download HTML' : 'Download HTML'}
//           className="btn-ghost text-xs py-1.5 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {exporting === 'html' ? <Loader2 size={12} className="animate-spin" /> : <FileCode size={13} />} .html
//         </button>

//         {/* Sidebar toggle — disabled for guests */}
//         {!isGuest && (
//           <button onClick={() => setSidebar(v => !v)} className="btn-ghost py-1.5 px-2.5">
//             {sidebar ? <PanelRightClose size={15} /> : <PanelRight size={15} />}
//           </button>
//         )}
//       </header>

//       {/* Guest notice strip */}
//       {isGuest && (
//         <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
//           <span className="flex items-center gap-1.5">
//             <Lock size={12} />
//             Guest mode - SEO scoring, downloads, readability analysis, and saving are disabled.
//           </span>
//           <button onClick={() => navigate('/login')} className="underline hover:no-underline font-medium">
//             Sign in for full access →
//           </button>
//         </div>
//       )}

//       {/* Body */}
//       <div className="flex flex-1 overflow-hidden">
//         {/* Editor */}
//         <div className="flex-1 overflow-y-auto p-5 lg:p-6">
//           {/* Meta bar */}
//           <div className="flex items-center gap-3 mb-5 flex-wrap text-xs text-gray-400">
//             <span className="flex items-center gap-1.5">
//               <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
//               {post.topic}
//             </span>
//             {post.target_keywords?.slice(0, 4).map(k => (
//               <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800">{k}</span>
//             ))}
//             <span className="ml-auto">{post.word_count} words</span>
//           </div>

//           {outline
//             ? <OutlinePanel outline={outline} post={post} onRefresh={refresh} isGuest={isGuest} />
//             : <div className="card p-10 text-center text-gray-400 text-sm">No outline found. Go back and create a new post.</div>
//           }
//         </div>

//         {/* SEO Sidebar — fully hidden for guests */}
//         {!isGuest && sidebar && (
//           <aside className="w-68 xl:w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 overflow-y-auto p-3.5 bg-gray-50 dark:bg-gray-950 animate-fade-up">
//             <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">SEO Analysis</h2>
//             <SEOSidebar postId={Number(postId)} seo={seo} meta={meta} onRefresh={refresh} />
//           </aside>
//         )}

//         {/* Guest placeholder instead of sidebar */}
//         {isGuest && (
//           <aside className="w-68 xl:w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
//               <Lock size={18} className="text-gray-400" />
//             </div>
//             <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SEO Analysis locked</p>
//             <p className="text-xs text-gray-400 dark:text-gray-600">Sign in to unlock SEO scoring, readability, and meta tag suggestions.</p>
//             <button onClick={() => navigate('/login')} className="btn-primary text-xs px-4 py-2 justify-center">
//               Sign In
//             </button>
//           </aside>
//         )}
//       </div>
//     </div>
//   )
// }


import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, FileText, FileCode, Loader2, PanelRight, PanelRightClose, Edit3, Check, X, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPost, updatePost, exportMarkdown, exportHTML } from '../utils/api'
import { downloadBlob, scoreBg } from '../utils/helpers'
import OutlinePanel from '../components/editor/OutlinePanel'
import SEOSidebar from '../components/seo/SEOSidebar'
import { useAuth } from '../App'

export default function EditorPage() {
  const { postId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  // Guest mode: came from ?guest=true OR user role is guest
  const isGuest = user?.role === 'guest' || searchParams.get('guest') === 'true'

  const [data, setData] = useState(null)
  const [ungenCount, setUngenCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sidebar, setSidebar] = useState(!isGuest) // hide sidebar for guests by default
  const [editTitle, setEditTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [exporting, setExporting] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const res = await getPost(postId)
      setData(res.data)
      setTitleVal(res.data.post.title)
    } catch { toast.error('Failed to load post') }
  }, [postId])

  useEffect(() => {
    setLoading(true)
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const saveTitle = async () => {
    if (isGuest) { toast.error('Sign in to save changes'); return }
    if (!titleVal.trim()) return
    try {
      await updatePost(postId, { title: titleVal.trim() })
      await refresh(); setEditTitle(false); toast.success('Title updated')
    } catch { toast.error('Update failed') }
  }

  const handleExport = async (format) => {
    setExporting(format)
    try {
      const res = format === 'md' ? await exportMarkdown(postId) : await exportHTML(postId)
      const slug = data?.post?.title?.toLowerCase().replace(/\s+/g, '-').slice(0, 40) || 'post'
      downloadBlob(res.data, `${slug}.${format}`)
      toast.success(`Exported .${format}`)
    } catch { toast.error('Export failed') }
    finally { setExporting(null) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
      <Loader2 size={28} className="animate-spin text-violet-500" />
    </div>
  )
  if (!data) return null

  const { post, outline, seo, meta } = data

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Top Bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/')} className="btn-ghost py-1.5 px-2.5 text-sm">
          <ArrowLeft size={15} />
        </button>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {editTitle && !isGuest ? (
            <div className="flex items-center gap-1.5">
              <input className="input text-sm py-1 max-w-lg" value={titleVal}
                onChange={e => setTitleVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditTitle(false) }}
                autoFocus />
              <button onClick={saveTitle} className="text-emerald-500"><Check size={14} /></button>
              <button onClick={() => setEditTitle(false)} className="text-gray-400"><X size={14} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="font-semibold text-gray-900 dark:text-white text-base truncate max-w-lg">{post.title}</h1>
              {!isGuest && (
                <button onClick={() => setEditTitle(true)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity">
                  <Edit3 size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Guest badge */}
        {isGuest && (
          <span className="tag text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Guest
          </span>
        )}

        {/* SEO badge — hidden for guests */}
        {!isGuest && seo?.overall_seo_score != null && (
          <span className={`tag text-xs font-semibold ${scoreBg(seo.overall_seo_score)}`}>
            SEO {Math.round(seo.overall_seo_score)}
          </span>
        )}

        {/* Export */}
        <button onClick={() => handleExport('md')} disabled={!!exporting} className="btn-ghost text-xs py-1.5 px-3">
          {exporting === 'md' ? <Loader2 size={12} className="animate-spin" /> : <FileText size={13} />} .md
        </button>
        <button onClick={() => handleExport('html')} disabled={!!exporting} className="btn-ghost text-xs py-1.5 px-3">
          {exporting === 'html' ? <Loader2 size={12} className="animate-spin" /> : <FileCode size={13} />} .html
        </button>

        {/* Sidebar toggle — disabled for guests */}
        {!isGuest && (
          <button onClick={() => setSidebar(v => !v)} className="btn-ghost py-1.5 px-2.5">
            {sidebar ? <PanelRightClose size={15} /> : <PanelRight size={15} />}
          </button>
        )}
      </header>

      {/* Guest notice strip */}
      {isGuest && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between text-xs text-amber-700 dark:text-amber-400">
          <span className="flex items-center gap-1.5">
            <Lock size={12} />
            Guest mode — SEO scoring, readability analysis, and saving are disabled.
          </span>
          <button onClick={() => navigate('/login')} className="underline hover:no-underline font-medium">
            Sign in for full access →
          </button>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-6">
          {/* Meta bar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              {post.topic}
            </span>
            {post.target_keywords?.slice(0, 4).map(k => (
              <span key={k} className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800">{k}</span>
            ))}
            <span className="ml-auto">{post.word_count} words</span>
          </div>

          {outline
            ? <OutlinePanel outline={outline} post={post} onRefresh={refresh} isGuest={isGuest} onUngenCountChange={setUngenCount} />
            : <div className="card p-10 text-center text-gray-400 text-sm">No outline found. Go back and create a new post.</div>
          }
        </div>

        {/* SEO Sidebar — fully hidden for guests */}
        {!isGuest && sidebar && (
          <aside className="w-68 xl:w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 overflow-y-auto p-3.5 bg-gray-50 dark:bg-gray-950 animate-fade-up">
            <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">SEO Analysis</h2>
            <SEOSidebar
              postId={Number(postId)}
              seo={seo}
              meta={meta}
              onRefresh={refresh}
              ungenCount={ungenCount}
              postWordCount={post.word_count}
            />
          </aside>
        )}

        {/* Guest placeholder instead of sidebar */}
        {isGuest && (
          <aside className="w-68 xl:w-72 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Lock size={18} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SEO Analysis locked</p>
            <p className="text-xs text-gray-400 dark:text-gray-600">Sign in to unlock SEO scoring, readability, and meta tag suggestions.</p>
            <button onClick={() => navigate('/login')} className="btn-primary text-xs px-4 py-2 justify-center">
              Sign In
            </button>
          </aside>
        )}
      </div>
    </div>
  )
}
