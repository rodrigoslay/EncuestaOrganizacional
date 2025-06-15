import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { LogOut, Settings, BarChart3 } from 'lucide-react'

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">PowerCars</h1>
              <p className="text-blue-200 text-sm">Taller Mecánico</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="hover:text-yellow-400 transition-colors"
            >
              Inicio
            </Link>
            <Link 
              to="/encuesta" 
              className="hover:text-yellow-400 transition-colors"
            >
              Encuesta
            </Link>
            {isAuthenticated && (
              <>
                <Link 
                  to="/dashboard" 
                  className="hover:text-yellow-400 transition-colors flex items-center space-x-1"
                >
                  <BarChart3 size={16} />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/reportes" 
                  className="hover:text-yellow-400 transition-colors flex items-center space-x-1"
                >
                  <Settings size={16} />
                  <span>Reportes</span>
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm">
                  Hola, {user?.full_name || user?.username}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-blue-900 border-white hover:bg-white"
                >
                  <LogOut size={16} className="mr-1" />
                  Salir
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-blue-900 border-white hover:bg-white"
                >
                  Administrador
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

