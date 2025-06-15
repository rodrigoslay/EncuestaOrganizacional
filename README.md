# EncuestaOrganizacional
Encuesta Organizacional para PowerCars
=======
# PowerCars - Sistema de Encuestas Organizacionales

## 📋 Descripción del Proyecto

Sistema web completo para PowerCars - Taller Mecánico que permite realizar encuestas organizacionales y generar análisis detallados para crear un organigrama estructurado y mejorar el ambiente laboral.

## 🚀 Aplicación en Producción

### URLs de Acceso
- **Frontend (Aplicación Principal):** 
- **Backend (API):** 

### Credenciales de Administrador
- **Usuario:** `admin`
- **Contraseña:** `admin123`

## 🏗️ Arquitectura del Sistema

### Frontend
- **Framework:** React 18 + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Routing:** React Router DOM

### Backend
- **Framework:** Flask + Python 3.11
- **Base de Datos:** SQLite + SQLAlchemy
- **Autenticación:** JWT + bcrypt
- **CORS:** Flask-CORS

## 📁 Estructura del Proyecto

```
powercars-project/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── contexts/        # Contextos de React
│   │   ├── pages/           # Páginas principales
│   │   └── App.jsx          # Componente principal
│   ├── package.json
│   └── vite.config.js
├── backend/                 # API Flask
│   ├── src/
│   │   ├── models/          # Modelos de base de datos
│   │   ├── routes/          # Rutas de la API
│   │   └── main.py          # Aplicación principal
│   ├── requirements.txt
│   └── venv/
├── docs/                    # Documentación
│   ├── documentacion_final_powercars.md
│   ├── arquitectura_tecnica.md
│   ├── esquema_base_datos.md
│   └── especificaciones_api.md
└── README.md
```

## 🔧 Instalación y Configuración

### Prerrequisitos
- Node.js 20+
- Python 3.11+
- Git

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

### Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python src/main.py
```

## 📊 Funcionalidades Principales

### 1. Sistema de Encuestas
- ✅ Formulario paso a paso con 7 secciones temáticas
- ✅ Opción de participación anónima
- ✅ Validación de datos en tiempo real
- ✅ Guardado automático de progreso

### 2. Dashboard Administrativo
- ✅ Estadísticas en tiempo real
- ✅ Visualizaciones interactivas con gráficos
- ✅ Análisis por área y experiencia
- ✅ Métricas de satisfacción laboral

### 3. Sistema de Reportes
- ✅ Reporte ejecutivo automatizado
- ✅ Análisis detallado por secciones
- ✅ Exportación en múltiples formatos
- ✅ Generación de recomendaciones

### 4. Seguridad y Autenticación
- ✅ Sistema de login para administradores
- ✅ Tokens JWT para sesiones seguras
- ✅ Protección de rutas administrativas
- ✅ Encriptación de contraseñas

## 📝 Cuestionario Organizacional

### Secciones de la Encuesta
1. **Información Personal** - Datos básicos del empleado
2. **Rol y Funciones** - Descripción del puesto actual
3. **Estructura Organizacional** - Jerarquía y supervisión
4. **Impedimentos y Mejoras** - Obstáculos y sugerencias
5. **Ambiente Laboral** - Satisfacción y clima organizacional
6. **Condiciones Laborales** - Horarios, beneficios y recursos
7. **Observaciones Adicionales** - Comentarios libres

## 🎯 Beneficios del Sistema

### Para la Empresa
- **Organigrama Documentado:** Primera estructura organizacional formal
- **Identificación de Problemas:** Detección temprana de impedimentos
- **Mejora Continua:** Base de datos para decisiones informadas
- **Ambiente Laboral:** Medición objetiva de satisfacción

### Para los Empleados
- **Voz y Participación:** Canal formal para expresar opiniones
- **Anonimato Garantizado:** Protección de la privacidad
- **Transparencia:** Acceso a resultados agregados
- **Mejoras Tangibles:** Implementación de sugerencias

## 📈 Métricas de Éxito

### Objetivos de Participación
- **Tasa de respuesta objetivo:** 80%
- **Tiempo promedio de completado:** 15-20 minutos
- **Tasa de abandono objetivo:** <10%

### Métricas de Satisfacción
- **Escala de evaluación:** 1-5 para ambiente laboral
- **Índice de satisfacción general**
- **Distribución por áreas de trabajo**

## 🚀 Plan de Implementación

### Fase 1: Lanzamiento (Semanas 1-2)
1. Comunicación interna sobre el proyecto
2. Capacitación a supervisores
3. Lanzamiento piloto con un área
4. Ajustes basados en feedback inicial

### Fase 2: Despliegue Completo (Semanas 3-4)
1. Extensión a todas las áreas
2. Monitoreo de participación
3. Soporte técnico continuo
4. Recordatorios y seguimiento

### Fase 3: Análisis y Acción (Semanas 5-6)
1. Análisis de resultados completos
2. Generación de reportes ejecutivos
3. Presentación a la dirección
4. Plan de acción basado en hallazgos

## 🔒 Seguridad

- **Autenticación JWT** para sesiones seguras
- **Encriptación bcrypt** para contraseñas
- **Protección CORS** configurada
- **Validación de datos** en frontend y backend
- **Sesiones de encuesta** con tokens únicos

## 📚 Documentación Adicional

- [Análisis del Proyecto](docs/powercars_analysis.md)
- [Arquitectura Técnica](docs/arquitectura_tecnica.md)
- [Esquema de Base de Datos](docs/esquema_base_datos.md)
- [Especificaciones de API](docs/especificaciones_api.md)
- [Cuestionario Completo](docs/cuestionario_powercars.md)
- [Documentación Final](docs/documentacion_final_powercars.md)

## 🤝 Contribución

Este proyecto fue desarrollado como una solución integral para PowerCars - Taller Mecánico. Para contribuciones o mejoras:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## 📄 Licencia

Este proyecto está desarrollado para uso interno de PowerCars - Taller Mecánico.

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

---

**Desarrollado por:** Slay Multimedios|  
**Fecha:** Junio 2025  
**Versión:** 1.0.0  
**Estado:** ✅ En Producción

>>>>>>> f4ea5f1 (Initial commit: PowerCars Sistema de Encuestas Organizacionales)
