export const PRICE_META = {
  version: '1.0.0',
  updated: '2026-09-03',
  currency: 'EUR',
  taxNote: 'Quellpreise werden unverändert als Bruttowerte behandelt.',
}

// Automatischer Kundenrabatt anhand der tatsächlich lieferbaren Stückzahl.
// Die Stufen sind bewusst zentral abgelegt und können hier leicht angepasst werden.
export const quantityDiscountTiers = [
  { min: 1, percent: 0 },
  { min: 10, percent: 3 },
  { min: 25, percent: 5 },
  { min: 50, percent: 8 },
  { min: 100, percent: 12 },
  { min: 250, percent: 15 },
  { min: 500, percent: 18 },
  { min: 1000, percent: 20 },
]

const materials = {
  glossy: 'Glänzend',
  transparent: 'Transparent',
  holographic: 'Holographic',
  matteWhite: 'Weiß Matt',
}

export const stickerFormats = [
  {
    id: 'a4', label: 'A4', perPrint: 1, finishSize: 'XL', source: 'Sticker-Preisliste · Quelle A',
    tiers: {
      glossy: [[1, 1.9], [2, 3.7], [5, 9.3], [10, 18.5], [20, 29.6]],
      transparent: [[1, 2], [2, 4], [5, 10], [10, 20], [20, 32]],
      holographic: [[1, 3.7], [2, 7.4], [5, 18.4], [10, 32.7], [20, 50.8]],
      matteWhite: [[1, 2], [2, 4], [5, 9.9], [10, 19.8], [20, 31.8]],
    },
  },
  {
    id: 'a5', label: 'A5', perPrint: 2, finishSize: 'L', source: 'Sticker-Preisliste · Quelle A',
    tiers: {
      glossy: [[2, 2.1], [4, 4.2], [10, 10.5], [20, 16.8], [40, 30.4]],
      transparent: [[2, 2.4], [4, 4.8], [10, 12], [20, 19.2], [40, 35.6]],
      holographic: [[2, 4.2], [4, 8.4], [10, 19.8], [20, 30.4], [40, 54.4]],
      matteWhite: [[2, 2.3], [4, 4.5], [10, 11.2], [20, 18], [40, 32.7]],
    },
  },
  {
    id: 'a7', label: 'A7', perPrint: 8, finishSize: 'M', source: 'Sticker-Preisliste · Quelle A',
    tiers: {
      glossy: [[8, 1.7], [16, 2.7], [40, 6.3], [80, 9.8]],
      transparent: [[8, 2.9], [16, 4.7], [40, 10.7], [80, 15.8]],
      holographic: [[8, 3.3], [16, 5.2], [40, 12.4], [80, 19.4]],
      matteWhite: [[8, 1.8], [16, 2.9], [40, 6.7], [80, 10.5]],
    },
  },
  {
    id: '95x95', label: '9,5 × 9,5 cm', perPrint: 6, finishSize: 'L', source: 'Sticker-Preisliste · Quelle A',
    tiers: {
      glossy: [[6, 1.6], [12, 2.5], [30, 5.8], [60, 9.1]],
      transparent: [[6, 2.5], [12, 4], [30, 9.2], [60, 13.6]],
      holographic: [[6, 3.1], [12, 5], [30, 11.4], [60, 18]],
      matteWhite: [[6, 1.7], [12, 2.7], [30, 6.2], [60, 9.8]],
    },
  },
  {
    id: '65x65', label: '6,5 × 6,5 cm', perPrint: 12, finishSize: 'M', source: 'Sticker-Preisliste · Quelle A',
    tiers: {
      glossy: [[12, 1.7], [24, 3.4], [60, 5.4], [120, 10.8]],
      transparent: [[12, 2.3], [24, 4.6], [60, 7.3], [120, 14.6]],
      holographic: [[12, 3.4], [24, 6.7], [60, 10.7], [120, 21.4]],
      matteWhite: [[12, 1.8], [24, 3.6], [60, 5.8], [120, 11.6]],
    },
  },
  {
    id: '20x5', label: '20 × 5 cm', perPrint: 5, finishSize: 'L', source: 'Sticker-Preisliste · Quelle A',
    tiers: {
      glossy: [[5, 1.6], [10, 3.2], [25, 6.4], [50, 11.8]],
      transparent: [[5, 2.4], [10, 4.7], [25, 9.4], [50, 17.4]],
      holographic: [[5, 3.2], [10, 6.3], [25, 12.7], [50, 23.4]],
      matteWhite: [[5, 1.7], [10, 3.4], [25, 6.8], [50, 12.6]],
    },
  },
  {
    id: '7x5', label: '7 × 5 cm', perPrint: 15, finishSize: 'S', source: 'Sticker-Preisliste · Quelle A',
    tiers: {
      glossy: [[15, 1.7], [30, 2.8], [75, 5.7], [150, 13.4]],
      transparent: [[15, 3.8], [30, 6.9], [75, 12.8], [150, 27.6]],
      holographic: [[15, 3.2], [30, 5.5], [75, 11.4], [150, 24.7]],
      matteWhite: [[15, 1.8], [30, 3], [75, 6.1], [150, 14.2]],
    },
  },
  {
    id: '10x3', label: '10 × 3 cm', perPrint: 18, finishSize: 'S', source: 'Sticker-Preisliste · Quelle A',
    tiers: {
      glossy: [[18, 1.8], [36, 3.1], [90, 6.4], [180, 14.7]],
      transparent: [[18, 4.4], [36, 8], [90, 14.9], [180, 31.7]],
      holographic: [[18, 3.6], [36, 6], [90, 12.6], [180, 27.1]],
      matteWhite: [[18, 1.9], [36, 3.3], [90, 6.8], [180, 15.5]],
    },
  },
]

