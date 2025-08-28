import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Ortam değişkenlerini yükle
  // Üçüncü parametre ('') ile, sadece VITE_ ile başlayan değişkenleri değil, tüm değişkenleri al
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Projenizin temel URL yolunu belirtir
    base: '/',
    plugins: [react()],
    // Bu 'define' bloğu, process.env değişkenini front-end'de kullanılabilir hale getirir
    define: {
      'process.env': JSON.stringify(env)
    },
    // Nginx'ten gelen istekleri kabul etmek için server ayarları
    server: {
      allowedHosts: ['zit.lol', 'www.zit.lol', 'api.zit.lol']
    },
  }
})