# Backend der FF Hausmannstätten

Eigenes Backend als Ersatz für die WordPress-Installation auf bplaced.

**Node.js + Express + SQLite.** Keine Datenbank zum Aufsetzen, keine Migration,
kein WordPress: die gesamte Datenhaltung liegt in einer Datei unter `data/`.

## Warum WordPress-Format?

Das Frontend spricht bereits die WordPress-REST-API (`title.rendered`,
`content.rendered`, `_embedded["wp:featuredmedia"]`). Dieses Backend liefert
exakt dieselbe Form. Umgestellt wird deshalb nur eine Variable:

```
REACT_APP_API_BASE=http://localhost:4000/wp-json/wp/v2
```

Am Frontend-Code ändert sich keine Zeile. Neue Clients können stattdessen den
kürzeren Pfad `/api/v1` verwenden — dieselben Daten, dieselben Antworten.

## Schnellstart

```bash
cd server
npm install
npm run seed        # Kategorien + 8 Beispieleinsätze anlegen
npm start           # http://localhost:4000
```

Im Projektverzeichnis darüber liegt bereits `.env.local` mit der passenden
`REACT_APP_API_BASE`. Danach im Hauptverzeichnis wie gewohnt `npm start`.

Kontrolle: <http://localhost:4000/health>
Redaktion: <http://localhost:4000/admin>

## Redaktionsoberfläche

Unter `/admin` liegt eine Oberfläche, mit der sich alles pflegen lässt, ohne
curl und ohne WordPress. Sie wird direkt vom Backend ausgeliefert – kein
zweiter Buildschritt, und der öffentliche React-Bundle bleibt frei von
Redaktionscode.

**Anmeldung:** mit dem Schlüssel für Schreibzugriffe. Er steht beim Start in der
Konsole und in `server/data/api-key.txt`. Beim ersten Start wird er erzeugt,
mit `FF_API_KEY` lässt er sich vorgeben.

| Reiter | Damit lässt sich pflegen |
| --- | --- |
| **Einsätze** | Titel, Kurzfassung, Datum, Einsatzart, Fahrzeuge, Organisationen, Bericht, Titelbild, Fotos, Entwurf/Veröffentlicht |
| **Kategorien** | Einsatz- und Tätigkeitsarten (inkl. „Art“), Fahrzeuge (Kurz-/Langname), weitere Organisationen |
| **Medien** | Bilder hochladen (auch per Drag & Drop), URL kopieren, löschen |
| **Kennzahlen** | Mitglieder, Fahrzeuge, Gründungsjahr; die Einsatzzahl des Jahres wird berechnet und nur angezeigt |

Der Bericht wird in Absätzen geschrieben, eine Leerzeile trennt sie – das HTML
für das Frontend entsteht daraus automatisch. Enthält ein Beitrag Markup, das
sich so nicht abbilden lässt (etwa Überschriften oder Listen aus dem
WordPress-Import), schaltet die Oberfläche von selbst in den HTML-Modus, statt
den Rest beim Speichern zu verlieren.

`FF_ADMIN=off` blendet die Oberfläche aus, etwa auf einer Instanz, die nur
ausliefern soll.

## Bestehende Inhalte übernehmen

Holt Kategorien, Beiträge und Bilder aus der alten WordPress-Instanz. Die IDs
bleiben erhalten, damit bestehende Links weiter funktionieren. Bilder werden
heruntergeladen, damit die Seite auch nach dem Abschalten von bplaced läuft.

```bash
npm run import:wp -- --reset
npm run import:wp -- --source http://ff-hausmann.bplaced.net/index.php/wp-json/wp/v2 --reset
npm run import:wp -- --no-images        # Bilder nur verlinken statt kopieren
```

## Datenmodell

Die Kategoriestruktur ist nicht frei wählbar — das Frontend leitet daraus die
Einsatzdetails ab (siehe `src/common/bl/FilterFunctions.ts`):

