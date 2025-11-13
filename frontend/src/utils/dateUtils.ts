/**
 * Utilidades para manejo consistente de fechas en la aplicación
 * Evita problemas de zona horaria al trabajar con fechas
 */

/**
 * Formatea una fecha para mostrarla al usuario
 * Maneja tanto fechas con timestamp completo como fechas simples
 * Añade 24 horas para corregir problemas de zona horaria
 * @param dateString - Fecha en string (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss.sssZ)
 * @param options - Opciones de formato (opcional)
 * @returns Fecha formateada o string de error
 */
export const formatDate = (
  dateString: string, 
  options?: {
    includeTime?: boolean;
    format?: 'short' | 'long';
  }
): string => {
  if (!dateString) return '';
  
  try {
    let date: Date;
    
    // Si la fecha ya incluye hora/timestamp, usarla directamente
    if (dateString.includes('T')) {
      date = new Date(dateString);
    } else {
      // Si es solo fecha (YYYY-MM-DD), crear fecha local al mediodía
      date = new Date(dateString + 'T12:00:00');
    }
    
    // AÑADIR 24 HORAS (1 DÍA) para contrarrestar el problema de zona horaria
    date.setDate(date.getDate() + 1);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida:', dateString);
      return 'Fecha inválida';
    }
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: options?.format === 'short' ? 'short' : 'long',
      day: 'numeric',
    };
    
    if (options?.includeTime) {
      formatOptions.hour = '2-digit';
      formatOptions.minute = '2-digit';
      formatOptions.second = '2-digit';
    }
    
    return date.toLocaleDateString('es-ES', formatOptions);
  } catch (error) {
    console.error('Error formateando fecha:', error, dateString);
    return 'Error de fecha';
  }
};

/**
 * Prepara una fecha para enviarla a la API
 * Convierte la fecha local a formato ISO sin problemas de zona horaria
 * @param dateString - Fecha en formato YYYY-MM-DD del input
 * @returns Fecha en formato YYYY-MM-DD para la API
 */
export const formatDateForAPI = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    // Crear fecha en zona local al mediodía para evitar conversión UTC
    const date = new Date(dateString + 'T12:00:00');
    
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida para API:', dateString);
      return '';
    }
    
    // Retornar solo la parte de fecha (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formateando fecha para API:', error, dateString);
    return '';
  }
};

/**
 * Formatea moneda hondureña
 * @param amount - Cantidad a formatear
 * @returns String con formato de moneda
 */
export const formatCurrency = (amount: number | string | null | undefined): string => {
  // Convertir a número y validar
  const numAmount = Number(amount);
  
  // Si es NaN, null, undefined o no es un número válido, usar 0
  const validAmount = isNaN(numAmount) ? 0 : numAmount;
  
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2
  }).format(validAmount);
};

/**
 * Obtiene la fecha y hora actual de Honduras
 * @returns Objeto Date con la hora local
 */
export const getCurrentDateTime = (): Date => {
  return new Date();
};

/**
 * Formatea fecha de creación (timestamp completo) para mostrar
 * NO añade día adicional porque ya viene con hora correcta
 * @param dateString - Fecha con timestamp completo
 * @returns Fecha formateada
 */
export const formatCreationDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.error('Fecha de creación inválida:', dateString);
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formateando fecha de creación:', error, dateString);
    return 'Error de fecha';
  }
};

/**
 * Formatea fecha y hora para mostrar en logs
 * Añade 24 horas para corregir problema de zona horaria
 * @param dateString - Fecha en string
 * @returns Fecha y hora formateadas
 */
export const formatDateTimeForLogs = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    let date = new Date(dateString);
    
    // AÑADIR 24 HORAS (1 DÍA) para contrarrestar el problema de zona horaria
    date.setDate(date.getDate() + 1);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida para logs:', dateString);
      return 'Fecha inválida';
    }
    
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Error formateando fecha para logs:', error, dateString);
    return 'Error de fecha';
  }
};