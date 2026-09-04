import { useEffect, useMemo, useRef, useState } from 'react'
import { materialOptions, PRICE_META, retailProducts, stickerFormats } from './data/prices.js'

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
const fmt = (value) => euro.format(Number(value) || 0)
const todayISO = () => new Date().toISOString().slice(0, 10)
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`
const STORE_KEY = 'hp67-business-hub-v2'

const STATUS = [
  ['new', 'Neu'],
  ['design', 'Entwurf'],
  ['approved', 'Freigabe'],
  ['production', 'Produktion'],
  ['ready', 'Fertig'],
  ['pickup', 'Abholung / Versand'],
  ['done', 'Erledigt'],
]
const STATUS_LABEL = Object.fromEntries(STATUS)

const TEMPLATE_OPTIONS = [
  ['confirmation', 'Auftrag bestätigen'],
  ['draft', 'Entwurf / Freigabe'],
  ['production', 'Produktion gestartet'],
  ['ready', 'Auftrag fertig'],
  ['pickup', 'Abholung erinnern'],
  ['shipping', 'Versand bestätigt'],
  ['payment', 'Restzahlung erinnern'],
]

function safeJson(value, fallback) {
  try { return JSON.parse(value) ?? fallback } catch { return fallback }
}
function loadStore() {
  const raw = safeJson(localStorage.getItem(STORE_KEY), null)
  return raw || { orders: [], customers: [], tasks: [], settings: { focusMode: true } }
}
function saveStore(value) {
  localStorage.setItem(STORE_KEY, JSON.stringify(value))
}
function nextOrderNo(orders) {
  const now = new Date()
  const date = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const count = orders.filter((order) => String(order.orderNo || '').includes(date)).length + 1
  return `HP67-${date}-${String(count).padStart(2, '0')}`
}
function emptyOrder(orders = []) {
  return {
    id: uid(), orderNo: nextOrderNo(orders), createdAt: todayISO(), status: 'new', priority: 'normal',
    customerName: '', phone: '', email: '', contact: '', items: [{ id: uid(), description: '', qty: 1, unitPrice: '' }],
    priceTotal: '', deposit: '', paid: false, paymentMethod: '', delivery: 'Abholung',
    productionFrom: '', productionTo: '', pickupDate: '', pickupFrom: '', pickupTo: '', shippingTracking: '',
    notes: '', checklist: { draftSent: false, draftApproved: false, depositReceived: false, inProduction: false, ready: false, collected: false, shipped: false },
  }
}
function moneyNumber(value) { return Math.max(0, Number(String(value).replace(',', '.')) || 0) }
function dateDiff(iso) {
  if (!iso) return null
  const start = new Date(`${todayISO()}T00:00:00`)
  const end = new Date(`${iso}T00:00:00`)
  return Math.round((end - start) / 86400000)
}
function dateText(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T12:00:00`).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' })
}
function phoneForWhatsApp(value = '') {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = `49${digits.slice(1)}`
  return digits
}
function whatsappLink(phone, text) {
  const digits = phoneForWhatsApp(phone)
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : ''
}
function buildMessage(order, type) {
  const name = order.customerName || 'dir'
  const pickup = order.pickupDate
    ? `${dateText(order.pickupDate)}${order.pickupFrom ? ` ab ${order.pickupFrom} Uhr` : ''}${order.pickupTo ? ` bis ${order.pickupTo} Uhr` : ''}`
    : 'wie besprochen'
  const rest = Math.max(0, moneyNumber(order.priceTotal) - moneyNumber(order.deposit))
  const base = `Hi ${name}, hier ist HoodPlaka67 👋\nAuftrag: ${order.orderNo}`
  const messages = {
    confirmation: `${base}\n\nDein Auftrag ist bei mir eingetragen. Gesamtpreis: ${fmt(order.priceTotal)}.${order.productionFrom ? `\nGeplante Produktion: ${dateText(order.productionFrom)}${order.productionTo ? ` bis ${dateText(order.productionTo)}` : ''}.` : ''}${order.pickupDate ? `\nAbholung: ${pickup}.` : ''}\n\nFalls sich etwas ändert, melde ich mich.`,
    draft: `${base}\n\nDer Entwurf ist fertig. Schau bitte alles genau an und gib mir kurz mit „passt so“ die Freigabe, dann kann ich weiter produzieren.`,
    production: `${base}\n\nDein Auftrag ist jetzt in Produktion.${order.productionTo ? ` Geplant fertig bis ${dateText(order.productionTo)}.` : ''} Ich melde mich, sobald alles fertig ist.`,
    ready: `${base}\n\nDein Auftrag ist fertig ✅${order.delivery === 'Abholung' ? `\nAbholung: ${pickup}.` : '\nIch mache ihn jetzt für den Versand fertig.'}${rest > 0 && !order.paid ? `\nOffener Restbetrag: ${fmt(rest)}.` : ''}`,
    pickup: `${base}\n\nKurze Erinnerung an deine Abholung: ${pickup}.${rest > 0 && !order.paid ? `\nOffener Restbetrag: ${fmt(rest)}.` : ''}\nWenn es zeitlich nicht passt, sag bitte kurz Bescheid.`,
    shipping: `${base}\n\nDein Auftrag wurde verschickt ✅${order.shippingTracking ? `\nSendungsnummer: ${order.shippingTracking}` : ''}\nDanke für deinen Auftrag!`,
    payment: `${base}\n\nKurze Erinnerung: Es ist noch ein Restbetrag von ${fmt(rest)} offen. Danke dir!`,
  }
  return messages[type] || messages.confirmation
}
function downloadBlob(name, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
function icsDate(date, time = '09:00') {
  if (!date) return ''
  return `${date.replaceAll('-', '')}T${String(time || '09:00').replace(':', '')}00`
}
function orderToICS(order) {
  const events = []
  const esc = (s = '') => String(s).replaceAll('\\', '\\\\').replaceAll(',', '\\,').replaceAll(';', '\\;').replaceAll('\n', '\\n')
  if (order.productionFrom) {
    events.push([
      'BEGIN:VEVENT', `UID:${order.id}-production@hoodplaka67`, `DTSTAMP:${icsDate(todayISO(), '00:00')}Z`,
      `DTSTART:${icsDate(order.productionFrom, '09:00')}`, `SUMMARY:${esc(`Produktion starten · ${order.orderNo} · ${order.customerName}`)}`,
      `DESCRIPTION:${esc(order.notes || 'HoodPlaka67 Auftrag')}`, 'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Produktion starten', 'END:VALARM', 'END:VEVENT',
    ].join('\r\n'))
  }
  if (order.productionTo) {
    events.push([
      'BEGIN:VEVENT', `UID:${order.id}-deadline@hoodplaka67`, `DTSTAMP:${icsDate(todayISO(), '00:00')}Z`,
      `DTSTART:${icsDate(order.productionTo, '16:00')}`, `SUMMARY:${esc(`Produktionsfrist · ${order.orderNo} · ${order.customerName}`)}`,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Produktionsfrist morgen', 'END:VALARM', 'END:VEVENT',
    ].join('\r\n'))
  }
  if (order.pickupDate) {
    events.push([
      'BEGIN:VEVENT', `UID:${order.id}-pickup@hoodplaka67`, `DTSTAMP:${icsDate(todayISO(), '00:00')}Z`,
      `DTSTART:${icsDate(order.pickupDate, order.pickupFrom || '17:00')}`, `SUMMARY:${esc(`${order.delivery} · ${order.orderNo} · ${order.customerName}`)}`,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Abholung / Versand morgen', 'END:VALARM',
      'BEGIN:VALARM', 'TRIGGER:-PT2H', 'ACTION:DISPLAY', 'DESCRIPTION:Abholung / Versand in 2 Stunden', 'END:VALARM', 'END:VEVENT',
    ].join('\r\n'))
  }
  return events
}
function allOrdersICS(orders) {
  const events = orders.filter((o) => o.status !== 'done').flatMap(orderToICS)
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HoodPlaka67//Business Hub//DE', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n')
}
function optimizePacks(requested, tiers) {
  const goal = Math.max(1, Number(requested) || 1)
  const maxPack = Math.max(...tiers.map(([q]) => q))
  const limit = goal + maxPack
  const dp = Array(limit + 1).fill(null)
  dp[0] = { cost: 0, packs: [] }
  for (let i = 0; i <= limit; i += 1) {
    if (!dp[i]) continue
    for (const [qty, price] of tiers) {
      const n = i + qty
      if (n > limit) continue
      const next = { cost: dp[i].cost + price, packs: [...dp[i].packs, qty] }
      if (!dp[n] || next.cost < dp[n].cost) dp[n] = next
    }
  }
  let best = null
  for (let supplied = goal; supplied <= limit; supplied += 1) {
    if (!dp[supplied]) continue
    const candidate = { supplied, cost: dp[supplied].cost, packs: dp[supplied].packs }
    if (!best || candidate.cost < best.cost || (candidate.cost === best.cost && supplied < best.supplied)) best = candidate
  }
  return best || { supplied: goal, cost: 0, packs: [] }
}
function csvCells(line) {
  const cells = []
  let current = ''; let quoted = false
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (ch === '"' && line[i + 1] === '"') { current += '"'; i += 1 }
    else if (ch === '"') quoted = !quoted
    else if (ch === ',' && !quoted) { cells.push(current); current = '' }
    else current += ch
  }
  cells.push(current)
  return cells
}

