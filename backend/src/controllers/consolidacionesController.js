const ConsolidacionGenerales = require('../models/ConsolidacionGenerales');
const ConsolidacionHoteles = require('../models/ConsolidacionHoteles');
const Cliente = require('../models/Cliente');

const consolidacionGenerales = new ConsolidacionGenerales();
const consolidacionHoteles = new ConsolidacionHoteles();
const cliente = new Cliente();

// Crear nueva consolidación
exports.create = async (req, res) => {
    try {
        const { tipoRubro, ...consolidacionData } = req.body;
        
        // Validar datos requeridos
        if (!consolidacionData.cliente_id || !consolidacionData.fecha_inicio || !consolidacionData.fecha_fin) {
            return res.status(400).json({
                error: 'Faltan datos requeridos: cliente_id, fecha_inicio, fecha_fin'
            });
        }

        // Validar que el cliente existe
        const clienteExiste = await cliente.getById(consolidacionData.cliente_id);
        if (!clienteExiste) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        // Agregar usuario de la sesión
        consolidacionData.usuario_id = req.user.id;

        let result;
        
        // Determinar qué tabla usar basado en el tipo de rubro
        if (tipoRubro === 'HOTELES') {
            result = await consolidacionHoteles.create(consolidacionData);
            result.tipo = 'HOTELES';
        } else {
            // Por defecto usar tabla generales
            result = await consolidacionGenerales.create(consolidacionData);
            result.tipo = 'GENERALES';
        }

        res.status(201).json({
            message: 'Consolidación creada exitosamente',
            data: result
        });

    } catch (error) {
        console.error('Error en consolidacionesController.create:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

// Obtener todas las consolidaciones (ambas tablas)
exports.getAll = async (req, res) => {
    try {
        const { cliente_id, fecha_desde, fecha_hasta, tipo } = req.query;
        
        const filters = {};
        if (cliente_id) filters.cliente_id = cliente_id;
        if (fecha_desde) filters.fecha_desde = fecha_desde;
        if (fecha_hasta) filters.fecha_hasta = fecha_hasta;

        let consolidaciones = [];

        // Obtener de ambas tablas o solo una según filtro
        if (!tipo || tipo === 'GENERALES') {
            const generales = await consolidacionGenerales.getAll(filters);
            consolidaciones = consolidaciones.concat(
                generales.map(c => ({ ...c, tipo: 'GENERALES' }))
            );
        }

        if (!tipo || tipo === 'HOTELES') {
            const hoteles = await consolidacionHoteles.getAll(filters);
            consolidaciones = consolidaciones.concat(
                hoteles.map(c => ({ ...c, tipo: 'HOTELES' }))
            );
        }

        // Ordenar por fecha de creación desc
        consolidaciones.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

        res.status(200).json({
            message: 'Consolidaciones obtenidas exitosamente',
            data: consolidaciones,
            total: consolidaciones.length
        });

    } catch (error) {
        console.error('Error en consolidacionesController.getAll:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

// Obtener consolidación por ID
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.query;

        if (!tipo) {
            return res.status(400).json({
                error: 'Parámetro tipo requerido (GENERALES o HOTELES)'
            });
        }

        let consolidacion;

        if (tipo === 'HOTELES') {
            consolidacion = await consolidacionHoteles.getById(id);
        } else {
            consolidacion = await consolidacionGenerales.getById(id);
        }

        if (!consolidacion) {
            return res.status(404).json({
                error: 'Consolidación no encontrada'
            });
        }

        consolidacion.tipo = tipo;

        res.status(200).json({
            message: 'Consolidación obtenida exitosamente',
            data: consolidacion
        });

    } catch (error) {
        console.error('Error en consolidacionesController.getById:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

// Actualizar consolidación
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipoRubro, ...consolidacionData } = req.body;

        if (!tipoRubro) {
            return res.status(400).json({
                error: 'Parámetro tipoRubro requerido (GENERALES o HOTELES)'
            });
        }

        let result;

        if (tipoRubro === 'HOTELES') {
            result = await consolidacionHoteles.update(id, consolidacionData);
        } else {
            result = await consolidacionGenerales.update(id, consolidacionData);
        }

        if (!result) {
            return res.status(404).json({
                error: 'Consolidación no encontrada'
            });
        }

        result.tipo = tipoRubro;

        res.status(200).json({
            message: 'Consolidación actualizada exitosamente',
            data: result
        });

    } catch (error) {
        console.error('Error en consolidacionesController.update:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

// Eliminar consolidación
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo } = req.query;

        if (!tipo) {
            return res.status(400).json({
                error: 'Parámetro tipo requerido (GENERALES o HOTELES)'
            });
        }

        let result;

        if (tipo === 'HOTELES') {
            result = await consolidacionHoteles.delete(id);
        } else {
            result = await consolidacionGenerales.delete(id);
        }

        res.status(200).json({
            message: 'Consolidación eliminada exitosamente',
            data: result
        });

    } catch (error) {
        console.error('Error en consolidacionesController.delete:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

// Obtener consolidaciones por cliente
exports.getByCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const { tipo } = req.query;

        // Validar que el cliente existe
        const clienteExiste = await cliente.getById(clienteId);
        if (!clienteExiste) {
            return res.status(404).json({
                error: 'Cliente no encontrado'
            });
        }

        let consolidaciones = [];

        // Obtener de ambas tablas o solo una según filtro
        if (!tipo || tipo === 'GENERALES') {
            const generales = await consolidacionGenerales.getByCliente(clienteId);
            consolidaciones = consolidaciones.concat(
                generales.map(c => ({ ...c, tipo: 'GENERALES' }))
            );
        }

        if (!tipo || tipo === 'HOTELES') {
            const hoteles = await consolidacionHoteles.getByCliente(clienteId);
            consolidaciones = consolidaciones.concat(
                hoteles.map(c => ({ ...c, tipo: 'HOTELES' }))
            );
        }

        // Ordenar por fecha de creación desc
        consolidaciones.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

        res.status(200).json({
            message: 'Consolidaciones del cliente obtenidas exitosamente',
            data: {
                cliente: clienteExiste,
                consolidaciones: consolidaciones,
                total: consolidaciones.length
            }
        });

    } catch (error) {
        console.error('Error en consolidacionesController.getByCliente:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

// Obtener estadísticas de I.S.T. (solo hoteles)
exports.getISTStatistics = async (req, res) => {
    try {
        const { cliente_id, fecha_desde, fecha_hasta } = req.query;
        
        const filters = {};
        if (cliente_id) filters.cliente_id = cliente_id;
        if (fecha_desde) filters.fecha_desde = fecha_desde;
        if (fecha_hasta) filters.fecha_hasta = fecha_hasta;

        const statistics = await consolidacionHoteles.getISTStatistics(filters);

        res.status(200).json({
            message: 'Estadísticas de I.S.T. obtenidas exitosamente',
            data: statistics
        });

    } catch (error) {
        console.error('Error en consolidacionesController.getISTStatistics:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};

// Obtener resumen de consolidaciones
exports.getSummary = async (req, res) => {
    try {
        const { cliente_id, fecha_desde, fecha_hasta } = req.query;
        
        const filters = {};
        if (cliente_id) filters.cliente_id = cliente_id;
        if (fecha_desde) filters.fecha_desde = fecha_desde;
        if (fecha_hasta) filters.fecha_hasta = fecha_hasta;

        const generales = await consolidacionGenerales.getAll(filters);
        const hoteles = await consolidacionHoteles.getAll(filters);

        const summary = {
            total_consolidaciones: generales.length + hoteles.length,
            consolidaciones_generales: generales.length,
            consolidaciones_hoteles: hoteles.length,
            total_debe_generales: generales.reduce((sum, c) => sum + (c.total_debe || 0), 0),
            total_haber_generales: generales.reduce((sum, c) => sum + (c.total_haber || 0), 0),
            total_debe_hoteles: hoteles.reduce((sum, c) => sum + (c.total_debe || 0), 0),
            total_haber_hoteles: hoteles.reduce((sum, c) => sum + (c.total_haber || 0), 0),
            total_ist_hoteles: hoteles.reduce((sum, c) => sum + (c.ist_4_haber || 0), 0),
            consolidaciones_balanceadas: [...generales, ...hoteles].filter(c => c.balanceado).length
        };

        res.status(200).json({
            message: 'Resumen obtenido exitosamente',
            data: summary
        });

    } catch (error) {
        console.error('Error en consolidacionesController.getSummary:', error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
};