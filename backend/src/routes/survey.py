from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models.user import SurveyTemplate, Question, SurveyResponse, QuestionAnswer
from src.models.database import db
import json

survey_bp = Blueprint('survey', __name__)

@survey_bp.route('/template', methods=['GET'])
def get_survey_template():
    try:
        # Obtener la plantilla activa
        template = SurveyTemplate.query.filter_by(is_active=True).first()
        
        if not template:
            # Crear plantilla por defecto si no existe
            template = create_default_template()
        
        # Obtener preguntas organizadas por sección
        questions = Question.query.filter_by(survey_template_id=template.id).order_by(Question.order_index).all()
        
        # Organizar preguntas por sección
        sections = {}
        for question in questions:
            section_name = question.section_name
            if section_name not in sections:
                sections[section_name] = []
            sections[section_name].append(question.to_dict())
        
        # Convertir a formato de lista
        sections_list = [{'name': name, 'questions': questions} for name, questions in sections.items()]
        
        return jsonify({
            'id': template.id,
            'title': template.title,
            'description': template.description,
            'sections': sections_list
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@survey_bp.route('/start', methods=['POST'])
def start_survey():
    try:
        data = request.get_json()
        
        template = SurveyTemplate.query.filter_by(is_active=True).first()
        if not template:
            return jsonify({'error': 'No hay plantilla de encuesta activa'}), 404
        
        # Crear nueva respuesta
        response = SurveyResponse(
            survey_template_id=template.id,
            employee_name=data.get('employee_name'),
            employee_area=data.get('employee_area'),
            work_experience=data.get('work_experience'),
            is_anonymous=data.get('is_anonymous', False),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        
        db.session.add(response)
        db.session.commit()
        
        return jsonify({
            'response_id': response.id,
            'session_token': f"session_{response.id}"
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@survey_bp.route('/answer', methods=['POST'])
def save_answer():
    try:
        data = request.get_json()
        response_id = data.get('response_id')
        question_id = data.get('question_id')
        answer = data.get('answer')
        
        # Verificar que la respuesta existe
        response = SurveyResponse.query.get(response_id)
        if not response:
            return jsonify({'error': 'Respuesta no encontrada'}), 404
        
        # Verificar que la pregunta existe
        question = Question.query.get(question_id)
        if not question:
            return jsonify({'error': 'Pregunta no encontrada'}), 404
        
        # Buscar respuesta existente o crear nueva
        existing_answer = QuestionAnswer.query.filter_by(
            survey_response_id=response_id,
            question_id=question_id
        ).first()
        
        if existing_answer:
            # Actualizar respuesta existente
            if isinstance(answer, (dict, list)):
                existing_answer.answer_json = answer
            elif isinstance(answer, (int, float)):
                existing_answer.answer_numeric = answer
            else:
                existing_answer.answer_text = str(answer)
        else:
            # Crear nueva respuesta
            new_answer = QuestionAnswer(
                survey_response_id=response_id,
                question_id=question_id
            )
            
            if isinstance(answer, (dict, list)):
                new_answer.answer_json = answer
            elif isinstance(answer, (int, float)):
                new_answer.answer_numeric = answer
            else:
                new_answer.answer_text = str(answer)
            
            db.session.add(new_answer)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Respuesta guardada'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@survey_bp.route('/complete', methods=['POST'])
def complete_survey():
    try:
        data = request.get_json()
        response_id = data.get('response_id')
        
        response = SurveyResponse.query.get(response_id)
        if not response:
            return jsonify({'error': 'Respuesta no encontrada'}), 404
        
        response.status = 'completed'
        response.completed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Encuesta completada exitosamente'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def create_default_template():
    """Crear plantilla de encuesta por defecto"""
    template = SurveyTemplate(
        title='Encuesta Organizacional PowerCars 2025',
        description='Encuesta para mapear la estructura organizacional y identificar áreas de mejora',
        created_by=1
    )
    
    db.session.add(template)
    db.session.flush()  # Para obtener el ID
    
    # Preguntas de la encuesta
    questions_data = [
        # Sección 1: Información Personal
        {
            'section': 'Información Personal',
            'text': '¿Cuál es tu nombre completo?',
            'type': 'text',
            'required': True,
            'order': 1
        },
        {
            'section': 'Información Personal',
            'text': '¿En qué área trabajas?',
            'type': 'select',
            'options': ['Mecánica', 'Administración', 'Ventas', 'Limpieza', 'Seguridad', 'Otro'],
            'required': True,
            'order': 2
        },
        {
            'section': 'Información Personal',
            'text': '¿Cuánto tiempo llevas trabajando en PowerCars?',
            'type': 'radio',
            'options': ['Menos de 6 meses', '6-12 meses', '1-3 años', '3-5 años', 'Más de 5 años'],
            'required': True,
            'order': 3
        },
        
        # Sección 2: Rol y Responsabilidades
        {
            'section': 'Rol y Responsabilidades',
            'text': '¿Cuál es tu rol específico en PowerCars?',
            'type': 'text',
            'required': True,
            'order': 4
        },
        {
            'section': 'Rol y Responsabilidades',
            'text': '¿Quién es tu líder directo o supervisor inmediato?',
            'type': 'text',
            'required': True,
            'order': 5
        },
        {
            'section': 'Rol y Responsabilidades',
            'text': 'Describe tus principales funciones diarias:',
            'type': 'textarea',
            'required': True,
            'order': 6
        },
        
        # Sección 3: Impedimentos y Mejoras
        {
            'section': 'Impedimentos y Mejoras',
            'text': '¿Existe algún impedimento principal para realizar tus funciones eficientemente?',
            'type': 'radio',
            'options': ['Sí', 'No'],
            'required': True,
            'order': 7
        },
        {
            'section': 'Impedimentos y Mejoras',
            'text': 'Si respondiste sí, especifica cuáles impedimentos enfrentas:',
            'type': 'textarea',
            'required': False,
            'order': 8
        },
        {
            'section': 'Impedimentos y Mejoras',
            'text': '¿Crees que se pueden mejorar los protocolos actuales de trabajo?',
            'type': 'radio',
            'options': ['Sí', 'No', 'No estoy seguro'],
            'required': True,
            'order': 9
        },
        
        # Sección 4: Ambiente Laboral
        {
            'section': 'Ambiente Laboral',
            'text': '¿Cómo calificarías el ambiente laboral en PowerCars?',
            'type': 'radio',
            'options': ['Excelente', 'Muy bueno', 'Bueno', 'Regular', 'Malo'],
            'required': True,
            'order': 10
        },
        {
            'section': 'Ambiente Laboral',
            'text': '¿Te sientes valorado por tu trabajo?',
            'type': 'radio',
            'options': ['Siempre', 'Frecuentemente', 'A veces', 'Raramente', 'Nunca'],
            'required': True,
            'order': 11
        },
        {
            'section': 'Ambiente Laboral',
            'text': '¿Cómo es la comunicación entre compañeros de trabajo?',
            'type': 'radio',
            'options': ['Excelente', 'Muy buena', 'Buena', 'Regular', 'Mala'],
            'required': True,
            'order': 12
        },
        
        # Sección 5: Condiciones Laborales
        {
            'section': 'Condiciones Laborales',
            'text': '¿Cómo evalúas los horarios de trabajo actuales?',
            'type': 'radio',
            'options': ['Muy adecuados', 'Adecuados', 'Aceptables', 'Inadecuados', 'Muy inadecuados'],
            'required': True,
            'order': 13
        },
        {
            'section': 'Condiciones Laborales',
            'text': '¿Tienes acceso a todas las herramientas necesarias para tu trabajo?',
            'type': 'radio',
            'options': ['Sí', 'No', 'Parcialmente'],
            'required': True,
            'order': 14
        },
        
        # Sección 6: Experiencia General
        {
            'section': 'Experiencia General',
            'text': 'En una escala del 1 al 10, ¿cómo calificarías tu experiencia trabajando en PowerCars?',
            'type': 'scale',
            'options': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            'required': True,
            'order': 15
        },
        {
            'section': 'Experiencia General',
            'text': '¿Qué es lo que más te gusta de trabajar aquí?',
            'type': 'textarea',
            'required': False,
            'order': 16
        },
        {
            'section': 'Experiencia General',
            'text': '¿Tienes ideas específicas que crees sería ideal implementar?',
            'type': 'textarea',
            'required': False,
            'order': 17
        },
        {
            'section': 'Experiencia General',
            'text': 'Observaciones extras o comentarios adicionales:',
            'type': 'textarea',
            'required': False,
            'order': 18
        }
    ]
    
    for q_data in questions_data:
        question = Question(
            survey_template_id=template.id,
            section_name=q_data['section'],
            question_text=q_data['text'],
            question_type=q_data['type'],
            options=q_data.get('options'),
            is_required=q_data['required'],
            order_index=q_data['order']
        )
        db.session.add(question)
    
    db.session.commit()
    return template

