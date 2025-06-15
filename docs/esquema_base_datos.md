# Esquema de Base de Datos - PowerCars Survey System

## Diagrama Entidad-Relación

### Entidades Principales

#### 1. Users (Usuarios del Sistema)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Survey_Templates (Plantillas de Encuesta)
```sql
CREATE TABLE survey_templates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    version VARCHAR(10) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. Questions (Preguntas)
```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    survey_template_id INTEGER REFERENCES survey_templates(id),
    section_name VARCHAR(100) NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- text, textarea, select, radio, checkbox, scale
    options JSONB, -- Para opciones de selección múltiple
    is_required BOOLEAN DEFAULT FALSE,
    order_index INTEGER NOT NULL,
    validation_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. Survey_Responses (Respuestas de Encuesta)
```sql
CREATE TABLE survey_responses (
    id SERIAL PRIMARY KEY,
    survey_template_id INTEGER REFERENCES survey_templates(id),
    employee_name VARCHAR(100),
    employee_area VARCHAR(100),
    work_experience VARCHAR(50),
    is_anonymous BOOLEAN DEFAULT FALSE,
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'in_progress' -- in_progress, completed, abandoned
);
```

#### 5. Question_Answers (Respuestas Individuales)
```sql
CREATE TABLE question_answers (
    id SERIAL PRIMARY KEY,
    survey_response_id INTEGER REFERENCES survey_responses(id),
    question_id INTEGER REFERENCES questions(id),
    answer_text TEXT,
    answer_numeric INTEGER,
    answer_json JSONB, -- Para respuestas complejas
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. Analytics_Cache (Cache de Analíticas)
```sql
CREATE TABLE analytics_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. Audit_Log (Log de Auditoría)
```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Índices para Performance

```sql
-- Índices principales
CREATE INDEX idx_survey_responses_template_id ON survey_responses(survey_template_id);
CREATE INDEX idx_survey_responses_completed_at ON survey_responses(completed_at);
CREATE INDEX idx_survey_responses_status ON survey_responses(status);

CREATE INDEX idx_question_answers_response_id ON question_answers(survey_response_id);
CREATE INDEX idx_question_answers_question_id ON question_answers(question_id);

CREATE INDEX idx_questions_template_id ON questions(survey_template_id);
CREATE INDEX idx_questions_section_order ON questions(section_name, order_index);

CREATE INDEX idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);

CREATE INDEX idx_audit_log_user_action ON audit_log(user_id, action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
```

## Datos de Ejemplo

### Usuarios Iniciales
```sql
INSERT INTO users (username, email, password_hash, role, full_name) VALUES
('admin', 'admin@powercars.com', '$2b$12$...', 'admin', 'Administrador Sistema'),
('manager', 'manager@powercars.com', '$2b$12$...', 'manager', 'Gerente General');
```

### Plantilla de Encuesta PowerCars
```sql
INSERT INTO survey_templates (title, description, created_by) VALUES
('Encuesta Organizacional PowerCars 2025', 'Encuesta para mapear la estructura organizacional y identificar áreas de mejora', 1);
```

### Preguntas de Ejemplo (Sección 1)
```sql
INSERT INTO questions (survey_template_id, section_name, question_text, question_type, options, is_required, order_index) VALUES
(1, 'Información Personal', '¿Cuál es tu nombre completo?', 'text', NULL, TRUE, 1),
(1, 'Información Personal', '¿En qué área trabajas?', 'select', 
 '["Mecánica", "Administración", "Ventas", "Limpieza", "Seguridad", "Otro"]', TRUE, 2),
(1, 'Información Personal', '¿Cuánto tiempo llevas trabajando en PowerCars?', 'radio',
 '["Menos de 6 meses", "6-12 meses", "1-3 años", "3-5 años", "Más de 5 años"]', TRUE, 3),
(1, 'Rol y Responsabilidades', '¿Cuál es tu rol específico en PowerCars?', 'text', NULL, TRUE, 4),
(1, 'Rol y Responsabilidades', '¿Quién es tu líder directo o supervisor inmediato?', 'text', NULL, TRUE, 5),
(1, 'Ambiente Laboral', '¿Cómo calificarías el ambiente laboral en PowerCars?', 'radio',
 '["Excelente", "Muy bueno", "Bueno", "Regular", "Malo"]', TRUE, 6);
```

## Consultas de Analíticas Comunes

### 1. Distribución por Área
```sql
SELECT 
    JSON_EXTRACT_PATH_TEXT(qa.answer_json, 'value') as area,
    COUNT(*) as total_empleados
FROM question_answers qa
JOIN questions q ON qa.question_id = q.id
WHERE q.question_text LIKE '%área trabajas%'
GROUP BY area
ORDER BY total_empleados DESC;
```

### 2. Satisfacción Laboral Promedio
```sql
SELECT 
    AVG(
        CASE qa.answer_text
            WHEN 'Excelente' THEN 5
            WHEN 'Muy bueno' THEN 4
            WHEN 'Bueno' THEN 3
            WHEN 'Regular' THEN 2
            WHEN 'Malo' THEN 1
        END
    ) as satisfaccion_promedio
FROM question_answers qa
JOIN questions q ON qa.question_id = q.id
WHERE q.question_text LIKE '%ambiente laboral%';
```

### 3. Estructura Jerárquica
```sql
SELECT 
    supervisor.answer_text as supervisor,
    COUNT(*) as empleados_a_cargo
FROM question_answers empleado
JOIN question_answers supervisor ON empleado.survey_response_id = supervisor.survey_response_id
JOIN questions q1 ON empleado.question_id = q1.id
JOIN questions q2 ON supervisor.question_id = q2.id
WHERE q1.question_text LIKE '%rol específico%'
AND q2.question_text LIKE '%líder directo%'
GROUP BY supervisor.answer_text
ORDER BY empleados_a_cargo DESC;
```

## Triggers y Funciones

### Trigger para Audit Log
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (action, table_name, record_id, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (action, table_name, record_id, old_values, new_values)
        VALUES (TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (action, table_name, record_id, old_values)
        VALUES (TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas importantes
CREATE TRIGGER audit_survey_responses
    AFTER INSERT OR UPDATE OR DELETE ON survey_responses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Función para Limpiar Cache Expirado
```sql
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM analytics_cache WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

