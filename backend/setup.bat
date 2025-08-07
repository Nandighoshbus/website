@echo off
echo 🚌 Setting up Nandighosh Bus Service Backend...

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the backend directory
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    copy .env.example .env >nul 2>&1 || echo ⚠️  Please create a .env file with your configuration
)

REM Create dist directory
if not exist "dist" mkdir dist

REM Build the project
echo 🔨 Building TypeScript...
npm run build

echo.
echo ✅ Backend setup complete!
echo.
echo 📋 Next steps:
echo 1. Update your .env file with your actual configuration
echo 2. Set up your Supabase database using database/schema.sql
echo 3. Optionally add sample data using database/sample-data.sql
echo 4. Run 'npm run dev' to start the development server
echo.
echo 🌐 The API will be available at: http://localhost:5000
echo 📚 Health check: http://localhost:5000/health
echo.
echo Happy coding! 🚀
pause
