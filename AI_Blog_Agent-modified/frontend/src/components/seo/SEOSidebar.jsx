// import { useState } from 'react'
// import { RefreshCw, Tag, Loader2, ChevronDown, ChevronUp, Copy, Link2, AlertTriangle, CheckCircle, BarChart2 } from 'lucide-react'
// import toast from 'react-hot-toast'
// import ScoreRing from './ScoreRing'
// import { fleschLabel, scoreColour } from '../../utils/helpers'
// import { runSEOAnalysis, generateMeta } from '../../utils/api'

// function Row({ label, value, colour, sub }) {
//   return (
//     <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
//       <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
//       <div className="text-right">
//         <span className={`text-sm font-semibold ${colour || 'text-gray-700 dark:text-gray-300'}`}>{value}</span>
//         {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
//       </div>
//     </div>
//   )
// }

// function Section({ title, icon: Icon, iconClass, children, defaultOpen = false }) {
//   const [open, setOpen] = useState(defaultOpen)
//   return (
//     <div className="card p-3.5">
//       <button className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-0"
//         onClick={() => setOpen(v => !v)}>
//         <span className="flex items-center gap-2">
//           <Icon size={14} className={iconClass || 'text-violet-500'} />
//           {title}
//         </span>
//         {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
//       </button>
//       {open && <div className="mt-2.5">{children}</div>}
//     </div>
//   )
// }

// export default function SEOSidebar({ postId, seo, meta, onRefresh }) {
//   const [analyzing, setAnalyzing] = useState(false)
//   const [genMeta, setGenMeta] = useState(false)

//   const handleAnalyze = async () => {
//     setAnalyzing(true)
//     try { await runSEOAnalysis(postId); await onRefresh(); toast.success('Analysis complete') }
//     catch { toast.error('Run analysis after generating sections') }
//     finally { setAnalyzing(false) }
//   }

//   const handleMeta = async () => {
//     setGenMeta(true)
//     try { await generateMeta(postId); await onRefresh(); toast.success('Meta tags generated') }
//     catch { toast.error('Meta generation failed') }
//     finally { setGenMeta(false) }
//   }

//   const copy = (t) => { navigator.clipboard.writeText(t); toast.success('Copied!') }
//   const flesch = seo ? fleschLabel(seo.flesch_reading_ease) : null

//   return (
//     <div className="flex flex-col gap-3">
//       {/* Score + Actions */}
//       <div className="card p-4">
//         <div className="flex items-start justify-between mb-3">
//           <ScoreRing score={seo?.overall_seo_score} size={68} />
//           <div className="flex flex-col gap-1.5">
//             <button onClick={handleAnalyze} disabled={analyzing} className="btn-ghost text-xs py-1.5 px-3">
//               {analyzing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
//               {analyzing ? 'Running…' : 'Run Analysis'}
//             </button>
//             <button onClick={handleMeta} disabled={genMeta} className="btn-ghost text-xs py-1.5 px-3">
//               {genMeta ? <Loader2 size={12} className="animate-spin" /> : <Tag size={12} />}
//               {genMeta ? 'Generating…' : 'Gen Meta'}
//             </button>
//           </div>
//         </div>
//         <Row label="Readability" value={seo ? `${seo.flesch_reading_ease}` : '—'} colour={flesch?.colour} sub={flesch?.label} />
//         <Row label="Grade Level" value={seo ? `G${seo.flesch_kincaid_grade}` : '—'} />
//         <Row label="Read Time" value={seo ? `${seo.reading_time_minutes} min` : '—'} />
//         <Row label="Heading Score" value={seo ? `${seo.heading_hierarchy_score}/100` : '—'} colour={scoreColour(seo?.heading_hierarchy_score)} />
//       </div>

