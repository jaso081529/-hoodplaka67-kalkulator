export const PRICE_META = {
  version: '1.2.0',
  updated: '2026-09-04',
  currency: 'EUR',
  taxNote: 'Alle Preise nach §19 UStG.',
}

export const quantityDiscountTiers = [
  { min: 1, percent: 0 }, { min: 10, percent: 3 }, { min: 25, percent: 5 }, { min: 50, percent: 8 },
  { min: 100, percent: 12 }, { min: 250, percent: 15 }, { min: 500, percent: 18 }, { min: 1000, percent: 20 },
]

export const finishSurcharges = {
  laminate: { label: 'Laminieren', perSticker: 0.10 },
  extraCut: { label: 'Extra-Schnitt', perSticker: 0.06 },
}

const materials = {
  glossy: 'Glossy',
  transparent: 'Transparent',
  holographic: 'Holographic',
  matteWhite: 'Weiß Matt',
}

export const stickerFormats = [
  {
    id: 'a4', label: 'A4', perPrint: 1, sheetLabel: 'A4', finishSize: 'XL', source: 'HoodPlaka67 Aufkleber-Preisliste · Stand 04.09.2026',
    tiers: {
      glossy: [[1, 1.90], [2, 3.70], [5, 9.30], [10, 18.50], [20, 29.60]],
      transparent: [[1, 2.00], [2, 4.00], [5, 10.00], [10, 20.00], [20, 32.00]],
      holographic: [[1, 3.70], [2, 7.40], [5, 18.40], [10, 32.70], [20, 50.80]],
      matteWhite: [[1, 2.00], [2, 4.00], [5, 9.90], [10, 19.80], [20, 31.80]],
    },
  },
  {
    id: 'a3', label: 'A3 Großformat', perPrint: 1, sheetLabel: 'A3', finishSize: 'XL', source: 'HoodPlaka67 Kalkulator · vorhandene A3-Staffel',
    tiers: {
      glossy: [[1, 3.10], [2, 6.00], [5, 14.90], [10, 28.90], [20, 49.90]],
      transparent: [[1, 3.40], [2, 6.70], [5, 16.90], [10, 33.90], [20, 58.90]],
      holographic: [[1, 4.50], [2, 8.90], [5, 21.90], [10, 38.90], [20, 59.90]],
      matteWhite: [[1, 3.20], [2, 6.20], [5, 15.50], [10, 30.90], [20, 52.90]],
    },
  },
  {
    id: 'a5', label: 'A5', perPrint: 2, sheetLabel: 'A4', finishSize: 'L', source: 'HoodPlaka67 Aufkleber-Preisliste · Stand 04.09.2026',
    tiers: {
      glossy: [[2, 2.10], [4, 4.20], [10, 10.50], [20, 16.80], [40, 30.40]],
      transparent: [[2, 2.40], [4, 4.80], [10, 12.00], [20, 19.20], [40, 35.60]],
      holographic: [[2, 4.20], [4, 8.40], [10, 19.80], [20, 30.40], [40, 54.40]],
      matteWhite: [[2, 2.30], [4, 4.50], [10, 11.20], [20, 18.00], [40, 32.70]],
    },
  },
  {
    id: 'a7', label: 'A7', perPrint: 8, sheetLabel: 'A4', finishSize: 'M', source: 'HoodPlaka67 Aufkleber-Preisliste · Stand 04.09.2026',
    tiers: {
      glossy: [[8, 1.70], [16, 2.70], [40, 6.30], [80, 9.80]],
      transparent: [[8, 2.90], [16, 4.70], [40, 10.70], [80, 15.80]],
      holographic: [[8, 3.30], [16, 5.20], [40, 12.40], [80, 19.40]],
      matteWhite: [[8, 1.80], [16, 2.90], [40, 6.70], [80, 10.50]],
    },
  },
  {
    id: '95x95', label: '9,5 × 9,5 cm', perPrint: 6, sheetLabel: 'A4', finishSize: 'L', source: 'HoodPlaka67 Aufkleber-Preisliste · Stand 04.09.2026',
    tiers: {
      glossy: [[6, 1.60], [12, 2.50], [30, 5.80], [60, 9.10]],
      transparent: [[6, 2.50], [12, 4.00], [30, 9.20], [60, 13.60]],
      holographic: [[6, 3.10], [12, 5.00], [30, 11.40], [60, 18.00]],
      matteWhite: [[6, 1.70], [12, 2.70], [30, 6.20], [60, 9.80]],
    },
  },
  {
    id: '65x65', label: '6,5 × 6,5 cm', perPrint: 12, sheetLabel: 'A4', finishSize: 'M', source: 'HoodPlaka67 Aufkleber-Preisliste · Stand 04.09.2026',
    tiers: {
      glossy: [[12, 1.70], [24, 3.40], [60, 5.40], [120, 10.80]],
      transparent: [[12, 2.30], [24, 4.60], [60, 7.30], [120, 14.60]],
      holographic: [[12, 3.40], [24, 6.70], [60, 10.70], [120, 21.40]],
      matteWhite: [[12, 1.80], [24, 3.60], [60, 5.80], [120, 11.60]],
    },
  },
  {
    id: '20x5', label: '20 × 5 cm', perPrint: 5, sheetLabel: 'A4', finishSize: 'L', source: 'HoodPlaka67 Aufkleber-Preisliste · Stand 04.09.2026',
    tiers: {
      glossy: [[5, 1.60], [10, 3.20], [25, 6.40], [50, 11.80]],
      transparent: [[5, 2.40], [10, 4.70], [25, 9.40], [50, 17.40]],
      holographic: [[5, 3.20], [10, 6.30], [25, 12.70], [50, 23.40]],
      matteWhite: [[5, 1.70], [10, 3.40], [25, 6.80], [50, 12.60]],
    },
  },
  {
    id: '7x5', label: '7 × 5 cm', perPrint: 15, sheetLabel: 'A4', finishSize: 'S', source: 'HoodPlaka67 Aufkleber-Preisliste · Stand 04.09.2026',
    tiers: {
      glossy: [[15, 1.70], [30, 2.80], [75, 5.70], [150, 13.40]],
      transparent: [[15, 3.80], [30, 6.90], [75, 12.80], [150, 27.60]],
      holographic: [[15, 3.20], [30, 5.50], [75, 11.40], [150, 24.70]],
      matteWhite: [[15, 1.80], [30, 3.00], [75, 6.10], [150, 14.20]],
    },
  },
  {
    id: '10x3', label: '10 × 3 cm', perPrint: 18, sheetLabel: 'A4', finishSize: 'S', source: 'HoodPlaka67 Aufkleber-Preisliste · Stand 04.09.2026',
    tiers: {
      glossy: [[18, 1.80], [36, 3.10], [90, 6.40], [180, 14.70]],
      transparent: [[18, 4.40], [36, 8.00], [90, 14.90], [180, 31.70]],
      holographic: [[18, 3.60], [36, 6.00], [90, 12.60], [180, 27.10]],
      matteWhite: [[18, 1.90], [36, 3.30], [90, 6.80], [180, 15.50]],
    },
  },
]