export const materialOptions = Object.entries(materials).map(([id, label]) => ({ id, label }))

export const finishSurcharges = {
  laminate: { label: 'Laminat', S: 2.5, M: 3.5, L: 4.5, XL: 6.5 },
  extraCut: { label: 'Extra-Schnitt', S: 2, M: 2.5, L: 3.5, XL: 5 },
}

const colorVariants = (colors, options) => colors.flatMap((color) =>
  options.map(([suffix, label, price]) => ({ id: `${color.toLowerCase()}-${suffix}`, label: `${color} · ${label}`, price })),
)

export const retailProducts = [
  {
    id: 'shirt-bc-e190', category: 'Textilien', label: 'T-Shirt B&C E190', source: 'Textil-Preisliste · Quelle B',
    variants: colorVariants(['Rot', 'Weiß', 'Schwarz'], [['front', 'einseitig bedruckt', 17], ['both', 'beidseitig bedruckt', 24.9]]),
  },
  {
    id: 'hoodie-russell', category: 'Textilien', label: 'Hoodie Russell Athletics', source: 'Textil-Preisliste · Quelle B',
    variants: colorVariants(['Schwarz'], [['front', 'einseitig bedruckt', 45], ['both', 'beidseitig bedruckt', 50]]),
  },
  {
    id: 'windbreaker-premium', category: 'Textilien', label: 'Premium Windbreaker', source: 'Textil-Preisliste · Quelle B',
    variants: colorVariants(['Eisweiß', 'Schwarz'], [['front', 'einseitig bedruckt', 45], ['both', 'beidseitig bedruckt', 50]]),
  },
  {
    id: 'windbreaker-light', category: 'Textilien', label: 'Premium Windbreaker Light', source: 'Textil-Preisliste · Quelle B',
    variants: colorVariants(['Rot', 'Weiß', 'Schwarz'], [['front', 'einseitig bedruckt', 22.99], ['both', 'beidseitig bedruckt', 27.99]]),
  },
  {
    id: 'anglerhut', category: 'Textilien', label: 'Anglerhut', source: 'Textil-Preisliste · Quelle B',
    variants: colorVariants(['Rot L/XL', 'Rot S/M', 'Weiß L/XL', 'Weiß S/M', 'Schwarz L/XL', 'Schwarz S/M'], [['one', 'ein Motiv', 14.99], ['extra', 'Motiv + Zusatzmotiv/Schrift', 16.99]]),
  },
  {
    id: 'schlauchschal-basic', category: 'Textilien', label: 'Schlauchschal Beechfield', source: 'Textil-Preisliste · Quellen B/C',
    variants: colorVariants(['Rot', 'Weiß', 'Schwarz'], [['plain', 'ohne Druck', 5.99], ['small', 'kleines Motiv', 9.99], ['large', 'großes Motiv', 11.99], ['extra', 'zusätzliches Motiv', 14.5]]),
  },
  {
    id: 'schlauchschal-cord', category: 'Textilien', label: 'Schlauchschal Dick mit Kordel', source: 'Textil-Preisliste · Quelle C',
    variants: colorVariants(['Rot', 'Weiß', 'Schwarz'], [['plain', 'ohne Druck', 9.99], ['print', 'mit Motiv', 14.99], ['extra', 'mit Zusatzmotiv', 16.99]]),
  },
  {
    id: 'capies', category: 'Textilien', label: 'Capies', source: 'Textil-Preisliste · Quelle C',
    variants: colorVariants(['Weiß', 'Schwarz'], [['print', 'mit Druck', 14.99], ['extra', 'mit Zusatzmotiv', 18.99]]),
  },
  {
    id: 'balaclava', category: 'Textilien', label: 'Balaclava Beechfield', source: 'Textil-Preisliste · Quelle C',
    variants: [{ id: 'black-plain', label: 'Schwarz · ohne Druck', price: 6 }, { id: 'black-small', label: 'Schwarz · kleines Motiv', price: 7.99 }, { id: 'black-large', label: 'Schwarz · großes Motiv', price: 9.99 }, { id: 'black-two-small', label: 'Schwarz · zwei kleine Motive', price: 9.9 }, { id: 'black-two-large', label: 'Schwarz · zwei große Motive', price: 12.9 }],
  },
  {
    id: 'clock', category: 'Accessoires', label: 'Wanduhr mit eigenem Design', source: 'Textil-Preisliste · Quelle C',
    variants: [{ id: 'design', label: 'Eigenes Design', price: 19.99 }],
  },
  {
    id: 'shoulder-bag', category: 'Accessoires', label: 'Umhängetasche', source: 'Textil-Preisliste · Quelle C',
    variants: [{ id: 'standard', label: 'Standard + Druck', price: 19.99 }, { id: 'premium', label: 'Premium + Druck', price: 24.99 }],
  },
]

export const categoryOptions = [
  { id: 'stickers', label: 'Aufkleber', hint: 'EK-Staffeln' },
  { id: 'textiles', label: 'Textilien', hint: 'VK-Preisliste' },
  { id: 'accessories', label: 'Accessoires', hint: 'VK-Preisliste' },
]
