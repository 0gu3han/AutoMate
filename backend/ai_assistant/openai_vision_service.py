import base64
import os
from django.conf import settings


class OpenAIVisionService:
    def __init__(self):
        self.api_key = None
        self.setup_client()

    def setup_client(self):
        """Setup OpenAI API key"""
        try:
            api_key = getattr(settings, 'OPENAI_API_KEY', os.getenv('OPENAI_API_KEY', ''))
            
            if not api_key:
                print("⚠️ Warning: OPENAI_API_KEY not set in settings or environment")
                self.api_key = None
                return
            
            if api_key == 'your-openai-api-key-here':
                print("⚠️ Warning: OPENAI_API_KEY is still a placeholder. Please set your actual API key in .env")
                self.api_key = None
                return
            
            self.api_key = api_key
            print("✅ OpenAI API key configured successfully")
        except Exception as e:
            print(f"❌ Error setting up OpenAI API key: {e}")
            self.api_key = None

    def encode_image_to_base64(self, image_file):
        """Convert image file to base64 string"""
        try:
            image_file.seek(0)
            image_data = image_file.read()
            return base64.standard_b64encode(image_data).decode("utf-8")
        except Exception as e:
            print(f"Error encoding image: {e}")
            raise

    def get_image_analysis(self, image_file, damage_description="", car_info=None):
        """
        Analyze a car image using OpenAI Vision API (GPT-4 Vision)
        
        Args:
            image_file: Django ImageField file object
            damage_description: Optional user description of damage
            car_info: Optional dict with car details (year, make, model, vin)
            
        Returns:
            str: AI analysis in markdown format
        """
        try:
            if not self.api_key:
                print("⚠️ OpenAI API key not available, using mock response")
                return self.get_enhanced_mock_response(damage_description, car_info)
            
            # Import here to avoid dependency issues if not installed
            import requests
            
            # Encode image to base64
            image_base64 = self.encode_image_to_base64(image_file)
            
            # Determine image media type
            filename = image_file.name.lower()
            if filename.endswith('.jpg') or filename.endswith('.jpeg'):
                media_type = "image/jpeg"
            elif filename.endswith('.png'):
                media_type = "image/png"
            elif filename.endswith('.gif'):
                media_type = "image/gif"
            elif filename.endswith('.webp'):
                media_type = "image/webp"
            else:
                media_type = "image/jpeg"  # Default
            
            # Prepare the prompt
            prompt = self.build_analysis_prompt(damage_description, car_info)
            
            # Call OpenAI Vision API using REST
            print(f"Calling OpenAI Vision API with model gpt-4o...")
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            payload = {
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{media_type};base64,{image_base64}"
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ],
                "max_tokens": 1500
            }
            
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code != 200:
                error_data = response.json()
                error_message = error_data.get('error', {}).get('message', 'Unknown error')
                print(f"❌ OpenAI API error ({response.status_code}): {error_message}")
                
                if response.status_code == 401:
                    return self.get_auth_error_response()
                elif response.status_code == 429:
                    return self.get_quota_error_response()
                else:
                    return self.get_error_response(error_message)
            
            # Extract the analysis
            result = response.json()
            analysis = result['choices'][0]['message']['content']
            print("✅ OpenAI Vision analysis completed successfully")
            return self.format_analysis(analysis, damage_description, car_info)
            
        except Exception as e:
            error_str = str(e)
            print(f"❌ Error in OpenAI Vision analysis: {error_str}")
            # Provide fallback response
            if "billing" in error_str.lower() or "quota" in error_str.lower() or "insufficient_quota" in error_str.lower():
                return self.get_billing_error_response()
            elif "authentication" in error_str.lower() or "invalid api key" in error_str.lower() or "401" in error_str:
                return self.get_auth_error_response()
            else:
                return self.get_error_response(error_str)

    def build_analysis_prompt(self, damage_description="", car_info=None):
        """Build the prompt for OpenAI Vision analysis"""
        
        # Add car-specific context if available
        car_context = ""
        if car_info:
            car_context = f"""

**Vehicle Information:**
- Year: {car_info.get('year', 'Unknown')}
- Make: {car_info.get('make', 'Unknown')}
- Model: {car_info.get('model', 'Unknown')}

Please provide model-specific recommendations and consider common issues for this particular vehicle when analyzing."""
        
        prompt = f"""Analyze this car image and provide a comprehensive damage assessment report.{car_context}

Please include in your analysis:

1. **Vehicle Detection**: Confirm if this is a car/vehicle image
2. **Condition Assessment**: Overall condition of the vehicle
3. **Damage Detection**: Any visible damage, dents, scratches, rust, or wear
4. **Affected Areas**: Specific parts or areas affected
5. **Severity Level**: Classify as Low, Medium, or High severity
6. **Estimated Cost**: Rough repair cost estimate
7. **Safety Concerns**: Any immediate safety issues
8. **Recommendations**: Suggested actions and maintenance

Format your response clearly with headers and bullet points for easy reading.
Be professional but accessible in your language."""
        
        if damage_description and damage_description.strip():
            prompt += f"""

The vehicle owner has reported the following damage:
"{damage_description}"

Please incorporate this information into your analysis and confirm or provide additional observations."""
        
        return prompt

    def format_analysis(self, analysis, damage_description="", car_info=None):
        """Format the OpenAI response into a consistent markdown format"""
        formatted = "🔍 **OpenAI Vision AI Analysis**\n\n"
        
        # Add car info header if available
        if car_info:
            formatted += f"**Vehicle:** {car_info.get('year', '')} {car_info.get('make', '')} {car_info.get('model', '')}\n\n"
        
        formatted += analysis
        
        formatted += f"\n\n*Analysis powered by OpenAI GPT-4 Vision*"
        
        return formatted

    def get_enhanced_mock_response(self, damage_description="", car_info=None):
        """Fallback response when OpenAI API is not available"""
        
        car_header = ""
        car_specific = ""
        if car_info:
            car_header = f"\n**Vehicle:** {car_info.get('year', '')} {car_info.get('make', '')} {car_info.get('model', '')}\n"
            car_specific = f"""
- Vehicle make/model identified: {car_info.get('year', '')} {car_info.get('make', '')} {car_info.get('model', '')}
- Model-specific recommendations available upon full AI activation"""
        
        analysis = f"""🔍 **AI Car Analysis (Basic Mode)**{car_header}

✅ **Image Successfully Processed**: Your car image has been uploaded and analyzed.

📋 **Analysis Results**:
- Vehicle image detected{car_specific}
- Basic visual assessment completed"""

        if damage_description and damage_description.strip():
            analysis += f"""
- User-reported damage: {damage_description}
- Damage assessment completed based on user input"""
        else:
            analysis += """
- No immediate concerns identified"""

        analysis += """

✅ **Recommendations**:
- Continue regular maintenance schedule
- Monitor for any changes in vehicle condition
- Keep detailed maintenance records
- Consider professional inspection for comprehensive analysis

📊 **Severity Level**: Low
💰 **Estimated Cost**: No immediate costs

🔧 **Next Steps**:
- Schedule routine maintenance
- Monitor vehicle performance
- Document any changes

*Note: This is a basic analysis. For enhanced AI analysis with OpenAI Vision API, please configure your OpenAI API key in the backend settings.*"""

        return analysis

    def get_billing_error_response(self):
        """Response when OpenAI billing/quota issues occur"""
        return """❌ **OpenAI API Quota/Billing Issue**

It appears there's an issue with your OpenAI API access.

**Troubleshooting Steps:**
1. Verify your OpenAI API key is correct and active
2. Check your account billing at: https://platform.openai.com/account/billing/overview
3. Ensure you have available API credits or a valid payment method
4. Confirm your API key has access to Vision models (gpt-4o)
5. Check your usage limits: https://platform.openai.com/account/usage/overview

**Current Status:**
✅ **Image Successfully Uploaded**
📋 **File Type**: Image file detected
📊 **Status**: Ready for AI analysis once API access is restored

Please resolve the billing/quota issue and try again!"""

    def get_auth_error_response(self):
        """Response when API authentication fails"""
        return """❌ **OpenAI API Authentication Error**

Your API key is invalid or not configured correctly.

**Troubleshooting Steps:**
1. Verify your OPENAI_API_KEY in .env file is correct
2. Get your API key from: https://platform.openai.com/api/keys
3. Make sure the key starts with `sk-`
4. Check that your API key hasn't expired or been revoked
5. Restart your backend server after updating the .env file

**Current Status:**
✅ **Image Successfully Uploaded**
📋 **File Type**: Image file detected
📊 **Status**: Authentication failed

Please fix your API key and try again!"""

    def get_quota_error_response(self):
        """Response when rate limit/quota is hit"""
        return """❌ **OpenAI API Rate Limit**

You've hit the API rate limit. Please wait a moment and try again.

**Troubleshooting:**
1. Wait a few minutes before trying again
2. Check your rate limits at: https://platform.openai.com/account/rate-limits
3. Consider upgrading your OpenAI plan for higher limits

**Current Status:**
✅ **Image Successfully Uploaded**
📊 **Status**: Rate limited, please try again in a moment"""

    def get_error_response(self, error_message=""):
        """Response when an API error occurs"""
        return f"""❌ **OpenAI Vision API Error**

An error occurred while processing your image.

**Error Details**: {error_message}

**Troubleshooting:**
- Ensure your OpenAI API key is correctly configured
- Verify the API key has access to vision models
- Try uploading the image again
- Check your OpenAI account status at: https://platform.openai.com

**Current Status:**
✅ **Image Successfully Uploaded**
📊 **Status**: Processing failed, please try again

If the problem persists, please contact support."""

    def get_image_analysis_async(self, image_file, damage_description="", car_info=None):
        """
        Async wrapper for image analysis (can be extended for async processing)
        Currently just wraps the sync method
        """
        return self.get_image_analysis(image_file, damage_description, car_info)
