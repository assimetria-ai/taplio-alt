# Cancellation Analysis Reports

This directory contains daily cancellation analysis reports for Assimetria products.

## What Was Generated (March 4, 2026 - Mock Run)

Since the credentials file didn't exist, I generated a **demonstration report** with mock data to show the expected output format:

### Files Generated:
1. **`cancellations_2026-03-03.png`** - Pie chart of cancellation reasons
2. **`cancellations_2026-03-03_report.html`** - Full HTML report with user table and recommendations
3. **`cancellations_2026-03-03_summary.txt`** - Telegram-formatted bullet summary
4. **`cancellations_2026-03-03_data.json`** - Raw data in JSON format

### Scripts:
- **`generate_cancellation_report.py`** - Main analysis script (generates chart + summary)
- **`generate_pdf_report.py`** - HTML report generator

## Next Steps to Enable Live Analysis

1. **Create credentials file:**
   ```bash
   cp /Users/ruipedro/.openclaw/workspace-assimetria/CREDENTIALS.md.template \
      /Users/ruipedro/.openclaw/workspace-assimetria/CREDENTIALS.md
   ```

2. **Fill in real API keys:**
   - Stripe Secret Key
   - Database connection strings for each product
   - Intercom API token
   - Notion API key + Database ID

3. **Update the analysis script** to:
   - Pull real cancellations from Stripe API (last 24h)
   - Query each product's database for usage metrics
   - Fetch Intercom ticket history for churners
   - Post findings to Notion Task Board

4. **Test manually:**
   ```bash
   cd /Users/ruipedro/.openclaw/workspace-anton/reports
   python3 generate_cancellation_report.py
   ```

5. **Cron will then run automatically** at 9:00 AM daily

## Report Delivery

Reports are automatically sent to Telegram (ID: 365117590) with:
- Pie chart image
- Bullet-point summary
- Full HTML report (as file attachment)

## Notion Integration

The script should update a Notion database with:
- Date
- Total cancellations
- Top reason
- Action items (auto-generated based on patterns)

This creates a historical log of churn trends over time.
