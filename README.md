# AutoMate - Smart Car Management System

AutoMate is a comprehensive car management application that helps users track their vehicles, maintenance schedules, and get AI-powered diagnostics for car issues.

## 🚗 Features

- **Car Management**: Add, edit, and track multiple vehicles
- **Maintenance Tracking**: Schedule and log maintenance activities
- **AI Diagnostics**: Upload car images for AI-powered issue diagnosis
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Material-UI** - Component library for consistent design
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing

### Backend
- **Django** - Python web framework
- **Django REST Framework** - API development
- **SQLite** - Database (can be easily switched to PostgreSQL/MySQL)
- **Google Vision API** - AI image analysis for car diagnostics

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- Git

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd AutoMate
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
```

### Google Vision API Setup
1. Create a Google Cloud project
2. Enable the Vision API
3. Create service account credentials
4. Place the JSON credentials file in `backend/google-vision-credentials/`

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Add Cars**: Add your vehicles with details like make, model, year, VIN
3. **Track Maintenance**: Log maintenance activities and set reminders
4. **AI Diagnostics**: Upload car images for AI-powered issue analysis

## 🏗️ Project Structure

```
AutoMate/
├── backend/                 # Django backend
│   ├── automate/           # Main Django project
│   ├── cars/              # Car management app
│   ├── maintenance/       # Maintenance tracking app
│   ├── ai_assistant/      # AI diagnostics app
│   ├── members/           # User authentication app
│   └── manage.py
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── services/      # API services
│   │   └── assets/        # Static assets
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Push notifications for maintenance reminders
- [ ] Integration with car service APIs
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Multi-language support
