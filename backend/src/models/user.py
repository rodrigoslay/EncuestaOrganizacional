from datetime import datetime
from src.models.database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='admin')
    full_name = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class SurveyTemplate(db.Model):
    __tablename__ = 'survey_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    version = db.Column(db.String(10), default='1.0')
    is_active = db.Column(db.Boolean, default=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    questions = db.relationship('Question', backref='survey_template', lazy=True)
    responses = db.relationship('SurveyResponse', backref='survey_template', lazy=True)

class Question(db.Model):
    __tablename__ = 'questions'
    
    id = db.Column(db.Integer, primary_key=True)
    survey_template_id = db.Column(db.Integer, db.ForeignKey('survey_templates.id'), nullable=False)
    section_name = db.Column(db.String(100), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), nullable=False)  # text, textarea, select, radio, checkbox, scale
    options = db.Column(db.JSON)  # Para opciones de selección múltiple
    is_required = db.Column(db.Boolean, default=False)
    order_index = db.Column(db.Integer, nullable=False)
    validation_rules = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    answers = db.relationship('QuestionAnswer', backref='question', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'section_name': self.section_name,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'options': self.options,
            'is_required': self.is_required,
            'order_index': self.order_index,
            'validation_rules': self.validation_rules
        }

class SurveyResponse(db.Model):
    __tablename__ = 'survey_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    survey_template_id = db.Column(db.Integer, db.ForeignKey('survey_templates.id'), nullable=False)
    employee_name = db.Column(db.String(100))
    employee_area = db.Column(db.String(100))
    work_experience = db.Column(db.String(50))
    is_anonymous = db.Column(db.Boolean, default=False)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='in_progress')  # in_progress, completed, abandoned
    
    answers = db.relationship('QuestionAnswer', backref='survey_response', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_name': self.employee_name if not self.is_anonymous else 'Anónimo',
            'employee_area': self.employee_area,
            'work_experience': self.work_experience,
            'is_anonymous': self.is_anonymous,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'status': self.status
        }

class QuestionAnswer(db.Model):
    __tablename__ = 'question_answers'
    
    id = db.Column(db.Integer, primary_key=True)
    survey_response_id = db.Column(db.Integer, db.ForeignKey('survey_responses.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    answer_text = db.Column(db.Text)
    answer_numeric = db.Column(db.Integer)
    answer_json = db.Column(db.JSON)  # Para respuestas complejas
    answered_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'question_id': self.question_id,
            'answer_text': self.answer_text,
            'answer_numeric': self.answer_numeric,
            'answer_json': self.answer_json,
            'answered_at': self.answered_at.isoformat() if self.answered_at else None
        }

