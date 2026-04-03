import { useState, useRef } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Wand2, Edit3, Check, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateSection, updateSection } from '../../utils/api'
import ReactMarkdown from 'react-markdown'

const LEVEL_STYLE = {
  1: 'text-base font-bold text-gray-900 dark:text-white',
  2: 'text-sm font-semibold text-gray-800 dark:text-gray-100',
  3: 'text-sm font-medium text-gray-700 dark:text-gray-300',
}
const LEVEL_BADGE = {
  1: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  2: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  3: 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-500 border border-gray-200 dark:border-gray-700',
}

export default function SectionEditor({ section, onUpdate }) {
  const [expanded, setExpanded] = useState(section.heading_level <= 2)
  const [editHead, setEditHead] = useState(false)
  const [headVal, setHeadVal] = useState(section.heading)
  const [editContent, setEditContent] = useState(false)
  const [contentVal, setContentVal] = useState(section.content || '')
  const [generating, setGenerating] = useState(false)
  const [extra, setExtra] = useState('')
  const [showExtra, setShowExtra] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const saveHead = async () => {
    if (!headVal.trim()) return
    try {
      const res = await updateSection(section.id, { heading: headVal.trim() })
      onUpdate(res.data); setEditHead(false)
    } catch { toast.error('Failed to update heading') }
  }

  const saveContent = async () => {
    try {
      const res = await updateSection(section.id, { content: contentVal })
      onUpdate(res.data); setEditContent(false); toast.success('Saved')
    } catch { toast.error('Failed to save') }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await generateSection({ section_id: section.id, extra_instructions: extra })
      onUpdate(res.data); setContentVal(res.data.content || '')
      setExpanded(true); setShowExtra(false); setExtra('')
      toast.success('Section generated!')
    } catch { toast.error('Generation failed') }
    finally { setGenerating(false) }
  }

  const level = section.heading_level
  const badgeStyle = LEVEL_BADGE[level] || LEVEL_BADGE[2]
  const textStyle = LEVEL_STYLE[level] || LEVEL_STYLE[2]

  return (
    <div ref={setNodeRef} style={style}
      className={`card transition-all duration-200 ${isDragging ? 'shadow-lg ring-2 ring-violet-400' : ''}`}>

      {/* Header row */}
      <div className="flex items-center gap-2.5 p-3.5">
        <button className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 flex-shrink-0"
          {...attributes} {...listeners}>
          <GripVertical size={16} />
        </button>

        <span className={`flex-shrink-0 text-xs font-mono px-1.5 py-0.5 rounded ${badgeStyle}`}>
          H{level}
        </span>

        {editHead ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input className="input text-sm py-1 flex-1" value={headVal}
              onChange={e => setHeadVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveHead(); if (e.key === 'Escape') setEditHead(false) }}
              autoFocus />
            <button onClick={saveHead} className="text-emerald-500 hover:text-emerald-600 flex-shrink-0"><Check size={14} /></button>
            <button onClick={() => { setEditHead(false); setHeadVal(section.heading) }}
              className="text-gray-400 hover:text-red-500 flex-shrink-0"><X size={14} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-1 min-w-0 group">
            <span className={`${textStyle} truncate`}>{section.heading}</span>
            <button onClick={() => setEditHead(true)}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 transition-opacity">
              <Edit3 size={12} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {section.is_generated && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Done
            </span>
          )}
          <button onClick={() => setShowExtra(v => !v)} disabled={generating}
            className="btn-ghost text-xs py-1 px-2.5">
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            {generating ? 'Writing…' : section.is_generated ? 'Rewrite' : 'Write'}
          </button>
          <button onClick={() => setExpanded(v => !v)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Extra instructions bar */}
      {showExtra && (
        <div className="px-3.5 pb-3 flex gap-2 animate-fade-up">
          <input className="input text-xs py-1.5 flex-1" placeholder="Optional: extra instructions…"
            value={extra} onChange={e => setExtra(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleGenerate() }} />
          <button onClick={handleGenerate} disabled={generating} className="btn-primary text-xs py-1.5 px-3">
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            {generating ? '…' : 'Go'}
          </button>
          <button onClick={() => setShowExtra(false)} className="btn-ghost text-xs py-1.5 px-2"><X size={12} /></button>
        </div>
      )}

      {/* Content */}
      {expanded && (
        <div className="px-3.5 pb-3.5 animate-fade-up">
          <div className="w-full h-px bg-gray-100 dark:bg-gray-800 mb-3" />
          {(section.content || contentVal) ? (
            editContent ? (
              <div>
                <textarea className="textarea text-xs min-h-[200px] leading-relaxed font-mono"
                  value={contentVal} onChange={e => setContentVal(e.target.value)} />
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={saveContent} className="btn-primary text-xs py-1.5"><Check size={12} /> Save</button>
                  <button onClick={() => { setEditContent(false); setContentVal(section.content || '') }}
                    className="btn-ghost text-xs py-1.5"><X size={12} /> Cancel</button>
                  <span className="text-xs text-gray-400 ml-auto">
                    {contentVal.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
              </div>
            ) : (
              <div className="group">
                <div className="section-content prose prose-sm max-w-none">
                  <ReactMarkdown>{section.content || contentVal}</ReactMarkdown>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {(section.content || '').split(/\s+/).filter(Boolean).length} words
                  </span>
                  <button onClick={() => { setEditContent(true); setContentVal(section.content || '') }}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-1">
                    <Edit3 size={11} /> Edit
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Wand2 size={24} className="mx-auto mb-1.5 opacity-30" />
              <p className="text-xs">Click <span className="text-violet-500 font-medium">Write</span> to generate content for this section.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
