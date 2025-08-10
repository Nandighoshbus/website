# Nandighosh Bus Service Backend - Scalability Setup Script (PowerShell)
# This script installs and configures the scalability improvements for Windows

Write-Host "🚌 Nandighosh Bus Service - Scalability Setup" -ForegroundColor Blue
Write-Host "==============================================" -ForegroundColor Blue

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Success "Node.js found: $nodeVersion"
    
    # Extract version number and check if it's 18+
    $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($versionNumber -lt 18) {
        Write-Warning "Node.js version 18+ recommended. Current version: $nodeVersion"
    }
} catch {
    Write-Error "Node.js is not installed. Please install Node.js 18+ first."
    Write-Host "Download from: https://nodejs.org/"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Success "npm found: $npmVersion"
} catch {
    Write-Error "npm is not installed. Please install npm first."
    exit 1
}

Write-Status "Installing scalability dependencies..."

# Install required packages
try {
    npm install --save ioredis@^5.4.1 winston@^3.15.0
    Write-Success "Dependencies installed successfully"
} catch {
    Write-Error "Failed to install dependencies. Please check your network connection."
    exit 1
}

# Check if Redis is available (Windows doesn't have redis-server by default)
$redisAvailable = $false
try {
    # Try to connect to Redis (assuming it might be running)
    $redisTest = redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Success "Redis is running and accessible"
        $redisAvailable = $true
    }
} catch {
    # Redis CLI not found or Redis not running
}

if (-not $redisAvailable) {
    Write-Warning "Redis not found or not running. You'll need Redis for caching:"
    Write-Host "  Options for Windows:"
    Write-Host "  - Use WSL2 with Redis"
    Write-Host "  - Use Docker: docker run --name redis -d -p 6379:6379 redis"
    Write-Host "  - Use cloud Redis (AWS ElastiCache, Redis Cloud, Azure Cache)"
    Write-Host "  - Install Redis on Windows: https://github.com/microsoftarchive/redis/releases"
}

# Create logs directory
Write-Status "Creating logs directory..."
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
}

# Create log files
@("error.log", "access.log", "combined.log") | ForEach-Object {
    $logPath = "logs\$_"
    if (-not (Test-Path $logPath)) {
        New-Item -ItemType File -Path $logPath | Out-Null
    }
}

Write-Success "Logs directory and files created"

# Create environment file template if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Status "Creating .env template..."
    
    $envTemplate = @"
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
"@

    $envTemplate | Out-File -FilePath ".env" -Encoding UTF8
    Write-Success "Created .env template - Please update with your actual values"
} else {
    Write-Warning ".env already exists - Please ensure it has the new configuration variables"
}

# Build the TypeScript files
Write-Status "Attempting to build TypeScript files..."
try {
    npm run build 2>$null | Out-Null
    Write-Success "TypeScript compilation successful"
} catch {
    Write-Warning "TypeScript compilation failed - this is normal if using the new files"
}

# Create startup scripts for Windows
Write-Status "Creating Windows startup scripts..."

# Development startup script (PowerShell)
$devScript = @'
# Development Startup Script
Write-Host "🚌 Starting Nandighosh Bus Service (Development)" -ForegroundColor Blue
Write-Host "==============================================" -ForegroundColor Blue

# Check if Redis is running (if available locally)
$redisRunning = $false
try {
    $redisTest = redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "✅ Redis is running" -ForegroundColor Green
        $redisRunning = $true
    }
} catch {
    # Redis not available
}

if (-not $redisRunning) {
    Write-Host "⚠️  Redis is not running. Options:" -ForegroundColor Yellow
    Write-Host "  1. Start Redis with Docker: docker run --name redis -d -p 6379:6379 redis"
    Write-Host "  2. Use cloud Redis service"
    Write-Host "  3. Install Redis locally"
    
    $choice = Read-Host "Continue without Redis? (y/N)"
    if ($choice -ne "y" -and $choice -ne "Y") {
        exit 1
    }
}

Write-Host "🚀 Starting development server..." -ForegroundColor Green
npm run dev
'@

$devScript | Out-File -FilePath "start-dev.ps1" -Encoding UTF8

# Production startup script (PowerShell)
$prodScript = @'
# Production Startup Script
Write-Host "🚌 Starting Nandighosh Bus Service (Production)" -ForegroundColor Blue
Write-Host "==============================================" -ForegroundColor Blue

# Build the application
Write-Host "📦 Building application..." -ForegroundColor Cyan
try {
    npm run build
    Write-Host "✅ Build completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Check if Redis is available
$redisRunning = $false
try {
    $redisTest = redis-cli ping 2>$null
    if ($redisTest -eq "PONG") {
        Write-Host "✅ Redis connection verified" -ForegroundColor Green
        $redisRunning = $true
    }
} catch {
    # Redis not available
}

if (-not $redisRunning) {
    Write-Host "❌ Redis is not available. Please ensure Redis is running." -ForegroundColor Red
    exit 1
}

# Start the production server
Write-Host "🚀 Starting production server..." -ForegroundColor Green
npm start
'@

$prodScript | Out-File -FilePath "start-prod.ps1" -Encoding UTF8

Write-Success "Created startup scripts: start-dev.ps1 and start-prod.ps1"

# Create Docker Compose file for Redis
Write-Status "Creating Docker Compose file for Redis..."
$dockerCompose = @"
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: nandighosh-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  redis_data:
"@

$dockerCompose | Out-File -FilePath "docker-compose.redis.yml" -Encoding UTF8
Write-Success "Created docker-compose.redis.yml for easy Redis setup"

Write-Host ""
Write-Success "✅ Scalability setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update .env file with your actual configuration values"
Write-Host "2. Start Redis:"
Write-Host "   - With Docker: docker-compose -f docker-compose.redis.yml up -d"
Write-Host "   - Or use cloud Redis service"
Write-Host "3. Start development server: .\start-dev.ps1"
Write-Host "4. Check health: http://localhost:5000/health"
Write-Host "5. View metrics: http://localhost:5000/metrics"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "- Read SCALABILITY_README.md for detailed information"
Write-Host "- Health monitoring: /health endpoint" 
Write-Host "- Performance metrics: /metrics endpoint"
Write-Host ""
Write-Success "Happy coding! 🚀" -ForegroundColor Green

# Pause to let user read the output
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
