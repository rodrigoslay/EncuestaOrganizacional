import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { FileText, BarChart3, Users, Target } from 'lucide-react'

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema de Encuestas Organizacionales
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Ayúdanos a mejorar PowerCars participando en nuestra encuesta organizacional. 
          Tu opinión es fundamental para crear un mejor ambiente de trabajo.
        </p>
        <Link to="/encuesta">
          <Button size="lg" className="bg-blue-900 hover:bg-blue-800">
            <FileText className="mr-2" size={20} />
            Completar Encuesta
          </Button>
        </Link>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 text-blue-900" size={24} />
              Confidencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Tus respuestas son completamente confidenciales. Puedes elegir 
              participar de forma anónima si lo prefieres.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 text-blue-900" size={24} />
              Mejora Continua
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Los resultados nos ayudarán a identificar áreas de mejora 
              y crear un mejor ambiente laboral para todos.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 text-blue-900" size={24} />
              Resultados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Los administradores pueden acceder a reportes y estadísticas 
              para tomar decisiones informadas.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Information Section */}
      <div className="bg-blue-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¿Por qué es importante tu participación?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Organigrama Claro</h3>
            <p className="text-gray-600">
              Actualmente PowerCars no cuenta con un organigrama documentado. 
              Tu participación nos ayudará a crear una estructura organizacional clara.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Mejores Procesos</h3>
            <p className="text-gray-600">
              Identificaremos impedimentos y áreas de mejora para optimizar 
              nuestros procesos de trabajo y aumentar la eficiencia.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Ambiente Laboral</h3>
            <p className="text-gray-600">
              Conoceremos tu experiencia trabajando en PowerCars para mejorar 
              el ambiente laboral y las condiciones de trabajo.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Desarrollo Profesional</h3>
            <p className="text-gray-600">
              Identificaremos necesidades de capacitación y oportunidades 
              de crecimiento profesional para todo el equipo.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ¿Listo para participar?
        </h2>
        <p className="text-gray-600 mb-6">
          La encuesta toma aproximadamente 10-15 minutos en completarse.
        </p>
        <Link to="/encuesta">
          <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900">
            Comenzar Encuesta Ahora
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default Home

