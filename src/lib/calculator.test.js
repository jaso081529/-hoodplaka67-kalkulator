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

  it('finds the cheapest deliverable amount for an A7 special quantity', () => {
    const result = optimizePacks(17, [[8, 3.3], [16, 5.2], [40, 12.4], [80, 19.4]])
    expect(result.supplied).toBe(24)
    expect(result.price).toBe(8.5)
  })

  it('rounds a near-limit order up to a valid pack total', () => {
    const result = optimizePacks(9999, [[15, 1.7], [30, 2.8], [75, 5.7], [150, 13.4]])
    expect(result.supplied).toBe(10005)
    expect(Number.isFinite(result.price)).toBe(true)
    expect(result.packs.reduce((total, pack) => total + pack.quantity * pack.count, 0)).toBe(10005)
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

  it('keeps displayed EK and profit cent-exact with the displayed VK', () => {
    const quote = calculateQuote({ sourceKind: 'vk', sourceTotal: 68.97, quantity: 3, markup: 100, discount: 0, friendEnabled: false, friendDiscount: 0 })
    expect(quote.ek).toBe(34.49)
    expect(quote.profit).toBe(34.48)
    expect(quote.ek + quote.profit).toBe(quote.vk)
  })

  it('includes order costs and rounds the final price', () => {
    const quote = calculateQuote({ sourceKind: 'ek', sourceTotal: 10, quantity: 4, markup: 100, discount: 0, friendEnabled: false, friendDiscount: 0, additionalCosts: 2, rounding: 'ninety' })
    expect(quote.ek).toBe(12)
    expect(quote.vk).toBe(24.9)
    expect(quote.profit).toBe(12.9)
  })

  it('rounds upwards to the next 50-cent price', () => {
    const quote = calculateQuote({ sourceKind: 'ek', sourceTotal: 10, quantity: 1, markup: 23, discount: 0, friendEnabled: false, friendDiscount: 0, rounding: 'half' })
    expect(quote.listVk).toBe(12.3)
    expect(quote.vk).toBe(12.5)
  })

  it('handles a full discount without an invalid margin', () => {
    const quote = calculateQuote({ sourceKind: 'ek', sourceTotal: 10, quantity: 1, markup: 100, discount: 100, friendEnabled: false, friendDiscount: 0 })
    expect(quote.vk).toBe(0)
    expect(quote.profit).toBe(-10)
    expect(quote.margin).toBe(0)
  })
})
