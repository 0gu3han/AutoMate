#!/bin/bash
# Quick Setup Script for AutoMate Backend

echo "========================================="
echo "AutoMate Backend Setup"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Python version
echo -e "\n${YELLOW}Step 1:${NC} Checking Python version..."
python3 --version || { echo -e "${RED}Python 3 is required${NC}"; exit 1; }
echo -e "${GREEN}✓${NC} Python installed"

# Step 2: Create virtual environment
echo -e "\n${YELLOW}Step 2:${NC} Setting up virtual environment..."
if [ ! -d ".venv_run" ]; then
    python3 -m venv .venv_run
    echo -e "${GREEN}✓${NC} Virtual environment created"
else
    echo -e "${GREEN}✓${NC} Virtual environment already exists"
fi

# Step 3: Activate and install dependencies
echo -e "\n${YELLOW}Step 3:${NC} Installing dependencies..."
source .venv_run/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓${NC} Dependencies installed"

# Step 4: Check for .env file
echo -e "\n${YELLOW}Step 4:${NC} Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠${NC} .env file not found. Creating from template..."
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your actual credentials${NC}"
else
    echo -e "${GREEN}✓${NC} .env file exists"
fi

# Step 5: Create logs directory
echo -e "\n${YELLOW}Step 5:${NC} Creating logs directory..."
mkdir -p logs
touch logs/error.log
echo -e "${GREEN}✓${NC} Logs directory created"

# Step 6: Run migrations
echo -e "\n${YELLOW}Step 6:${NC} Running database migrations..."
python manage.py makemigrations
python manage.py migrate
echo -e "${GREEN}✓${NC} Migrations completed"

# Step 7: Collect static files
echo -e "\n${YELLOW}Step 7:${NC} Collecting static files..."
python manage.py collectstatic --noinput --clear
echo -e "${GREEN}✓${NC} Static files collected"

# Summary
echo -e "\n========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "========================================="
echo -e "\nNext steps:"
echo "1. Edit .env file with your credentials"
echo "2. For PostgreSQL: Install and create database"
echo "3. For Redis: Install redis-server"
echo "4. Create superuser: python manage.py createsuperuser"
echo "5. Run server: python manage.py runserver"
echo "6. Start Celery worker: celery -A automate worker -l info"
echo "7. Start Celery beat: celery -A automate beat -l info"
echo ""
echo "For production deployment, see PRODUCTION_SETUP.md"
echo "========================================="
