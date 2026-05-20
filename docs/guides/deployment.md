# Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing: `npm test`
- [ ] Code linting clean: `npm run lint`
- [ ] Environment variables configured
- [ ] Database migrations completed
- [ ] API documentation updated
- [ ] Security vulnerabilities scanned: `npm audit`

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=project_bidding_db
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret
API_URL=https://your-api-domain.com
CORS_ORIGIN=https://your-frontend-domain.com
LOG_LEVEL=info
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t apl-bidding:latest .
```

### Push to Registry

```bash
docker tag apl-bidding:latest your-registry/apl-bidding:latest
docker push your-registry/apl-bidding:latest
```

### Deploy Using Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

## Kubernetes Deployment

### Create Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: apl-bidding-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: apl-bidding
  template:
    metadata:
      labels:
        app: apl-bidding
    spec:
      containers:
      - name: apl-bidding
        image: your-registry/apl-bidding:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: apl-config
              key: db-host
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
```

### Create Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: apl-bidding-service
spec:
  selector:
    app: apl-bidding
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Cloud Deployment

### AWS Elastic Beanstalk

```bash
# Initialize EB application
eb init -p node.js-14 apl-bidding

# Deploy
eb create apl-bidding-env
eb deploy
```

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create apl-bidding

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main
```

### Google Cloud Run

```bash
# Build and deploy
gcloud run deploy apl-bidding \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production
```

## Database Migration in Production

### Before Deployment

```bash
# Backup current database
pg_dump project_bidding_db > backup.sql

# Test migrations in staging
npm run migrate:up -- --dry-run
```

### During Deployment

```bash
# Run migrations
npm run migrate:up

# Verify migration
npm run migrate:status
```

### Rollback if Needed

```bash
# Restore from backup
psql project_bidding_db < backup.sql

# Or rollback migrations
npm run migrate:down
```

## Monitoring & Logging

### Application Logs

```bash
# View logs
docker logs apl-bidding-container

# Stream logs
docker logs -f apl-bidding-container
```

### Health Check

```bash
curl https://your-api-domain.com/health
```

### Performance Monitoring

- Set up APM (Application Performance Monitoring)
- Configure New Relic or DataDog for monitoring
- Set up alerts for critical metrics

## Scaling Strategies

### Horizontal Scaling

```bash
# Docker Swarm
docker service create --replicas 3 apl-bidding

# Kubernetes
kubectl scale deployment apl-bidding --replicas=5
```

### Load Balancing

- Configure Nginx or HAProxy
- Set up auto-scaling based on CPU/Memory metrics
- Use health checks for automatic failover

## Security Best Practices

1. **Use HTTPS only** - Enable SSL/TLS certificates
2. **Implement rate limiting** - Prevent abuse and DDoS
3. **Regular security audits** - Run `npm audit` regularly
4. **Keep dependencies updated** - Run `npm update`
5. **Use secrets management** - Store sensitive data securely
6. **Enable CORS properly** - Only allow trusted domains
7. **Implement authentication** - Use JWT with secure tokens
8. **Database hardening** - Use strong passwords and encryption

## Rollback Procedure

```bash
# Identify previous version
docker images | grep apl-bidding

# Rollback to previous image
docker run -d apl-bidding:previous-tag

# Or with Docker Compose
docker-compose -f docker-compose.v1.yml up -d
```

## Post-Deployment Verification

- [ ] All endpoints responding correctly
- [ ] Database connections working
- [ ] Authentication functioning
- [ ] API documentation accessible
- [ ] Monitoring and alerts active
- [ ] Backup procedures verified

## Support & Troubleshooting

For deployment issues, check:
- Application logs
- Database connectivity
- Network configuration
- Environment variables
- API endpoint health

## Contact & Escalation

- Development Lead: [Email]
- DevOps Team: [Email]
- On-call Support: [Phone/Slack]
