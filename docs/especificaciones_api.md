# Especificaciones de API - PowerCars Survey System

## Endpoints de Autenticación

### POST /api/auth/login
**Descripción:** Autenticación de usuarios administradores
```json
{
  "method": "POST",
  "endpoint": "/api/auth/login",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "username": "string",
    "password": "string"
  },
  "responses": {
    "200": {
      "access_token": "string",
      "refresh_token": "string",
      "user": {
        "id": "integer",
        "username": "string",
        "role": "string",
        "full_name": "string"
      }
    },
    "401": {
      "error": "Credenciales inválidas"
    }
  }
}
```

### POST /api/auth/refresh
**Descripción:** Renovar token de acceso
```json
{
  "method": "POST",
  "endpoint": "/api/auth/refresh",
  "headers": {
    "Authorization": "Bearer <refresh_token>"
  },
  "responses": {
    "200": {
      "access_token": "string"
    }
  }
}
```

## Endpoints de Encuesta

### GET /api/survey/template
**Descripción:** Obtener plantilla de encuesta activa
```json
{
  "method": "GET",
  "endpoint": "/api/survey/template",
  "responses": {
    "200": {
      "id": "integer",
      "title": "string",
      "description": "string",
      "sections": [
        {
          "name": "string",
          "questions": [
            {
              "id": "integer",
              "text": "string",
              "type": "string",
              "options": ["string"],
              "required": "boolean",
              "validation": "object"
            }
          ]
        }
      ]
    }
  }
}
```

### POST /api/survey/start
**Descripción:** Iniciar nueva respuesta de encuesta
```json
{
  "method": "POST",
  "endpoint": "/api/survey/start",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "employee_name": "string",
    "employee_area": "string",
    "work_experience": "string",
    "is_anonymous": "boolean"
  },
  "responses": {
    "201": {
      "response_id": "integer",
      "session_token": "string"
    }
  }
}
```

### POST /api/survey/answer
**Descripción:** Guardar respuesta a pregunta específica
```json
{
  "method": "POST",
  "endpoint": "/api/survey/answer",
  "headers": {
    "Content-Type": "application/json",
    "X-Session-Token": "string"
  },
  "body": {
    "response_id": "integer",
    "question_id": "integer",
    "answer": "string|number|object"
  },
  "responses": {
    "200": {
      "success": true,
      "message": "Respuesta guardada"
    }
  }
}
```

### POST /api/survey/complete
**Descripción:** Marcar encuesta como completada
```json
{
  "method": "POST",
  "endpoint": "/api/survey/complete",
  "headers": {
    "X-Session-Token": "string"
  },
  "body": {
    "response_id": "integer"
  },
  "responses": {
    "200": {
      "success": true,
      "message": "Encuesta completada exitosamente"
    }
  }
}
```

## Endpoints de Dashboard (Protegidos)

### GET /api/dashboard/stats
**Descripción:** Estadísticas generales del dashboard
```json
{
  "method": "GET",
  "endpoint": "/api/dashboard/stats",
  "headers": {
    "Authorization": "Bearer <access_token>"
  },
  "responses": {
    "200": {
      "total_responses": "integer",
      "completed_responses": "integer",
      "completion_rate": "float",
      "avg_completion_time": "integer",
      "responses_by_area": [
        {
          "area": "string",
          "count": "integer"
        }
      ],
      "responses_by_experience": [
        {
          "experience": "string",
          "count": "integer"
        }
      ]
    }
  }
}
```

### GET /api/dashboard/satisfaction
**Descripción:** Análisis de satisfacción laboral
```json
{
  "method": "GET",
  "endpoint": "/api/dashboard/satisfaction",
  "headers": {
    "Authorization": "Bearer <access_token>"
  },
  "responses": {
    "200": {
      "overall_satisfaction": {
        "average": "float",
        "distribution": [
          {
            "rating": "string",
            "count": "integer",
            "percentage": "float"
          }
        ]
      },
      "satisfaction_by_area": [
        {
          "area": "string",
          "average": "float",
          "count": "integer"
        }
      ],
      "satisfaction_trends": [
        {
          "date": "string",
          "average": "float"
        }
      ]
    }
  }
}
```

