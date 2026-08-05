import * as registerService from '../services/register.service.js';

export const iniciarRegistro = async (req, res) => {
  try {
    // req.body contiene: email, direccion, pais (nombre), provincia (nombre), localidad
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'El email es requerido' });
    }

    // Llamamos al servicio para procesar el preregistro
    const resultado = await registerService.crearRegistroTemporal(req.body);
    return res.status(200).json({ 
      success: true, 
      message: 'Código enviado al correo',
      tokenTemporal: resultado.tokenTemporal // Un identificador para saber quién está verificando
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verificarCodigo = async (req, res) => {
console.log("Verificando código:", req.body);
  try {
    const { tokenTemporal, codigo } = req.body;

    if (!tokenTemporal || !codigo) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    // El servicio valida el código y el tiempo de expiración
    const usuarioConfirmado = await registerService.confirmarRegistroDefinitivo(tokenTemporal, codigo);
console.log(usuarioConfirmado)
    return res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado con éxito', 
      data: usuarioConfirmado 
    });
  } catch (error) {
    // Si el código está mal o expiró, devolvemos un error 400
    return res.status(400).json({ success: false, message: error.message });
  }
};