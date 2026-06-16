import { describe, expect, it } from 'vitest'
import {
  AUTO_SAVE_DELAY,
  EXPORT_DIMENSIONS,
  EXPORT_PIXEL_RATIO,
  MAX_IMAGE_SIZE,
  MAX_IMAGE_SIZE_MB,
  MAX_TITLE_LENGTH,
  TOAST_DURATION,
} from './constants'

describe('constants', () => {
  it('should have correct time constants', () => {
    expect(AUTO_SAVE_DELAY).toBe(3000)
    expect(TOAST_DURATION).toBe(3000)
  })

  it('should have correct image limits', () => {
    expect(MAX_IMAGE_SIZE).toBe(5 * 1024 * 1024)
    expect(MAX_IMAGE_SIZE_MB).toBe(5)
  })

  it('should have correct input constraints', () => {
    expect(MAX_TITLE_LENGTH).toBe(100)
  })

  it('should have correct export dimensions', () => {
    expect(EXPORT_DIMENSIONS.story).toEqual({ width: 1080, height: 1920, label: '9:16 竖版' })
    expect(EXPORT_DIMENSIONS.square).toEqual({ width: 1242, height: 1242, label: '1:1 方形' })
  })

  it('should have correct pixel ratio', () => {
    expect(EXPORT_PIXEL_RATIO).toBe(2)
  })
})
