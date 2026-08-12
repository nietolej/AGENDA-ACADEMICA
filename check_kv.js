const { createClient } = require('@vercel/kv');

const url = process.env.KV_REST_API_URL || "https://moral-terrier-125495.upstash.io";
const token = process.env.KV_REST_API_TOKEN || "gQAAAAAAAeo3AAIgcDE4NzVlMjJjNWVkODI0YTc0OTJiYTBlZDI3NTQ5OWE3NA";

const kv = createClient({ url, token });

async function check() {
  const materias = await kv.get('materias');
  console.log('Materias count:', materias ? materias.length : 0);
  if (materias && materias.length > 0) {
    console.log('Sample:', materias[0]);
  }
}

check();
