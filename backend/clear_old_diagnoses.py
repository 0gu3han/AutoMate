#!/usr/bin/env python3
"""
Clear old mock diagnoses from the database
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'automate.settings')
django.setup()

def clear_old_diagnoses():
    """Clear all old diagnoses from the database"""
    
    from ai_assistant.models import DiagnosisRequest
    
    print("🗑️ **Clearing old diagnoses from database...**")
    
    # Count existing diagnoses
    old_count = DiagnosisRequest.objects.count()
    print(f"📊 Found {old_count} existing diagnoses")
    
    if old_count > 0:
        # Delete all diagnoses
        DiagnosisRequest.objects.all().delete()
        print(f"✅ Deleted {old_count} old diagnoses")
        print("🎉 Database cleared! Only new Google Vision results will show.")
    else:
        print("✅ No old diagnoses found - database is already clean!")
    
    # Verify deletion
    new_count = DiagnosisRequest.objects.count()
    print(f"📊 Current diagnoses in database: {new_count}")

if __name__ == "__main__":
    clear_old_diagnoses() 