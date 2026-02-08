#!/bin/bash
# Generate secure secrets for LibreChat
# Usage: ./scripts/generate-secrets.sh

echo "=== LibreChat Security Keys Generator ==="
echo ""
echo "Add these to your .env file:"
echo ""
echo "# JWT Secrets"
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -hex 32)"
echo ""
echo "# Credential Encryption Keys"
echo "CREDS_KEY=$(openssl rand -hex 32)"
echo "CREDS_IV=$(openssl rand -hex 16)"
echo ""
echo "# Meilisearch Master Key"
echo "MEILI_MASTER_KEY=$(openssl rand -base64 32)"
echo ""
echo "=== IMPORTANT ==="
echo "1. Copy these values to your .env file"
echo "2. Never commit .env to version control"
echo "3. Keep a secure backup of these keys"
echo "4. If you change JWT_SECRET, all existing sessions will be invalidated"
