import { createContext, useContext, useState } from 'react'

const SurveyContext = createContext()

const API_BASE_URL = 'https://ogh5izcv8evq.manus.space'

export const useSurvey = () => {
  const context = useContext(SurveyContext)
  if (!context) {
    throw new Error('useSurvey debe ser usado dentro de SurveyProvider')
  }
  return context
}

export const SurveyProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [surveyData, setSurveyData] = useState({})
  const [responseId, setResponseId] = useState(null)
  const [sessionToken, setSessionToken] = useState(null)
  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(false)

  const startSurvey = async (personalData) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/survey/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personalData)
      })

      const data = await response.json()

      if (response.ok) {
        setResponseId(data.response_id)
        setSessionToken(data.session_token)
        setSurveyData({ ...personalData })
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    } finally {
      setLoading(false)
    }
  }

  const saveAnswer = async (questionId, answer) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/survey/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken
        },
        body: JSON.stringify({
          response_id: responseId,
          question_id: questionId,
          answer: answer
        })
      })

      const data = await response.json()
      return response.ok ? { success: true } : { success: false, error: data.error }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    }
  }

  const completeSurvey = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/survey/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Token': sessionToken
        },
        body: JSON.stringify({
          response_id: responseId
        })
      })

      const data = await response.json()
      return response.ok ? { success: true } : { success: false, error: data.error }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/survey/template`)
      const data = await response.json()

      if (response.ok) {
        setTemplate(data)
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Error de conexión' }
    } finally {
      setLoading(false)
    }
  }

  const resetSurvey = () => {
    setCurrentStep(0)
    setSurveyData({})
    setResponseId(null)
    setSessionToken(null)
  }

  const value = {
    currentStep,
    setCurrentStep,
    surveyData,
    setSurveyData,
    responseId,
    sessionToken,
    template,
    loading,
    startSurvey,
    saveAnswer,
    completeSurvey,
    loadTemplate,
    resetSurvey
  }

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  )
}

