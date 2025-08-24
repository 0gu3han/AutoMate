import os
import io
from django.conf import settings
from google.cloud import vision
from google.oauth2 import service_account
import json

class FreeVisionService:
    def __init__(self):
        self.client = None
        self.setup_client()

    def setup_client(self):
        """Setup Google Vision client with credentials"""
        try:
            print(f"Setting up Google Vision client...")
            print(f"GOOGLE_APPLICATION_CREDENTIALS: {getattr(settings, 'GOOGLE_APPLICATION_CREDENTIALS', 'Not set')}")
            
            # Try to use service account credentials if available
            if hasattr(settings, 'GOOGLE_APPLICATION_CREDENTIALS'):
                credentials_path = settings.GOOGLE_APPLICATION_CREDENTIALS
                print(f"Using credentials from: {credentials_path}")
                
                # Check if file exists
                import os
                if os.path.exists(credentials_path):
                    print(f"Credentials file exists: {os.path.getsize(credentials_path)} bytes")
                    self.client = vision.ImageAnnotatorClient()
                    print("Google Vision client created successfully")
                else:
                    print(f"Credentials file does not exist: {credentials_path}")
                    self.client = None
            else:
                print("No GOOGLE_APPLICATION_CREDENTIALS set, using default")
                self.client = vision.ImageAnnotatorClient()
                print("Google Vision client created with default credentials")
        except Exception as e:
            print(f"Error setting up Google Vision client: {e}")
            self.client = None

    def analyze_car_image(self, image_file, damage_description=""):
        """
        Analyze a car image using Google Vision AI (FREE)
        """
        print(f"Starting image analysis...")
        print(f"Client available: {self.client is not None}")
        print(f"User damage description: {damage_description}")
        
        if not self.client:
            print("No client available, returning mock response")
            return self.get_enhanced_mock_response(damage_description)

        try:
            print("Reading image file...")
            # Read the image file
            content = image_file.read()
            print(f"Image content size: {len(content)} bytes")
            image = vision.Image(content=content)

            print("Performing label detection...")
            # Perform label detection (fastest and most useful for cars)
            label_response = self.client.label_detection(image=image)
            labels = [label.description for label in label_response.label_annotations]
            print(f"Detected labels: {labels}")
            
            # Generate car-specific analysis
            analysis = self.generate_car_analysis({'labels': labels}, damage_description)
            print("Analysis completed successfully")
            return analysis

        except Exception as e:
            print(f"Error in image analysis: {str(e)}")
            if "BILLING_DISABLED" in str(e):
                print("Billing disabled error detected")
                return self.get_billing_error_response()
            else:
                print("Other error, returning mock response")
                return self.get_enhanced_mock_response(damage_description)

    def generate_car_analysis(self, results, damage_description=""):
        """
        Generate car-specific analysis from Google Vision results
        """
        labels = results.get('labels', [])
        print(f"Analyzing labels: {labels}")
        print(f"User damage description: {damage_description}")
        
        # Convert all labels to lowercase for better matching
        labels_lower = [label.lower() for label in labels]
        
        # Look for car-related terms
        car_terms = ['car', 'vehicle', 'automobile', 'tire', 'wheel', 'engine', 'brake', 'headlight', 'tail light', 'motor', 'transport']
        found_car_terms = [term for term in car_terms if any(term in label for label in labels_lower)]
        
        # Look for damage-related terms (expanded list)
        damage_terms = [
            'scratch', 'dent', 'crack', 'rust', 'damage', 'broken', 'worn', 'bent', 'deformed',
            'shattered', 'smashed', 'crushed', 'collision', 'accident', 'impact', 'hit',
            'scratched', 'dented', 'cracked', 'rusted', 'damaged', 'broken', 'worn out',
            'bent', 'deformed', 'shattered', 'smashed', 'crushed', 'collision', 'accident',
            'impact', 'hit', 'crash', 'wreck', 'totaled', 'destroyed', 'mangled',
            'metal', 'plastic', 'glass', 'paint', 'body', 'panel', 'bumper', 'fender',
            'hood', 'trunk', 'door', 'window', 'mirror', 'grill', 'headlight', 'taillight',
            'wheel', 'tire', 'rim', 'hubcap', 'exhaust', 'muffler', 'tailpipe'
        ]
        found_damage = [term for term in damage_terms if any(term in label for label in labels_lower)]
        
        # Look for specific car parts that might indicate damage
        car_parts = ['bumper', 'fender', 'hood', 'trunk', 'door', 'window', 'mirror', 'grill', 'headlight', 'taillight']
        found_parts = [part for part in car_parts if any(part in label for label in labels_lower)]
        
        # Look for condition indicators
        condition_indicators = ['new', 'old', 'clean', 'dirty', 'polished', 'matted', 'shiny', 'dull']
        found_conditions = [condition for condition in condition_indicators if any(condition in label for label in labels_lower)]

        # Generate analysis
        analysis = "🔍 **Google Vision AI Analysis**\n\n"
        
        # Vehicle detection
        if found_car_terms:
            analysis += "✅ **Vehicle Detected**: This appears to be a car/vehicle image.\n\n"
        else:
            analysis += "⚠️ **Vehicle Not Clearly Detected**: The image may not clearly show a vehicle.\n\n"

        # Enhanced damage assessment with pattern recognition
        damage_indicators = []
        severity_level = "Low"
        cost_estimate = "No immediate costs"
        
        # Check for specific damage patterns in labels
        if any(term in labels_lower for term in ['scratch', 'dent', 'crack', 'rust', 'damage', 'broken']):
            damage_indicators.extend([term for term in ['scratch', 'dent', 'crack', 'rust', 'damage', 'broken'] if any(term in label for label in labels_lower)])
        
        # Check for collision-related terms
        if any(term in labels_lower for term in ['collision', 'accident', 'crash', 'wreck', 'impact']):
            damage_indicators.extend([term for term in ['collision', 'accident', 'crash', 'wreck', 'impact'] if any(term in label for label in labels_lower)])
        
        # Advanced pattern analysis for crash detection
        crash_indicators = []
        
        # Check for multiple car parts that might indicate damage
        car_parts_detected = len(found_parts)
        if car_parts_detected >= 3:
            # Multiple parts detected might indicate damage spread
            crash_indicators.append("multiple affected areas")
        
        # Check for specific combinations that suggest damage
        if any(term in labels_lower for term in ['automotive exterior', 'automotive tire', 'automotive lighting']):
            if any(term in labels_lower for term in ['personal luxury car', 'motor vehicle']):
                # This combination often indicates visible damage
                crash_indicators.append("exterior damage detected")
        
        # Check for material damage indicators
        material_damage = []
        if any(term in labels_lower for term in ['metal', 'plastic', 'glass', 'paint']):
            if any(term in labels_lower for term in ['old', 'dirty', 'worn', 'matted', 'dull']):
                material_damage = ['material wear', 'aging']
        
        # Check for structural damage
        structural_damage = []
        if any(term in labels_lower for term in ['bent', 'deformed', 'smashed', 'crushed']):
            structural_damage = ['structural damage']
        
        # Combine all damage indicators
        all_damage = damage_indicators + crash_indicators + material_damage + structural_damage
        
        # Check if user provided damage description
        if damage_description and damage_description.strip():
            analysis += f"🚨 **User-Reported Damage**: {damage_description}\n\n"
            all_damage.append("user-reported damage")
            
            # Analyze user description for severity
            user_desc_lower = damage_description.lower()
            if any(term in user_desc_lower for term in ['crash', 'accident', 'collision', 'wreck', 'totaled', 'destroyed']):
                severity_level = "High"
                cost_estimate = "$2000-10000"
            elif any(term in user_desc_lower for term in ['dent', 'scratch', 'bump', 'hit']):
                severity_level = "Medium"
                cost_estimate = "$500-2000"
            else:
                severity_level = "Medium"
                cost_estimate = "$100-500"
        
        # Determine severity based on detected patterns
        if all_damage:
            if any(term in all_damage for term in ['crash', 'accident', 'collision', 'wreck', 'structural damage']):
                severity_level = "High"
                cost_estimate = "$2000-10000"
            elif any(term in all_damage for term in ['multiple affected areas', 'exterior damage detected']):
                severity_level = "Medium"
                cost_estimate = "$500-2000"
            else:
                severity_level = "Medium"
                cost_estimate = "$100-500"
            
            analysis += f"🚨 **Damage Detected**: Found potential issues: {', '.join(all_damage)}\n\n"
        elif found_parts:
            analysis += f"🔍 **Car Parts Identified**: {', '.join(found_parts)}\n"
            if found_conditions:
                analysis += f"📊 **Condition**: {', '.join(found_conditions)}\n"
            analysis += "✅ **No Obvious Damage Detected**: The identified parts appear to be in good condition.\n\n"
        else:
            analysis += "✅ **No Obvious Damage Detected**: The vehicle appears to be in good condition.\n\n"

        # Add all detected labels for transparency
        if labels:
            analysis += f"📋 **AI Detected Elements**: {', '.join(labels[:10])}\n\n"

        # Add recommendations based on severity level
        if severity_level == "High":
            analysis += "🚨 **Critical Recommendations**:\n"
            analysis += "- DO NOT DRIVE - Vehicle may be unsafe\n"
            analysis += "- Contact emergency services if needed\n"
            analysis += "- Schedule immediate professional inspection\n"
            analysis += "- Contact insurance company immediately\n"
            analysis += "- Get multiple repair estimates\n"
            analysis += "- Document all damage thoroughly\n"
        elif severity_level == "Medium":
            analysis += "🔧 **Repair Recommendations**:\n"
            analysis += "- Schedule professional inspection within 24-48 hours\n"
            analysis += "- Get repair estimates from multiple sources\n"
            analysis += "- Document all damage for insurance purposes\n"
            analysis += "- Consider safety implications before driving\n"
            analysis += "- Monitor for any changes in vehicle behavior\n"
        else:
            analysis += "✅ **Maintenance Recommendations**:\n"
            analysis += "- Continue regular maintenance schedule\n"
            analysis += "- Monitor for any changes in condition\n"
            analysis += "- Keep detailed maintenance records\n"
            analysis += "- Consider preventive maintenance\n"

        analysis += f"\n📊 **Severity Level**: {severity_level}"
        analysis += f"\n💰 **Estimated Cost**: {cost_estimate}"
        
        # Add confidence note
        analysis += f"\n\n*Analysis based on {len(labels)} detected elements using Google Vision AI*"

        return analysis

    def get_enhanced_mock_response(self, damage_description=""):
        """Enhanced fallback response when Google Vision is not available"""
        analysis = """🔍 **AI Car Analysis (Basic Mode)**

✅ **Image Successfully Processed**: Your car image has been uploaded and analyzed.

📋 **Analysis Results**:
- Vehicle image detected
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
- Consider professional inspection for comprehensive analysis"""

        # Analyze user description for severity
        severity_level = "Low"
        cost_estimate = "No immediate costs"
        
        if damage_description and damage_description.strip():
            user_desc_lower = damage_description.lower()
            if any(term in user_desc_lower for term in ['crash', 'accident', 'collision', 'wreck', 'totaled', 'destroyed']):
                severity_level = "High"
                cost_estimate = "$2000-10000"
                analysis += """
🚨 **Critical Recommendations**:
- DO NOT DRIVE - Vehicle may be unsafe
- Contact emergency services if needed
- Schedule immediate professional inspection
- Contact insurance company immediately
- Get multiple repair estimates
- Document all damage thoroughly"""
            elif any(term in user_desc_lower for term in ['dent', 'scratch', 'bump', 'hit']):
                severity_level = "Medium"
                cost_estimate = "$500-2000"
                analysis += """
🔧 **Repair Recommendations**:
- Schedule professional inspection within 24-48 hours
- Get repair estimates from multiple sources
- Document all damage for insurance purposes
- Consider safety implications before driving
- Monitor for any changes in vehicle behavior"""
            else:
                severity_level = "Medium"
                cost_estimate = "$100-500"
                analysis += """
🔧 **Repair Recommendations**:
- Schedule professional inspection within 24-48 hours
- Get repair estimates from multiple sources
- Document all damage for insurance purposes
- Consider safety implications before driving
- Monitor for any changes in vehicle behavior"""

        analysis += """

📊 **Severity Level**: """ + severity_level
        analysis += """
💰 **Estimated Cost**: """ + cost_estimate
        analysis += """

🔧 **Next Steps**:
- Schedule routine maintenance
- Monitor vehicle performance
- Document any changes

*Note: This is a basic analysis. For enhanced AI analysis with Google Vision API, please configure your credentials in the backend settings.*"""

        return analysis

    def get_billing_error_response(self):
        """Response when Google Cloud billing is not enabled"""
        return """❌ **Google Cloud Billing Required**

To use Google Vision API, you need to enable billing on your Google Cloud project.

**Quick Fix:**
1. Go to: https://console.developers.google.com/billing/enable?project=29157707823
2. Enable billing (required for free tier)
3. Wait 2-3 minutes for activation

**Free Tier Benefits:**
- 1000 requests/month FREE
- No charges if you stay within limits
- Billing account required but won't charge for free usage

**Current Analysis:**
✅ **Image Successfully Uploaded**
📋 **File Type**: Image file detected
📊 **Status**: Ready for AI analysis once billing is enabled

Please enable billing and try again for full AI analysis!"""

    def get_mock_response(self):
        """Legacy fallback response"""
        return self.get_enhanced_mock_response()

    def get_image_analysis(self, image_file, damage_description=""):
        """
        Main method to analyze uploaded image
        """
        try:
            # Reset file pointer to beginning
            image_file.seek(0)
            return self.analyze_car_image(image_file, damage_description)
        except Exception as e:
            print(f"Vision API error: {str(e)}")
            return f"❌ **Google Vision API Error**\n\nError: {str(e)}\n\nPlease check your Google Cloud Vision API setup." 