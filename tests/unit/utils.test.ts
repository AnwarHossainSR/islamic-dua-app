import { cn } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names', () => {
      const result = cn('text-red-500', 'bg-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toContain('base-class')
      expect(result).toContain('conditional-class')
      expect(result).not.toContain('hidden-class')
    })
  })
})