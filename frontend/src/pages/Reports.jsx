import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Download, FileText, BarChart3 } from 'lucide-react'

const Reports = () => {
  const { token } = useAuth()
  const [summaryReport, setSummaryReport] = useState(null)
  const [detailedReport, setDetailedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedArea, setSelectedArea] = useState('')

  const fetchSummaryReport = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://ogh5izcv8evq.manus.space/api/reports/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setSummaryReport(data.report_data)
    } catch (error) {
      console.error('Error fetching summary report:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDetailedReport = async (section, area = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ section })
      if (area) params.append('area', area)
      
      const response = await fetch(`https://ogh5izcv8evq.manus.space/api/reports/detailed?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setDetailedReport(data)
    } catch (error) {
      console.error('Error fetching detailed report:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSummaryReport()
  }, [token])

  const handleDetailedReportRequest = () => {
    if (selectedSection) {
      fetchDetailedReport(selectedSection, selectedArea)
    }
  }

  const exportData = async (format, type = 'summary') => {
    try {
      let url = `https://ogh5izcv8evq.manus.space/api/reports/${type}?format=${format}`
      if (type === 'detailed' && selectedSection) {
        url += `&section=${selectedSection}`
        if (selectedArea) url += `&area=${selectedArea}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.download_url) {
        // Simular descarga
        alert(`Archivo ${format.toUpperCase()} generado: ${data.download_url}`)
      } else {
        // Mostrar datos JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_${type}_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Error al exportar datos')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Análisis</h1>
        <p className="text-gray-600">Genera y descarga reportes detallados de la encuesta organizacional</p>
      </div>

      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="summary">Reporte Ejecutivo</TabsTrigger>
          <TabsTrigger value="detailed">Análisis Detallado</TabsTrigger>
          <TabsTrigger value="export">Exportar Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2" size={24} />
                Reporte Ejecutivo
              </CardTitle>
              <CardDescription>
                Resumen general de los resultados de la encuesta organizacional
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto"></div>
                  <p className="mt-2">Cargando reporte...</p>
                </div>
              ) : summaryReport ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Total Respuestas</h4>
                      <p className="text-2xl font-bold text-blue-900">{summaryReport.summary?.total_responses}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900">Tasa de Respuesta</h4>
                      <p className="text-2xl font-bold text-green-900">{summaryReport.summary?.response_rate}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900">Tiempo Promedio</h4>
                      <p className="text-2xl font-bold text-yellow-900">{summaryReport.summary?.completion_time_avg}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Hallazgos Principales</h3>
                    <ul className="space-y-2">
                      {summaryReport.key_findings?.map((finding, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recomendaciones</h3>
                    <ul className="space-y-2">
                      {summaryReport.recommendations?.map((recommendation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => exportData('pdf', 'summary')}>
                      <Download className="mr-2" size={16} />
                      Descargar PDF
                    </Button>
                    <Button variant="outline" onClick={() => exportData('excel', 'summary')}>
                      <Download className="mr-2" size={16} />
                      Descargar Excel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No hay datos disponibles</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2" size={24} />
                Análisis Detallado por Sección
              </CardTitle>
              <CardDescription>
                Selecciona una sección específica para obtener análisis detallado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sección</label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sección" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ambiente Laboral">Ambiente Laboral</SelectItem>
                      <SelectItem value="Estructura Organizacional">Estructura Organizacional</SelectItem>
                      <SelectItem value="Impedimentos y Mejoras">Impedimentos y Mejoras</SelectItem>
                      <SelectItem value="Condiciones Laborales">Condiciones Laborales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Área (Opcional)</label>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por área" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las áreas</SelectItem>
                      <SelectItem value="Mecánica">Mecánica</SelectItem>
                      <SelectItem value="Administración">Administración</SelectItem>
                      <SelectItem value="Ventas">Ventas</SelectItem>
                      <SelectItem value="Limpieza">Limpieza</SelectItem>
                      <SelectItem value="Seguridad">Seguridad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleDetailedReportRequest}
                disabled={!selectedSection || loading}
              >
                Generar Análisis Detallado
              </Button>

              {detailedReport && (
                <div className="mt-6 space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">
                      Análisis: {detailedReport.section_analysis?.section_name}
                    </h3>
                    
                    {detailedReport.section_analysis?.response_count && (
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Respuestas analizadas</p>
                          <p className="text-2xl font-bold">{detailedReport.section_analysis.response_count}</p>
                        </div>
                        {detailedReport.section_analysis.satisfaction_score && (
                          <div>
                            <p className="text-sm text-gray-600">Puntuación promedio</p>
                            <p className="text-2xl font-bold">{detailedReport.section_analysis.satisfaction_score}/5</p>
                          </div>
                        )}
                      </div>
                    )}

                    {detailedReport.section_analysis?.key_metrics && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Métricas Clave</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(detailedReport.section_analysis.key_metrics).map(([key, value]) => (
                            <div key={key} className="bg-white p-3 rounded">
                              <p className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                              <p className="font-semibold">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recomendaciones</h3>
                    <ul className="space-y-2">
                      {detailedReport.recommendations?.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Plan de Acción</h3>
                    <div className="space-y-3">
                      {detailedReport.action_items?.map((item, index) => (
                        <div key={index} className="bg-yellow-50 p-4 rounded-lg">
                          <p className="font-medium">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button onClick={() => exportData('pdf', 'detailed')}>
                      <Download className="mr-2" size={16} />
                      Descargar PDF
                    </Button>
                    <Button variant="outline" onClick={() => exportData('excel', 'detailed')}>
                      <Download className="mr-2" size={16} />
                      Descargar Excel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Datos</CardTitle>
              <CardDescription>
                Descarga los datos de las respuestas en diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Respuestas Individuales</h3>
                  <p className="text-sm text-gray-600">
                    Exporta todas las respuestas individuales de la encuesta
                  </p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      onClick={() => exportData('csv', 'responses')}
                    >
                      <Download className="mr-2" size={16} />
                      Descargar CSV
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => exportData('excel', 'responses')}
                    >
                      <Download className="mr-2" size={16} />
                      Descargar Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => exportData('json', 'responses')}
                    >
                      <Download className="mr-2" size={16} />
                      Descargar JSON
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Datos Analíticos</h3>
                  <p className="text-sm text-gray-600">
                    Exporta estadísticas y análisis procesados
                  </p>
                  <div className="space-y-2">
                    <Button 
                      className="w-full"
                      onClick={async () => {
                        try {
                          const response = await fetch('https://ogh5izcv8evq.manus.space/api/reports/analytics', {
                            headers: { 'Authorization': `Bearer ${token}` }
                          })
                          const data = await response.json()
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                          const url = window.URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`
                          a.click()
                          window.URL.revokeObjectURL(url)
                        } catch (error) {
                          alert('Error al exportar datos analíticos')
                        }
                      }}
                    >
                      <Download className="mr-2" size={16} />
                      Datos para Gráficos
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Nota sobre Privacidad</h4>
                <p className="text-sm text-gray-700">
                  Los datos exportados respetan la configuración de anonimato de cada respuesta. 
                  Las respuestas marcadas como anónimas no incluirán información personal identificable.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Reports

