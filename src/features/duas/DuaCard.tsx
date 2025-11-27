import type { Dua } from '@/lib/types'

interface DuaCardProps {
  dua: Dua
}

export function DuaCard({ dua }: DuaCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold">{dua.title_bn}</h3>
        {dua.is_important && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
            Important
          </span>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded">
        <p className="text-2xl text-right mb-2" dir="rtl">{dua.dua_text_ar}</p>
        {dua.transliteration && (
          <p className="text-sm text-gray-600 italic mb-2">{dua.transliteration}</p>
        )}
        {dua.translation_bn && (
          <p className="text-gray-700">{dua.translation_bn}</p>
        )}
      </div>

      <div className="flex gap-4 text-sm text-gray-600">
        <span className="px-2 py-1 bg-gray-100 rounded">{dua.category}</span>
        {dua.source && <span>Source: {dua.source}</span>}
      </div>
    </div>
  )
}
