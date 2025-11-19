import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

const PASSWORD = 's0p0rt3*%';

const tables = [
  { key: 'consolidaciones_generales', label: 'Consolidaciones Generales' },
  { key: 'consolidaciones_hoteles', label: 'Consolidaciones Hoteles' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'users', label: 'Usuarios' },
  { key: 'system_logs', label: 'Logs del Sistema' },
  { key: 'uploaded_files', label: 'Archivos Subidos' }
];

// helper para nombre de backup en el servidor se maneja en backend

// Nota: las acciones ahora se ejecutan en el backend vía API segura.

const SystemConfig: React.FC = () => {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [confirmMode, setConfirmMode] = useState<'backup' | 'delete' | null>(null);
  const [backupBefore, setBackupBefore] = useState(true);

  if (!user || user.role !== 'admin') return null;

  const tryUnlock = () => {
    if (password === PASSWORD) {
      setUnlocked(true);
      toast.success('Acceso concedido a Configuración de Sistema');
      setPassword('');
    } else {
      toast.error('Contraseña incorrecta');
    }
  };

  const handleAction = (tableKey: string, mode: 'backup' | 'delete') => {
    setSelectedTable(tableKey);
    setConfirmMode(mode);
  };
  const getApiBase = () => {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') return `http://${host}:3002/api`;
    return 'http://localhost:3002/api';
  };

  const performBackup = async () => {
    if (!selectedTable) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiBase()}/admin/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ table: selectedTable })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Error en backup');

      toast.success(`Respaldo creado: ${data.backup} (${data.rows} filas)`);
      setSelectedTable(null);
      setConfirmMode(null);
    } catch (error: any) {
      console.error('Error backup:', error);
      toast.error(error.message || 'Error creando respaldo');
    }
  };

  const performDelete = async (backupBefore = false) => {
    if (!selectedTable) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${getApiBase()}/admin/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ table: selectedTable, backupBefore })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || 'Error en eliminación');

      toast.success(`Eliminación ejecutada${data.backup ? ` (respaldo: ${data.backup})` : ''}`);
      setSelectedTable(null);
      setConfirmMode(null);
    } catch (error: any) {
      console.error('Error delete:', error);
      toast.error(error.message || 'Error eliminando registros');
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Ajustes en DB y esenciales</h3>

      {!unlocked ? (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="input-field"
            />
            <button onClick={tryUnlock} className="btn-primary">Abrir</button>
          </div>
          
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tables.map(t => (
              <div key={t.key} className="p-3 border rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.label}</div>
                    <div className="text-xs text-gray-500">Tabla: <code>{t.key}</code></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleAction(t.key, 'backup')} className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded">Crear respaldo</button>
                    <button onClick={() => handleAction(t.key, 'delete')} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded">Borrar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <button onClick={() => { setUnlocked(false); toast('Sesión cerrada'); }} className="btn-secondary">Cerrar Configuración</button>
          </div>
        </div>
      )}

      {/* Confirm modal (simple inline) */}
      {selectedTable && confirmMode && (
        <div className="mt-4 p-4 border rounded bg-white">
          <h4 className="font-semibold">Confirmar acción</h4>
          <p className="text-sm text-gray-600">Tabla: <code>{selectedTable}</code></p>
          {confirmMode === 'backup' ? (
            <>
              <p className="mt-2">¿Desea crear un respaldo y ejecutarlo en el servidor?</p>
              <div className="mt-3 space-x-2">
                <button onClick={performBackup} className="btn-primary">Crear respaldo en servidor</button>
                <button onClick={() => { setSelectedTable(null); setConfirmMode(null); }} className="btn-secondary">Cancelar</button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-red-600">ATENCIÓN: Esto eliminará TODOS los registros de la tabla en el servidor. Puede crear un respaldo antes de borrar.</p>
              <div className="mt-2">
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={backupBefore} onChange={(e) => setBackupBefore(e.target.checked)} className="mr-2" />
                  <span className="text-sm">Crear respaldo antes de eliminar</span>
                </label>
              </div>
              <div className="mt-3 space-x-2">
                <button onClick={() => performDelete(backupBefore)} className="px-3 py-1 bg-red-600 text-white rounded">Eliminar en servidor</button>
                <button onClick={() => { setSelectedTable(null); setConfirmMode(null); }} className="btn-secondary">Cancelar</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemConfig;
