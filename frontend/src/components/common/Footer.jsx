const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">PowerCars Taller Mecánico</h3>
            <p className="text-gray-300 text-sm">
              Sistema de encuestas organizacionales para mejorar la estructura 
              y ambiente laboral de nuestra empresa.
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/encuesta" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Completar Encuesta
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-300 hover:text-yellow-400 transition-colors">
                  Acceso Administradores
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">Información</h4>
            <p className="text-gray-300 text-sm">
              Esta encuesta es confidencial y ayudará a mejorar nuestro 
              ambiente de trabajo y estructura organizacional.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 PowerCars Taller Mecánico. Sistema desarrollado para mejora organizacional.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

