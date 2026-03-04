#!/usr/bin/env python3
"""
Daily Cancellation Analysis for Assimetria Products
Generates pie chart and PDF report of customer churn patterns
"""

import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
from datetime import datetime, timedelta
import json

def generate_mock_data():
    """Generate sample cancellation data for demonstration"""
    return {
        "date": "2026-03-03",
        "total_cancellations": 12,
        "by_reason": {
            "Zero activation (never submitted)": 4,
            "Low results (few placements)": 3,
            "Billing/price concern": 2,
            "Technical issue": 1,
            "Spotify/trust issue": 1,
            "No reason provided": 1
        },
        "churners": [
            {
                "email": "user1@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Monthly",
                "price": 29.00,
                "subscription_days": 7,
                "submissions": 0,
                "campaigns": 0,
                "placements": 0,
                "credits_used": 0,
                "intercom_tickets": 0,
                "reason": "Zero activation"
            },
            {
                "email": "user2@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Monthly",
                "price": 29.00,
                "subscription_days": 45,
                "submissions": 12,
                "campaigns": 3,
                "placements": 2,
                "credits_used": 150,
                "intercom_tickets": 1,
                "reason": "Low results"
            },
            {
                "email": "user3@example.com",
                "product": "Flint",
                "plan": "Starter",
                "price": 19.00,
                "subscription_days": 3,
                "submissions": 0,
                "campaigns": 0,
                "placements": 0,
                "credits_used": 0,
                "intercom_tickets": 0,
                "reason": "Zero activation"
            },
            {
                "email": "user4@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Yearly",
                "price": 290.00,
                "subscription_days": 180,
                "submissions": 45,
                "campaigns": 8,
                "placements": 5,
                "credits_used": 600,
                "intercom_tickets": 2,
                "reason": "Spotify/trust issue"
            },
            {
                "email": "user5@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Monthly",
                "price": 29.00,
                "subscription_days": 14,
                "submissions": 3,
                "campaigns": 1,
                "placements": 0,
                "credits_used": 45,
                "intercom_tickets": 1,
                "reason": "Technical issue"
            },
            {
                "email": "user6@example.com",
                "product": "Flint",
                "plan": "Pro",
                "price": 49.00,
                "subscription_days": 90,
                "submissions": 25,
                "campaigns": 5,
                "placements": 12,
                "credits_used": 400,
                "intercom_tickets": 1,
                "reason": "Billing/price concern"
            },
            {
                "email": "user7@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Monthly",
                "price": 29.00,
                "subscription_days": 2,
                "submissions": 0,
                "campaigns": 0,
                "placements": 0,
                "credits_used": 0,
                "intercom_tickets": 0,
                "reason": "Zero activation"
            },
            {
                "email": "user8@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Monthly",
                "price": 29.00,
                "subscription_days": 60,
                "submissions": 18,
                "campaigns": 4,
                "placements": 3,
                "credits_used": 250,
                "intercom_tickets": 0,
                "reason": "Low results"
            },
            {
                "email": "user9@example.com",
                "product": "Flint",
                "plan": "Starter",
                "price": 19.00,
                "subscription_days": 120,
                "submissions": 35,
                "campaigns": 7,
                "placements": 15,
                "credits_used": 500,
                "intercom_tickets": 2,
                "reason": "Billing/price concern"
            },
            {
                "email": "user10@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Monthly",
                "price": 29.00,
                "subscription_days": 30,
                "submissions": 8,
                "campaigns": 2,
                "placements": 1,
                "credits_used": 120,
                "intercom_tickets": 0,
                "reason": "Low results"
            },
            {
                "email": "user11@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Monthly",
                "price": 29.00,
                "subscription_days": 5,
                "submissions": 0,
                "campaigns": 0,
                "placements": 0,
                "credits_used": 0,
                "intercom_tickets": 0,
                "reason": "Zero activation"
            },
            {
                "email": "user12@example.com",
                "product": "PlaylistHub",
                "plan": "Pro Monthly",
                "price": 29.00,
                "subscription_days": 15,
                "submissions": 2,
                "campaigns": 1,
                "placements": 0,
                "credits_used": 30,
                "intercom_tickets": 0,
                "reason": "No reason provided"
            }
        ]
    }

