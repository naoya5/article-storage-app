import { memo } from "react"

interface PlatformSelectorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export const PlatformSelector = memo(function PlatformSelector({ 
  value, 
  onChange, 
  disabled = false 
}: PlatformSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-800 mb-1">
        プラットフォーム
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={disabled}
      >
        <option value="">すべて</option>
        <option value="TWITTER">Twitter</option>
        <option value="ZENN">Zenn</option>
        <option value="QIITA">Qiita</option>
      </select>
    </div>
  )
})