| Elternkategorie | Unterkategorien sind … | Wird im Frontend zu |
| --- | --- | --- |
| `einsatze` | Einsatz- und Tätigkeitsarten (Brandeinsatz, Übung …) | `IOperation.type` |
| `fahrzeuge` | Fahrzeuge (`name` = Kurzname, `description` = Langname) | `IOperation.vehicles` |
| `einsatzmittel` | weitere Organisationen (Rotes Kreuz, Polizei …) | `IOperation.organisations` |

### Einsatz oder Tätigkeit?

Unterkategorien von `einsatze` tragen zusätzlich ein `kind`:

| Wert | Bedeutung | Beispiele |
| --- | --- | --- |
| `einsatz` (Standard) | echter Einsatz | Brandeinsatz, Technischer Einsatz |
| `taetigkeit` | sonstiger Dienst | Übung, Ortsfest, Friedenslicht |

Ausgeliefert wird es als `meta.kind` (WordPress hat dort ein leeres Array —
ältere Clients ignorieren das Feld einfach). Die Website kennzeichnet beides
unterschiedlich und lässt danach filtern; die Jahreszahl auf der Startseite
zählt ausschließlich `einsatz`. Gepflegt wird das Feld im Adminbereich unter
*Kategorien*.

Nur direkte Kinder von `einsatze` gelten als Art. Fahrzeuge und Einsatzmittel
haben zwar denselben Standardwert in der Spalte, zählen aber nie mit.

Jeder Einsatz hängt zusätzlich direkt in `einsatze` — danach fragt die
Startseite. Der Beitragstext wird als HTML gespeichert: `<p>` wird zu Absätzen,
`<img>` zur Fotogalerie.

## Endpunkte

Lesen ist offen, Schreiben verlangt den Header `X-API-Key`.

| Methode | Pfad | Zweck |
| --- | --- | --- |
| GET | `/categories?per_page=100` | alle Kategorien |
| GET | `/posts?categories=<id>&per_page=100&_embed=1` | Einsätze inkl. Titelbild |
| GET | `/posts/<id>` | einzelner Einsatz |
| GET | `/media/<id>` | Bilddatensatz |
| POST/PATCH/DELETE | `/posts`, `/categories`, `/media` | Pflege (API-Key) |
| GET | `/members` | Mannschaft (`?include_inactive=1` auch ausgetretene) |
| POST/PATCH/DELETE | `/members`, `/members/<id>` | Mannschaft pflegen (API-Key) |
| GET | `/vehicles` | Fuhrpark |
| GET | `/vehicles/<id\|slug>` | einzelnes Fahrzeug, z. B. `/vehicles/tlfa` |
| POST/PATCH/DELETE | `/vehicles`, `/vehicles/<id>` | Fuhrpark pflegen (API-Key) |
| GET | `/media-folders` | Ordner der Mediathek mit Anzahl |
| PATCH | `/media-folders` | Ordner umbenennen/zusammenlegen (API-Key) |
| PATCH | `/media/<id>` | Bild umbenennen oder verschieben (API-Key) |
| GET | `/settings` | Kennzahlen der Startseite (Einsatzzahl berechnet) |
| PATCH | `/settings` | Kennzahlen ändern (API-Key) |
| GET | `/session` | prüft den Schlüssel, von der Redaktion genutzt (API-Key) |
| GET | `/health` | Status und Datensatzzahlen |

Paginierung über `X-WP-Total` und `X-WP-TotalPages`, zusätzlich unterstützt
`/posts` die Parameter `page`, `search`, `order` und `status`.

### Einsatz anlegen

```bash
curl -X POST http://localhost:4000/wp-json/wp/v2/posts \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $FF_API_KEY" \
  -d '{
        "title": "Verkehrsunfall B73",
        "excerpt": "Kurzfassung für die Übersicht",
        "content": "<p>Was passiert ist.</p>",
        "date": "2026-09-08T18:42:00",
        "categories": [1, 5, 10],
        "featured_media": 3
      }'
```