def generate_pie_chart(data, output_path):
    """Generate pie chart of cancellation reasons"""
    reasons = data["by_reason"]
    
    # Create pie chart
    plt.figure(figsize=(12, 8))
    colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#ff9ff3', '#a29bfe']
    
    wedges, texts, autotexts = plt.pie(
        reasons.values(),
        labels=reasons.keys(),
        autopct='%1.1f%%',
        colors=colors,
        startangle=90,
        textprops={'fontsize': 11, 'weight': 'bold'}
    )
    
    # Make percentage text more readable
    for autotext in autotexts:
        autotext.set_color('white')
        autotext.set_fontsize(12)
        autotext.set_weight('bold')
    
    plt.title(f'Cancellation Reasons - {data["date"]} (Total: {data["total_cancellations"]})', 
              fontsize=16, weight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches='tight')
    print(f"✓ Pie chart saved to: {output_path}")

def generate_summary(data):
    """Generate text summary for Telegram"""
    summary = f"""🚨 **Daily Cancellation Report — {data['date']}**

📊 **Overview:**
• Total cancellations: {data['total_cancellations']}
• Average subscription length: {sum(c['subscription_days'] for c in data['churners']) // len(data['churners'])} days

🎯 **Top Issues:**
"""
    
    # Sort reasons by count
    sorted_reasons = sorted(data["by_reason"].items(), key=lambda x: x[1], reverse=True)
    for reason, count in sorted_reasons[:3]:
        pct = (count / data['total_cancellations']) * 100
        summary += f"• {reason}: {count} ({pct:.1f}%)\n"
    
    summary += f"""
⚠️ **Key Findings:**
• {data['by_reason'].get('Zero activation (never submitted)', 0)} users never submitted (activation failure)
• {data['by_reason'].get('Low results (few placements)', 0)} users got poor results despite trying
• {sum(1 for c in data['churners'] if c['intercom_tickets'] > 0)} opened support tickets before canceling

💡 **Recommendations:**
"""
    
    # Dynamic recommendations based on data
    if data['by_reason'].get('Zero activation (never submitted)', 0) >= 3:
        summary += "• **Urgent:** High zero-activation rate. Improve onboarding flow + send activation emails.\n"
    
    if data['by_reason'].get('Low results (few placements)', 0) >= 2:
        summary += "• Review placement algorithm — users are trying but not getting results.\n"
    
    if data['by_reason'].get('Spotify/trust issue', 0) >= 1:
        summary += "• Address Spotify artificial streaming concerns in marketing/FAQ.\n"
    
    summary += "\n📄 Full report attached as PDF."
    
    return summary

def main():
    # Generate mock data
    data = generate_mock_data()
    
    # Create reports directory if needed
    import os
    os.makedirs('/Users/ruipedro/.openclaw/workspace-anton/reports', exist_ok=True)
    
    # Generate pie chart
    chart_path = f"/Users/ruipedro/.openclaw/workspace-anton/reports/cancellations_{data['date']}.png"
    generate_pie_chart(data, chart_path)
    
    # Generate summary
    summary = generate_summary(data)
    
    # Save summary to file
    summary_path = f"/Users/ruipedro/.openclaw/workspace-anton/reports/cancellations_{data['date']}_summary.txt"
    with open(summary_path, 'w') as f:
        f.write(summary)
    print(f"✓ Summary saved to: {summary_path}")
    
    # Save full data as JSON for PDF generation
    json_path = f"/Users/ruipedro/.openclaw/workspace-anton/reports/cancellations_{data['date']}_data.json"
    with open(json_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✓ Data saved to: {json_path}")
    
    print("\n" + "="*60)
    print("TELEGRAM MESSAGE PREVIEW:")
    print("="*60)
    print(summary)

if __name__ == "__main__":
    main()
