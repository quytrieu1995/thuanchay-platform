import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Đọc version từ package.json
const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const appVersion = packageJson.version

// Plugin để inject version và tạo version.json
const versionPlugin = () => {
  let buildTime = new Date().toISOString()
  let buildHash = Date.now().toString(36)

  return {
    name: 'version-plugin',
    buildStart() {
      buildTime = new Date().toISOString()
      buildHash = Date.now().toString(36)
    },
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>
    <meta name="app-version" content="${appVersion}" />
    <meta name="build-time" content="${buildTime}" />
    <meta name="build-hash" content="${buildHash}" />`
      )
    },
    closeBundle() {
      // Tạo file version.json trong thư mục dist sau khi build xong
      const versionData = {
        version: appVersion,
        buildTime,
        buildHash,
        timestamp: Date.now()
      }
      try {
        writeFileSync(
          resolve(__dirname, 'dist/version.json'),
          JSON.stringify(versionData, null, 2),
          'utf-8'
        )
      } catch (error) {
        console.warn('Could not write version.json:', error.message)
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    versionPlugin()
  ],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
  }
})
