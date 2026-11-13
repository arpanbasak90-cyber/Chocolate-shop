import app, { bootstrapInitialOwner } from '../server/index.js';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    try {
      await bootstrapInitialOwner();
      initialized = true;
    } catch (e) {
      console.error('Vercel bootstrap notice:', e.message);
    }
  }
  return app(req, res);
}
