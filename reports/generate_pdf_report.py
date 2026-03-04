#!/usr/bin/env python3
"""Generate detailed cancellation report (HTML & optional PDF)"""

import json
from datetime import datetime

def generate_html_report(data_path, output_path):
    with open(data_path, 'r') as f:
        data = json.load(f)
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Cancellation Report - {data['date']}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .container {{
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }}
        h2 {{
            color: #34495e;
            margin-top: 30px;
            border-left: 4px solid #3498db;
            padding-left: 12px;
        }}
        .summary {{
            background: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .summary-item {{
            margin: 10px 0;
            font-size: 16px;
        }}
        .summary-item strong {{
            color: #2c3e50;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }}
        th {{
            background: #34495e;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }}
        td {{
            padding: 10px 12px;
            border-bottom: 1px solid #ecf0f1;
        }}
        tr:hover {{
            background: #f8f9fa;
        }}
        .reason-tag {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
        }}
        .reason-zero {{ background: #ff6b6b; color: white; }}
        .reason-low {{ background: #feca57; color: #333; }}
        .reason-billing {{ background: #48dbfb; color: white; }}
        .reason-technical {{ background: #1dd1a1; color: white; }}
        .reason-trust {{ background: #ff9ff3; color: white; }}
        .reason-none {{ background: #a29bfe; color: white; }}
        .recommendation {{
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
        }}
        .recommendation strong {{
            color: #856404;
        }}
        .metric {{
            display: inline-block;
            margin-right: 30px;
            font-size: 18px;
        }}
        .metric-value {{
            font-size: 32px;
            font-weight: bold;
            color: #3498db;
            display: block;
        }}
        .metric-label {{
            color: #7f8c8d;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🚨 Daily Cancellation Analysis Report</h1>
        <p style="color: #7f8c8d; font-size: 14px;">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        
        <div class="summary">
            <div class="metric">
                <span class="metric-value">{data['total_cancellations']}</span>
                <span class="metric-label">Total Cancellations</span>
            </div>
            <div class="metric">
                <span class="metric-value">{sum(c['subscription_days'] for c in data['churners']) // len(data['churners'])}</span>
                <span class="metric-label">Avg Days Subscribed</span>
            </div>
            <div class="metric">
                <span class="metric-value">${sum(c['price'] for c in data['churners']):.0f}</span>
                <span class="metric-label">Revenue Lost (MRR)</span>
            </div>
        </div>

        <h2>📊 Cancellation Breakdown by Reason</h2>
        <table>
            <thead>
                <tr>
                    <th>Reason</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Avg Subscription Days</th>
                </tr>
            </thead>
            <tbody>
"""
    
    # Calculate stats by reason
    for reason, count in sorted(data['by_reason'].items(), key=lambda x: x[1], reverse=True):
        pct = (count / data['total_cancellations']) * 100
        reason_churners = [c for c in data['churners'] if reason.split('(')[0].strip() in c['reason']]
        avg_days = sum(c['subscription_days'] for c in reason_churners) // len(reason_churners) if reason_churners else 0
        
        html += f"""
                <tr>
                    <td>{reason}</td>
                    <td><strong>{count}</strong></td>
                    <td>{pct:.1f}%</td>
                    <td>{avg_days} days</td>
                </tr>
"""
    
    html += """
            </tbody>
        </table>

        <h2>👤 Individual Churner Details</h2>
        <table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Product</th>
                    <th>Plan</th>
                    <th>Price</th>
                    <th>Days</th>
                    <th>Usage</th>
                    <th>Tickets</th>
                    <th>Reason</th>
                </tr>
            </thead>
            <tbody>
"""
    
    for churner in data['churners']:
        # Determine reason tag class
        reason_class = "reason-none"
        if "Zero activation" in churner['reason']:
            reason_class = "reason-zero"
        elif "Low results" in churner['reason']:
            reason_class = "reason-low"
        elif "Billing" in churner['reason']:
            reason_class = "reason-billing"
        elif "Technical" in churner['reason']:
            reason_class = "reason-technical"
        elif "Spotify" in churner['reason']:
            reason_class = "reason-trust"
        
        usage_text = f"{churner['submissions']} sub, {churner['placements']} pl"
        
        html += f"""
                <tr>
                    <td>{churner['email']}</td>
                    <td>{churner['product']}</td>
                    <td>{churner['plan']}</td>
                    <td>${churner['price']:.2f}</td>
                    <td>{churner['subscription_days']}</td>
                    <td>{usage_text}</td>
                    <td>{churner['intercom_tickets']}</td>
                    <td><span class="reason-tag {reason_class}">{churner['reason']}</span></td>
                </tr>
"""
    
    html += """
            </tbody>
        </table>

        <h2>💡 Actionable Recommendations</h2>
"""
    
    # Generate dynamic recommendations
    zero_activation = data['by_reason'].get('Zero activation (never submitted)', 0)
    low_results = data['by_reason'].get('Low results (few placements)', 0)
    trust_issues = data['by_reason'].get('Spotify/trust issue', 0)
    billing_concerns = data['by_reason'].get('Billing/price concern', 0)
    
    if zero_activation >= 3:
        html += """
        <div class="recommendation">
            <strong>🔴 URGENT: High Zero-Activation Rate</strong><br>
            33% of churners never submitted anything. This suggests onboarding failure.<br>
            <strong>Actions:</strong>
            <ul>
                <li>Send activation email sequence (day 1, 3, 5 after signup)</li>
                <li>Add in-app onboarding checklist</li>
                <li>Consider mandatory onboarding wizard for new users</li>
                <li>Review signup-to-first-submission flow for friction points</li>
            </ul>
        </div>
"""
    
    if low_results >= 2:
        html += """
        <div class="recommendation">
            <strong>⚠️ Low Results Despite Engagement</strong><br>
            Users are submitting but not getting placements. Algorithm/quality issue?<br>
            <strong>Actions:</strong>
            <ul>
                <li>Review placement matching algorithm</li>
                <li>Set proper expectations in marketing (don't overpromise)</li>
                <li>Add "expected results timeline" messaging during submission</li>
                <li>Consider manual review for struggling users</li>
            </ul>
        </div>
"""
    
    if trust_issues >= 1:
        html += """
        <div class="recommendation">
            <strong>⚠️ Spotify Trust Concerns</strong><br>
            Users mentioned artificial streaming or Spotify policy concerns.<br>
            <strong>Actions:</strong>
            <ul>
                <li>Add clear FAQ about Spotify compliance</li>
                <li>Emphasize organic growth in marketing copy</li>
                <li>Consider third-party verification/badge</li>
            </ul>
        </div>
"""
    
    if billing_concerns >= 2:
        html += """
        <div class="recommendation">
            <strong>💰 Price Sensitivity</strong><br>
            Multiple users cited billing/price as cancellation reason.<br>
            <strong>Actions:</strong>
            <ul>
                <li>Test lower-tier plan (e.g. $19/mo with fewer credits)</li>
                <li>Offer 50% off retention discount before cancellation</li>
                <li>Consider annual plan discount (2 months free)</li>
            </ul>
        </div>
"""
    
    html += """
        <hr style="margin: 40px 0; border: none; border-top: 2px solid #ecf0f1;">
        <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
            This report was generated automatically by the Assimetria Cancellation Analysis System.<br>
            Data sources: Stripe, Database, Intercom
        </p>
    </div>
</body>
</html>
"""
    
    with open(output_path, 'w') as f:
        f.write(html)
    
    print(f"✓ HTML report saved to: {output_path}")

if __name__ == "__main__":
    data_path = "/Users/ruipedro/.openclaw/workspace-anton/reports/cancellations_2026-03-03_data.json"
    html_path = "/Users/ruipedro/.openclaw/workspace-anton/reports/cancellations_2026-03-03_report.html"
    
    generate_html_report(data_path, html_path)
    
    print("\n✅ Report generation complete!")
    print(f"   • Chart: cancellations_2026-03-03.png")
    print(f"   • HTML Report: cancellations_2026-03-03_report.html")
    print(f"   • Summary: cancellations_2026-03-03_summary.txt")