export const materialOptions = Object.entries(materials).map(([id, label]) => ({ id, label }))

const colorVariants = (colors, options) => colors.flatMap((color) => options.map(([suffix, label, price]) => ({ id: `${color.toLowerCase()}-${suffix}`, label: `${color} · ${label}`, price })))

export const retailProducts = [
  { id: 'shirt-bc-e190', category: 'Textilien', label: 'T-Shirt B&C E190', source: 'Textil-Preisliste · Quelle B', variants: colorVariants(['Rot', 'Weiß', 'Schwarz'], [['front', 'einseitig bedruckt', 17], ['both', 'beidseitig bedruckt', 24.9]]) },
  { id: 'hoodie-russell', category: 'Textilien', label: 'Hoodie Russell Athletics', source: 'Textil-Preisliste · Quelle B', variants: colorVariants(['Schwarz'], [['front', 'einseitig bedruckt', 45], ['both', 'beidseitig bedruckt', 50]]) },
  { id: 'windbreaker-premium', category: 'Textilien', label: 'Premium Windbreaker', source: 'Textil-Preisliste · Quelle B', variants: colorVariants(['Eisweiß', 'Schwarz'], [['front', 'einseitig bedruckt', 45], ['both', 'beidseitig bedruckt', 50]]) },
  { id: 'windbreaker-light', category: 'Textilien', label: 'Premium Windbreaker Light', source: 'Textil-Preisliste · Quelle B', variants: colorVariants(['Rot', 'Weiß', 'Schwarz'], [['front', 'einseitig bedruckt', 22.99], ['both', 'beidseitig bedruckt', 27.99]]) },
  { id: 'anglerhut', category: 'Textilien', label: 'Anglerhut', source: 'Textil-Preisliste · Quelle B', variants: colorVariants(['Rot L/XL', 'Rot S/M', 'Weiß L/XL', 'Weiß S/M', 'Schwarz L/XL', 'Schwarz S/M'], [['one', 'ein Motiv', 14.99], ['extra', 'Motiv + Zusatzmotiv/Schrift', 16.99]]) },
  { id: 'schlauchschal-basic', category: 'Textilien', label: 'Schlauchschal Beechfield', source: 'Textil-Preisliste · Quellen B/C', variants: colorVariants(['Rot', 'Weiß', 'Schwarz'], [['plain', 'ohne Druck', 5.99], ['small', 'kleines Motiv', 9.99], ['large', 'großes Motiv', 11.99], ['extra', 'zusätzliches Motiv', 14.5]]) },
  { id: 'schlauchschal-cord', category: 'Textilien', label: 'Schlauchschal Dick mit Kordel', source: 'Textil-Preisliste · Quelle C', variants: colorVariants(['Rot', 'Weiß', 'Schwarz'], [['plain', 'ohne Druck', 9.99], ['print', 'mit Motiv', 14.99], ['extra', 'mit Zusatzmotiv', 16.99]]) },
  { id: 'capies', category: 'Textilien', label: 'Capies', source: 'Textil-Preisliste · Quelle C', variants: colorVariants(['Weiß', 'Schwarz'], [['print', 'mit Druck', 14.99], ['extra', 'mit Zusatzmotiv', 18.99]]) },
  { id: 'balaclava', category: 'Textilien', label: 'Balaclava Beechfield', source: 'Textil-Preisliste · Quelle C', variants: [{ id: 'black-plain', label: 'Schwarz · ohne Druck', price: 6 }, { id: 'black-small', label: 'Schwarz · kleines Motiv', price: 7.99 }, { id: 'black-large', label: 'Schwarz · großes Motiv', price: 9.99 }, { id: 'black-two-small', label: 'Schwarz · zwei kleine Motive', price: 9.9 }, { id: 'black-two-large', label: 'Schwarz · zwei große Motive', price: 12.9 }] },
  { id: 'clock', category: 'Accessoires', label: 'Wanduhr mit eigenem Design', source: 'Textil-Preisliste · Quelle C', variants: [{ id: 'design', label: 'Eigenes Design', price: 19.99 }] },
  { id: 'shoulder-bag', category: 'Accessoires', label: 'Umhängetasche', source: 'Textil-Preisliste · Quelle C', variants: [{ id: 'standard', label: 'Standard + Druck', price: 19.99 }, { id: 'premium', label: 'Premium + Druck', price: 24.99 }] },
]

export const categoryOptions = [
  { id: 'stickers', label: 'Aufkleber', hint: 'aktuelle Packpreise' },
  { id: 'textiles', label: 'Textilien', hint: 'VK-Preisliste' },
  { id: 'accessories', label: 'Accessoires', hint: 'VK-Preisliste' },
]