//       {/* Keyword Density */}
//       <Section title="Keyword Density" icon={BarChart2} defaultOpen={true}>
//         {seo?.keyword_densities && Object.keys(seo.keyword_densities).length > 0
//           ? Object.entries(seo.keyword_densities).map(([kw, density]) => {
//               const good = density >= 0.5 && density <= 2.5
//               const low = density < 0.5
//               const colour = good ? 'text-emerald-600 dark:text-emerald-400' : low ? 'text-red-500' : 'text-amber-500'
//               const bar = good ? 'bg-emerald-500' : low ? 'bg-red-400' : 'bg-amber-400'
//               return (
//                 <div key={kw} className="mb-2.5 last:mb-0">
//                   <div className="flex justify-between mb-1">
//                     <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[130px]">{kw}</span>
//                     <span className={`text-xs font-mono font-semibold ${colour}`}>{density}%</span>
//                   </div>
//                   <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
//                     <div className={`h-full rounded-full transition-all duration-500 ${bar}`}
//                       style={{ width: `${Math.min(100, density * 25)}%` }} />
//                   </div>
//                 </div>
//               )
//             })
//           : <p className="text-xs text-gray-400">Run analysis to see keyword density.</p>
//         }
//       </Section>

//       {/* Heading Issues */}
//       <Section title="Heading Structure" icon={seo?.heading_issues?.length ? AlertTriangle : CheckCircle}
//         iconClass={seo?.heading_issues?.length ? 'text-amber-500' : 'text-emerald-500'} defaultOpen={true}>
//         {!seo
//           ? <p className="text-xs text-gray-400">Run analysis first.</p>
//           : seo.heading_issues.length === 0
//             ? <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
//                 <CheckCircle size={12} /> No issues — great structure!
//               </p>
//             : seo.heading_issues.map((issue, i) => (
//                 <p key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5 mb-1">
//                   <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" />{issue}
//                 </p>
//               ))
//         }
//       </Section>

//       {/* Internal Links */}
//       {seo?.suggested_links?.length > 0 && (
//         <Section title={`Internal Links (${seo.suggested_links.length})`} icon={Link2}>
//           {seo.suggested_links.map((link, i) => (
//             <div key={i} className="mb-2 last:mb-0 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
//               <p className="text-violet-600 dark:text-violet-400 text-xs font-medium mb-0.5">{link.anchor_text}</p>
//               <p className="text-gray-400 text-xs font-mono mb-0.5">{link.suggested_slug}</p>
//               <p className="text-gray-500 text-xs">{link.reason}</p>
//             </div>
//           ))}
//         </Section>
//       )}

//       {/* Meta Preview */}
//       {meta && (
//         <Section title="Meta Preview" icon={Tag} defaultOpen={true}>
//           {/* SERP Preview */}
//           <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border border-gray-100 dark:border-gray-700">
//             <p className="text-blue-700 dark:text-blue-400 text-sm font-medium leading-tight truncate">
//               {meta.meta_title || 'No title'}
//             </p>
//             <p className="text-green-700 dark:text-green-500 text-xs">https://yourdomain.com/blog/…</p>
//             <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-2 leading-snug">
//               {meta.meta_description || 'No description'}
//             </p>
//           </div>

//           <div className="space-y-2">
//             {[
//               { label: 'Title', value: meta.meta_title, max: 60 },
//               { label: 'Description', value: meta.meta_description, max: 160 },
//             ].map(({ label, value, max }) => (
//               <div key={label} className="flex items-start justify-between gap-2">
//                 <div className="min-w-0 flex-1">
//                   <p className="text-xs text-gray-400 mb-0.5">{label} ({value?.length || 0}/{max})</p>
//                   <p className={`text-xs ${(value?.length || 0) > max ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>{value}</p>
//                 </div>
//                 <button onClick={() => copy(value)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 mt-4">
//                   <Copy size={12} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </Section>
//       )}

//       {/* Title Variations */}
//       {seo?.title_variations?.length > 0 && (
//         <Section title="Title Variations" icon={Tag} iconClass="text-gray-400">
//           {seo.title_variations.map((t, i) => (
//             <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
//               <p className="text-xs text-gray-600 dark:text-gray-400">{t}</p>
//               <button onClick={() => copy(t)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><Copy size={11} /></button>
//             </div>
//           ))}
//         </Section>
//       )}
//     </div>
//   )
// }


