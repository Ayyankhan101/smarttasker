#!/bin/bash

# Get script directory (portable - works from any location)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

case "$1" in
    start)
        echo "Checking dependencies..."
        
        # Install backend deps if node_modules missing
        if [ ! -d "$BACKEND_DIR/node_modules" ]; then
            echo "Installing backend dependencies..."
            cd "$BACKEND_DIR" && npm install
        fi
        
        # Install frontend deps if node_modules missing
        if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
            echo "Installing frontend dependencies..."
            cd "$FRONTEND_DIR" && npm install
        fi
        
        echo "Starting SmartTasker..."
        cd "$BACKEND_DIR" && node src/index.js > /tmp/smarttasker-backend.log 2>&1 &
        echo $! > /tmp/smarttasker-backend.pid
        sleep 1
        
        cd "$FRONTEND_DIR" && npm run dev -- --host 0.0.0.0 > /tmp/smarttasker-frontend.log 2>&1 &
        echo $! > /tmp/smarttasker-frontend.pid
        sleep 2
        
        echo "SmartTasker started!"
        echo "  Backend: http://localhost:5000"
        echo "  Frontend: http://localhost:5173"
        ;;
    stop)
        echo "Stopping SmartTasker..."
        
        if [ -f /tmp/smarttasker-backend.pid ]; then
            kill $(cat /tmp/smarttasker-backend.pid) 2>/dev/null
            rm /tmp/smarttasker-backend.pid
        fi
        
        if [ -f /tmp/smarttasker-frontend.pid ]; then
            kill $(cat /tmp/smarttasker-frontend.pid) 2>/dev/null
            rm /tmp/smarttasker-frontend.pid
        fi
        
        pkill -f "node src/index.js" 2>/dev/null
        pkill -f "vite" 2>/dev/null
        
        echo "SmartTasker stopped!"
        ;;
    restart)
        $0 stop
        sleep 1
        $0 start
        ;;
    status)
        if pgrep -f "node src/index.js" > /dev/null; then
            echo "Backend: Running"
        else
            echo "Backend: Stopped"
        fi
        
        if pgrep -f "vite" > /dev/null; then
            echo "Frontend: Running"
        else
            echo "Frontend: Stopped"
        fi
        ;;
    logs)
        echo "=== Backend Logs ==="
        tail -20 /tmp/smarttasker-backend.log 2>/dev/null || echo "No backend logs"
        echo ""
        echo "=== Frontend Logs ==="
        tail -20 /tmp/smarttasker-frontend.log 2>/dev/null || echo "No frontend logs"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start    - Start both backend and frontend (installs deps if needed)"
        echo "  stop     - Stop both servers"
        echo "  restart  - Restart all servers"
        echo "  status   - Check if servers are running"
        echo "  logs     - View server logs"
        exit 1
        ;;
esac