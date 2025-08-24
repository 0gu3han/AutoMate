#!/usr/bin/env python3
"""
Test Google Vision API Setup
"""

import os
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'automate.settings')
django.setup()

def test_google_vision():
    """Test if Google Vision API is properly configured"""
    
    print("🔍 **Testing Google Vision API Setup**\n")
    
    # Check if credentials file exists
    credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', '')
    print(f"📁 Credentials path: {credentials_path}")
    
    if credentials_path and os.path.exists(credentials_path):
        print("✅ Credentials file found")
    else:
        print("❌ Credentials file not found")
        print("   Please follow the setup instructions in setup_google_vision.py")
        return False
    
    # Test Google Vision service
    try:
        from ai_assistant.free_vision_service import FreeVisionService
        service = FreeVisionService()
        
        print(f"🔧 Google Vision client available: {service.client is not None}")
        
        if service.client:
            print("✅ Google Vision API is properly configured!")
            print("🎉 You can now upload images for real AI analysis!")
            return True
        else:
            print("❌ Google Vision client not available")
            print("   Please check your credentials and API setup")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Google Vision: {str(e)}")
        return False

if __name__ == "__main__":
    test_google_vision() 