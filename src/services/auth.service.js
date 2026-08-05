import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import User from "../models/user.model.js";
import { env } from "../config/env.js";

import { generateSecret, generateURI, verify } from "otplib";


const loginService = async (data) => {
    try {
        const user = await User.findOne({ email: data.email });
        if (!user) {
            throw { statusCode: 404, message: "Usuario no encontrado" };
        }
        
        const validPassword = await bcrypt.compare(data.password, user.password);
        if (!validPassword) {
            throw { statusCode: 401, message: "Password incorrecto" };
        }

        user.ultimoLogin = new Date();
        await user.save();

        // --- FLUJO 2FA ---
        // Si el usuario NO tiene el 2FA configurado y activado aún (Primer Login)
        if (!user.twoFactorEnabled) {
            // 1. Generamos un secreto único y seguro para este usuario
            const secret = generateSecret();
            user.twoFactorSecret = secret;
            await user.save();

            // 2. Creamos la URI estándar que entiende Google Authenticator / Authy
             const otpauth = generateURI({
                issuer: "TuAppIngenieria",
                label: user.email,
                secret: secret
            });
            // 3. Transformamos esa URI en un código QR en formato Base64 (imagen de texto)
            const qrCodeBase64 = await QRCode.toDataURL(otpauth);

            // Generamos un token temporal muy corto (vence en 5 min) solo para el segundo paso
            const tokenTemporal = jwt.sign(
                { userId: user._id, userEmail: user.email, pendiente2FA: true },
                env.JWT_SECRET,
                { expiresIn: "5m" }
            );

            return {
                requiere2FA: true,
                qrCode: qrCodeBase64, // Viaja directamente a la etiqueta <img> del front
                tokenTemporal,
            };
        }

        // Si ya lo tiene activo de antes, solo pide el código sin mandar el QR de nuevo
        if (user.twoFactorEnabled) {
            const tokenTemporal = jwt.sign(
                { userId: user._id, pendiente2FA: true },
                env.JWT_SECRET,
                { expiresIn: "5m" }
            );

            return {
                requiere2FA: true,
                qrCode: null,
                tokenTemporal,
            };
        }
    } catch (error) {
        console.error("✖️ Error en loginService", error);
        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
        };
    }
};

// NUEVO SERVICIO: Para verificar el código numérico que mande el front
const verificar2FAService = async (tokenTemporal, codigo) => {
    try {
        // 1. Desencriptamos el token temporal para saber qué usuario es
        let decoded;
        try {
            decoded = jwt.verify(tokenTemporal, env.JWT_SECRET);
        } catch (err) {
            throw { statusCode: 401, message: "La sesión temporal expiró. Volvé a ingresar." };
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.twoFactorSecret) {
            throw { statusCode: 404, message: "Sesión de verificación inválida." };
        }

        // 2. Validación de seguridad con otplib contra el secreto guardado en la base de datos
        const result = await verify({
            token: codigo,
            secret: user.twoFactorSecret,
        });

        if (!result.valid) {
            throw { statusCode: 400, message: "El código de verificación es incorrecto." };
        }

        // Si es la primera vez que se valida con éxito, lo marcamos como activo definitivo
        if (!user.twoFactorEnabled) {
            user.twoFactorEnabled = true;
            await user.save();
        }

        // 3. Generación del JWT Real y Definitivo de Sesión
        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

        return {
            token,
            role: user.role,
            userId: user._id,
        };
    } catch (error) {
        console.error("✖️ Error en verificar2FAService", error);
        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
        };
    }
};

export { loginService, verificar2FAService };




//##############################################
//CODIGO ANTES DE VERIFICACION DE DOBLE FACTOR
//##############################################

/*import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { env } from "../config/env.js"

const loginService = async (data) => {
    try {
        const user = await User.findOne({
            email: data.email,
        })
        if (!user) {
            throw {
                statusCode: 404,
                message: "Usuario no encontrado",
            }
        }
        const validPassword = await bcrypt.compare (
            data.password,
            user.password,
        )
        if (!validPassword) {
            throw {
                statusCode: 401,
                message: "Password incorrecto",
            }
        }

        //Actualizar fecha y hora del ultimo login
        user.ultimoLogin = new Date()

        await user.save()

        //Payload del token
        const payload = {
            userId: user._id,
            role: user.role,
        }

        //Generacion del JWT
        const token = jwt.sign(
            payload,
            env.JWT_SECRET,
            {
                expiresIn: env.JWT_EXPIRES_IN,
            }
        )

        return {
            token,
            role: user.role,
        }
    } catch (error) {
        console.error(
            "✖️ Error en loginService",
            error
        )

        throw {
            statusCode: error.statusCode || 500,
            message: error.message || "Error interno del servidor",
            errors: error.errors || null,
        }
    }
}

export { loginService }*/