Datumsangaben ohne Zeitzone werden als Ortszeit gespeichert und unverändert
zurückgegeben — genau wie in WordPress.

### Bild hochladen

```bash
curl -X POST http://localhost:4000/wp-json/wp/v2/media \
  -H "Content-Type: image/jpeg" \
  -H "X-Filename: einsatz-b73.jpg" \
  -H "X-API-Key: $FF_API_KEY" \
  --data-binary @einsatz-b73.jpg
```

Die Datei landet in `data/uploads/` und wird unter `/uploads/...` ausgeliefert.
Alternativ ein externes Bild nur verlinken:
`{"source_url": "https://…/bild.jpg"}` als JSON.

### Mannschaft

```bash
curl http://localhost:4000/api/v1/members
```

Jeder Eintrag hat `name`, `rank` (Dienstgrad), `function` (Funktion), `team`
(Bereich) und `sort_order`. Der Bereich ist freier Text — die Wehr kann
Gruppen anlegen, ohne dass am Schema etwas geändert wird. `sort_order`
bestimmt sowohl die Reihenfolge innerhalb eines Bereichs als auch die
Reihenfolge der Bereiche selbst (es zählt der erste Eintrag).

`active: false` blendet jemanden auf der Website aus, ohne den Datensatz zu
löschen; die Redaktion sieht solche Einträge über `?include_inactive=1`.
Gepflegt wird alles im Adminbereich unter *Mannschaft*.

### Fuhrpark

```bash
curl http://localhost:4000/api/v1/vehicles/tlfa
```

```json
{
  "slug": "tlfa",
  "short": "TLFA",
  "name": "Tanklöschfahrzeug mit Allradantrieb",
  "call_sign": "Tank Hausmannstätten",
  "description": "…",
  "specs":  [{ "label": "Löschwasser", "value": "3.000 l" }],
  "tasks":  ["Brandbekämpfung im Innen- und Außenangriff"],
  "photos": [{ "url": "http://…/uploads/tlfa_closed.webp", "caption": "…" }],
  "category_id": 9
}
```

Das speist die Fahrzeugübersicht **und** die Detailseite unter
`/fahrzeuge/<slug>`. `specs`, `tasks` und `photos` liegen als JSON, weil sie
reine Anzeigelisten sind; im Adminbereich werden sie zeilenweise eingegeben
(`Bezeichnung: Wert` bzw. `URL | Bildunterschrift`).

**`category_id` nicht mit dem Fuhrpark verwechseln.** Unter *Kategorien →
Fahrzeuge* stehen die Schlagworte, mit denen ein Einsatz vermerkt, welche
Fahrzeuge ausgerückt sind. Unter *Fuhrpark* stehen die Fahrzeugseiten.
`category_id` verbindet beides, damit dasselbe Fahrzeug gemeint ist.

Liefert das Backend keine Fahrzeuge oder keine Mannschaft (alte
WordPress-Instanz, Netzwerkfehler, noch nichts eingetragen), greift die
Website auf die mitgelieferten Listen in `src/data/` zurück und bleibt
dadurch nie leer.

### Ordner in der Mediathek

Jedes Bild hat ein Feld `folder` – ein einfacher Text, keine Ordnertabelle
und keine Verschachtelung. Leer heißt „noch nicht einsortiert“.

```bash
curl "http://localhost:4000/api/v1/media?folder=Fahrzeuge&per_page=100"
curl http://localhost:4000/api/v1/media-folders
```

Beim Hochladen bestimmt der Header `X-Folder` das Ziel (prozentkodiert, weil
Header nur Latin-1 tragen). Die Uploadknöpfe direkt am Beitrag, am Fahrzeug
und am Mitglied setzen ihn selbst — Einsatzfotos landen in `Einsätze`,
Fahrzeugfotos in `Fahrzeuge`, Portraits in `Mannschaft`. Ein Ordner entsteht,
sobald das erste Bild darin liegt, und verschwindet mit dem letzten.

