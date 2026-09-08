# better-sqlite3 wird nativ gebaut, deshalb slim statt alpine: dort fehlt die
# passende libc und der Build schlaegt fehl.
FROM node:20-slim

WORKDIR /app

# Erst die Manifeste kopieren: solange sie sich nicht aendern, bleibt die
# Installationsschicht im Cache.
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
# public/ enthaelt die Redaktionsoberflaeche unter /admin.
COPY public ./public

# Datenbank und Uploads liegen im Volume, nicht im Image.
ENV FF_DATA_DIR=/app/data
VOLUME ["/app/data"]

ENV PORT=4000
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||4000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
