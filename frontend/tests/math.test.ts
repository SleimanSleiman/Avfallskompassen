import { describe, it, expect } from 'vitest'
import { multiply, subtract } from '../src/math'

describe('multiply function', () => {
  it('multiplies numbers correctly', () => {
    expect(multiply(2, 3)).toBe(6)
  })
})

describe('subtract function', () => {
  it('subtracts numbers correctly', () => {
    expect(subtract(5, 3)).toBe(2)
  })
})
