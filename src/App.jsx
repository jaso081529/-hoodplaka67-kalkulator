import { useEffect, useMemo, useState } from 'react'
import { categoryOptions, finishSurcharges, materialOptions, PRICE_META, quantityDiscountTiers, retailProducts, stickerFormats } from './data/prices.js'
import { calculateQuote, getQuantityDiscount, optimizePacks } from './lib/calculator.js'

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })
const fmt = (value) => euro.format(Number(value) || 0)
const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`

function Field({ label, hint, children }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}

function NumberField({ label, value, onChange, suffix, min = 0, max, step = 1 }) {
  return (
    <Field label={label}>
      <div className="number-wrap">
        <input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} />
        {suffix && <span>{suffix}</span>}
      </div>
    </Field>
  )
}

function Metric({ label, value, tone, sub }) {
  return <div className={`metric ${tone || ''}`}><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div>
}

export default function App() {
  const [category, setCategory] = useState('stickers')
  const [formatId, setFormatId] = useState('a4')
  const [materialId, setMaterialId] = useState('glossy')
  const [quantity, setQuantity] = useState(5)
  const [quantityMode, setQuantityMode] = useState('prints')
  const [printCount, setPrintCount] = useState(5)
  const [retailProductId, setRetailProductId] = useState('shirt-bc-e190')
  const [retailVariantId, setRetailVariantId] = useState('rot-front')
  const [markup, setMarkup] = useState(100)
  const [discount, setDiscount] = useState(0)
  const [quantityDiscountEnabled, setQuantityDiscountEnabled] = useState(true)
  const [friendEnabled, setFriendEnabled] = useState(false)
  const [friendDiscount, setFriendDiscount] = useState(15)
  const [additionalCosts, setAdditionalCosts] = useState(0)
  const [rounding, setRounding] = useState('none')
  const [manualPrice, setManualPrice] = useState('')
  const [laminate, setLaminate] = useState(false)
  const [extraCut, setExtraCut] = useState(false)
  const [finishSize, setFinishSize] = useState('XL')
  const [comparison, setComparison] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hp67-comparison')) || [] } catch { return [] }
  })
  const [toast, setToast] = useState('')

  const stickerFormat = stickerFormats.find((item) => item.id === formatId) || stickerFormats[0]
  const retailPool = retailProducts.filter((item) => item.category === (category === 'textiles' ? 'Textilien' : 'Accessoires'))
  const retailProduct = retailPool.find((item) => item.id === retailProductId) || retailPool[0]
  const retailVariant = retailProduct?.variants.find((item) => item.id === retailVariantId) || retailProduct?.variants[0]
  const isSticker = category === 'stickers'

  useEffect(() => { localStorage.setItem('hp67-comparison', JSON.stringify(comparison)) }, [comparison])
  useEffect(() => {
    if (!isSticker && retailProduct) {
      setRetailProductId(retailProduct.id)
      setRetailVariantId(retailProduct.variants[0].id)
      setQuantity(1)
      setManualPrice('')
    }
  }, [category]) // eslint-disable-line react-hooks/exhaustive-deps

  const packTiers = useMemo(() => isSticker && quantityMode === 'prints'
    ? stickerFormat.tiers[materialId].map(([pieces, price]) => [pieces / stickerFormat.perPrint, price])
    : isSticker ? stickerFormat.tiers[materialId] : [], [isSticker, quantityMode, stickerFormat, materialId])
  const requestedPackAmount = quantityMode === 'prints' ? printCount : quantity
  const packResult = useMemo(() => isSticker ? optimizePacks(requestedPackAmount, packTiers) : null, [isSticker, requestedPackAmount, packTiers])
  const addons = isSticker
    ? (laminate ? finishSurcharges.laminate[finishSize] : 0) + (extraCut ? finishSurcharges.extraCut[finishSize] : 0)
    : 0
  const sourceKind = isSticker ? 'ek' : 'vk'
  const sourcePrice = manualPrice !== ''
    ? Math.max(0, Number(manualPrice) || 0)
    : isSticker ? packResult.price + addons : (retailVariant?.price || 0) * Math.max(1, Number(quantity) || 1)
  const calculatedQuantity = isSticker
    ? packResult.supplied * (quantityMode === 'prints' ? stickerFormat.perPrint : 1)
    : Math.max(1, Number(quantity) || 1)
  const requestedPieces = isSticker
    ? (quantityMode === 'prints' ? Number(printCount) * stickerFormat.perPrint : Number(quantity))
    : Number(quantity)
  const quantityDiscount = quantityDiscountEnabled ? getQuantityDiscount(calculatedQuantity, quantityDiscountTiers) : 0
  const nextQuantityTier = quantityDiscountTiers.find((tier) => tier.min > calculatedQuantity)
  const quote = calculateQuote({ sourceKind, sourceTotal: sourcePrice, quantity: calculatedQuantity, markup, quantityDiscount, discount, friendEnabled, friendDiscount, additionalCosts, rounding })

  const title = isSticker
    ? `Aufkleber · ${stickerFormat.label} · ${materialOptions.find((item) => item.id === materialId)?.label}`
    : `${retailProduct?.label} · ${retailVariant?.label}`
  const source = isSticker ? stickerFormat.source : retailProduct?.source

  function chooseFormat(nextId) {
    const next = stickerFormats.find((item) => item.id === nextId)
    setFormatId(nextId)
    setFinishSize(next.finishSize)
    setPrintCount(1)
    setQuantity(next.perPrint)
    setManualPrice('')
  }

  function chooseMaterial(nextId) {
    setMaterialId(nextId)
    setPrintCount(1)
    setQuantity(stickerFormat.perPrint)
    setManualPrice('')
  }

  function chooseRetailProduct(nextId) {
    const next = retailPool.find((item) => item.id === nextId)
    setRetailProductId(nextId)
    setRetailVariantId(next.variants[0].id)
    setManualPrice('')
  }

  function addComparison() {
    setComparison((current) => [{
      id: uid(), title, quantity: calculatedQuantity, requested: requestedPieces, sourceKind, source,
      settings: `${markup}% Aufschlag${quantityDiscount ? ` · ${quantityDiscount}% Mengenrabatt` : ''}${discount ? ` · ${discount}% Zusatzrabatt` : ''}${friendEnabled ? ` · ${friendDiscount}% Freundschaft` : ''}${additionalCosts ? ` · ${fmt(additionalCosts)} Nebenkosten` : ''}`,
      ...quote,
    }, ...current].slice(0, 8))
    setToast('Variante zum Vergleich hinzugefügt')
    window.setTimeout(() => setToast(''), 2400)
  }

  async function copyQuote() {
    const lines = [
      'HP67 KALKULATION', title, `Menge: ${calculatedQuantity}`, `EK / Ziel-EK: ${fmt(quote.ek)}`,
      `VK: ${fmt(quote.vk)}`, `Stückpreis: ${fmt(quote.unitPrice)}`, `Mengenrabatt: ${quantityDiscount}%`, `Gewinn: ${fmt(quote.profit)}`,
      `Marge: ${quote.margin.toFixed(1)} %`, `Quelle: ${source}`,
    ]
    await navigator.clipboard.writeText(lines.join('\n'))
    setToast('Kalkulation kopiert')
    window.setTimeout(() => setToast(''), 2400)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="HoodPlaka67 Kalkulator Startseite">
          <span className="brand-mark">HP<span>67</span></span>
          <span><strong>HoodPlaka67</strong><small>Preis- & Angebotskalkulator</small></span>
        </a>
        <div className="status-pill"><i /> Datenstand {new Date(PRICE_META.updated).toLocaleDateString('de-DE')}</div>
      </header>

      <main id="top">
        <section className="hero">
          <div><span className="eyebrow">KALKULIEREN. VERGLEICHEN. VERKAUFEN.</span><h1>Dein Preis.<br /><em>Sauber kalkuliert.</em></h1></div>
          <p>Staffelpreise, individuelle Aufschläge und Sonderkonditionen in einer klaren Angebotsrechnung.</p>
        </section>

        <nav className="category-tabs" aria-label="Produktkategorie">
          {categoryOptions.map((item) => <button key={item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}><span>{item.label}</span><small>{item.hint}</small></button>)}
        </nav>

        <div className="calculator-grid">
          <section className="panel builder-panel">
            <div className="panel-heading"><span>01</span><div><h2>Produkt konfigurieren</h2><p>Wähle Basis, Ausführung und Menge.</p></div></div>

            {isSticker ? (
              <div className="form-stack">
                <Field label="Format"><select value={formatId} onChange={(event) => chooseFormat(event.target.value)}>{stickerFormats.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
                <Field label="Material">
                  <div className="choice-grid">{materialOptions.map((item) => <button type="button" key={item.id} className={materialId === item.id ? 'choice active' : 'choice'} onClick={() => chooseMaterial(item.id)}><i className={`swatch ${item.id}`} />{item.label}</button>)}</div>
                </Field>
                <Field label="Kalkulation nach">
                  <div className="segmented">
                    <button type="button" className={quantityMode === 'prints' ? 'active' : ''} onClick={() => setQuantityMode('prints')}>Drucke / A4-Bögen</button>
                    <button type="button" className={quantityMode === 'pieces' ? 'active' : ''} onClick={() => setQuantityMode('pieces')}>Eigene Stückzahl</button>
                  </div>
                </Field>
                <div className="two-cols">
                  {quantityMode === 'prints'
                    ? <NumberField label="Anzahl Drucke" value={printCount} onChange={(value) => { setPrintCount(Math.min(10000, Math.max(1, Number(value) || 1))); setManualPrice('') }} min={1} max={10000} suffix="A4" />
                    : <NumberField label="Eigene Stückzahl" value={quantity} onChange={(value) => { setQuantity(Math.min(10000, Math.max(1, Number(value) || 1))); setManualPrice('') }} min={1} max={10000} suffix="Stk." />}
                  <div className="yield-card"><span>ERGEBNIS AUS DRUCK</span><strong>{calculatedQuantity} Sticker</strong><small>{quantityMode === 'prints' ? `${printCount} × A4 · ${stickerFormat.perPrint} pro Druck` : `${packResult.supplied} Stück lieferbar`}</small></div>
                </div>
                {calculatedQuantity !== requestedPieces && <div className="notice"><strong>Automatisch angepasst:</strong> Für {requestedPieces} gewünschte Sticker werden {calculatedQuantity} lieferbare Sticker kalkuliert.</div>}
                <div className="pack-line"><span>Druckplan</span><strong>{packResult.packs.map((pack) => `${pack.count}× ${quantityMode === 'prints' ? `${pack.quantity} Druck${pack.quantity === 1 ? '' : 'e'}` : `${pack.quantity} Stk.`}`).join(' + ')}</strong></div>
                <div className="pack-line source-packs"><span>Packgrößen laut Liste</span><strong>{stickerFormat.tiers[materialId].map(([pieces]) => pieces).join(' · ')} Stück</strong></div>
                <details className="extras">
                  <summary>Schutz & Schnitt <small>optional</small></summary>
                  <p><strong>Laminat</strong> ist eine zusätzliche Schutzschicht. <strong>Extra-Schnitt</strong> deckt zusätzlichen Schneideaufwand ab. Beides stammt als Aufpreis aus deiner Preisliste.</p>
                  <div className="extras-grid">
                    <Field label="Aufpreisgröße"><select value={finishSize} onChange={(event) => setFinishSize(event.target.value)}>{['S', 'M', 'L', 'XL'].map((size) => <option key={size}>{size}</option>)}</select></Field>
                    <div className="toggle-row"><button type="button" className={laminate ? 'mini-toggle on' : 'mini-toggle'} onClick={() => setLaminate(!laminate)} aria-pressed={laminate}>Laminat <small>+{fmt(finishSurcharges.laminate[finishSize])}</small></button><button type="button" className={extraCut ? 'mini-toggle on' : 'mini-toggle'} onClick={() => setExtraCut(!extraCut)} aria-pressed={extraCut}>Extra-Schnitt <small>+{fmt(finishSurcharges.extraCut[finishSize])}</small></button></div>
                  </div>
                </details>
              </div>
            ) : (
              <div className="form-stack">
                <Field label="Produkt"><select value={retailProduct?.id} onChange={(event) => chooseRetailProduct(event.target.value)}>{retailPool.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field>
                <Field label="Variante / Druck"><select value={retailVariant?.id} onChange={(event) => { setRetailVariantId(event.target.value); setManualPrice('') }}>{retailProduct?.variants.map((item) => <option key={item.id} value={item.id}>{item.label} · {fmt(item.price)}</option>)}</select></Field>
                <NumberField label="Menge" value={quantity} onChange={setQuantity} min={1} suffix="Stk." />
                <div className="notice"><strong>VK-Quelle:</strong> Der Ziel-EK wird aus dem Listen-VK und deinem Aufschlag rückwärts berechnet.</div>
              </div>
            )}

            <div className="divider" />
            <div className="panel-heading compact"><span>02</span><div><h2>Konditionen</h2><p>Deine Kalkulation, flexibel angepasst.</p></div></div>
            <div className="settings-grid">
              <NumberField label={isSticker ? 'Aufschlag' : 'Ziel-Aufschlag'} value={markup} onChange={setMarkup} min={-99} step={1} suffix="%" />
              <NumberField label="Zusatzrabatt" value={discount} onChange={setDiscount} min={0} max={100} step={1} suffix="%" />
              <Field label="Automatischer Mengenrabatt">
                <div className="bulk-control">
                  <button type="button" className={quantityDiscountEnabled ? 'switch on' : 'switch'} onClick={() => setQuantityDiscountEnabled(!quantityDiscountEnabled)} aria-pressed={quantityDiscountEnabled}><i /></button>
                  <div><strong>{quantityDiscount}% aktiv</strong><small>{quantityDiscountEnabled ? nextQuantityTier ? `Ab ${nextQuantityTier.min} Stück: ${nextQuantityTier.percent}%` : 'Höchste Rabattstufe erreicht' : 'Automatik ausgeschaltet'}</small></div>
                </div>
              </Field>
              <NumberField label="Nebenkosten je Auftrag" value={additionalCosts} onChange={setAdditionalCosts} min={0} step={0.5} suffix="€" />
              <Field label="Verkaufspreis runden"><select value={rounding} onChange={(event) => setRounding(event.target.value)}><option value="none">Nicht runden</option><option value="half">Auf nächste 0,50 €</option><option value="ninety">Auf nächsten x,90 €</option></select></Field>
              <Field label={`Quell-${isSticker ? 'EK' : 'VK'} überschreiben`} hint="Leer = Preis aus zentraler Preisliste"><div className="number-wrap"><input type="number" min="0" step="0.01" placeholder={fmt(sourcePrice)} value={manualPrice} onChange={(event) => setManualPrice(event.target.value)} /><span>€</span></div></Field>
              <Field label="Freundschaftspreis">
                <div className="friend-control"><button type="button" className={friendEnabled ? 'switch on' : 'switch'} onClick={() => setFriendEnabled(!friendEnabled)} aria-pressed={friendEnabled}><i /></button><div className="number-wrap compact-number"><input type="number" min="0" max="100" value={friendDiscount} onChange={(event) => setFriendDiscount(event.target.value)} disabled={!friendEnabled} /><span>%</span></div></div>
              </Field>
            </div>
          </section>

          <aside className="panel result-panel">
            <div className="result-top"><span className={`basis ${sourceKind}`}>{sourceKind === 'ek' ? 'EK-BASIS' : 'VK-BASIS'}</span><span className="live-dot">LIVE</span></div>
            <p className="result-kicker">AKTUELLE KALKULATION</p>
            <h2>{title}</h2>
            <div className="price-main"><span>Verkaufspreis</span><strong>{fmt(quote.vk)}</strong><small>{calculatedQuantity} Stück · {fmt(quote.unitPrice)} / Stück</small></div>
            <div className="metric-grid">
              <Metric label={isSticker ? 'Einkauf' : 'Ziel-EK'} value={fmt(quote.ek)} sub={sourceKind === 'vk' ? 'rückwärts kalkuliert' : 'Quellpreis + Extras'} />
              <Metric label="Gewinn" value={fmt(quote.profit)} tone={quote.profit < 0 ? 'negative' : 'positive'} sub={`${quote.margin.toFixed(1)} % Marge`} />
              <Metric label="Listen-VK" value={fmt(quote.listVk)} />
              <Metric label="Nachlass gesamt" value={`− ${fmt(quote.totalDiscount)}`} sub={quantityDiscount ? `${quantityDiscount}% Mengenrabatt enthalten` : 'kein Mengenrabatt'} />
            </div>
            <div className="source-box"><span>PREISQUELLE</span><strong>{source}</strong><small>{manualPrice !== '' ? 'Manuell überschrieben' : 'Originalwert verwendet'} · Stand {new Date(PRICE_META.updated).toLocaleDateString('de-DE')}</small></div>
            <div className="result-actions"><button className="primary" onClick={addComparison}>+ Zum Vergleich</button><button className="secondary" onClick={copyQuote}>Kopieren</button></div>
          </aside>
        </div>

        <section className="comparison-section">
          <div className="section-title"><div><span className="eyebrow">VARIANTEN</span><h2>Direktvergleich</h2><p>Bis zu acht Kalkulationen bleiben lokal in deinem Browser gespeichert.</p></div>{comparison.length > 0 && <button className="text-button" onClick={() => setComparison([])}>Liste leeren</button>}</div>
          {comparison.length === 0 ? <div className="empty-state"><span>↗</span><h3>Noch keine Varianten</h3><p>Konfiguration erstellen und „Zum Vergleich“ wählen.</p></div> : (
            <div className="comparison-table-wrap"><table><thead><tr><th>Variante</th><th>Menge</th><th>EK / Ziel-EK</th><th>VK</th><th>Stück</th><th>Gewinn</th><th>Marge</th><th /></tr></thead><tbody>{comparison.map((item) => <tr key={item.id}><td><strong>{item.title}</strong><small>{item.settings}</small></td><td>{item.quantity}</td><td>{fmt(item.ek)}</td><td><strong>{fmt(item.vk)}</strong></td><td>{fmt(item.unitPrice)}</td><td className={item.profit < 0 ? 'loss' : 'gain'}>{fmt(item.profit)}</td><td>{item.margin.toFixed(1)} %</td><td><button className="remove" onClick={() => setComparison((rows) => rows.filter((row) => row.id !== item.id))} aria-label="Variante entfernen">×</button></td></tr>)}</tbody></table></div>
          )}
        </section>
      </main>

      <footer><span className="brand-mark small">HP<span>67</span></span><p>Interner Kalkulator · Preise vor Verwendung prüfen</p><a href="https://www.hoodplaka67.store" target="_blank" rel="noreferrer">hoodplaka67.store ↗</a></footer>
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  )
}
