import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

const Dashboard = () => {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [satisfaction, setSatisfaction] = useState(null)
  const [hierarchy, setHierarchy] = useState(null)
  const [issues, setIssues] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          'Authorization': `Bearer ${token}`
        }

        const [statsRes, satisfactionRes, hierarchyRes, issuesRes] = await Promise.all([
          fetch('https://ogh5izcv8evq.manus.space/api/dashboard/stats', { headers }),
          fetch('https://ogh5izcv8evq.manus.space/api/dashboard/satisfaction', { headers }),
          fetch('https://ogh5izcv8evq.manus.space/api/dashboard/hierarchy', { headers }),
          fetch('https://ogh5izcv8evq.manus.space/api/dashboard/issues', { headers })
        ])

        const [statsData, satisfactionData, hierarchyData, issuesData] = await Promise.all([
          statsRes.json(),
          satisfactionRes.json(),
          hierarchyRes.json(),
          issuesRes.json()
        ])

        setStats(statsData)
        setSatisfaction(satisfactionData)
        setHierarchy(hierarchyData)
        setIssues(issuesData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Organizacional</h1>
        <p className="text-gray-600">Análisis de resultados de la encuesta PowerCars</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Respuestas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_responses || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.completed_responses || 0} completadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Finalización</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completion_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              De encuestas iniciadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción Promedio</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satisfaction?.overall_satisfaction?.average || 0}/5</div>
            <p className="text-xs text-muted-foreground">
              Ambiente laboral
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impedimentos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issues?.common_impediments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Principales identificados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs with Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfacción</TabsTrigger>
          <TabsTrigger value="hierarchy">Estructura</TabsTrigger>
          <TabsTrigger value="issues">Problemas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Respuestas por Área</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats?.responses_by_area || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribución por Experiencia</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats?.responses_by_experience || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ experience, count }) => `${experience}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(stats?.responses_by_experience || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Satisfacción</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={satisfaction?.overall_satisfaction?.distribution || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Satisfacción por Área</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={satisfaction?.satisfaction_by_area || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="area" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estructura Organizacional</CardTitle>
              <CardDescription>
                Análisis de la jerarquía identificada en las respuestas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-900">
                      {hierarchy?.management_levels || 0}
                    </div>
                    <div className="text-sm text-gray-600">Niveles de Gestión</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-900">
                      {hierarchy?.organizational_chart?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Supervisores Identificados</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-900">
                      {hierarchy?.areas_without_clear_hierarchy?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Áreas sin Jerarquía Clara</div>
                  </div>
                </div>

                {hierarchy?.organizational_chart && hierarchy.organizational_chart.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Estructura Identificada:</h4>
                    <div className="space-y-3">
                      {hierarchy.organizational_chart.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="font-medium text-lg">{item.supervisor}</div>
                          <div className="text-sm text-gray-600">
                            {item.span_of_control} empleados a cargo
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            {item.direct_reports.map((report, idx) => (
                              <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                <div className="font-medium">{report.name}</div>
                                <div className="text-gray-500">{report.role} - {report.area}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Impedimentos Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issues?.common_impediments?.map((impediment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium">{impediment.impediment}</div>
                        <div className="text-sm text-gray-600">
                          {impediment.frequency} menciones ({impediment.percentage}%)
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No hay impedimentos reportados</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sugerencias de Mejora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issues?.improvement_suggestions?.map((suggestion, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="font-medium">{suggestion.suggestion}</div>
                        <div className="text-sm text-gray-600">
                          {suggestion.frequency} menciones - {suggestion.category}
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-gray-500">No hay sugerencias disponibles</p>}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Necesidades de Capacitación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {issues?.training_needs?.map((need, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-medium">{need.training_type}</div>
                    <div className="text-sm text-gray-600">
                      {need.requests} solicitudes
                    </div>
                    <div className="text-sm text-blue-600">
                      Áreas: {need.areas.join(', ')}
                    </div>
                  </div>
                )) || <p className="text-gray-500">No hay necesidades de capacitación identificadas</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Dashboard

