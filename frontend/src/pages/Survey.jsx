import { useState, useEffect } from 'react'
import { useSurvey } from '../contexts/SurveyContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Progress } from '../components/ui/progress'
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'

const Survey = () => {
  const { 
    currentStep, 
    setCurrentStep, 
    template, 
    loadTemplate, 
    startSurvey, 
    saveAnswer, 
    completeSurvey,
    loading 
  } = useSurvey()

  const [personalData, setPersonalData] = useState({
    employee_name: '',
    employee_area: '',
    work_experience: '',
    is_anonymous: false
  })

  const [answers, setAnswers] = useState({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    loadTemplate()
  }, [])

  const handleStartSurvey = async () => {
    const result = await startSurvey(personalData)
    if (result.success) {
      setCurrentStep(1)
    } else {
      alert('Error al iniciar la encuesta: ' + result.error)
    }
  }

  const handleSaveAnswer = async () => {
    if (!currentAnswer.trim()) return

    const currentSection = template.sections[Math.floor((currentStep - 1) / 3)]
    const questionIndex = (currentStep - 1) % 3
    const question = currentSection?.questions[questionIndex]

    if (question) {
      const result = await saveAnswer(question.id, currentAnswer)
      if (result.success) {
        setAnswers(prev => ({ ...prev, [question.id]: currentAnswer }))
        setCurrentAnswer('')
      } else {
        alert('Error al guardar respuesta: ' + result.error)
      }
    }
  }

  const handleNext = async () => {
    await handleSaveAnswer()
    
    const totalQuestions = template?.sections?.reduce((total, section) => total + section.questions.length, 0) || 0
    
    if (currentStep < totalQuestions) {
      setCurrentStep(currentStep + 1)
    } else {
      const result = await completeSurvey()
      if (result.success) {
        setIsCompleted(true)
      } else {
        alert('Error al completar encuesta: ' + result.error)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <CardTitle className="text-2xl">¡Encuesta Completada!</CardTitle>
            <CardDescription>
              Gracias por tu participación. Tus respuestas nos ayudarán a mejorar PowerCars.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Los resultados de esta encuesta serán analizados para crear mejoras 
              en nuestra organización y ambiente laboral.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentStep === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Por favor completa tus datos básicos para comenzar la encuesta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={personalData.employee_name}
                onChange={(e) => setPersonalData(prev => ({ ...prev, employee_name: e.target.value }))}
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <Label htmlFor="area">Área de Trabajo</Label>
              <Select 
                value={personalData.employee_area} 
                onValueChange={(value) => setPersonalData(prev => ({ ...prev, employee_area: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mecánica">Mecánica</SelectItem>
                  <SelectItem value="Administración">Administración</SelectItem>
                  <SelectItem value="Ventas">Ventas</SelectItem>
                  <SelectItem value="Limpieza">Limpieza</SelectItem>
                  <SelectItem value="Seguridad">Seguridad</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience">Tiempo en PowerCars</Label>
              <Select 
                value={personalData.work_experience} 
                onValueChange={(value) => setPersonalData(prev => ({ ...prev, work_experience: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu experiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Menos de 6 meses">Menos de 6 meses</SelectItem>
                  <SelectItem value="6-12 meses">6-12 meses</SelectItem>
                  <SelectItem value="1-3 años">1-3 años</SelectItem>
                  <SelectItem value="3-5 años">3-5 años</SelectItem>
                  <SelectItem value="Más de 5 años">Más de 5 años</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={personalData.is_anonymous}
                onChange={(e) => setPersonalData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="anonymous">Participar de forma anónima</Label>
            </div>

            <Button 
              onClick={handleStartSurvey} 
              className="w-full"
              disabled={!personalData.employee_name || !personalData.employee_area || !personalData.work_experience}
            >
              Comenzar Encuesta
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <p>Cargando encuesta...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalQuestions = template.sections.reduce((total, section) => total + section.questions.length, 0)
  const progress = (currentStep / totalQuestions) * 100

  const currentSectionIndex = Math.floor((currentStep - 1) / Math.ceil(totalQuestions / template.sections.length))
  const currentSection = template.sections[currentSectionIndex]
  const questionIndex = (currentStep - 1) % Math.ceil(totalQuestions / template.sections.length)
  const currentQuestion = currentSection?.questions[questionIndex]

  if (!currentQuestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <p>Pregunta no encontrada</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderQuestionInput = () => {
    switch (currentQuestion.question_type) {
      case 'text':
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Tu respuesta..."
          />
        )
      
      case 'textarea':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Tu respuesta..."
            rows={4}
          />
        )
      
      case 'radio':
      case 'select':
        return (
          <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case 'scale':
        return (
          <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
            <div className="grid grid-cols-5 gap-2">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <RadioGroupItem value={option} id={`scale-${index}`} />
                  <Label htmlFor={`scale-${index}`} className="text-sm">{option}</Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )
      
      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Tu respuesta..."
          />
        )
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">
              Pregunta {currentStep} de {totalQuestions}
            </span>
            <span className="text-sm text-gray-500">
              {currentSection?.name}
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
          {currentQuestion.is_required && (
            <CardDescription className="text-red-500">* Campo obligatorio</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestionInput()}
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft size={16} className="mr-2" />
              Anterior
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={currentQuestion.is_required && !currentAnswer.trim()}
            >
              {currentStep === totalQuestions ? 'Finalizar' : 'Siguiente'}
              {currentStep !== totalQuestions && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Survey

