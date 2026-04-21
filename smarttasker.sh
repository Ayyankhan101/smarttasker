#!/bin/bash

case "$1" in
    start)
        echo "Starting SmartTasker..."
        cd /home/ayyan/SE-ASSIGENMENT/smarttasker/backend && node src/index.js > /tmp/smarttasker-backend.log 2>&1 &
        echo $! > /tmp/smarttasker-backend.pid
        sleep 1
        
        cd /home/ayyan/SE-ASSIGENMENT/smarttasker/frontend && npm run dev -- --host 0.0.0.0 > /tmp/smarttasker-frontend.log 2>&1 &
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
        exit 1
        ;;
esac