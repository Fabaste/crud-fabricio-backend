import { Resend } from 'resend';
import {resend} from '../config/resend.js'

console.log(resend)
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, codigo } = req.body;

  try {
    const data = await resend.emails.send({
      from: 'fabaste@msn.com>', // Cambia por tu dominio verificado
      to: [email],
      subject: 'Código de confirmación',
      html: `<p>Tu código de verificación es: <strong>${codigo}</strong></p>`,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}