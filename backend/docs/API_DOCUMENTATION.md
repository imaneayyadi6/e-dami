# E-DAMI API Documentation

## Overview
E-DAMI is a document management and approval system for organizational workflows. This API provides endpoints for user management, document processing, and approval workflows.

## Base URL
- **Development**: `http://localhost:4000`
- **Production**: `https://e-dami.snrt.ma`

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers

## Health Checks
- **Basic Health**: `GET /health`
- **Detailed Health**: `GET /health/detailed`
- **Readiness**: `GET /ready` (for Kubernetes)
- **Liveness**: `GET /live` (for Kubernetes)

## API Endpoints

### Authentication
- `POST /api/utilisateurs/login` - User login
- `POST /api/utilisateurs/register` - User registration
- `POST /api/utilisateurs/validatetoken` - Validate JWT token
- `POST /api/utilisateurs/setpassword` - Set password
- `POST /api/utilisateurs/changepassword` - Change password

### Users
- `GET /api/utilisateurs` - Get all users (Admin only)
- `POST /api/utilisateurs` - Create user (Admin only)
- `GET /api/utilisateurs/:id` - Get user by ID
- `PUT /api/utilisateurs/infos/:id` - Update user info (Admin only)
- `PUT /api/utilisateurs/password/:id` - Update user password
- `DELETE /api/utilisateurs/:id` - Deactivate user (Admin only)

### Directions
- `GET /api/directions` - Get all directions
- `POST /api/directions` - Create direction (Admin only)
- `GET /api/directions/:id` - Get direction by ID
- `PUT /api/directions/:id` - Update direction (Admin only)
- `DELETE /api/directions/:id` - Delete direction (Admin only)

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service (Admin only)
- `GET /api/services/:id` - Get service by ID
- `PUT /api/services/:id` - Update service (Admin only)
- `DELETE /api/services/:id` - Delete service (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Admin only)
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Subcategories
- `GET /api/souscategories` - Get all subcategories
- `POST /api/souscategories` - Create subcategory (Admin only)
- `GET /api/souscategories/:id` - Get subcategory by ID
- `PUT /api/souscategories/:id` - Update subcategory (Admin only)
- `DELETE /api/souscategories/:id` - Delete subcategory (Admin only)

### Options
- `GET /api/options` - Get all options
- `POST /api/options` - Create option (Admin only)
- `GET /api/options/:id` - Get option by ID
- `PUT /api/options/:id` - Update option (Admin only)
- `DELETE /api/options/:id` - Delete option (Admin only)

### Demands (Demandes)
- `GET /api/demandes` - Get all demands
- `POST /api/demandes` - Create demand
- `GET /api/demandes/:id` - Get demand by ID
- `PUT /api/demandes/:id` - Update demand
- `POST /api/demandes/:id/process` - Process demand (approve/reject)
- `POST /api/demandes/:id/refuse` - Refuse demand with file upload

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

### Charts & Analytics
- `GET /api/charts/demandes` - Get demand statistics
- `GET /api/charts/utilisateurs` - Get user statistics
- `GET /api/charts/performance` - Get performance metrics

### File Generation
- `POST /api/generate/pdf` - Generate PDF from demand
- `POST /api/generate/excel` - Generate Excel report

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Non autorisé, pas de token"
}
```

### 403 Forbidden
```json
{
  "error": "Non autorisé en tant que créateur"
}
```

### 404 Not Found
```json
{
  "error": "utilisateur introuvable !"
}
```

### 429 Too Many Requests
```json
{
  "error": "Trop de requêtes depuis cette IP, veuillez réessayer plus tard."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

## Data Models

### User (Utilisateur)
```json
{
  "id": "string",
  "nom": "string",
  "prenom": "string",
  "email": "string",
  "matricule": "number",
  "fonction": "string",
  "gsm": "string",
  "isActive": "boolean",
  "firstTimeLogin": "boolean",
  "roles": ["array of role objects"],
  "service": "objectId",
  "direction": "objectId",
  "departement": "objectId",
  "isChefDeService": "boolean",
  "isDirecteur": "boolean"
}
```

### Demand (Demande)
```json
{
  "id": "string",
  "dateDemande": "date",
  "option": "objectId",
  "demandeur": "objectId",
  "contenu": "string",
  "status": "string",
  "traitement": ["array of treatment objects"]
}
```

## WebSocket Events
The API supports real-time notifications via Socket.IO:

- `notification` - New notification received
- `demande_updated` - Demand status updated
- `user_online` - User came online
- `user_offline` - User went offline

## File Upload
- **Max file size**: 10MB
- **Allowed types**: PDF, DOC, DOCX, images (JPG, PNG, GIF, BMP, WEBP)
- **Upload endpoint**: `POST /api/demandes/:id/refuse` (with file)

## Security Features
- JWT authentication with blacklist
- Rate limiting (100 req/15min per IP)
- Input validation and sanitization
- CORS protection
- Security headers (Helmet.js)
- Request size limits (10MB)
- File type validation

## Monitoring
- Health check endpoints for monitoring systems
- Structured logging with Winston
- Request/response logging
- Error tracking
- Performance metrics

## Development
- **API Documentation**: Available at `/api-docs` (Swagger UI)
- **Environment**: Development/Production modes
- **Logging**: Console + File logging
- **Database**: MongoDB with Mongoose ODM
