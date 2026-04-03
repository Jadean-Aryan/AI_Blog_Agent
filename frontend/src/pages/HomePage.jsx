import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, X, Plus, ArrowRight, Loader2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { createPost } from '../utils/api'

const SUGGESTIONS = ['SEO tips', 'content marketing', 'digital marketing', 'social media', 'email marketing', 'lead generation']

export default function HomePage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState([])
  const [kw, setKw] = useState('')
  const [loading, setLoading] = useState(false)

  const addKw = (k) => {
    const v = (k || kw).trim()
    if (!v || keywords.includes(v)) return
    setKeywords(p => [...p, v]); setKw('')
  }
  const removeKw = (k) => setKeywords(p => p.filter(x => x !== k))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!topic.trim()) { toast.error('Enter a topic'); return }
    setLoading(true)
    try {
      const res = await createPost({ topic: topic.trim(), target_keywords: keywords })
      toast.success('Outline generated!')
      navigate(`/editor/${res.data.post.id}`)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to generate outline')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
      <div className="w-full max-w-xl animate-fade-up">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-xs font-medium mb-4">
            <Sparkles size={12} /> AI-Powered SEO Blog Writer
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
            From topic to<br />
            <span className="text-violet-600 dark:text-violet-400">SEO-ready post</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
            Enter your topic and keywords. AI generates a structured outline, writes each section, and scores your SEO.
          </p>
        </div>

        {/* Form */}
        <div className="card p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Blog Topic <span className="text-violet-500">*</span>
              </label>
              <input className="input text-sm" placeholder="e.g. How to improve website SEO in 2025"
                value={topic} onChange={e => setTopic(e.target.value)} disabled={loading} autoFocus />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Target Keywords <span className="text-gray-400 font-normal normal-case">(press Enter to add)</span>
              </label>
              <div className="flex gap-2">
                <input className="input text-sm" placeholder="Type a keyword…"
                  value={kw} onChange={e => setKw(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKw() } }}
                  disabled={loading} />
                <button type="button" onClick={() => addKw()} disabled={!kw.trim() || loading}
                  className="btn-ghost flex-shrink-0 px-3">
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

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-6">
          {['AI Outline', 'Section Writer', 'SEO Scoring', 'Readability', 'Meta Tags', 'MD / HTML Export'].map(f => (
            <span key={f} className="text-xs text-gray-400 dark:text-gray-600">· {f}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
