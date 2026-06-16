import { describe, expect, it } from 'vitest'
import { proficiencyLabels, statusLabels } from './labels'

describe('labels', () => {
  it('should have correct status labels', () => {
    expect(statusLabels.requestable).toBe('可点歌')
    expect(statusLabels.practicing).toBe('练习中')
    expect(statusLabels.paused).toBe('已暂停')
  })

  it('should have correct proficiency labels', () => {
    expect(proficiencyLabels.rough).toBe('粗略')
    expect(proficiencyLabels.complete).toBe('完整')
    expect(proficiencyLabels.familiar).toBe('熟练')
    expect(proficiencyLabels.signature).toBe('招牌')
  })
})
