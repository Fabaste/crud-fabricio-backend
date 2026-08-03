import { Resend } from 'resend';
import {env} from './env.js'

if (!env.RESEND_API_KEY) {
  throw new Error('Falta la variable de entorno RESEND_API_KEY');
}

export const resend = new Resend(env.RESEND_API_KEY);