# AutoMate Mobile App

A React Native mobile app for car management built with Expo. Connects to the AutoMate Django backend for authentication, car management, and AI-powered diagnostics.

## Features

- **User Authentication**: Register/Login with email and password
- **Car Management**: Add, edit, delete cars with make/model dropdowns
- **AI Diagnostics**: Upload car images for AI analysis using OpenAI Vision API
- **Profile Management**: View user info and logout
- **Persistent Storage**: Token-based authentication with AsyncStorage

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Python/Django backend running (see AutoMate backend README)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Update the API base URL in `src/services/api.js`:
   - Change `192.168.1.100` to your machine's IP address (accessible from your phone)
   - Or use `localhost:8000` if testing on Android emulator/iOS simulator

3. Start the backend Django server:
```bash
cd ../backend
python manage.py runserver 0.0.0.0:8000
```

## Running the App

### Expo Development Server
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## Project Structure

```
src/
├── screens/
│   ├── LoginScreen.js         # Login form
│   ├── RegisterScreen.js      # Registration form
│   ├── CarsScreen.js          # Car management (list, add, edit, delete)
│   ├── DiagnosticsScreen.js   # Image upload for AI analysis
│   ├── ProfileScreen.js       # User profile and logout
│   └── AuthContext.js         # Auth state management
├── services/
│   └── api.js                 # API service layer (Axios)
└── utils/
    └── carMakesModels.json    # Car makes/models dropdown data
```

## Dependencies

- `@react-navigation/*`: Navigation
- `axios`: HTTP client
- `@react-native-async-storage/async-storage`: Token persistence
- `expo-image-picker`: Camera and photo library access
- `@react-native-picker/picker`: Dropdown picker component

## Backend API Integration

The app connects to the Django backend at:
- Default: `http://192.168.1.100:8000/api`
- Update in `src/services/api.js` with your machine's IP

### Required Backend Endpoints

- `POST /api/members/register/` - User registration
- `POST /api/members/login/` - User login
- `GET /api/cars/` - List user's cars
- `POST /api/cars/` - Create car
- `PUT /api/cars/{id}/` - Update car
- `DELETE /api/cars/{id}/` - Delete car
- `GET /api/ai_assistant/diagnosis-requests/` - List diagnoses
- `POST /api/ai_assistant/diagnosis-requests/` - Upload image for analysis
- `DELETE /api/ai_assistant/diagnosis-requests/{id}/` - Delete diagnosis

## Authentication

- Uses token-based authentication (DRF TokenAuthentication)
- Token stored in AsyncStorage after login
- Auto-checked on app launch to restore session
- Sent in `Authorization: Token <token>` header with every API request

## Customization

### Add More Car Makes/Models
Edit `src/utils/carMakesModels.json`:
```json
{
  "YourBrand": ["Model1", "Model2"],
  ...
}
```

### Change API Base URL
Update `API_BASE_URL` in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://YOUR_IP:8000/api';
```

### Change Colors/Theme
Update color values in screen components (e.g., `#1976d2` for primary blue)

## Troubleshooting

### Can't connect to backend
- Ensure Django backend is running: `python manage.py runserver 0.0.0.0:8000`
- Use your machine's IP instead of `localhost` (check with `ifconfig`)
- Verify firewall allows connections on port 8000

### Image upload fails
- Ensure camera permissions are granted
- Check backend `MEDIA_ROOT` is writable
- Verify OpenAI API key is configured in backend

### Token expiration
- Logout and login again to get a new token
- Check Django `TOKEN_AUTH` settings

## Development Tips

- Use `console.log()` for debugging (visible in Expo CLI)
- Check backend logs: `tail -f backend_server.log`
- Use `AsyncStorage.getItem('authToken')` to debug stored token

## License

MIT

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
