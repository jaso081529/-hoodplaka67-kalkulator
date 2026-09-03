import { describe, expect, it } from 'vitest'
import { calculateQuote, optimizePacks } from './calculator.js'

describe('optimizePacks', () => {
  it('uses the cheapest available combination', () => {
    const result = optimizePacks(25, [[5, 1.6], [10, 3.2], [25, 6.4], [50, 11.8]])
    expect(result.supplied).toBe(25)
    expect(result.price).toBe(6.4)
  })

  it('rounds a custom order up to a deliverable quantity', () => {
    const result = optimizePacks(7, [[6, 1.6], [12, 2.5]])
    expect(result.supplied).toBe(12)
    expect(result.price).toBe(2.5)
  })

  it('prefers one larger pack when the price is identical', () => {
    const result = optimizePacks(5, [[1, 1.9], [2, 3.7], [5, 9.3]])
    expect(result.packs).toEqual([{ quantity: 5, price: 9.3, count: 1 }])
  })
})

describe('calculateQuote', () => {
  it('calculates an EK-based quote with stacked discounts', () => {
    const quote = calculateQuote({ sourceKind: 'ek', sourceTotal: 10, quantity: 10, markup: 100, discount: 10, friendEnabled: true, friendDiscount: 10 })
    expect(quote.ek).toBe(10)
    expect(quote.listVk).toBe(20)
    expect(quote.vk).toBe(16.2)
    expect(quote.profit).toBe(6.2)
  })

  it('calculates the target EK backwards from a VK source', () => {
    const quote = calculateQuote({ sourceKind: 'vk', sourceTotal: 50, quantity: 1, markup: 100, discount: 0, friendEnabled: false, friendDiscount: 0 })
    expect(quote.ek).toBe(25)
    expect(quote.vk).toBe(50)
  })

  it('includes order costs and rounds the final price', () => {
    const quote = calculateQuote({ sourceKind: 'ek', sourceTotal: 10, quantity: 4, markup: 100, discount: 0, friendEnabled: false, friendDiscount: 0, additionalCosts: 2, rounding: 'ninety' })
    expect(quote.ek).toBe(12)
    expect(quote.vk).toBe(24.9)
    expect(quote.profit).toBe(12.9)
  })
})

