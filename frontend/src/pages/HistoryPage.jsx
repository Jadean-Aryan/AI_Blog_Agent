import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, FileText, Trash2, ExternalLink, TrendingUp, Clock, Search, RefreshCw, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { listPosts, deletePost, getSEOAnalyses, exportMarkdown, exportHTML } from '../utils/api'
import { scoreColour, scoreBg, scoreLabel, formatDate, downloadBlob, truncate } from '../utils/helpers'
import ScoreRing from '../components/seo/ScoreRing'
import { useAuth } from '../App'

function TrendBars({ analyses }) {
  if (!analyses || analyses.length < 2) return null
  const sorted = [...analyses].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const max = Math.max(...sorted.map(a => a.overall_seo_score), 1)
  return (
    <div className="flex items-end gap-0.5 h-8">
      {sorted.map((a, i) => {
        const h = Math.max(15, (a.overall_seo_score / max) * 100)
        const bg = a.overall_seo_score >= 70 ? '#10b981' : a.overall_seo_score >= 45 ? '#f59e0b' : '#ef4444'
        return <div key={i} className="w-1.5 rounded-sm flex-shrink-0"
          title={`${a.overall_seo_score}`} style={{ height: `${h}%`, background: bg }} />
      })}
    </div>
  )
}

function PostCard({ post, isAdmin, onDelete }) {
  const navigate = useNavigate()
  const [analyses, setAnalyses] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    getSEOAnalyses(post.id).then(r => setAnalyses(r.data)).catch(() => {})
  }, [post.id])

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('Delete this post?')) return
    setDeleting(true)
    try { await deletePost(post.id); toast.success('Deleted'); onDelete(post.id) }
    catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  const handleExport = async (e, format) => {
    e.stopPropagation(); setExporting(format)
    try {
      const res = format === 'md' ? await exportMarkdown(post.id) : await exportHTML(post.id)
      const slug = post.title.toLowerCase().replace(/\s+/g, '-').slice(0, 40)
      downloadBlob(res.data, `${slug}.${format}`); toast.success(`Exported .${format}`)
    } catch { toast.error('Export failed') }
    finally { setExporting(null) }
  }

  const score = post.overall_seo_score

  return (
    <div className="card p-4 hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer transition-all duration-150 group"
      onClick={() => navigate(`/editor/${post.id}`)}>
      <div className="flex items-start gap-3.5">
        <ScoreRing score={score} size={52} label="" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={e => handleExport(e, 'md')} disabled={!!exporting}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" title="Export .md">
                {exporting === 'md' ? <Loader2 size={12} className="animate-spin" /> : <FileText size={13} />}
              </button>
              <button onClick={e => handleExport(e, 'html')} disabled={!!exporting}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" title="Export .html">
                {exporting === 'html' ? <Loader2 size={12} className="animate-spin" /> : <ExternalLink size={13} />}
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors" title="Delete">
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          </div>

          <p className="text-gray-400 dark:text-gray-500 text-xs mb-2">{truncate(post.topic, 80)}</p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={11} /> {formatDate(post.created_at)}
            </span>
            <span className="text-xs text-gray-400">{post.word_count} words</span>
            {score != null && (
              <span className={`text-xs font-medium ${scoreColour(score)}`}>
                SEO {Math.round(score)} — {scoreLabel(score)}
              </span>
            )}
            {/* Admin sees author */}
            {isAdmin && post.author && (
              <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                <User size={11} /> {post.author}
              </span>
            )}
            <span className={`tag text-xs ${
              post.status === 'published'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}>{post.status}</span>
          </div>
        </div>

        {/* Trend bars */}
        {analyses.length > 1 && (
          <div className="flex-shrink-0 hidden sm:flex flex-col items-end gap-1">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <TrendingUp size={10} /> {analyses.length}
            </span>
            <TrendBars analyses={analyses} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const isAdmin = user?.role === 'admin'

  const fetchPosts = async () => {
    try { const res = await listPosts(); setPosts(res.data) }
    catch { toast.error('Failed to load posts') }
  }

  useEffect(() => { setLoading(true); fetchPosts().finally(() => setLoading(false)) }, [])

  const handleRefresh = async () => { setRefreshing(true); await fetchPosts(); setRefreshing(false) }
  const handleDelete = (id) => setPosts(p => p.filter(x => x.id !== id))

  const filtered = posts.filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.topic.toLowerCase().includes(search.toLowerCase())
  )

  const avgSeo = posts.filter(p => p.overall_seo_score != null).length
    ? Math.round(posts.filter(p => p.overall_seo_score != null).reduce((a, p) => a + p.overall_seo_score, 0) /
        posts.filter(p => p.overall_seo_score != null).length)
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-7">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isAdmin ? 'All Posts' : 'My Posts'}
            </h1>
            {isAdmin && (
              <span className="tag bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800 text-xs">
                <Shield size={10} /> Admin
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">
            {posts.length} post{posts.length !== 1 ? 's' : ''}
            {avgSeo != null && ` · avg SEO ${avgSeo}`}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-ghost text-sm">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      {posts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Posts', value: posts.length, colour: 'text-gray-900 dark:text-white' },
            { label: 'Avg SEO Score', value: avgSeo != null ? `${avgSeo}/100` : '—', colour: scoreColour(avgSeo) },
            { label: 'Total Words', value: posts.reduce((a, p) => a + (p.word_count || 0), 0).toLocaleString(), colour: 'text-gray-900 dark:text-white' },
          ].map(s => (
            <div key={s.label} className="card p-3.5 text-center">
              <p className={`text-xl font-bold ${s.colour}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {posts.length > 0 && (
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-8 text-sm" placeholder="Search posts…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-violet-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {search
            ? <p className="text-sm">No posts matching "{search}"</p>
            : <>
                <FileText size={36} className="mx-auto mb-3 opacity-20" />
                <p className="font-medium text-gray-500 dark:text-gray-400 mb-1">No posts yet</p>
                <p className="text-sm">Create your first post from the home page.</p>
              </>
          }
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map(post => (
            <PostCard key={post.id} post={post} isAdmin={isAdmin} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