### Seiten ein- und ausblenden

`pages.membersVisible` (`"1"`/`"0"`) steuert, ob die Seite „Mannschaft“
öffentlich erreichbar ist. Steht sie auf `"0"`, entfällt auch der Menüpunkt –
sonst führte er auf eine 404-Seite. Einzelne Personen blendet stattdessen
`active: false` am Mitglied aus.

### Kennzahlen der Startseite

```bash
curl http://localhost:4000/api/v1/settings
```

```json
{
  "stats.members": "104",
  "stats.vehicles": "5",
  "stats.foundedYear": "1889",
  "stats.year": "2026",
  "stats.operationsThisYear": "4"
}
```

`stats.members`, `stats.vehicles` und `stats.foundedYear` pflegt die Redaktion
im Adminbereich unter *Kennzahlen*:

```bash
curl -X PATCH http://localhost:4000/api/v1/settings   -H "Content-Type: application/json" -H "X-API-Key: $FF_API_KEY"   -d '{"stats.members": "106"}'
```

`stats.year` und `stats.operationsThisYear` werden berechnet und lassen sich
**nicht** setzen (PATCH darauf ergibt 400). Die Einsatzzahl ergibt sich aus den
veröffentlichten Beiträgen des laufenden Jahres, deren Art `kind = einsatz`
trägt — sie kann also nicht veralten und nicht von der Wirklichkeit abweichen.

## Konfiguration

`server/.env.example` kopieren nach `server/.env` (oder Variablen direkt setzen):

| Variable | Bedeutung |
| --- | --- |
| `PORT` | Port der API, Standard 4000 |
| `FF_API_KEY` | Schlüssel für Schreibzugriffe. Nicht gesetzt = beim ersten Start erzeugt und in `data/api-key.txt` abgelegt. `off` = API ist nur lesbar |
| `FF_ADMIN` | `off` blendet die Redaktionsoberfläche aus |
| `FF_CORS_ORIGIN` | erlaubte Herkunft, Standard `*` |
| `FF_PUBLIC_URL` | öffentliche Basis-URL hinter einem Reverse Proxy (sonst zeigen Bild-URLs ins Leere) |
| `FF_DATA_DIR` | Ablageort für Datenbank und Uploads |

## Tests

```bash
npm test
```

Der Vertragstest prüft nicht irgendein JSON, sondern genau die Felder, die
`src/common/API/BASER_API.tsx` ausliest, und die Kategoriestruktur, die
`FilterFunctions.ts` voraussetzt. Bricht einer dieser Punkte, bliebe die
Startseite leer — der Test schlägt vorher fehl.

Dazu kommen zwei weitere Ebenen:

* `test/content.test.js` prüft die Umwandlung zwischen Absatzeditor und
  gespeichertem HTML — vor allem, dass Beiträge mit fremdem Markup als
  „nicht einfach“ erkannt werden und deshalb nicht beschädigt werden können.
* `test/admin.test.js` bedient die Redaktionsoberfläche in einem echten DOM
  (jsdom) gegen einen laufenden Server: anmelden, Einsatz anlegen, ändern,
  Kategorie mit Art anlegen, Kennzahlen speichern, löschen. Ein Tippfehler,
  der die Seite beim Laden abstürzen lässt, fällt damit auf.

## Betrieb

Die Anwendung ist zustandslos bis auf `data/`. Ein Backup ist eine Kopie dieses
Ordners (Server dafür kurz stoppen oder `sqlite3 … ".backup"` verwenden).

```bash
FF_API_KEY=$(openssl rand -hex 24) PORT=4000 npm start
```

Hinter nginx/Apache als Reverse Proxy auf Port 4000, mit gesetztem
`FF_PUBLIC_URL`. Für dauerhaften Betrieb systemd, pm2 oder Docker verwenden:

```bash
docker build -t ff-api server/
docker run -d -p 4000:4000 -v ff-data:/app/data -e FF_API_KEY=… ff-api
```
