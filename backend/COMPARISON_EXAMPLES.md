# Test och Exempel för Jämförelsefunktionen

## Förutsättningar

1. Backend-servern måste köras: `./mvnw spring-boot:run`
2. Du måste vara inloggad
3. Du måste ha skapat minst en fastighet

OBS! : Kommun och propertyType kan ännu inte väljas via frontend än, måste göras direkt via databasen.

## Steg-för-steg guide

### Steg 1: Skapa testfastigheter

Skapa flera fastigheter av samma typ för att få en jämförelsegrupp:

```bash
# Fastighet 1 - Din fastighet
curl -X POST http://localhost:8081/api/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Storgatan 123, Helsingborg",
    "numberOfApartments": 25,
    "lockTypeId": 1,
    "propertyType": "FLERBOSTADSHUS",
    "accessPathLength": 10.5
  }'

# Fastighet 2 - Liknande fastighet
curl -X POST http://localhost:8081/api/properties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Drottninggatan 45, Helsingborg",
    "numberOfApartments": 22,
    "lockTypeId": 1,
    "propertyType": "FLERBOSTADSHUS",
    "accessPathLength": 8.0
  }'

### Steg 2: Hämta jämförelsedata

```bash
# Ersätt {propertyId} med ID från den första fastigheten
curl http://localhost:8081/api/properties/1/comparison \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Tolkning av resultatet

### Kostnadsjämförelse
- **propertyCost**: Din fastighets totala årskostnad inkl. moms: 14 266 kr
- **averageCost**: Genomsnittskostnad för liknande fastigheter: 13 851 kr
- **percentageDifference**: Du betalar 3% mer än genomsnittet
- **comparisonGroupSize**: 2 liknande fastigheter hittades

### Kärlstorleksjämförelse
- **propertyTotalVolume**: Din fastighe har 370L totalt
- **averageVolume**: Genomsnittet är också 370L
- **comparison**: "lika stora" - dina kärl är lagom stora

### Avfallsmängdjämförelse
För **Restavfall**:
- Din fastighet genererar 8 400 kg/år
- Genomsnittet är 7 920 kg/år
- Du genererar 6% mer restavfall än liknande fastigheter

### Hämtningsfrekvensjämförelse
- Din fastighet har 52 tömningar/år (1 gång/vecka)
- Detta är standard för flerbostadshus
- 0% skillnad mot genomsnittet

## Felsökning

### Problem: "Property type is required for comparison"
**Lösning**: Se till att fastigheten har ett propertyType satt. Uppdatera befintliga fastigheter i databasen.

### Problem: "Municipality is required for comparison"
**Lösning**: Se till att fastigheten är kopplad till en kommun. Detta krävs för korrekt jämförelse.

### Problem: comparisonGroupSize är 0
**Förklaring**: Inga liknande fastigheter hittades. Detta kan bero på:
- Ingen annan fastighet av samma typ
- Inga fastigheter med liknande antal lägenheter (±5)
- Ingen fastighet i samma kommun

### Problem: "Unauthorized" eller 401-fel
**Lösning**: Du måste vara inloggad. Logga in först och använd den returnerade JWT-token:

## Mock-data information

Eftersom ingen extern datakälla används genereras mock-data baserat på:

1. **Kostnader** - Helsingborgs avfallstaxa 2025
2. **Avfallsmängder** - Realistiska intervall med slumpmässig variation
3. **Kärlstorlekar** - Standardstorlekar för respektive fastighetstyp
4. **Hämtningsfrekvens** - Enligt taxan för varje fastighetstyp

Mock-datan har en slumpmässig variation på ±10% för att simulera verkliga skillnader mellan fastigheter.