import { useState } from 'react'
import { RefreshCw, Tag, Loader2, ChevronDown, ChevronUp, Copy, Link2, AlertTriangle, CheckCircle, BarChart2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import ScoreRing from './ScoreRing'
import { fleschLabel, scoreColour } from '../../utils/helpers'
import { runSEOAnalysis, generateMeta } from '../../utils/api'

function Row({ label, value, colour, sub }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <div className="text-right">
        <span className={`text-sm font-semibold ${colour || 'text-gray-700 dark:text-gray-300'}`}>{value}</span>
        {sub && <span className="text-xs text-gray-400 ml-1">{sub}</span>}
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, iconClass, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="card p-3.5">
      <button className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-0"
        onClick={() => setOpen(v => !v)}>
        <span className="flex items-center gap-2">
          <Icon size={14} className={iconClass || 'text-violet-500'} />
          {title}
        </span>
        {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
      </button>
      {open && <div className="mt-2.5">{children}</div>}
    </div>
  )
}

function formatReadability(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'
  return `${Math.round(num)}`
}

function formatGradeLevel(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '—'
  return `G${Number.isInteger(num) ? num : num.toFixed(1)}`
}

function formatReadTime(readingTimeMinutes, wordCount = 0) {
  const seoMinutes = Number(readingTimeMinutes)
  if (Number.isFinite(seoMinutes) && seoMinutes > 0) {
    if (seoMinutes < 1) return '< 1 min'
    return `${Math.ceil(seoMinutes)} min`
  }

  const words = Number(wordCount)
  if (Number.isFinite(words) && words > 0) {
    const estimatedMinutes = Math.max(1, Math.ceil(words / 200))
    return `${estimatedMinutes} min`
  }

  return '—'
}

export default function SEOSidebar({ postId, seo, meta, onRefresh, ungenCount = 0, postWordCount = 0 }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [genMeta, setGenMeta] = useState(false)

  const allGenerated = ungenCount === 0
  const readabilityValue = formatReadability(seo?.flesch_reading_ease)
  const gradeValue = formatGradeLevel(seo?.flesch_kincaid_grade)
  const readTimeValue = formatReadTime(seo?.reading_time_minutes, postWordCount)
  const contentLengthValue = postWordCount > 0 ? `${postWordCount.toLocaleString()} words` : '—'

  const handleAnalyze = async () => {
    if (!allGenerated) {
      toast.error(`Generate all ${ungenCount} remaining section${ungenCount > 1 ? 's' : ''} first`)
      return
    }
    setAnalyzing(true)
    try {
      await runSEOAnalysis(postId)
      await onRefresh()
      toast.success('Analysis complete')
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleMeta = async () => {
    if (!allGenerated) {
      toast.error(`Generate all ${ungenCount} remaining section${ungenCount > 1 ? 's' : ''} first`)
      return
    }
    setGenMeta(true)
    try {
      await generateMeta(postId)
      await onRefresh()
      toast.success('Meta tags generated')
    } catch {
      toast.error('Meta generation failed')
    } finally {
      setGenMeta(false)
    }
  }

  const copy = (t) => { navigator.clipboard.writeText(t); toast.success('Copied!') }
  const flesch = seo ? fleschLabel(seo.flesch_reading_ease) : null

  return (
    <div className="flex flex-col gap-3">

      {/* Warning banner when sections are ungenerated */}
      {!allGenerated && (
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2.5">
          <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>{ungenCount} section{ungenCount > 1 ? 's' : ''} not written yet.</strong>
            {' '}Write all sections before running SEO analysis for accurate results.
          </p>
        </div>
      )}

      {/* Score + Actions */}
      <div className="card p-4">
        <div className="flex items-start justify-between mb-3">
          <ScoreRing score={seo?.overall_seo_score} size={68} />
          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`btn-ghost text-xs py-1.5 px-3 ${!allGenerated ? 'opacity-50' : ''}`}
              title={!allGenerated ? `${ungenCount} section(s) not generated yet` : 'Run SEO analysis'}
            >
              {analyzing
                ? <><Loader2 size={12} className="animate-spin" /> Running…</>
                : !allGenerated
                  ? <><Lock size={12} /> Run Analysis</>
                  : <><RefreshCw size={12} /> Run Analysis</>
              }
            </button>
            <button
              onClick={handleMeta}
              disabled={genMeta}
              className={`btn-ghost text-xs py-1.5 px-3 ${!allGenerated ? 'opacity-50' : ''}`}
              title={!allGenerated ? `${ungenCount} section(s) not generated yet` : 'Generate meta tags'}
            >
              {genMeta
                ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
                : !allGenerated
                  ? <><Lock size={12} /> Gen Meta</>
                  : <><Tag size={12} /> Gen Meta</>
              }
            </button>
          </div>
        </div>
        <Row label="Readability" value={readabilityValue} colour={flesch?.colour} sub={flesch?.label} />
        <Row label="Grade Level" value={gradeValue} />
        <Row label="Read Time" value={readTimeValue} />
        <Row label="Content Length" value={contentLengthValue} />
        <Row label="Heading Score" value={seo ? `${seo.heading_hierarchy_score}/100` : '—'} colour={scoreColour(seo?.heading_hierarchy_score)} />
      </div>

      {/* Keyword Density */}
      <Section title="Keyword Density" icon={BarChart2} defaultOpen={true}>
        {seo?.keyword_densities && Object.keys(seo.keyword_densities).length > 0
          ? Object.entries(seo.keyword_densities).map(([kw, density]) => {
              const good = density >= 0.5 && density <= 2.5
              const low = density < 0.5
              const colour = good ? 'text-emerald-600 dark:text-emerald-400' : low ? 'text-red-500' : 'text-amber-500'
              const bar = good ? 'bg-emerald-500' : low ? 'bg-red-400' : 'bg-amber-400'
              return (
                <div key={kw} className="mb-2.5 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[130px]">{kw}</span>
                    <span className={`text-xs font-mono font-semibold ${colour}`}>{density}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${bar}`}
                      style={{ width: `${Math.min(100, density * 25)}%` }} />
                  </div>
                </div>
              )
            })
          : <p className="text-xs text-gray-400">
              {allGenerated ? 'Run analysis to see keyword density.' : 'Write all sections first, then run analysis.'}
            </p>
        }
      </Section>

      {/* Heading Issues */}
      <Section
        title="Heading Structure"
        icon={seo?.heading_issues?.length ? AlertTriangle : CheckCircle}
        iconClass={seo?.heading_issues?.length ? 'text-amber-500' : 'text-emerald-500'}
        defaultOpen={true}
      >
        {!seo
          ? <p className="text-xs text-gray-400">
              {allGenerated ? 'Run analysis first.' : 'Write all sections first, then run analysis.'}
            </p>
          : seo.heading_issues.length === 0
            ? <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle size={12} /> No issues — great structure!
              </p>
            : seo.heading_issues.map((issue, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5 mb-1">
                  <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" />{issue}
                </p>
              ))
        }
      </Section>

      {/* Internal Links */}
      {seo?.suggested_links?.length > 0 && (
        <Section title={`Internal Links (${seo.suggested_links.length})`} icon={Link2}>
          {seo.suggested_links.map((link, i) => (
            <div key={i} className="mb-2 last:mb-0 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-violet-600 dark:text-violet-400 text-xs font-medium mb-0.5">{link.anchor_text}</p>
              <p className="text-gray-400 text-xs font-mono mb-0.5">{link.suggested_slug}</p>
              <p className="text-gray-500 text-xs">{link.reason}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Meta Preview */}
      {meta && (
        <Section title="Meta Preview" icon={Tag} defaultOpen={true}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 border border-gray-100 dark:border-gray-700">
            <p className="text-blue-700 dark:text-blue-400 text-sm font-medium leading-tight truncate">
              {meta.meta_title || 'No title'}
            </p>
            <p className="text-green-700 dark:text-green-500 text-xs">https://yourdomain.com/blog/…</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 line-clamp-2 leading-snug">
              {meta.meta_description || 'No description'}
            </p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Title', value: meta.meta_title, max: 60 },
              { label: 'Description', value: meta.meta_description, max: 160 },
            ].map(({ label, value, max }) => (
              <div key={label} className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">{label} ({value?.length || 0}/{max})</p>
                  <p className={`text-xs ${(value?.length || 0) > max ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>{value}</p>
                </div>
                <button onClick={() => copy(value)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0 mt-4">
                  <Copy size={12} />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Title Variations */}
      {seo?.title_variations?.length > 0 && (
        <Section title="Title Variations" icon={Tag} iconClass="text-gray-400">
          {seo.title_variations.map((t, i) => (
            <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <p className="text-xs text-gray-600 dark:text-gray-400">{t}</p>
              <button onClick={() => copy(t)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><Copy size={11} /></button>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}
