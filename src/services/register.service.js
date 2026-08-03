import { Resend } from 'resend';
import crypto from 'bcryptjs';
import { env } from '../config/env.js';

const resend = new Resend(env.RESEND_API_KEY);

// Base de datos temporal en memoria (Expira automáticamente)
const registrosTemporales = new Map();

export const crearRegistroTemporal = async (datosUsuario) => {
  // 1. Generar código de 6 dígitos en el Backend
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 2. Generar un token único para identificar esta transacción en el Front
  const tokenTemporal = crypto.randomUUID();

  // 3. Definir tiempo de expiración (Ej: 5 minutos desde ahora)
  const expiraEn = Date.now() + 5 * 60 * 1000;

  // 4. Guardar temporalmente los datos del usuario + código + expiración
  registrosTemporales.set(tokenTemporal, {
    ...datosUsuario,
    codigo,
    expiraEn
  });

  // 5. Configurar auto-eliminación si expira el tiempo (Elimina del registro temporal)
  setTimeout(() => {
    if (registrosTemporales.has(tokenTemporal)) {
      console.log(`Registro temporal ${tokenTemporal} eliminado por expiración de tiempo.`);
      registrosTemporales.delete(tokenTemporal);
    }
  }, 5 * 60 * 1000);

  // 6. Enviar el correo usando Resend
  await resend.emails.send({
    from: 'TuApp <onboarding@resend.dev>', // Usa tu dominio verificado en producción
    to: [datosUsuario.email],
    subject: 'Tu código de verificación',
    html: `<p>Hola, tu código de confirmación es: <strong style="font-size: 20px;">${codigo}</strong></p>
           <p>Este código expira en 5 minutos.</p>`,
  });

  return { tokenTemporal };
};

export const confirmarRegistroDefinitivo = async (tokenTemporal, codigoIngresado) => {
  const registro = registrosTemporales.get(tokenTemporal);

  // Validación A: ¿Existe el registro o ya fue borrado por expiración?
  if (!registro) {
    throw new Error('El código ha expirado o la sesión de registro no existe.');
  }

  // Validación B: ¿Ya pasaron los 5 minutos? (Doble verificación de seguridad)
  if (Date.now() > registro.expiraEn) {
    registrosTemporales.delete(tokenTemporal); // Forzar borrado
    throw new Error('El código ha expirado. Vuelve a registrarte.');
  }

  // Validación C: ¿El código coincide?
  if (registro.codigo !== codigoIngresado) {
    throw new Error('El código ingresado es incorrecto.');
  }

  // --- PASO FINAL ---
  // Aquí es donde extraes los datos limpios y los insertas en tu Base de Datos Real
  const { email, direccion, pais, provincia, localidad } = registro;
  
  const nuevoUsuarioDefinitivo = {
    id: Math.floor(Math.random() * 1000), // Simulación de ID de Base de Datos
    email,
    direccion,
    pais,
    provincia,
    localidad,
    activo: true
  };

  // Guardar en tu DB real aquí (Ej: await Usuario.create(nuevoUsuarioDefinitivo))

  // Limpiamos la tabla temporal inmediatamente para liberar memoria/espacio
  registrosTemporales.delete(tokenTemporal);

  return nuevoUsuarioDefinitivo;
};