### GET /api/dashboard/hierarchy
**Descripción:** Análisis de estructura jerárquica
```json
{
  "method": "GET",
  "endpoint": "/api/dashboard/hierarchy",
  "headers": {
    "Authorization": "Bearer <access_token>"
  },
  "responses": {
    "200": {
      "organizational_chart": [
        {
          "supervisor": "string",
          "direct_reports": [
            {
              "name": "string",
              "role": "string",
              "area": "string"
            }
          ],
          "span_of_control": "integer"
        }
      ],
      "management_levels": "integer",
      "areas_without_clear_hierarchy": ["string"]
    }
  }
}
```

### GET /api/dashboard/issues
**Descripción:** Análisis de problemas e impedimentos
```json
{
  "method": "GET",
  "endpoint": "/api/dashboard/issues",
  "headers": {
    "Authorization": "Bearer <access_token>"
  },
  "responses": {
    "200": {
      "common_impediments": [
        {
          "impediment": "string",
          "frequency": "integer",
          "percentage": "float",
          "affected_areas": ["string"]
        }
      ],
      "improvement_suggestions": [
        {
          "suggestion": "string",
          "frequency": "integer",
          "category": "string"
        }
      ],
      "training_needs": [
        {
          "training_type": "string",
          "requests": "integer",
          "areas": ["string"]
        }
      ]
    }
  }
}
```

## Endpoints de Reportes

### GET /api/reports/summary
**Descripción:** Reporte ejecutivo resumido
```json
{
  "method": "GET",
  "endpoint": "/api/reports/summary",
  "headers": {
    "Authorization": "Bearer <access_token>"
  },
  "query_params": {
    "format": "json|pdf|excel",
    "date_from": "YYYY-MM-DD",
    "date_to": "YYYY-MM-DD"
  },
  "responses": {
    "200": {
      "report_data": "object",
      "download_url": "string (if format != json)"
    }
  }
}
```

### GET /api/reports/detailed
**Descripción:** Reporte detallado por secciones
```json
{
  "method": "GET",
  "endpoint": "/api/reports/detailed",
  "headers": {
    "Authorization": "Bearer <access_token>"
  },
  "query_params": {
    "section": "string",
    "area": "string",
    "format": "json|pdf|excel"
  },
  "responses": {
    "200": {
      "section_analysis": "object",
      "recommendations": ["string"],
      "action_items": ["string"]
    }
  }
}
```

### GET /api/reports/responses
**Descripción:** Exportar respuestas individuales (anonimizadas)
```json
{
  "method": "GET",
  "endpoint": "/api/reports/responses",
  "headers": {
    "Authorization": "Bearer <access_token>"
  },
  "query_params": {
    "format": "csv|excel|json",
    "include_personal_data": "boolean",
    "area": "string"
  },
  "responses": {
    "200": {
      "download_url": "string",
      "total_records": "integer"
    }
  }
}
```

## Endpoints de Administración

### GET /api/admin/users
**Descripción:** Listar usuarios del sistema
```json
{
  "method": "GET",
  "endpoint": "/api/admin/users",
  "headers": {
    "Authorization": "Bearer <access_token>"
  },
  "responses": {
    "200": {
      "users": [
        {
          "id": "integer",
          "username": "string",
          "email": "string",
          "role": "string",
          "is_active": "boolean",
          "created_at": "string"
        }
      ]
    }
  }
}
```

### POST /api/admin/users
**Descripción:** Crear nuevo usuario administrador
```json
{
  "method": "POST",
  "endpoint": "/api/admin/users",
  "headers": {
    "Authorization": "Bearer <access_token>",
    "Content-Type": "application/json"
  },
  "body": {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string",
    "full_name": "string"
  },
  "responses": {
    "201": {
      "user": "object",
      "message": "Usuario creado exitosamente"
    }
  }
}
```

## Códigos de Error Comunes

```json
{
  "error_codes": {
    "400": "Bad Request - Datos inválidos",
    "401": "Unauthorized - Token inválido o expirado",
    "403": "Forbidden - Sin permisos suficientes",
    "404": "Not Found - Recurso no encontrado",
    "409": "Conflict - Recurso ya existe",
    "422": "Unprocessable Entity - Error de validación",
    "429": "Too Many Requests - Rate limit excedido",
    "500": "Internal Server Error - Error del servidor"
  }
}
```

## Rate Limiting

```json
{
  "rate_limits": {
    "/api/survey/*": "100 requests per hour per IP",
    "/api/dashboard/*": "1000 requests per hour per user",
    "/api/reports/*": "50 requests per hour per user",
    "/api/auth/login": "10 requests per 15 minutes per IP"
  }
}
```

