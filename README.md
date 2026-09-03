# HP67 Preis- & Angebotskalkulator

Responsive Web-App für die interne Preis- und Angebotskalkulation von HoodPlaka67. Die App bündelt Sticker-Staffeln, Textilien und Accessoires aus den vorhandenen Projektunterlagen in einer zentralen, leicht erweiterbaren Datenstruktur.

## Funktionen

- Produkt- und Kategorieauswahl für Aufkleber, Textilien und Accessoires
- Kalkulation nach Anzahl der A4-Drucke; die Sticker-Ausbeute je Format wird automatisch ermittelt
- Optionale Sonderstückzahlen bis 10.000 Stück mit automatischer Suche nach der günstigsten lieferbaren Pack-Kombination
- Verständlich erklärte, einklappbare Aufpreise für Laminat und Extra-Schnitt
- EK-/VK-Kalkulation, Stückpreis, Gewinn und Marge
- Frei einstellbarer Aufschlag, Rabatt und Freundschaftspreis
- Zusätzliche Auftragskosten für Verpackung, Versand oder Einrichtungsaufwand
- Verkaufspreis-Rundung auf 0,50 € oder psychologische x,90-Preise
- Manuelle Überschreibung des Quellpreises für Sonderfälle
- Vergleich von bis zu acht Varianten mit lokaler Speicherung im Browser
- Kopierbare Angebotszusammenfassung
- Responsive, touchfreundliche Oberfläche im HoodPlaka67-Stil

## Preislogik

Die Stickerlisten werden als **EK-Basis** behandelt. Der Verkaufspreis entsteht aus EK plus Aufschlag und anschließendem Rabatt/Freundschaftsrabatt.

Die fotografierten Textil- und Zubehörlisten werden als **VK-Basis** behandelt. Da dort kein eindeutiger EK ausgewiesen ist, berechnet die App einen transparent als „Ziel-EK“ bezeichneten Wert rückwärts aus dem gewünschten Aufschlag. Der Quell-VK selbst bleibt dabei unverändert, bis ein Rabatt angewendet oder der Quellpreis manuell überschrieben wird.

Rabatte werden nacheinander angewendet:

```text
VK nach Rabatt = Listen-VK × (1 − Rabatt) × (1 − Freundschaftsrabatt)
```

## Enthaltene Quellen

- Quelle A: bestätigte Stickerpreise für A4, A5, A7, 9,5 × 9,5 cm, 6,5 × 6,5 cm, 20 × 5 cm, 7 × 5 cm und 10 × 3 cm sowie Veredelungsaufschläge
- Quelle B: T-Shirts, Hoodies, Windbreaker, Anglerhüte und Schlauchschals
- Quelle C: Schlauchschals, Capies, Balaclava, Wanduhr und Umhängetaschen

Nicht eindeutig lesbare oder widersprüchliche Zellen wurden nicht als eigenständige Preisoption übernommen. Vor einem verbindlichen Angebot sollten Quellpreise geprüft werden.

## Entwicklung

Voraussetzungen: Node.js 20 oder neuer.

```bash
npm install
npm run dev
```

Produktions-Build und Tests:

```bash
npm test
npm run build
```

## Preise erweitern

Alle Produkt- und Preisdefinitionen liegen in [`src/data/prices.js`](src/data/prices.js). Neue Stickerformate werden in `stickerFormats`, weitere Textilien oder Accessoires in `retailProducts` ergänzt. Die UI liest Kategorien, Varianten, Quellenart und Preisoptionen automatisch aus diesen Daten.

## Technik

React, Vite und Vitest. Es gibt kein Backend; Vergleiche werden ausschließlich lokal im Browser gespeichert.

## Rechtlicher Hinweis

Dieses Werkzeug ist für interne Kalkulationen gedacht. Es ersetzt keine steuerliche oder kaufmännische Beratung. Alle Preise und Margen sind vor einem verbindlichen Angebot zu prüfen.

Die App enthält keine Analyse- oder Werbetracker und lädt keine externen Schriftarten. Vergleichsdaten verbleiben ausschließlich im lokalen Browser-Speicher.

