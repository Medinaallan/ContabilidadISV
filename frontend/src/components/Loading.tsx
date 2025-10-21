import { LoadingProps } from '@/types';

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'Cargando...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div 
        className={`loader border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin ${sizeClasses[size]}`}
      ></div>
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export default Loading;