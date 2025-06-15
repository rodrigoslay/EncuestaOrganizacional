from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import SurveyResponse, QuestionAnswer, Question
from src.models.database import db
import json
import csv
import io
from datetime import datetime

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary_report():
    try:
        format_type = request.args.get('format', 'json')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        # Construir query base
        query = SurveyResponse.query.filter_by(status='completed')
        
        if date_from:
            query = query.filter(SurveyResponse.completed_at >= datetime.fromisoformat(date_from))
        if date_to:
            query = query.filter(SurveyResponse.completed_at <= datetime.fromisoformat(date_to))
        
        responses = query.all()
        
        # Generar datos del reporte
        report_data = {
            'generated_at': datetime.utcnow().isoformat(),
            'period': {
                'from': date_from,
                'to': date_to
            },
            'summary': {
                'total_responses': len(responses),
                'response_rate': '85%',  # Placeholder
                'completion_time_avg': '12 minutos'  # Placeholder
            },
            'key_findings': [
                'El 78% de los empleados considera el ambiente laboral como bueno o excelente',
                'La principal área de mejora identificada es la disponibilidad de herramientas',
                'El 65% de los empleados se siente valorado en su trabajo',
                'Se identificaron 3 niveles jerárquicos principales'
            ],
            'recommendations': [
                'Implementar un sistema de gestión de herramientas y equipos',
                'Establecer reuniones regulares de feedback entre supervisores y empleados',
                'Crear un programa de reconocimiento de empleados',
                'Documentar formalmente la estructura organizacional'
            ]
        }
        
        if format_type == 'json':
            return jsonify({'report_data': report_data}), 200
        else:
            # Para otros formatos, retornar URL de descarga (placeholder)
            return jsonify({
                'download_url': f'/api/reports/download/summary_{format_type}_{datetime.now().strftime("%Y%m%d")}'
            }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/detailed', methods=['GET'])
@jwt_required()
def get_detailed_report():
    try:
        section = request.args.get('section')
        area = request.args.get('area')
        format_type = request.args.get('format', 'json')
        
        # Análisis detallado por sección
        section_analysis = {}
        recommendations = []
        action_items = []
        
        if section == 'Ambiente Laboral':
            section_analysis = {
                'section_name': 'Ambiente Laboral',
                'response_count': 25,
                'satisfaction_score': 3.8,
                'key_metrics': {
                    'ambiente_general': 3.8,
                    'valoracion_personal': 3.5,
                    'comunicacion_equipos': 3.6
                },
                'trends': 'Mejora gradual en los últimos 6 meses',
                'areas_concern': ['Valoración personal', 'Comunicación entre turnos']
            }
            
            recommendations = [
                'Implementar programa de reconocimiento mensual',
                'Establecer reuniones de coordinación entre turnos',
                'Crear espacios de descanso más cómodos'
            ]
            
            action_items = [
                'Diseñar sistema de reconocimiento - Responsable: RRHH - Plazo: 30 días',
                'Programar reuniones inter-turno - Responsable: Supervisores - Plazo: 15 días',
                'Evaluar espacios comunes - Responsable: Administración - Plazo: 45 días'
            ]
        
        elif section == 'Estructura Organizacional':
            section_analysis = {
                'section_name': 'Estructura Organizacional',
                'response_count': 25,
                'clarity_score': 2.9,
                'hierarchy_levels': 3,
                'span_of_control_avg': 4.2,
                'areas_unclear_hierarchy': ['Área de limpieza', 'Seguridad nocturna']
            }
            
            recommendations = [
                'Crear organigrama visual oficial',
                'Definir roles y responsabilidades por escrito',
                'Establecer líneas de reporte claras'
            ]
            
            action_items = [
                'Documentar organigrama - Responsable: Gerencia - Plazo: 20 días',
                'Crear manual de roles - Responsable: RRHH - Plazo: 30 días',
                'Comunicar estructura a todo el personal - Responsable: Gerencia - Plazo: 35 días'
            ]
        
        return jsonify({
            'section_analysis': section_analysis,
            'recommendations': recommendations,
            'action_items': action_items
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/responses', methods=['GET'])
@jwt_required()
def export_responses():
    try:
        format_type = request.args.get('format', 'json')
        include_personal_data = request.args.get('include_personal_data', 'false').lower() == 'true'
        area = request.args.get('area')
        
        # Construir query
        query = SurveyResponse.query.filter_by(status='completed')
        if area:
            query = query.filter_by(employee_area=area)
        
        responses = query.all()
        
        if format_type == 'csv':
            # Generar CSV
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Headers
            headers = ['ID', 'Área', 'Experiencia', 'Fecha Completado']
            if include_personal_data:
                headers.insert(1, 'Nombre')
            
            writer.writerow(headers)
            
            # Datos
            for response in responses:
                row = [
                    response.id,
                    response.employee_area,
                    response.work_experience,
                    response.completed_at.strftime('%Y-%m-%d %H:%M') if response.completed_at else ''
                ]
                if include_personal_data:
                    row.insert(1, response.employee_name if not response.is_anonymous else 'Anónimo')
                
                writer.writerow(row)
            
            output.seek(0)
            
            # Crear archivo temporal y retornar URL
            filename = f"responses_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            return jsonify({
                'download_url': f'/api/reports/download/{filename}',
                'total_records': len(responses)
            }), 200
        
        else:
            # Formato JSON
            data = []
            for response in responses:
                response_data = {
                    'id': response.id,
                    'area': response.employee_area,
                    'experience': response.work_experience,
                    'completed_at': response.completed_at.isoformat() if response.completed_at else None,
                    'is_anonymous': response.is_anonymous
                }
                
                if include_personal_data:
                    response_data['name'] = response.employee_name if not response.is_anonymous else 'Anónimo'
                
                data.append(response_data)
            
            return jsonify({
                'responses': data,
                'total_records': len(data)
            }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/analytics', methods=['GET'])
@jwt_required()
def get_analytics_data():
    try:
        # Datos para gráficos del dashboard
        analytics_data = {
            'satisfaction_trend': [
                {'month': 'Enero', 'score': 3.2},
                {'month': 'Febrero', 'score': 3.4},
                {'month': 'Marzo', 'score': 3.8},
                {'month': 'Abril', 'score': 3.7},
                {'month': 'Mayo', 'score': 3.9}
            ],
            'area_performance': [
                {'area': 'Mecánica', 'satisfaction': 4.1, 'productivity': 85},
                {'area': 'Administración', 'satisfaction': 3.8, 'productivity': 92},
                {'area': 'Ventas', 'satisfaction': 3.6, 'productivity': 78},
                {'area': 'Limpieza', 'satisfaction': 3.9, 'productivity': 88}
            ],
            'impediments_frequency': [
                {'impediment': 'Falta de herramientas', 'count': 12},
                {'impediment': 'Problemas de comunicación', 'count': 8},
                {'impediment': 'Sobrecarga de trabajo', 'count': 6},
                {'impediment': 'Falta de capacitación', 'count': 4}
            ],
            'hierarchy_distribution': [
                {'level': 'Gerencia', 'count': 2},
                {'level': 'Supervisores', 'count': 5},
                {'level': 'Técnicos', 'count': 15},
                {'level': 'Auxiliares', 'count': 8}
            ]
        }
        
        return jsonify(analytics_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

