# E-DAMI Deployment Guide

## Prerequisites
- Node.js 18+ 
- MongoDB 5.0+
- PM2 (for production)
- Nginx (for reverse proxy)

## Environment Setup

### 1. Environment Variables
Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=production
PORT=4000
SERVER_URL=https://e-dami.snrt.ma
CLIENT_ADDRESS=https://e-dami.snrt.ma

# Database
MONGO_URI=mongodb://localhost:27017/e-dami
# or for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/e-dami

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
ZIMBRA_ADDRESS=smtp.snrt.com
ZIMBRA_USERNAME=your-email@snrt.com
ZIMBRA_MOTDEPASSE=your-email-password

# Logging
LOG_LEVEL=info
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

## Production Deployment

### 1. Using PM2 (Recommended)

Install PM2 globally:
```bash
npm install -g pm2
```

Create PM2 ecosystem file (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'e-dami-api',
    script: 'backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

Start the application:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 2. Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm ci && npm run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start application
CMD ["node", "backend/server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/e-dami
    depends_on:
      - mongo
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    restart: unless-stopped

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
```

Deploy with Docker:
```bash
docker-compose up -d
```

### 3. Nginx Configuration

Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream e_dami {
        server app:4000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name e-dami.snrt.ma;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name e-dami.snrt.ma;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # File upload size
        client_max_body_size 10M;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://e_dami;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Socket.IO
        location /socket.io/ {
            proxy_pass http://e_dami;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Static files
        location /uploads/ {
            alias /app/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Frontend
        location / {
            proxy_pass http://e_dami;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Database Setup

### 1. MongoDB Setup
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
use e-dami
db.createUser({
  user: "e-dami-user",
  pwd: "secure-password",
  roles: ["readWrite"]
})
```

### 2. Database Indexes
The application will automatically create indexes on startup. For manual creation:

```bash
mongo e-dami
db.utilisateurs.createIndex({ "email": 1 })
db.utilisateurs.createIndex({ "matricule": 1 })
db.demandes.createIndex({ "demandeur": 1 })
db.demandes.createIndex({ "status": 1 })
```

## Monitoring & Logging

### 1. Log Management
```bash
# View logs
pm2 logs e-dami-api

# Log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 2. Health Monitoring
- **Health Check**: `GET /health`
- **Detailed Health**: `GET /health/detailed`
- **Readiness**: `GET /ready`
- **Liveness**: `GET /live`

### 3. Monitoring Tools
- **PM2 Monitoring**: `pm2 monit`
- **Log Files**: `./logs/` directory
- **API Documentation**: `/api-docs`

## Backup Strategy

### 1. Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db e-dami --out /backup/mongodb/$DATE
tar -czf /backup/mongodb/e-dami_$DATE.tar.gz /backup/mongodb/$DATE
rm -rf /backup/mongodb/$DATE
```

### 2. File Backup
```bash
# Backup uploads directory
tar -czf /backup/uploads/uploads_$(date +%Y%m%d).tar.gz uploads/
```

## Security Checklist

- [ ] Environment variables secured
- [ ] JWT secret is strong and unique
- [ ] Database authentication enabled
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] File upload restrictions in place
- [ ] Regular security updates
- [ ] Backup strategy implemented

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :4000
   sudo kill -9 <PID>
   ```

2. **MongoDB connection failed**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **Permission denied on uploads**
   ```bash
   sudo chown -R node:node uploads/
   sudo chmod -R 755 uploads/
   ```

4. **Memory issues**
   ```bash
   pm2 restart e-dami-api
   # or increase memory limit in ecosystem.config.js
   ```

### Log Analysis
```bash
# Check error logs
tail -f logs/error.log

# Check combined logs
tail -f logs/combined.log

# Check PM2 logs
pm2 logs e-dami-api --lines 100
```

## Performance Optimization

1. **Enable Gzip compression** (already configured)
2. **Use CDN for static assets**
3. **Implement Redis caching** (optional)
4. **Database query optimization**
5. **Load balancing** (for high traffic)

## Maintenance

### Daily
- Check application health
- Monitor disk space
- Review error logs

### Weekly
- Database backup verification
- Security updates
- Performance monitoring

### Monthly
- Log file cleanup
- Database optimization
- Security audit
