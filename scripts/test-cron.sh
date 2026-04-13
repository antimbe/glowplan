#!/bin/bash

# Script pour tester manuellement le cron job de rappels
# Usage: bash scripts/test-cron.sh

set -e

if [ -z "$CRON_SECRET" ]; then
  echo "⚠️  CRON_SECRET non défini, test en mode développement"
  echo ""
  echo "📋 Test debug (affiche les RDV à rappeler):"
  echo "curl http://localhost:3000/api/cron/reminders/debug"
  echo ""
  echo "🚀 Exécuter le cron (mode dev - sans auth requise):"
  echo "curl http://localhost:3000/api/cron/reminders"
  echo ""
  echo "🚀 Avec authentification (production):"
  echo "curl -X POST http://localhost:3000/api/cron/reminders \\"
  echo "  -H 'Authorization: Bearer YOUR_CRON_SECRET'"
  exit 0
fi

echo "🔐 CRON_SECRET trouvé, utilisation avec authentification"
echo ""

echo "📋 1. Debug: vérification des RDV à rappeler..."
curl http://localhost:3000/api/cron/reminders/debug | jq '.'
echo ""

echo "🚀 2. Exécution du cron job..."
curl -X POST http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" | jq '.'
