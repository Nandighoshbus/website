#!/bin/bash

# Nandighosh Bus Service Backend Setup Script
echo "🚌 Setting up Nandighosh Bus Service Backend..."

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "⚠️  Please create a .env file with your configuration"
fi

# Create dist directory
mkdir -p dist

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env file with your actual configuration"
echo "2. Set up your Supabase database using database/schema.sql"
echo "3. Optionally add sample data using database/sample-data.sql"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "🌐 The API will be available at: http://localhost:5000"
echo "📚 Health check: http://localhost:5000/health"
echo ""
echo "Happy coding! 🚀"
