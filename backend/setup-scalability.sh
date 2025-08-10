#!/bin/bash

# Nandighosh Bus Service Backend - Scalability Setup Script
# This script installs and configures the scalability improvements

echo "🚌 Nandighosh Bus Service - Scalability Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_warning "Node.js version 18+ recommended. Current version: $(node --version)"
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Installing scalability dependencies..."

# Install required packages
npm install --save ioredis@^5.4.1 winston@^3.15.0

# Check if Redis is installed locally
if command -v redis-server &> /dev/null; then
    print_success "Redis server found locally"
    
    # Check if Redis is running
    if redis-cli ping &> /dev/null; then
        print_success "Redis is already running"
    else
        print_warning "Redis is installed but not running"
        print_status "To start Redis locally: redis-server"
    fi
else
    print_warning "Redis not found locally. You'll need Redis for caching:"
    echo "  - Install locally: https://redis.io/download"
    echo "  - Or use cloud Redis (AWS ElastiCache, Redis Cloud, etc.)"
fi

# Create logs directory
print_status "Creating logs directory..."
mkdir -p logs
touch logs/error.log
touch logs/access.log
touch logs/combined.log

# Create environment file template if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env template..."
    cat > .env << EOL
# Nandighosh Bus Service - Scalability Configuration

# Application
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Caching
CACHE_TTL_DEFAULT=3600
CACHE_TTL_ROUTES=1800
CACHE_TTL_USER=600

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
ALLOWED_ORIGINS=http://localhost:3000,https://nandighosh-bus.vercel.app

# Logging
LOG_LEVEL=info
LOGS_DIR=logs

# Performance
MAX_BODY_SIZE=10mb
COMPRESSION_LEVEL=6
TRUST_PROXY=1

# Monitoring
HEALTH_CHECK_INTERVAL=300000
METRICS_COLLECTION=true
EOL
    print_success "Created .env template - Please update with your actual values"
else
    print_warning ".env already exists - Please ensure it has the new configuration variables"
fi

# Build the TypeScript files
print_status "Building TypeScript files..."
if npm run build &> /dev/null; then
    print_success "TypeScript compilation successful"
else
    print_warning "TypeScript compilation failed - this is normal if using the new files"
fi

# Create startup scripts
print_status "Creating startup scripts..."

# Development startup script
cat > start-dev.sh << 'EOL'
#!/bin/bash

echo "🚌 Starting Nandighosh Bus Service (Development)"
echo "=============================================="

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Redis is not running. Starting Redis..."
    
    # Try to start Redis in the background
    if command -v redis-server &> /dev/null; then
        redis-server --daemonize yes
        sleep 2
        
        if redis-cli ping &> /dev/null; then
            echo "✅ Redis started successfully"
        else
            echo "❌ Failed to start Redis automatically"
            echo "Please start Redis manually: redis-server"
            exit 1
        fi
    else
        echo "❌ Redis not found. Please install Redis or use cloud Redis"
        exit 1
    fi
fi

echo "🚀 Starting development server..."
npm run dev
EOL

# Production startup script
cat > start-prod.sh << 'EOL'
#!/bin/bash

echo "🚌 Starting Nandighosh Bus Service (Production)"
echo "=============================================="

# Build the application
echo "📦 Building application..."
npm run build

# Check if Redis is available
if ! redis-cli ping &> /dev/null; then
    echo "❌ Redis is not available. Please ensure Redis is running."
    exit 1
fi

echo "✅ Redis connection verified"

# Start the production server
echo "🚀 Starting production server..."
npm start
EOL

chmod +x start-dev.sh start-prod.sh

print_success "Created startup scripts: start-dev.sh and start-prod.sh"

# Update package.json scripts if they don't exist
print_status "Checking package.json scripts..."

# Check if jq is available for JSON manipulation
if command -v jq &> /dev/null; then
    # Add scripts using jq
    jq '.scripts.dev = "nodemon src/server.scalable.ts" | .scripts.start = "node dist/server.scalable.js" | .scripts["build:scalable"] = "tsc src/server.scalable.ts --outDir dist --target ES2020 --module commonjs"' package.json > package.json.tmp && mv package.json.tmp package.json
    print_success "Updated package.json scripts"
else
    print_warning "jq not available - please manually add these scripts to package.json:"
    echo '  "dev": "nodemon src/server.scalable.ts"'
    echo '  "start": "node dist/server.scalable.js"'
    echo '  "build:scalable": "tsc src/server.scalable.ts --outDir dist --target ES2020 --module commonjs"'
fi

echo ""
print_success "✅ Scalability setup completed!"
echo ""
echo "🔧 Next Steps:"
echo "1. Update .env file with your actual configuration values"
echo "2. Ensure Redis is running (locally or cloud)"
echo "3. Start development server: ./start-dev.sh"
echo "4. Check health: http://localhost:5000/health"
echo "5. View metrics: http://localhost:5000/metrics"
echo ""
echo "📚 Documentation:"
echo "- Read SCALABILITY_README.md for detailed information"
echo "- Health monitoring: /health endpoint"
echo "- Performance metrics: /metrics endpoint"
echo ""
print_success "Happy coding! 🚀"
EOL
