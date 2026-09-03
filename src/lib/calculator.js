export function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100
}

export function getQuantityDiscount(quantity, tiers) {
  const amount = Math.max(1, Math.floor(Number(quantity) || 1))
  return tiers.reduce((active, tier) => amount >= tier.min ? tier.percent : active, 0)
}

export function optimizePacks(requested, tiers) {
  const wanted = Math.min(10000, Math.max(1, Math.floor(Number(requested) || 1)))
  const maxPack = Math.max(...tiers.map(([quantity]) => quantity))
  // The requested quantity is capped, but the smallest deliverable pack total
  // may legitimately exceed it (for example 9,999 requested -> 10,005 supplied).
  const limit = wanted + maxPack
  const costs = Array(limit + 1).fill(Infinity)
  const packCounts = Array(limit + 1).fill(Infinity)
  const picks = Array(limit + 1).fill(null)
  costs[0] = 0
  packCounts[0] = 0

  for (let quantity = 1; quantity <= limit; quantity += 1) {
    for (const [packQuantity, packPrice] of tiers) {
      const candidateCost = quantity >= packQuantity ? costs[quantity - packQuantity] + packPrice : Infinity
      const candidateCount = quantity >= packQuantity ? packCounts[quantity - packQuantity] + 1 : Infinity
      if (candidateCost < costs[quantity] || (candidateCost === costs[quantity] && candidateCount < packCounts[quantity])) {
        costs[quantity] = candidateCost
        packCounts[quantity] = candidateCount
        picks[quantity] = [quantity - packQuantity, packQuantity, packPrice]
      }
    }
  }

  let supplied = wanted
  for (let quantity = wanted; quantity <= limit; quantity += 1) {
    if (costs[quantity] < costs[supplied]) supplied = quantity
  }

  const packMap = new Map()
  let cursor = supplied
  while (cursor > 0 && picks[cursor]) {
    const [previous, packQuantity, packPrice] = picks[cursor]
    const key = `${packQuantity}|${packPrice}`
    packMap.set(key, { quantity: packQuantity, price: packPrice, count: (packMap.get(key)?.count || 0) + 1 })
    cursor = previous
  }

  const packs = [...packMap.values()].sort((a, b) => b.quantity - a.quantity)
  return { requested: wanted, supplied, price: roundMoney(costs[supplied]), packs }
}

export function calculateQuote({ sourceKind, sourceTotal, quantity, markup, quantityDiscount = 0, discount, friendEnabled, friendDiscount, additionalCosts = 0, rounding = 'none' }) {
  const amount = Math.max(1, Number(quantity) || 1)
  const cleanSource = Math.max(0, Number(sourceTotal) || 0)
  const cleanMarkup = Math.max(-99, Number(markup) || 0)
  const cleanQuantityDiscount = Math.max(0, Math.min(100, Number(quantityDiscount) || 0))
  const cleanDiscount = Math.max(0, Math.min(100, Number(discount) || 0))
  const cleanFriend = friendEnabled ? Math.max(0, Math.min(100, Number(friendDiscount) || 0)) : 0
  const cleanAdditionalCosts = Math.max(0, Number(additionalCosts) || 0)
  const discountFactor = (1 - cleanQuantityDiscount / 100) * (1 - cleanDiscount / 100) * (1 - cleanFriend / 100)

  const ek = sourceKind === 'ek' ? cleanSource + cleanAdditionalCosts : cleanSource / (1 + cleanMarkup / 100) + cleanAdditionalCosts
  const listVk = sourceKind === 'ek' ? ek * (1 + cleanMarkup / 100) : cleanSource
  const rawVk = listVk * discountFactor
  const vk = rounding === 'half'
    ? Math.ceil(rawVk * 2) / 2
    : rounding === 'ninety'
      ? Math.ceil(Math.max(0, rawVk - 0.9)) + 0.9
      : rawVk
  const roundedEk = roundMoney(ek)
  const roundedVk = roundMoney(vk)
  const roundedProfit = roundMoney(roundedVk - roundedEk)
  const margin = roundedVk > 0 ? (roundedProfit / roundedVk) * 100 : 0

  return {
    ek: roundedEk,
    listVk: roundMoney(listVk),
    vk: roundedVk,
    unitPrice: roundMoney(roundedVk / amount),
    profit: roundedProfit,
    margin: roundMoney(margin),
    totalDiscount: roundMoney(Math.max(0, listVk - rawVk)),
  }
}
