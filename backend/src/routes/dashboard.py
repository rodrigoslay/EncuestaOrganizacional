from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import SurveyResponse, QuestionAnswer, Question
from src.models.database import db
from sqlalchemy import func, case
from collections import defaultdict

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    try:
        # Estadísticas generales
        total_responses = SurveyResponse.query.count()
        completed_responses = SurveyResponse.query.filter_by(status='completed').count()
        completion_rate = (completed_responses / total_responses * 100) if total_responses > 0 else 0
        
        # Respuestas por área
        area_question = Question.query.filter(Question.question_text.like('%área trabajas%')).first()
        responses_by_area = []
        if area_question:
            area_stats = db.session.query(
                QuestionAnswer.answer_text,
                func.count(QuestionAnswer.id).label('count')
            ).filter_by(question_id=area_question.id).group_by(QuestionAnswer.answer_text).all()
            
            responses_by_area = [{'area': stat[0], 'count': stat[1]} for stat in area_stats]
        
        # Respuestas por experiencia
        exp_question = Question.query.filter(Question.question_text.like('%tiempo llevas trabajando%')).first()
        responses_by_experience = []
        if exp_question:
            exp_stats = db.session.query(
                QuestionAnswer.answer_text,
                func.count(QuestionAnswer.id).label('count')
            ).filter_by(question_id=exp_question.id).group_by(QuestionAnswer.answer_text).all()
            
            responses_by_experience = [{'experience': stat[0], 'count': stat[1]} for stat in exp_stats]
        
        return jsonify({
            'total_responses': total_responses,
            'completed_responses': completed_responses,
            'completion_rate': round(completion_rate, 2),
            'responses_by_area': responses_by_area,
            'responses_by_experience': responses_by_experience
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/satisfaction', methods=['GET'])
@jwt_required()
def get_satisfaction_analysis():
    try:
        # Análisis de satisfacción general
        satisfaction_question = Question.query.filter(Question.question_text.like('%ambiente laboral%')).first()
        
        overall_satisfaction = {'average': 0, 'distribution': []}
        satisfaction_by_area = []
        
        if satisfaction_question:
            # Mapeo de respuestas a valores numéricos
            satisfaction_mapping = {
                'Excelente': 5,
                'Muy bueno': 4,
                'Bueno': 3,
                'Regular': 2,
                'Malo': 1
            }
            
            # Distribución general
            satisfaction_stats = db.session.query(
                QuestionAnswer.answer_text,
                func.count(QuestionAnswer.id).label('count')
            ).filter_by(question_id=satisfaction_question.id).group_by(QuestionAnswer.answer_text).all()
            
            total_responses = sum(stat[1] for stat in satisfaction_stats)
            distribution = []
            total_score = 0
            
            for answer, count in satisfaction_stats:
                percentage = (count / total_responses * 100) if total_responses > 0 else 0
                distribution.append({
                    'rating': answer,
                    'count': count,
                    'percentage': round(percentage, 2)
                })
                
                if answer in satisfaction_mapping:
                    total_score += satisfaction_mapping[answer] * count
            
            average = (total_score / total_responses) if total_responses > 0 else 0
            
            overall_satisfaction = {
                'average': round(average, 2),
                'distribution': distribution
            }
            
            # Satisfacción por área
            area_question = Question.query.filter(Question.question_text.like('%área trabajas%')).first()
            if area_question:
                # Query compleja para obtener satisfacción por área
                area_satisfaction = db.session.query(
                    QuestionAnswer.answer_text.label('area'),
                    func.avg(
                        case(
                            (QuestionAnswer.answer_text == 'Excelente', 5),
                            (QuestionAnswer.answer_text == 'Muy bueno', 4),
                            (QuestionAnswer.answer_text == 'Bueno', 3),
                            (QuestionAnswer.answer_text == 'Regular', 2),
                            (QuestionAnswer.answer_text == 'Malo', 1),
                            else_=0
                        )
                    ).label('avg_satisfaction'),
                    func.count(QuestionAnswer.id).label('count')
                ).join(
                    SurveyResponse, QuestionAnswer.survey_response_id == SurveyResponse.id
                ).filter(
                    QuestionAnswer.question_id == area_question.id
                ).group_by(QuestionAnswer.answer_text).all()
                
                satisfaction_by_area = [
                    {
                        'area': result.area,
                        'average': round(float(result.avg_satisfaction), 2) if result.avg_satisfaction else 0,
                        'count': result.count
                    }
                    for result in area_satisfaction
                ]
        
        return jsonify({
            'overall_satisfaction': overall_satisfaction,
            'satisfaction_by_area': satisfaction_by_area,
            'satisfaction_trends': []  # Placeholder para tendencias temporales
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/hierarchy', methods=['GET'])
@jwt_required()
def get_hierarchy_analysis():
    try:
        # Obtener preguntas relevantes
        role_question = Question.query.filter(Question.question_text.like('%rol específico%')).first()
        supervisor_question = Question.query.filter(Question.question_text.like('%líder directo%')).first()
        
        organizational_chart = []
        management_levels = 0
        areas_without_clear_hierarchy = []
        
        if role_question and supervisor_question:
            # Obtener todas las respuestas de roles y supervisores
            responses = db.session.query(
                SurveyResponse.id,
                SurveyResponse.employee_name,
                SurveyResponse.employee_area
            ).filter_by(status='completed').all()
            
            hierarchy_data = {}
            
            for response in responses:
                # Obtener rol del empleado
                role_answer = QuestionAnswer.query.filter_by(
                    survey_response_id=response.id,
                    question_id=role_question.id
                ).first()
                
                # Obtener supervisor del empleado
                supervisor_answer = QuestionAnswer.query.filter_by(
                    survey_response_id=response.id,
                    question_id=supervisor_question.id
                ).first()
                
                if role_answer and supervisor_answer:
                    supervisor_name = supervisor_answer.answer_text
                    
                    if supervisor_name not in hierarchy_data:
                        hierarchy_data[supervisor_name] = []
                    
                    hierarchy_data[supervisor_name].append({
                        'name': response.employee_name or 'Anónimo',
                        'role': role_answer.answer_text,
                        'area': response.employee_area
                    })
            
            # Convertir a formato de organigrama
            for supervisor, direct_reports in hierarchy_data.items():
                organizational_chart.append({
                    'supervisor': supervisor,
                    'direct_reports': direct_reports,
                    'span_of_control': len(direct_reports)
                })
            
            # Calcular niveles de gestión (simplificado)
            management_levels = len(organizational_chart)
        
        return jsonify({
            'organizational_chart': organizational_chart,
            'management_levels': management_levels,
            'areas_without_clear_hierarchy': areas_without_clear_hierarchy
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/issues', methods=['GET'])
@jwt_required()
def get_issues_analysis():
    try:
        # Análisis de impedimentos
        impediment_question = Question.query.filter(Question.question_text.like('%impedimento%')).first()
        impediment_details_question = Question.query.filter(Question.question_text.like('%especifica cuáles%')).first()
        
        common_impediments = []
        improvement_suggestions = []
        training_needs = []
        
        if impediment_question and impediment_details_question:
            # Obtener respuestas de impedimentos
            impediment_responses = db.session.query(
                QuestionAnswer.answer_text,
                func.count(QuestionAnswer.id).label('count')
            ).filter_by(question_id=impediment_question.id).group_by(QuestionAnswer.answer_text).all()
            
            total_impediment_responses = sum(resp[1] for resp in impediment_responses)
            
            for answer, count in impediment_responses:
                percentage = (count / total_impediment_responses * 100) if total_impediment_responses > 0 else 0
                common_impediments.append({
                    'impediment': answer,
                    'frequency': count,
                    'percentage': round(percentage, 2),
                    'affected_areas': []  # Placeholder
                })
            
            # Obtener detalles de impedimentos específicos
            specific_impediments = QuestionAnswer.query.filter_by(
                question_id=impediment_details_question.id
            ).filter(QuestionAnswer.answer_text.isnot(None)).all()
            
            # Análisis básico de texto para categorizar impedimentos
            impediment_categories = defaultdict(int)
            for imp in specific_impediments:
                text = imp.answer_text.lower()
                if 'herramienta' in text or 'equipo' in text:
                    impediment_categories['Falta de herramientas/equipos'] += 1
                elif 'capacitación' in text or 'entrenamiento' in text:
                    impediment_categories['Falta de capacitación'] += 1
                elif 'comunicación' in text:
                    impediment_categories['Problemas de comunicación'] += 1
                elif 'tiempo' in text or 'sobrecarga' in text:
                    impediment_categories['Sobrecarga de trabajo'] += 1
                else:
                    impediment_categories['Otros'] += 1
            
            improvement_suggestions = [
                {'suggestion': category, 'frequency': count, 'category': 'Operacional'}
                for category, count in impediment_categories.items()
            ]
        
        # Análisis de necesidades de capacitación (placeholder)
        training_needs = [
            {'training_type': 'Capacitación técnica', 'requests': 5, 'areas': ['Mecánica']},
            {'training_type': 'Atención al cliente', 'requests': 3, 'areas': ['Ventas', 'Administración']},
            {'training_type': 'Liderazgo', 'requests': 2, 'areas': ['Administración']}
        ]
        
        return jsonify({
            'common_impediments': common_impediments,
            'improvement_suggestions': improvement_suggestions,
            'training_needs': training_needs
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

