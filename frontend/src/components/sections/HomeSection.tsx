import React, { useState, useEffect } from 'react';
import { Building2, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const HomeSection: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[calc(100vh-200px)] relative overflow-hidden">
      {/* Fondo con gradiente elegante */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 40% 60%, rgba(168, 85, 247, 0.05) 0%, transparent 40%),
            linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.03) 50%, rgba(168, 85, 247, 0.05) 100%)
          `
        }}
      />

      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8">
        {/* Logo/Título principal */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-primary-600 rounded-full shadow-lg">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Servicios Contables de Occidente
          </h1>
        </div>

        {/* Información de fecha y hora */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 border border-gray-200/50">
          <div className="flex items-center justify-center space-x-6 text-gray-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-300" />
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">
                {format(currentTime, 'HH:mm:ss', { locale: es })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;