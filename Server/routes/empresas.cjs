const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../models/index.cjs');

// GET /api/empresas - Listar empresas con conteos de trabajadores y vehículos
router.get('/', async (req, res) => {
  try {
    const empresas = await db.Empresa.findAll({
      include: [
        { model: db.Trabajador, as: 'trabajadores', attributes: ['id_trabajador'] },
        { model: db.Vehiculo, as: 'vehiculos', attributes: ['id_vehiculo'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const resultado = empresas.map(emp => {
      const plain = emp.get({ plain: true });
      const inicio = plain.corbatin_rango_inicio != null ? parseInt(plain.corbatin_rango_inicio, 10) : null;
      const fin = plain.corbatin_rango_fin != null ? parseInt(plain.corbatin_rango_fin, 10) : null;
      return {
        ...plain,
        id: String(plain.id_empresa),
        nombre: plain.razon_social,
        responsable: plain.responsable_nombre,
        estado: plain.estatus === 'ACTIVA' ? 'activo' : 'suspendido',
        totalTrabajadores: plain.trabajadores?.length || 0,
        totalVehiculos: plain.vehiculos?.length || 0,
        corbatin_rango_inicio: inicio,
        corbatin_rango_fin: fin,
        corbatinRangoInicio: inicio,
        corbatinRangoFin: fin,
        cuposTotales: (inicio && fin && fin >= inicio) ? (fin - inicio + 1) : null
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({ error: 'Error al consultar empresas', details: error.message });
  }
});

// GET /api/empresas/:id - Obtener empresa por ID
router.get('/:id', async (req, res) => {
  try {
    const empresa = await db.Empresa.findByPk(req.params.id, {
      include: [
        { model: db.Trabajador, as: 'trabajadores' },
        { model: db.Vehiculo, as: 'vehiculos' },
        { model: db.Usuario, as: 'usuarios', attributes: ['id_usuario', 'nombre', 'correo'] }
      ]
    });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    res.status(500).json({ error: 'Error al consultar empresa' });
  }
});

// POST /api/empresas - Registrar nueva empresa
router.post('/', async (req, res) => {
  try {
    const {
      razon_social,
      nombre,
      responsable_nombre,
      responsable,
      telefono,
      correo,
      estatus,
      estado,
      corbatin_rango_inicio,
      corbatin_rango_fin,
      corbatinRangoInicio,
      corbatinRangoFin
    } = req.body;

    const razon = razon_social || nombre;
    const resp = responsable_nombre || responsable;
    const rangoInicio = corbatin_rango_inicio ?? corbatinRangoInicio;
    const rangoFin = corbatin_rango_fin ?? corbatinRangoFin;

    if (!razon || !resp || !telefono) {
      return res.status(400).json({ error: 'Razón social, responsable y teléfono son obligatorios' });
    }

    const inicioParsed = rangoInicio != null && String(rangoInicio).trim() !== '' ? parseInt(rangoInicio, 10) : null;
    const finParsed = rangoFin != null && String(rangoFin).trim() !== '' ? parseInt(rangoFin, 10) : null;

    if (inicioParsed !== null && finParsed !== null) {
      if (inicioParsed > finParsed) {
        return res.status(400).json({ error: 'El corbatín inicial no puede ser mayor al corbatín final.' });
      }

      // Validar que el rango no se empalme con otra empresa
      const empalme = await db.Empresa.findOne({
        where: {
          corbatin_rango_inicio: { [Op.ne]: null },
          corbatin_rango_fin: { [Op.ne]: null },
          [Op.and]: [
            { corbatin_rango_inicio: { [Op.lte]: finParsed } },
            { corbatin_rango_fin: { [Op.gte]: inicioParsed } }
          ]
        }
      });

      if (empalme) {
        return res.status(400).json({
          error: `El rango #${inicioParsed} al #${finParsed} se traslapa con la empresa "${empalme.razon_social}" (Rango: #${empalme.corbatin_rango_inicio} al #${empalme.corbatin_rango_fin}). Cada empresa debe tener un rango único.`
        });
      }
    }

    const nueva = await db.Empresa.create({
      razon_social: razon,
      responsable_nombre: resp,
      telefono,
      correo: correo || null,
      estatus: estatus || (estado === 'activo' ? 'ACTIVA' : 'ACTIVA'),
      corbatin_rango_inicio: inicioParsed,
      corbatin_rango_fin: finParsed
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al crear empresa:', error);
    res.status(500).json({ error: 'Error al registrar empresa', details: error.message });
  }
});

// PUT /api/empresas/:id - Actualizar empresa
router.put('/:id', async (req, res) => {
  try {
    const empresa = await db.Empresa.findByPk(req.params.id);
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

    const {
      razon_social,
      nombre,
      responsable_nombre,
      responsable,
      telefono,
      correo,
      estatus,
      estado,
      corbatin_rango_inicio,
      corbatin_rango_fin,
      corbatinRangoInicio,
      corbatinRangoFin
    } = req.body;

    if (razon_social || nombre) empresa.razon_social = razon_social || nombre;
    if (responsable_nombre || responsable) empresa.responsable_nombre = responsable_nombre || responsable;
    if (telefono !== undefined) empresa.telefono = telefono;
    if (correo !== undefined) empresa.correo = correo;
    if (estatus !== undefined) empresa.estatus = estatus;
    else if (estado !== undefined) empresa.estatus = estado === 'activo' ? 'ACTIVA' : 'SUSPENDIDA';

    const rangoInicio = corbatin_rango_inicio ?? corbatinRangoInicio;
    const rangoFin = corbatin_rango_fin ?? corbatinRangoFin;

    if (rangoInicio !== undefined) {
      empresa.corbatin_rango_inicio = rangoInicio != null && String(rangoInicio).trim() !== '' ? parseInt(rangoInicio, 10) : null;
    }
    if (rangoFin !== undefined) {
      empresa.corbatin_rango_fin = rangoFin != null && String(rangoFin).trim() !== '' ? parseInt(rangoFin, 10) : null;
    }

    if (empresa.corbatin_rango_inicio != null && empresa.corbatin_rango_fin != null) {
      if (empresa.corbatin_rango_inicio > empresa.corbatin_rango_fin) {
        return res.status(400).json({ error: 'El corbatín inicial no puede ser mayor al corbatín final.' });
      }

      // Validar que el rango no se empalme con otra empresa (excluyendo la actual)
      const empalme = await db.Empresa.findOne({
        where: {
          id_empresa: { [Op.ne]: req.params.id },
          corbatin_rango_inicio: { [Op.ne]: null },
          corbatin_rango_fin: { [Op.ne]: null },
          [Op.and]: [
            { corbatin_rango_inicio: { [Op.lte]: empresa.corbatin_rango_fin } },
            { corbatin_rango_fin: { [Op.gte]: empresa.corbatin_rango_inicio } }
          ]
        }
      });

      if (empalme) {
        return res.status(400).json({
          error: `El rango #${empresa.corbatin_rango_inicio} al #${empresa.corbatin_rango_fin} se traslapa con la empresa "${empalme.razon_social}" (Rango: #${empalme.corbatin_rango_inicio} al #${empalme.corbatin_rango_fin}). Cada empresa debe tener un rango único.`
        });
      }
    }

    await empresa.save();
    res.json(empresa);
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json({ error: 'Error al actualizar empresa', details: error.message });
  }
});

// DELETE /api/empresas/:id - Eliminar empresa permanentemente (con cascada limpia)
router.delete('/:id', async (req, res) => {
  try {
    const idEmp = req.params.id;
    const empresa = await db.Empresa.findByPk(idEmp);
    if (!empresa) return res.json({ message: 'Empresa ya no existe o fue eliminada previamente', id_empresa: idEmp });

    // 1. Obtener todos los vehículos de la empresa
    const vehiculos = await db.Vehiculo.findAll({ where: { id_empresa: idEmp }, attributes: ['id_vehiculo'] }).catch(() => []);
    const vehiculoIds = vehiculos.map(v => v.id_vehiculo);

    // 2. Obtener todos los trabajadores de la empresa
    const trabajadores = await db.Trabajador.findAll({ where: { id_empresa: idEmp }, attributes: ['id_trabajador'] }).catch(() => []);
    const trabajadorIds = trabajadores.map(t => t.id_trabajador);

    // 3. Limpiar corbatines asociados a los vehículos
    if (vehiculoIds.length > 0 && db.Corbatin) {
      await db.BitacoraAcceso.update({ id_corbatin: null }, { where: { id_vehiculo: vehiculoIds } }).catch(() => {});
      await db.Corbatin.destroy({ where: { id_vehiculo: vehiculoIds } }).catch(() => {});
    }

    // 4. Limpiar conductores de vehículos
    if (db.ConductorVehiculo) {
      if (vehiculoIds.length > 0) {
        await db.ConductorVehiculo.destroy({ where: { id_vehiculo: vehiculoIds } }).catch(() => {});
      }
      if (trabajadorIds.length > 0) {
        await db.ConductorVehiculo.destroy({ where: { id_trabajador: trabajadorIds } }).catch(() => {});
      }
    }

    // 5. Desvincular bitácora de acceso histórica (poner id_empresa, id_vehiculo, id_trabajador a NULL para conservar el historial)
    if (db.BitacoraAcceso) {
      await db.BitacoraAcceso.update(
        { id_empresa: null, id_vehiculo: null, id_trabajador: null, id_corbatin: null },
        { where: { id_empresa: idEmp } }
      ).catch(() => {});
      if (vehiculoIds.length > 0) {
        await db.BitacoraAcceso.update({ id_vehiculo: null }, { where: { id_vehiculo: vehiculoIds } }).catch(() => {});
      }
      if (trabajadorIds.length > 0) {
        await db.BitacoraAcceso.update({ id_trabajador: null }, { where: { id_trabajador: trabajadorIds } }).catch(() => {});
      }
    }

    // 6. Eliminar sanciones, revisiones, evidencias y reportes
    if (db.Sancion) {
      await db.Sancion.destroy({ where: { id_empresa: idEmp } }).catch(() => {});
      if (vehiculoIds.length > 0) {
        await db.Sancion.destroy({ where: { id_vehiculo: vehiculoIds } }).catch(() => {});
      }
    }

    const reportes = await db.ReporteInfraccion.findAll({ where: { id_empresa: idEmp }, attributes: ['id_reporte'] }).catch(() => []);
    const reporteIds = reportes.map(r => r.id_reporte);
    if (reporteIds.length > 0) {
      if (db.RevisionReporte) {
        await db.RevisionReporte.destroy({ where: { id_reporte: reporteIds } }).catch(() => {});
      }
      if (db.Evidencia) {
        await db.Evidencia.destroy({ where: { id_reporte: reporteIds } }).catch(() => {});
      }
      await db.ReporteInfraccion.destroy({ where: { id_reporte: reporteIds } }).catch(() => {});
    }

    // 7. Eliminar vehículos y trabajadores de la empresa
    if (vehiculoIds.length > 0) {
      await db.Vehiculo.destroy({ where: { id_vehiculo: vehiculoIds } }).catch(() => {});
    }
    if (trabajadorIds.length > 0) {
      await db.Trabajador.destroy({ where: { id_trabajador: trabajadorIds } }).catch(() => {});
    }

    // 8. Eliminar aceptaciones de reglamento
    if (db.AceptacionReglamento) {
      await db.AceptacionReglamento.destroy({ where: { id_empresa: idEmp } }).catch(() => {});
    }

    // 9. Eliminar usuarios de la empresa
    if (db.Usuario) {
      await db.Usuario.destroy({ where: { id_empresa: idEmp } }).catch(() => {});
    }

    // 10. Eliminar la empresa
    await empresa.destroy();

    res.json({ message: 'Empresa y registros asociados eliminados correctamente', id_empresa: idEmp });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    res.status(500).json({ error: 'Error al eliminar empresa', details: error.message });
  }
});

module.exports = router;
