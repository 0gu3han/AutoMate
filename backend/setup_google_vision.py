#!/usr/bin/env python3
"""
Google Vision API Setup Script
This script helps you set up Google Vision API for the AutoMate project.
"""

import os
import json
from pathlib import Path

def create_google_vision_setup():
    """Create Google Vision API setup instructions"""
    
    setup_instructions = """
🔧 **Google Vision API Setup for AutoMate**

## Step 1: Create Google Cloud Account
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable billing (required for API usage)

## Step 2: Enable Vision API
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Cloud Vision API"
3. Click "Enable"

## Step 3: Create Service Account
1. Go to https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click "Create Service Account"
3. Name: "automate-vision-api"
4. Description: "AutoMate Vision API Service Account"
5. Click "Create and Continue"
6. Role: "Cloud Vision API User"
7. Click "Done"

## Step 4: Download Credentials
1. Click on your service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Download the file
6. Rename to: `google-vision-credentials.json`
7. Move to: `backend/google-vision-credentials.json`

## Step 5: Configure Django Settings
Add to your .env file:
GOOGLE_APPLICATION_CREDENTIALS=google-vision-credentials/google-vision-credentials.json

## Step 6: Test Setup
Run: python manage.py shell
Then test:
from ai_assistant.free_vision_service import FreeVisionService
service = FreeVisionService()
print("Client available:", service.client is not None)

## Free Tier Limits:
- 1000 requests per month FREE
- Perfect for testing and small usage
- No credit card required for free tier

## Troubleshooting:
- Make sure billing is enabled
- Check that Vision API is enabled
- Verify credentials file path is correct
- Ensure credentials file has proper permissions
"""
    
    print(setup_instructions)
    
    # Create credentials directory
    credentials_dir = Path("google-vision-credentials")
    credentials_dir.mkdir(exist_ok=True)
    
    # Create sample .env entry
    env_entry = """
# Google Vision API Configuration
GOOGLE_APPLICATION_CREDENTIALS=google-vision-credentials/google-vision-credentials.json
"""
    
    print("\n📁 **Created directories:**")
    print(f"  - {credentials_dir.absolute()}")
    
    print("\n📝 **Add to your .env file:**")
    print(env_entry)
    
    print("\n✅ **Setup complete! Follow the steps above to configure Google Vision API.**")

if __name__ == "__main__":
    create_google_vision_setup() 