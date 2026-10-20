#!/bin/bash

cd "$(dirname "$0")"

npx concurrently -n backend,frontend -c blue,green \
    "npm run dev --prefix backend" \
    "npm run dev --prefix frontend"