import { describe, expect, it } from 'vitest'
import { finishSurcharges, retailProducts, stickerFormats } from './prices.js'

const expectedStickerData = {
  a4: {
    perPrint: 1,
    packs: [1, 2, 5, 10, 20],
    tiers: {
      glossy: [[1, 1.9], [2, 3.7], [5, 9.3], [10, 18.5], [20, 29.6]],
      transparent: [[1, 2], [2, 4], [5, 10], [10, 20], [20, 32]],
      holographic: [[1, 3.7], [2, 7.4], [5, 18.4], [10, 32.7], [20, 50.8]],
      matteWhite: [[1, 2], [2, 4], [5, 9.9], [10, 19.8], [20, 31.8]],
    },
  },
  a5: {
    perPrint: 2,
    packs: [1, 2, 5, 10, 20],
    tiers: {
      glossy: [[2, 2.1], [4, 4.2], [10, 10.5], [20, 16.8], [40, 30.4]],
      transparent: [[2, 2.4], [4, 4.8], [10, 12], [20, 19.2], [40, 35.6]],
      holographic: [[2, 4.2], [4, 8.4], [10, 19.8], [20, 30.4], [40, 54.4]],
      matteWhite: [[2, 2.3], [4, 4.5], [10, 11.2], [20, 18], [40, 32.7]],
    },
  },
  a7: {
    perPrint: 8,
    packs: [1, 2, 5, 10],
    tiers: {
      glossy: [[8, 1.7], [16, 2.7], [40, 6.3], [80, 9.8]],
      transparent: [[8, 2.9], [16, 4.7], [40, 10.7], [80, 15.8]],
      holographic: [[8, 3.3], [16, 5.2], [40, 12.4], [80, 19.4]],
      matteWhite: [[8, 1.8], [16, 2.9], [40, 6.7], [80, 10.5]],
    },
  },
  '95x95': {
    perPrint: 6,
    packs: [1, 2, 5, 10],
    tiers: {
      glossy: [[6, 1.6], [12, 2.5], [30, 5.8], [60, 9.1]],
      transparent: [[6, 2.5], [12, 4], [30, 9.2], [60, 13.6]],
      holographic: [[6, 3.1], [12, 5], [30, 11.4], [60, 18]],
      matteWhite: [[6, 1.7], [12, 2.7], [30, 6.2], [60, 9.8]],
    },
  },
  '65x65': {
    perPrint: 12,
    packs: [1, 2, 5, 10],
    tiers: {
      glossy: [[12, 1.7], [24, 3.4], [60, 5.4], [120, 10.8]],
      transparent: [[12, 2.3], [24, 4.6], [60, 7.3], [120, 14.6]],
      holographic: [[12, 3.4], [24, 6.7], [60, 10.7], [120, 21.4]],
      matteWhite: [[12, 1.8], [24, 3.6], [60, 5.8], [120, 11.6]],
    },
  },
  '20x5': {
    perPrint: 5,
    packs: [1, 2, 5, 10],
    tiers: {
      glossy: [[5, 1.6], [10, 3.2], [25, 6.4], [50, 11.8]],
      transparent: [[5, 2.4], [10, 4.7], [25, 9.4], [50, 17.4]],
      holographic: [[5, 3.2], [10, 6.3], [25, 12.7], [50, 23.4]],
      matteWhite: [[5, 1.7], [10, 3.4], [25, 6.8], [50, 12.6]],
    },
  },
  '7x5': {
    perPrint: 15,
    packs: [1, 2, 5, 10],
    tiers: {
      glossy: [[15, 1.7], [30, 2.8], [75, 5.7], [150, 13.4]],
      transparent: [[15, 3.8], [30, 6.9], [75, 12.8], [150, 27.6]],
      holographic: [[15, 3.2], [30, 5.5], [75, 11.4], [150, 24.7]],
      matteWhite: [[15, 1.8], [30, 3], [75, 6.1], [150, 14.2]],
    },
  },
  '10x3': {
    perPrint: 18,
    packs: [1, 2, 5, 10],
    tiers: {
      glossy: [[18, 1.8], [36, 3.1], [90, 6.4], [180, 14.7]],
      transparent: [[18, 4.4], [36, 8], [90, 14.9], [180, 31.7]],
      holographic: [[18, 3.6], [36, 6], [90, 12.6], [180, 27.1]],
      matteWhite: [[18, 1.9], [36, 3.3], [90, 6.8], [180, 15.5]],
    },
  },
}

const expectedRetailPrices = {
  'shirt-bc-e190': [17, 24.9, 17, 24.9, 17, 24.9],
  'hoodie-russell': [45, 50],
  'windbreaker-premium': [45, 50, 45, 50],
  'windbreaker-light': [22.99, 27.99, 22.99, 27.99, 22.99, 27.99],
  anglerhut: [14.99, 16.99, 14.99, 16.99, 14.99, 16.99, 14.99, 16.99, 14.99, 16.99, 14.99, 16.99],
  'schlauchschal-basic': [5.99, 9.99, 11.99, 14.5, 5.99, 9.99, 11.99, 14.5, 5.99, 9.99, 11.99, 14.5],
  'schlauchschal-cord': [9.99, 14.99, 16.99, 9.99, 14.99, 16.99, 9.99, 14.99, 16.99],
  capies: [14.99, 18.99, 14.99, 18.99],
  balaclava: [6, 7.99, 9.99, 9.9, 12.9],
  clock: [19.99],
  'shoulder-bag': [19.99, 24.99],
}

describe('price source integrity', () => {
  it('contains every sticker quantity and price exactly as supplied', () => {
    expect(stickerFormats.map(({ id }) => id)).toEqual(Object.keys(expectedStickerData))

    for (const format of stickerFormats) {
      const expected = expectedStickerData[format.id]
      expect(format.perPrint).toBe(expected.perPrint)
      expect(format.tiers).toEqual(expected.tiers)
    }
  })

  it('maps every sticker quantity to a whole A4 print pack', () => {
    for (const format of stickerFormats) {
      const expected = expectedStickerData[format.id]
      for (const tiers of Object.values(format.tiers)) {
        const printPacks = tiers.map(([pieces]) => pieces / format.perPrint)
        expect(printPacks.every(Number.isInteger)).toBe(true)
        expect(printPacks).toEqual(expected.packs)
      }
    }
  })

  it('contains the supplied finishing surcharges exactly', () => {
    expect(finishSurcharges).toEqual({
      laminate: { label: 'Laminat', S: 2.5, M: 3.5, L: 4.5, XL: 6.5 },
      extraCut: { label: 'Extra-Schnitt', S: 2, M: 2.5, L: 3.5, XL: 5 },
    })
  })

  it('keeps every clearly readable textile and accessory price unchanged', () => {
    expect(Object.fromEntries(retailProducts.map((product) => [product.id, product.variants.map(({ price }) => price)]))).toEqual(expectedRetailPrices)
  })
})