function Badge({ children, tone = '' }) { return <span className={`badge ${tone}`}>{children}</span> }
function Empty({ children }) { return <div className="empty-state">{children}</div> }

export default function App() {
  const initial = useMemo(loadStore, [])
  const [orders, setOrders] = useState(initial.orders || [])
  const [customers, setCustomers] = useState(initial.customers || [])
  const [tasks, setTasks] = useState(initial.tasks || [])
  const [settings, setSettings] = useState(initial.settings || { focusMode: true })
  const [page, setPage] = useState('dashboard')
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('open')
  const [toast, setToast] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [messageType, setMessageType] = useState('confirmation')
  const [taskDraft, setTaskDraft] = useState({ title: '', date: todayISO(), time: '', priority: 'normal' })
  const [calcCategory, setCalcCategory] = useState('stickers')
  const [calcFormat, setCalcFormat] = useState('a4')
  const [calcMaterial, setCalcMaterial] = useState('glossy')
  const [calcQty, setCalcQty] = useState(10)
  const [calcProduct, setCalcProduct] = useState('shirt-bc-e190')
  const [calcVariant, setCalcVariant] = useState('')
  const [calcMarkup, setCalcMarkup] = useState(100)
  const [calcDiscount, setCalcDiscount] = useState(0)
  const importRef = useRef(null)
  const csvRef = useRef(null)

  useEffect(() => { saveStore({ orders, customers, tasks, settings }) }, [orders, customers, tasks, settings])

  const openOrders = orders.filter((o) => o.status !== 'done')
  const overdueOrders = openOrders.filter((o) => (o.productionTo && dateDiff(o.productionTo) < 0) || (o.pickupDate && dateDiff(o.pickupDate) < 0))
  const todayOrders = openOrders.filter((o) => [o.productionFrom, o.productionTo, o.pickupDate].includes(todayISO()))
  const outstanding = orders.reduce((sum, o) => sum + (o.paid ? 0 : Math.max(0, moneyNumber(o.priceTotal) - moneyNumber(o.deposit))), 0)

  const reminders = useMemo(() => {
    const list = []
    for (const order of openOrders) {
      const add = (date, type, title, priority = 'normal') => {
        if (!date) return
        const diff = dateDiff(date)
        if (diff <= 7) list.push({ id: `${order.id}-${type}`, orderId: order.id, date, diff, title, priority, customerName: order.customerName, orderNo: order.orderNo, type })
      }
      add(order.productionFrom, 'productionStart', 'Produktion starten', order.priority)
      add(order.productionTo, 'productionDue', 'Produktion fertig machen', order.priority === 'high' ? 'high' : 'normal')
      add(order.pickupDate, 'pickup', order.delivery === 'Versand' ? 'Versand einplanen' : 'Abholung', order.priority)
      const rest = Math.max(0, moneyNumber(order.priceTotal) - moneyNumber(order.deposit))
      if (rest > 0 && !order.paid && ['ready', 'pickup'].includes(order.status)) {
        list.push({ id: `${order.id}-payment`, orderId: order.id, date: order.pickupDate || todayISO(), diff: dateDiff(order.pickupDate || todayISO()), title: `Restzahlung ${fmt(rest)}`, priority: 'high', customerName: order.customerName, orderNo: order.orderNo, type: 'payment' })
      }
    }
    for (const task of tasks.filter((t) => !t.done)) {
      const diff = dateDiff(task.date)
      if (diff <= 7) list.push({ ...task, diff, customerName: '', orderNo: '', type: 'task' })
    }
    return list.sort((a, b) => a.diff - b.diff || (a.priority === 'high' ? -1 : 1))
  }, [orders, tasks])

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return undefined
    const fire = async () => {
      const critical = reminders.filter((r) => r.diff <= 0).slice(0, 4)
      if (!critical.length) return
      const key = `hp67-notified-${todayISO()}-${critical.map((r) => r.id).join('|')}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
      const reg = await navigator.serviceWorker?.ready.catch(() => null)
      const body = critical.map((r) => `${r.title}${r.customerName ? ` · ${r.customerName}` : ''}`).join('\n')
      if (reg?.showNotification) reg.showNotification(`HoodPlaka67 · ${critical.length} fällig`, { body, tag: 'hp67-due', renotify: true })
      else new Notification('HoodPlaka67 · Erinnerung', { body })
    }
    fire()
    const timer = window.setInterval(fire, 60000)
    return () => window.clearInterval(timer)
  }, [reminders])

  function flash(text) { setToast(text); window.setTimeout(() => setToast(''), 2200) }
  function startNewOrder() { setEditing(emptyOrder(orders)); setPage('orders'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function editOrder(order) { setEditing(JSON.parse(JSON.stringify(order))); setPage('orders'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  function saveOrder() {
    if (!editing.customerName.trim()) return flash('Kundenname fehlt')
    const itemTotal = editing.items.reduce((sum, item) => sum + moneyNumber(item.qty) * moneyNumber(item.unitPrice), 0)
    const order = { ...editing, priceTotal: editing.priceTotal === '' && itemTotal > 0 ? itemTotal : editing.priceTotal }
    setOrders((current) => current.some((o) => o.id === order.id) ? current.map((o) => o.id === order.id ? order : o) : [order, ...current])
    setCustomers((current) => {
      const key = phoneForWhatsApp(order.phone) || order.email.toLowerCase() || order.customerName.toLowerCase()
      const existing = current.find((c) => (phoneForWhatsApp(c.phone) || c.email.toLowerCase() || c.name.toLowerCase()) === key)
      if (existing) return current.map((c) => c.id === existing.id ? { ...c, name: order.customerName, phone: order.phone, email: order.email, lastOrderAt: todayISO() } : c)
      return [{ id: uid(), name: order.customerName, phone: order.phone, email: order.email, notes: '', tags: [], createdAt: todayISO(), lastOrderAt: todayISO() }, ...current]
    })
    setEditing(null)
    flash('Auftrag gespeichert')
  }
  function deleteOrder(id) {
    if (!window.confirm('Auftrag wirklich löschen?')) return
    setOrders((current) => current.filter((o) => o.id !== id)); setEditing(null); flash('Auftrag gelöscht')
  }
  function setOrderStatus(id, status) {
    setOrders((current) => current.map((o) => o.id === id ? { ...o, status } : o))
  }
  function openWhatsApp(order, type = 'confirmation') {
    const link = whatsappLink(order.phone, buildMessage(order, type))
    if (!link) return flash('Beim Kunden fehlt die Telefonnummer')
    window.open(link, '_blank', 'noopener,noreferrer')
  }
  async function copyMessage(order, type) {
    await navigator.clipboard.writeText(buildMessage(order, type)); flash('WhatsApp-Text kopiert')
  }
  async function enableNotifications() {
    if (!('Notification' in window)) return flash('Benachrichtigungen werden hier nicht unterstützt')
    const result = await Notification.requestPermission()
    flash(result === 'granted' ? 'Benachrichtigungen aktiviert' : 'Benachrichtigungen nicht freigegeben')
  }
  function addTask() {
    if (!taskDraft.title.trim()) return
    setTasks((current) => [{ id: uid(), ...taskDraft, done: false }, ...current])
    setTaskDraft({ title: '', date: todayISO(), time: '', priority: 'normal' }); flash('Erinnerung gespeichert')
  }
  function exportBackup() {
    downloadBlob(`hoodplaka67-backup-${todayISO()}.json`, JSON.stringify({ version: 2, exportedAt: new Date().toISOString(), orders, customers, tasks, settings }, null, 2), 'application/json')
  }
  async function importBackup(file) {
    if (!file) return
    const text = await file.text(); const data = safeJson(text, null)
    if (!data?.orders || !Array.isArray(data.orders)) return flash('Keine gültige HP67-Sicherung')
    setOrders(data.orders); setCustomers(data.customers || []); setTasks(data.tasks || []); setSettings(data.settings || { focusMode: true }); flash('Sicherung importiert')
  }
  async function importShopifyCsv(file) {
    if (!file) return
    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) return flash('CSV ist leer')
    const headers = csvCells(lines[0]).map((h) => h.trim())
    const rows = lines.slice(1).map((line) => Object.fromEntries(csvCells(line).map((cell, i) => [headers[i], cell])))
    const grouped = new Map()
    for (const row of rows) {
      const key = row.Name || row['Order ID'] || row.Email || uid()
      if (!grouped.has(key)) grouped.set(key, { row, items: [] })
      const itemName = row['Lineitem name'] || row['Lineitem sku'] || row['Lineitem title']
      if (itemName) grouped.get(key).items.push({ id: uid(), description: itemName, qty: Number(row['Lineitem quantity'] || 1), unitPrice: row['Lineitem price'] || '' })
    }
    const imported = [...grouped.values()].map(({ row, items }) => ({
      ...emptyOrder(orders), id: uid(), orderNo: row.Name ? `SHOP-${row.Name.replace('#', '')}` : nextOrderNo(orders), createdAt: (row['Created at'] || '').slice(0, 10) || todayISO(),
      customerName: row['Billing Name'] || row['Shipping Name'] || row['Customer'] || row.Email || 'Shopify Kunde', phone: row.Phone || row['Billing Phone'] || row['Shipping Phone'] || '', email: row.Email || '',
      items: items.length ? items : [{ id: uid(), description: 'Shopify Bestellung', qty: 1, unitPrice: row.Total || '' }], priceTotal: row.Total || row['Total'] || '',
      paid: String(row['Financial Status'] || '').toLowerCase() === 'paid', delivery: 'Versand', status: String(row['Fulfillment Status'] || '').toLowerCase() === 'fulfilled' ? 'done' : 'new', notes: `Import aus Shopify CSV${row['Notes'] ? `\n${row['Notes']}` : ''}`,
    }))
    setOrders((current) => [...imported, ...current])
    const newCustomers = imported.map((o) => ({ id: uid(), name: o.customerName, phone: o.phone, email: o.email, notes: 'Aus Shopify importiert', tags: ['Shopify'], createdAt: todayISO(), lastOrderAt: o.createdAt }))
    setCustomers((current) => [...newCustomers.filter((c, i, arr) => arr.findIndex((x) => (phoneForWhatsApp(x.phone) || x.email || x.name) === (phoneForWhatsApp(c.phone) || c.email || c.name)) === i), ...current])
    flash(`${imported.length} Shopify-Aufträge importiert`)
  }

  const selectedMessageOrder = orders.find((o) => o.id === selectedOrderId) || openOrders[0] || orders[0]
  const filteredOrders = orders.filter((order) => {
    const hay = `${order.orderNo} ${order.customerName} ${order.phone} ${order.items.map((i) => i.description).join(' ')}`.toLowerCase()
    const matches = hay.includes(search.toLowerCase())
    if (!matches) return false
    if (statusFilter === 'open') return order.status !== 'done'
    if (statusFilter === 'all') return true
    return order.status === statusFilter
  })
  const calcSticker = stickerFormats.find((f) => f.id === calcFormat) || stickerFormats[0]
  const calcRetailPool = retailProducts.filter((p) => p.category === (calcCategory === 'textiles' ? 'Textilien' : 'Accessoires'))
  const calcRetail = calcRetailPool.find((p) => p.id === calcProduct) || calcRetailPool[0]
  const calcRetailVariant = calcRetail?.variants.find((v) => v.id === calcVariant) || calcRetail?.variants[0]
  const calcPack = calcCategory === 'stickers' ? optimizePacks(calcQty, calcSticker.tiers[calcMaterial]) : null
  const calcEk = calcCategory === 'stickers' ? calcPack.cost : (calcRetailVariant?.price || 0) * Math.max(1, Number(calcQty) || 1)
  const calcVkBeforeDiscount = calcCategory === 'stickers' ? calcEk * (1 + Number(calcMarkup || 0) / 100) : calcEk
  const calcVk = calcVkBeforeDiscount * (1 - Number(calcDiscount || 0) / 100)
  const calcSupplied = calcCategory === 'stickers' ? calcPack.supplied : Math.max(1, Number(calcQty) || 1)

  function addCalcToOrder() {
    const description = calcCategory === 'stickers'
      ? `Aufkleber ${calcSticker.label} · ${materialOptions.find((m) => m.id === calcMaterial)?.label}`
      : `${calcRetail?.label} · ${calcRetailVariant?.label}`
    const order = emptyOrder(orders)
    order.items = [{ id: uid(), description, qty: calcSupplied, unitPrice: calcSupplied ? (calcVk / calcSupplied).toFixed(2) : calcVk.toFixed(2) }]
    order.priceTotal = calcVk.toFixed(2)
    setEditing(order); setPage('orders'); flash('Kalkulation in neuen Auftrag übernommen')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setPage('dashboard')}><span className="brand-mark">HP<span>67</span></span><span><strong>HoodPlaka67</strong><small>Business Hub</small></span></button>
        <div className="top-actions"><button className="btn secondary desktop-only" onClick={enableNotifications}>🔔 Erinnerungen</button><button className="btn primary" onClick={startNewOrder}>＋ Neuer Auftrag</button></div>
      </header>

      <nav className="main-nav">
        {[['dashboard', '⌂', 'Heute'], ['orders', '▤', 'Aufträge'], ['planner', '◷', 'Planer'], ['customers', '♙', 'Kunden'], ['whatsapp', '◉', 'WhatsApp'], ['calculator', '€', 'Kalkulator'], ['settings', '⚙', 'Mehr']].map(([id, icon, label]) => (
          <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}><span>{icon}</span><small>{label}</small>{id === 'planner' && reminders.filter((r) => r.diff <= 0).length > 0 && <i>{reminders.filter((r) => r.diff <= 0).length}</i>}</button>
        ))}
      </nav>

      <main className="content">
        {page === 'dashboard' && <>
          <section className="hero compact-hero"><div><span className="eyebrow">NICHTS MEHR VERGESSEN</span><h1>Heute zuerst.<br /><em>Alles im Blick.</em></h1></div><div className="hero-actions"><label className="focus-toggle"><input type="checkbox" checked={settings.focusMode !== false} onChange={(e) => setSettings((s) => ({ ...s, focusMode: e.target.checked }))} /><span>Fokusmodus</span></label></div></section>
          <section className="metric-grid">
            <div className="metric-card danger"><span>Überfällig</span><strong>{overdueOrders.length}</strong><small>sofort prüfen</small></div>
            <div className="metric-card"><span>Heute</span><strong>{todayOrders.length}</strong><small>Termine / Fristen</small></div>
            <div className="metric-card"><span>Offene Aufträge</span><strong>{openOrders.length}</strong><small>noch nicht erledigt</small></div>
            <div className="metric-card money"><span>Offene Beträge</span><strong>{fmt(outstanding)}</strong><small>noch einzusammeln</small></div>
          </section>
          <section className="two-panel-grid">
            <div className="panel">
              <div className="panel-title"><div><span className="eyebrow">DEIN NÄCHSTER SCHRITT</span><h2>Dringend & heute</h2></div><button className="text-button" onClick={() => setPage('planner')}>Planer öffnen →</button></div>
              {reminders.filter((r) => settings.focusMode === false ? r.diff <= 7 : r.diff <= 1).length ? <div className="reminder-list">{reminders.filter((r) => settings.focusMode === false ? r.diff <= 7 : r.diff <= 1).slice(0, 8).map((r) => <div className={`reminder-row ${r.diff < 0 ? 'overdue' : r.diff === 0 ? 'today' : ''}`} key={r.id}><div className="date-box"><strong>{r.diff < 0 ? `${Math.abs(r.diff)}T` : r.diff === 0 ? 'HEUTE' : 'MORGEN'}</strong><small>{dateText(r.date)}</small></div><div className="grow"><strong>{r.title}</strong><small>{r.customerName ? `${r.customerName} · ${r.orderNo}` : 'Eigene Erinnerung'}</small></div>{r.orderId && <button className="btn small" onClick={() => editOrder(orders.find((o) => o.id === r.orderId))}>Öffnen</button>}</div>)}</div> : <Empty>Keine dringenden Termine. ✅</Empty>}
            </div>
            <div className="panel quick-panel">
              <div className="panel-title"><div><span className="eyebrow">SCHNELLZUGRIFF</span><h2>1 Klick statt merken</h2></div></div>
              <button className="quick-action" onClick={startNewOrder}><span>＋</span><div><strong>Auftrag eintragen</strong><small>inkl. Produktions- & Abholtermin</small></div></button>
              <button className="quick-action" onClick={() => setPage('planner')}><span>⏰</span><div><strong>Erinnerung setzen</strong><small>eigene Aufgabe mit Fälligkeit</small></div></button>
              <button className="quick-action" onClick={() => setPage('whatsapp')}><span>◉</span><div><strong>Kunde anschreiben</strong><small>WhatsApp-Text schon vorausgefüllt</small></div></button>
              <button className="quick-action" onClick={() => downloadBlob(`hoodplaka67-kalender-${todayISO()}.ics`, allOrdersICS(orders), 'text/calendar;charset=utf-8')}><span>▣</span><div><strong>Kalender exportieren</strong><small>mit Erinnerungen für Produktion & Abholung</small></div></button>
            </div>
          </section>
          <section className="panel">
            <div className="panel-title"><div><span className="eyebrow">PIPELINE</span><h2>Wo hängt welcher Auftrag?</h2></div></div>
            <div className="pipeline">{STATUS.filter(([id]) => id !== 'done').map(([id, label]) => { const count = orders.filter((o) => o.status === id).length; return <button key={id} onClick={() => { setStatusFilter(id); setPage('orders') }}><span>{label}</span><strong>{count}</strong></button> })}</div>
          </section>
        </>}

        {page === 'orders' && <>
          {editing && <section className="panel editor-panel">
            <div className="panel-title"><div><span className="eyebrow">AUFTRAGSZETTEL DIGITAL</span><h2>{orders.some((o) => o.id === editing.id) ? editing.orderNo : 'Neuer Auftrag'}</h2></div><button className="icon-button" onClick={() => setEditing(null)}>✕</button></div>
            <div className="form-grid cols-4">
              <label><span>Auftrags-Nr.</span><input value={editing.orderNo} onChange={(e) => setEditing({ ...editing, orderNo: e.target.value })} /></label>
              <label><span>Status</span><select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>{STATUS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
              <label><span>Priorität</span><select value={editing.priority} onChange={(e) => setEditing({ ...editing, priority: e.target.value })}><option value="normal">Normal</option><option value="high">Dringend</option></select></label>
              <label><span>Auftragsdatum</span><input type="date" value={editing.createdAt} onChange={(e) => setEditing({ ...editing, createdAt: e.target.value })} /></label>
            </div>
            <h3 className="section-label">Kunde</h3>
            <div className="form-grid cols-4">
              <label><span>Name *</span><input value={editing.customerName} onChange={(e) => setEditing({ ...editing, customerName: e.target.value })} /></label>
              <label><span>Telefon / WhatsApp</span><input inputMode="tel" placeholder="0176 ..." value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></label>
              <label><span>E-Mail</span><input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></label>
              <label><span>Instagram / Kontakt</span><input value={editing.contact} onChange={(e) => setEditing({ ...editing, contact: e.target.value })} /></label>
            </div>
            <h3 className="section-label">Bestellung / Details</h3>
            <div className="item-table"><div className="item-head"><span>Beschreibung</span><span>Menge</span><span>Einzelpreis</span><span></span></div>{editing.items.map((item, index) => <div className="item-row" key={item.id}><input placeholder="z. B. 100 Sticker 9,5×9,5 Glossy" value={item.description} onChange={(e) => setEditing({ ...editing, items: editing.items.map((x, i) => i === index ? { ...x, description: e.target.value } : x) })} /><input type="number" min="1" value={item.qty} onChange={(e) => setEditing({ ...editing, items: editing.items.map((x, i) => i === index ? { ...x, qty: e.target.value } : x) })} /><input type="number" step="0.01" min="0" value={item.unitPrice} onChange={(e) => setEditing({ ...editing, items: editing.items.map((x, i) => i === index ? { ...x, unitPrice: e.target.value } : x) })} /><button onClick={() => setEditing({ ...editing, items: editing.items.filter((_, i) => i !== index) })}>✕</button></div>)}</div>
            <button className="text-button add-line" onClick={() => setEditing({ ...editing, items: [...editing.items, { id: uid(), description: '', qty: 1, unitPrice: '' }] })}>＋ weitere Position</button>
            <div className="form-grid cols-4">
              <label><span>Gesamtpreis €</span><input type="number" step="0.01" value={editing.priceTotal} onChange={(e) => setEditing({ ...editing, priceTotal: e.target.value })} /></label>
              <label><span>Anzahlung €</span><input type="number" step="0.01" value={editing.deposit} onChange={(e) => setEditing({ ...editing, deposit: e.target.value })} /></label>
              <label><span>Restbetrag</span><div className="read-field">{fmt(Math.max(0, moneyNumber(editing.priceTotal) - moneyNumber(editing.deposit)))}</div></label>
              <label><span>Zahlungsart</span><input value={editing.paymentMethod} onChange={(e) => setEditing({ ...editing, paymentMethod: e.target.value })} placeholder="Bar / PayPal / Überweisung" /></label>
            </div>
            <h3 className="section-label">Produktion & Abholung</h3>
            <div className="form-grid cols-4">
              <label><span>Produktion von</span><input type="date" value={editing.productionFrom} onChange={(e) => setEditing({ ...editing, productionFrom: e.target.value })} /></label>
              <label><span>Produktion bis</span><input type="date" value={editing.productionTo} onChange={(e) => setEditing({ ...editing, productionTo: e.target.value })} /></label>
              <label><span>Abhol-/Versanddatum</span><input type="date" value={editing.pickupDate} onChange={(e) => setEditing({ ...editing, pickupDate: e.target.value })} /></label>
              <label><span>Art</span><select value={editing.delivery} onChange={(e) => setEditing({ ...editing, delivery: e.target.value })}><option>Abholung</option><option>Versand</option><option>Lieferung</option></select></label>
              <label><span>Abholzeit von</span><input type="time" value={editing.pickupFrom} onChange={(e) => setEditing({ ...editing, pickupFrom: e.target.value })} /></label>
              <label><span>Abholzeit bis</span><input type="time" value={editing.pickupTo} onChange={(e) => setEditing({ ...editing, pickupTo: e.target.value })} /></label>
              <label className="span-2"><span>Sendungsnummer / Tracking</span><input value={editing.shippingTracking} onChange={(e) => setEditing({ ...editing, shippingTracking: e.target.value })} /></label>
            </div>
            <h3 className="section-label">Checkliste – damit nichts untergeht</h3>
            <div className="check-grid">{[['draftSent', 'Entwurf gesendet'], ['draftApproved', 'Entwurf bestätigt'], ['depositReceived', 'Anzahlung erhalten'], ['inProduction', 'In Produktion'], ['ready', 'Fertig'], ['collected', 'Abgeholt'], ['shipped', 'Versendet']].map(([key, label]) => <label key={key}><input type="checkbox" checked={!!editing.checklist[key]} onChange={(e) => setEditing({ ...editing, checklist: { ...editing.checklist, [key]: e.target.checked } })} />{label}</label>)}<label><input type="checkbox" checked={!!editing.paid} onChange={(e) => setEditing({ ...editing, paid: e.target.checked })} />komplett bezahlt</label></div>
            <label className="full-label"><span>Notizen</span><textarea rows="4" value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} placeholder="Sonderwünsche, Motiv, Material, Zusagen, was unbedingt zu beachten ist ..." /></label>
            <div className="editor-actions"><button className="btn primary" onClick={saveOrder}>Speichern</button>{orders.some((o) => o.id === editing.id) && <><button className="btn whatsapp" onClick={() => openWhatsApp(editing, 'confirmation')}>WhatsApp senden</button><button className="btn secondary" onClick={() => downloadBlob(`${editing.orderNo}.ics`, ['BEGIN:VCALENDAR', 'VERSION:2.0', ...orderToICS(editing), 'END:VCALENDAR'].join('\r\n'), 'text/calendar;charset=utf-8')}>Kalender</button><button className="btn danger-outline" onClick={() => deleteOrder(editing.id)}>Löschen</button></>}</div>
          </section>}
          <section className="panel">
            <div className="panel-title stacked-mobile"><div><span className="eyebrow">AUFTRÄGE</span><h2>Alle Kundenaufträge</h2></div><div className="search-tools"><input className="search" placeholder="Name, Nummer, Produkt suchen ..." value={search} onChange={(e) => setSearch(e.target.value)} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="open">Offene</option><option value="all">Alle</option>{STATUS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div></div>
            {filteredOrders.length ? <div className="order-list">{filteredOrders.map((order) => { const rest = Math.max(0, moneyNumber(order.priceTotal) - moneyNumber(order.deposit)); const overdue = (order.productionTo && dateDiff(order.productionTo) < 0) || (order.pickupDate && dateDiff(order.pickupDate) < 0); return <article className={`order-card ${overdue ? 'is-overdue' : ''}`} key={order.id}><div className="order-main"><div className="order-title"><div><span>{order.orderNo}</span><h3>{order.customerName}</h3></div><div className="badges"><Badge tone={`status-${order.status}`}>{STATUS_LABEL[order.status]}</Badge>{order.priority === 'high' && <Badge tone="danger">Dringend</Badge>}{overdue && <Badge tone="danger">Überfällig</Badge>}</div></div><p>{order.items.filter((i) => i.description).map((i) => `${i.qty}× ${i.description}`).join(' · ') || 'Keine Position eingetragen'}</p><div className="order-meta"><span>Produktion: <strong>{dateText(order.productionFrom)} – {dateText(order.productionTo)}</strong></span><span>{order.delivery}: <strong>{dateText(order.pickupDate)} {order.pickupFrom || ''}</strong></span><span>Preis: <strong>{fmt(order.priceTotal)}</strong></span>{rest > 0 && !order.paid && <span className="red">Offen: <strong>{fmt(rest)}</strong></span>}</div></div><div className="order-actions"><select value={order.status} onChange={(e) => setOrderStatus(order.id, e.target.value)}>{STATUS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><button className="btn whatsapp small" onClick={() => openWhatsApp(order, order.status === 'ready' ? 'ready' : 'confirmation')}>WhatsApp</button><button className="btn secondary small" onClick={() => editOrder(order)}>Öffnen</button></div></article> })}</div> : <Empty>Noch keine passenden Aufträge.</Empty>}
          </section>
        </>}

        {page === 'planner' && <>
          <section className="hero mini-hero"><div><span className="eyebrow">TERMIN-GEDÄCHTNIS</span><h1>Planer & Erinnerungen</h1><p>Produktionsstart, Fertigstellung, Abholung und offene Zahlungen werden automatisch aus deinen Aufträgen gezogen.</p></div></section>
          <section className="two-panel-grid planner-grid">
            <div className="panel"><div className="panel-title"><div><span className="eyebrow">AUTOMATISCH</span><h2>Nächste 7 Tage</h2></div><button className="btn secondary small" onClick={enableNotifications}>🔔 Aktivieren</button></div>{reminders.length ? <div className="reminder-list">{reminders.map((r) => <div className={`reminder-row ${r.diff < 0 ? 'overdue' : r.diff === 0 ? 'today' : ''}`} key={r.id}><div className="date-box"><strong>{r.diff < 0 ? `-${Math.abs(r.diff)} T` : r.diff === 0 ? 'HEUTE' : `+${r.diff} T`}</strong><small>{dateText(r.date)}</small></div><div className="grow"><strong>{r.title}</strong><small>{r.customerName ? `${r.customerName} · ${r.orderNo}` : (r.time ? `${r.time} Uhr` : 'Eigene Aufgabe')}</small></div>{r.type === 'task' ? <button className="btn small" onClick={() => setTasks((current) => current.map((t) => t.id === r.id ? { ...t, done: true } : t))}>✓</button> : <button className="btn small" onClick={() => editOrder(orders.find((o) => o.id === r.orderId))}>Öffnen</button>}</div>)}</div> : <Empty>Für die nächsten 7 Tage ist nichts offen.</Empty>}</div>
            <div className="panel"><div className="panel-title"><div><span className="eyebrow">EIGENE ERINNERUNG</span><h2>Nicht im Kopf behalten</h2></div></div><div className="task-form"><label><span>Was darfst du nicht vergessen?</span><input value={taskDraft.title} onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })} placeholder="z. B. Folie nachbestellen / Kunde anrufen" /></label><div className="form-grid cols-2"><label><span>Datum</span><input type="date" value={taskDraft.date} onChange={(e) => setTaskDraft({ ...taskDraft, date: e.target.value })} /></label><label><span>Uhrzeit</span><input type="time" value={taskDraft.time} onChange={(e) => setTaskDraft({ ...taskDraft, time: e.target.value })} /></label></div><label><span>Priorität</span><select value={taskDraft.priority} onChange={(e) => setTaskDraft({ ...taskDraft, priority: e.target.value })}><option value="normal">Normal</option><option value="high">Dringend</option></select></label><button className="btn primary" onClick={addTask}>Erinnerung speichern</button></div><div className="tip-box"><strong>📅 Sicherste Variante:</strong><p>Lade deinen HP67-Kalender als .ics herunter. Dann übernimmt dein Handy die Erinnerungen auch dann, wenn diese Web-App geschlossen ist.</p><button className="btn secondary" onClick={() => downloadBlob(`hoodplaka67-kalender-${todayISO()}.ics`, allOrdersICS(orders), 'text/calendar;charset=utf-8')}>Kalenderdatei herunterladen</button></div></div>
          </section>
          <section className="panel"><div className="panel-title"><div><span className="eyebrow">ERLEDIGT / OFFEN</span><h2>Eigene Aufgaben</h2></div></div>{tasks.length ? <div className="simple-list">{tasks.map((task) => <label className={task.done ? 'done' : ''} key={task.id}><input type="checkbox" checked={task.done} onChange={(e) => setTasks((current) => current.map((t) => t.id === task.id ? { ...t, done: e.target.checked } : t))} /><span><strong>{task.title}</strong><small>{dateText(task.date)} {task.time ? `· ${task.time} Uhr` : ''}</small></span><button onClick={(e) => { e.preventDefault(); setTasks((current) => current.filter((t) => t.id !== task.id)) }}>✕</button></label>)}</div> : <Empty>Keine eigenen Aufgaben gespeichert.</Empty>}</section>
        </>}

        {page === 'customers' && <section className="panel"><div className="panel-title stacked-mobile"><div><span className="eyebrow">KUNDENKARTEI</span><h2>Kunden & Historie</h2></div><input className="search" placeholder="Kunde suchen ..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>{customers.filter((c) => `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(search.toLowerCase())).length ? <div className="customer-grid">{customers.filter((c) => `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(search.toLowerCase())).map((customer) => { const history = orders.filter((o) => (phoneForWhatsApp(o.phone) && phoneForWhatsApp(o.phone) === phoneForWhatsApp(customer.phone)) || (!customer.phone && o.customerName.toLowerCase() === customer.name.toLowerCase())); const sum = history.reduce((s, o) => s + moneyNumber(o.priceTotal), 0); const open = history.filter((o) => o.status !== 'done').length; return <article className="customer-card" key={customer.id}><div className="avatar">{customer.name.slice(0, 2).toUpperCase()}</div><div className="grow"><h3>{customer.name}</h3><p>{customer.phone || 'Keine Nummer'}{customer.email ? ` · ${customer.email}` : ''}</p><div className="customer-stats"><span>{history.length} Aufträge</span><span>{fmt(sum)} Umsatz</span>{open > 0 && <span>{open} offen</span>}</div></div><div className="customer-actions">{customer.phone && <button className="btn whatsapp small" onClick={() => window.open(whatsappLink(customer.phone, `Hi ${customer.name}, hier ist HoodPlaka67 👋`), '_blank', 'noopener,noreferrer')}>WhatsApp</button>}<button className="btn secondary small" onClick={() => { const o = emptyOrder(orders); o.customerName = customer.name; o.phone = customer.phone; o.email = customer.email; setEditing(o); setPage('orders') }}>Neuer Auftrag</button></div></article> })}</div> : <Empty>Noch keine Kunden gespeichert. Kunden werden beim Speichern eines Auftrags automatisch angelegt.</Empty>}</section>}

        {page === 'whatsapp' && <section className="two-panel-grid whatsapp-layout"><div className="panel"><div className="panel-title"><div><span className="eyebrow">WHATSAPP CENTER</span><h2>Nachricht in 2 Klicks</h2></div></div>{orders.length ? <div className="message-form"><label><span>Auftrag / Kunde</span><select value={selectedMessageOrder?.id || ''} onChange={(e) => setSelectedOrderId(e.target.value)}>{orders.map((o) => <option key={o.id} value={o.id}>{o.orderNo} · {o.customerName}</option>)}</select></label><label><span>Vorlage</span><select value={messageType} onChange={(e) => setMessageType(e.target.value)}>{TEMPLATE_OPTIONS.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label><span>Vorschau</span><textarea rows="12" readOnly value={selectedMessageOrder ? buildMessage(selectedMessageOrder, messageType) : ''} /></label><div className="button-row"><button className="btn whatsapp" onClick={() => openWhatsApp(selectedMessageOrder, messageType)}>In WhatsApp öffnen</button><button className="btn secondary" onClick={() => copyMessage(selectedMessageOrder, messageType)}>Text kopieren</button></div>{selectedMessageOrder && !selectedMessageOrder.phone && <div className="notice danger-notice">Bei diesem Kunden fehlt die Telefonnummer.</div>}</div> : <Empty>Lege zuerst einen Auftrag an.</Empty>}</div><div className="panel"><div className="panel-title"><div><span className="eyebrow">VORLAGEN</span><h2>Was automatisch eingesetzt wird</h2></div></div><div className="template-list">{TEMPLATE_OPTIONS.map(([id, label]) => <button className={messageType === id ? 'active' : ''} onClick={() => setMessageType(id)} key={id}><strong>{label}</strong><small>Name, Auftragsnummer, Termin, Restbetrag und Tracking werden – wenn vorhanden – direkt eingesetzt.</small></button>)}</div><div className="tip-box"><strong>Wichtig bei WhatsApp:</strong><p>Diese Version öffnet WhatsApp mit einem vorausgefüllten Text. Vollautomatisches Senden ohne dein Antippen braucht die WhatsApp Business Platform und einen sicheren Server/API-Zugang.</p></div></div></section>}

        {page === 'calculator' && <>
          <section className="hero mini-hero"><div><span className="eyebrow">PREIS + AUFTRAG IN EINEM</span><h1>Kalkulator</h1><p>Aus der Kalkulation kannst du direkt einen neuen Auftrag anlegen.</p></div><Badge>Datenstand {new Date(PRICE_META.updated).toLocaleDateString('de-DE')}</Badge></section>
          <section className="calculator-grid"><div className="panel"><div className="segmented wide"><button className={calcCategory === 'stickers' ? 'active' : ''} onClick={() => setCalcCategory('stickers')}>Aufkleber</button><button className={calcCategory === 'textiles' ? 'active' : ''} onClick={() => { setCalcCategory('textiles'); setCalcProduct('shirt-bc-e190'); setCalcQty(1) }}>Textilien</button><button className={calcCategory === 'accessories' ? 'active' : ''} onClick={() => { setCalcCategory('accessories'); setCalcProduct('clock'); setCalcQty(1) }}>Accessoires</button></div>{calcCategory === 'stickers' ? <div className="form-grid cols-2"><label><span>Format</span><select value={calcFormat} onChange={(e) => setCalcFormat(e.target.value)}>{stickerFormats.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></label><label><span>Material</span><select value={calcMaterial} onChange={(e) => setCalcMaterial(e.target.value)}>{materialOptions.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}</select></label><label><span>Gewünschte Stückzahl</span><input type="number" min="1" value={calcQty} onChange={(e) => setCalcQty(e.target.value)} /></label><label><span>Aufschlag auf EK</span><input type="number" value={calcMarkup} onChange={(e) => setCalcMarkup(e.target.value)} /></label><label><span>Rabatt</span><input type="number" min="0" max="100" value={calcDiscount} onChange={(e) => setCalcDiscount(e.target.value)} /></label></div> : <div className="form-grid cols-2"><label><span>Produkt</span><select value={calcRetail?.id || ''} onChange={(e) => { setCalcProduct(e.target.value); setCalcVariant('') }}>{calcRetailPool.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label><label><span>Variante</span><select value={calcRetailVariant?.id || ''} onChange={(e) => setCalcVariant(e.target.value)}>{calcRetail?.variants.map((v) => <option key={v.id} value={v.id}>{v.label} · {fmt(v.price)}</option>)}</select></label><label><span>Menge</span><input type="number" min="1" value={calcQty} onChange={(e) => setCalcQty(e.target.value)} /></label><label><span>Zusatzrabatt</span><input type="number" min="0" max="100" value={calcDiscount} onChange={(e) => setCalcDiscount(e.target.value)} /></label></div>}</div><div className="panel calc-result"><span className="eyebrow">ERGEBNIS</span><h2>{calcCategory === 'stickers' ? `${calcSticker.label} · ${materialOptions.find((m) => m.id === calcMaterial)?.label}` : `${calcRetail?.label}`}</h2><div className="big-price">{fmt(calcVk)}</div><div className="result-lines"><span>Liefermenge <strong>{calcSupplied} Stk.</strong></span><span>{calcCategory === 'stickers' ? 'EK laut Preisliste' : 'Listenpreis'} <strong>{fmt(calcEk)}</strong></span><span>Stückpreis <strong>{fmt(calcSupplied ? calcVk / calcSupplied : 0)}</strong></span>{calcCategory === 'stickers' && <span>Pack-Kombi <strong>{calcPack.packs.join(' + ') || '—'}</strong></span>}</div><button className="btn primary full" onClick={addCalcToOrder}>Als neuen Auftrag übernehmen</button><small className="source-note">Quelle: {calcCategory === 'stickers' ? calcSticker.source : calcRetail?.source}</small></div></section>
        </>}

        {page === 'settings' && <section className="settings-grid-page"><div className="panel"><div className="panel-title"><div><span className="eyebrow">DATENSICHERUNG</span><h2>Backup & Wiederherstellung</h2></div></div><p>Alle Aufträge liegen aktuell lokal in deinem Browser. Exportiere regelmäßig eine Sicherung.</p><div className="button-row"><button className="btn primary" onClick={exportBackup}>Backup herunterladen</button><button className="btn secondary" onClick={() => importRef.current?.click()}>Backup importieren</button><input ref={importRef} type="file" accept="application/json" hidden onChange={(e) => importBackup(e.target.files?.[0])} /></div></div><div className="panel"><div className="panel-title"><div><span className="eyebrow">SHOPIFY</span><h2>Bestellungen importieren</h2></div></div><p>Exportiere deine Bestellungen in Shopify als CSV und lade sie hier ein. Kunden und Positionen werden als Aufträge übernommen.</p><button className="btn secondary" onClick={() => csvRef.current?.click()}>Shopify CSV importieren</button><input ref={csvRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => importShopifyCsv(e.target.files?.[0])} /></div><div className="panel"><div className="panel-title"><div><span className="eyebrow">KALENDER</span><h2>Erinnerungen aufs Handy</h2></div></div><p>Die .ics-Datei enthält Produktionsstart, Produktionsfrist und Abholung/Versand inklusive Erinnerungen.</p><button className="btn secondary" onClick={() => downloadBlob(`hoodplaka67-kalender-${todayISO()}.ics`, allOrdersICS(orders), 'text/calendar;charset=utf-8')}>Kalender exportieren</button></div><div className="panel"><div className="panel-title"><div><span className="eyebrow">APP</span><h2>Benachrichtigungen</h2></div></div><p>Bei geöffneter App kann dein Browser dich bei fälligen Punkten informieren. Für zuverlässige Hintergrund-Erinnerungen nutze zusätzlich den Kalenderexport.</p><button className="btn secondary" onClick={enableNotifications}>Benachrichtigungen aktivieren</button></div></section>}
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
