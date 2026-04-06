// import { useState } from 'react'
// import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
// import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
// import { KeyboardSensor } from '@dnd-kit/core'
// import { Loader2, Wand2, RotateCcw } from 'lucide-react'
// import toast from 'react-hot-toast'
// import SectionEditor from './SectionEditor'
// import { reorderSections, generateAllSections, regenerateOutline } from '../../utils/api'

// export default function OutlinePanel({ outline, post, onRefresh }) {
//   const sorted = [...(outline?.sections || [])].sort((a, b) => a.order_index - b.order_index)
//   const [sections, setSections] = useState(sorted)
//   const [genAll, setGenAll] = useState(false)
//   const [regenOut, setRegenOut] = useState(false)

//   // Sync when parent refreshes
//   const newIds = sorted.map(s => s.id).join(',')
//   const localIds = sections.map(s => s.id).join(',')
//   if (newIds !== localIds) setSections(sorted)

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
//     useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
//   )

//   const handleDragEnd = async ({ active, over }) => {
//     if (!over || active.id === over.id) return
//     const oldIdx = sections.findIndex(s => s.id === active.id)
//     const newIdx = sections.findIndex(s => s.id === over.id)
//     const reordered = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, order_index: i }))
//     setSections(reordered)
//     try {
//       await reorderSections({ section_orders: reordered.map(s => ({ id: s.id, order_index: s.order_index })) })
//     } catch { toast.error('Reorder failed') }
//   }

//   const handleSectionUpdate = (updated) => {
//     setSections(prev => prev.map(s => s.id === updated.id ? updated : s))
//   }

//   const handleGenAll = async () => {
//     setGenAll(true)
//     try { await generateAllSections(outline.id); await onRefresh(); toast.success('All sections written!') }
//     catch { toast.error('Some sections failed') }
//     finally { setGenAll(false) }
//   }

//   const handleRegenOutline = async () => {
//     if (!window.confirm('Regenerate outline? This will clear current sections.')) return
//     setRegenOut(true)
//     try { await regenerateOutline(post.id); await onRefresh(); toast.success('New outline generated!') }
//     catch { toast.error('Failed to regenerate outline') }
//     finally { setRegenOut(false) }
//   }

//   const ungenCount = sections.filter(s => !s.is_generated).length

//   return (
//     <div>
//       {/* Toolbar */}
//       <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
//         <p className="text-sm text-gray-500 dark:text-gray-400">
//           {sections.length} sections
//           {ungenCount > 0 && <span className="text-amber-500 ml-1.5">· {ungenCount} not written</span>}
//         </p>
//         <div className="flex items-center gap-2">
//           <button onClick={handleRegenOutline} disabled={regenOut} className="btn-ghost text-xs py-1.5 px-3">
//             {regenOut ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
//             Regen Outline
//           </button>
//           {ungenCount > 0 && (
//             <button onClick={handleGenAll} disabled={genAll} className="btn-primary text-xs py-1.5 px-3">
//               {genAll ? <><Loader2 size={12} className="animate-spin" /> Writing…</> : <><Wand2 size={12} /> Write All</>}
//             </button>
//           )}
//         </div>
//       </div>

//       <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
//           <div className="flex flex-col gap-2.5">
//             {sections.map(section => (
//               <SectionEditor key={section.id} section={section} onUpdate={handleSectionUpdate} />
//             ))}
//           </div>
//         </SortableContext>
//       </DndContext>

//       {sections.length === 0 && (
//         <div className="card p-10 text-center text-gray-400 dark:text-gray-600">
//           <p className="text-sm">No sections found. Try regenerating the outline.</p>
//         </div>
//       )}
//     </div>
//   )
// }


import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { KeyboardSensor } from '@dnd-kit/core'
import { Loader2, Wand2, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import SectionEditor from './SectionEditor'
import { reorderSections, generateAllSections, regenerateOutline } from '../../utils/api'

export default function OutlinePanel({ outline, post, onRefresh, onUngenCountChange }) {
  const sorted = [...(outline?.sections || [])].sort((a, b) => a.order_index - b.order_index)
  const [sections, setSections] = useState(sorted)
  const [genAll, setGenAll] = useState(false)
  const [regenOut, setRegenOut] = useState(false)

  // Sync when parent refreshes
  const newIds = sorted.map(s => s.id).join(',')
  const localIds = sections.map(s => s.id).join(',')
  if (newIds !== localIds) setSections(sorted)

  const ungenCount = sections.filter(s => !s.is_generated).length

  // Notify parent of ungenCount whenever it changes so EditorPage can pass it to SEOSidebar
  // Use a ref-based approach to avoid render loops
  const prevUngen = sections.filter(s => !s.is_generated).length
  if (onUngenCountChange) onUngenCountChange(ungenCount)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex(s => s.id === active.id)
    const newIdx = sections.findIndex(s => s.id === over.id)
    const reordered = arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, order_index: i }))
    setSections(reordered)
    try {
      await reorderSections({ section_orders: reordered.map(s => ({ id: s.id, order_index: s.order_index })) })
    } catch { toast.error('Reorder failed') }
  }

  const handleSectionUpdate = (updated) => {
    setSections(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  const handleGenAll = async () => {
    setGenAll(true)
    try {
      await generateAllSections(outline.id)
      await onRefresh()
      toast.success('All sections written!')
    } catch { toast.error('Some sections failed') }
    finally { setGenAll(false) }
  }

  const handleRegenOutline = async () => {
    if (!window.confirm('Regenerate outline? This will clear current sections.')) return
    setRegenOut(true)
    try {
      await regenerateOutline(post.id)
      await onRefresh()
      toast.success('New outline generated!')
    } catch { toast.error('Failed to regenerate outline') }
    finally { setRegenOut(false) }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {sections.length} sections
          {ungenCount > 0 && (
            <span className="text-amber-500 ml-1.5">· {ungenCount} not written</span>
          )}
          {ungenCount === 0 && sections.length > 0 && (
            <span className="text-emerald-500 ml-1.5">· all written ✓</span>
          )}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={handleRegenOutline} disabled={regenOut} className="btn-ghost text-xs py-1.5 px-3">
            {regenOut ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
            Regen Outline
          </button>
          {ungenCount > 0 && (
            <button onClick={handleGenAll} disabled={genAll} className="btn-primary text-xs py-1.5 px-3">
              {genAll
                ? <><Loader2 size={12} className="animate-spin" /> Writing…</>
                : <><Wand2 size={12} /> Write All</>}
            </button>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2.5">
            {sections.map(section => (
              <SectionEditor key={section.id} section={section} onUpdate={handleSectionUpdate} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {sections.length === 0 && (
        <div className="card p-10 text-center text-gray-400 dark:text-gray-600">
          <p className="text-sm">No sections found. Try regenerating the outline.</p>
        </div>
      )}
    </div>
  )
}