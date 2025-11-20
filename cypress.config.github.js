const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // Configuración base para CI
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeouts optimizados para CI con Node.js 20
    defaultCommandTimeout: 15000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    pageLoadTimeout: 30000,
    
    // Configuración de video y screenshots para CI
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Archivos de prueba
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    
    // Variables de ambiente
    env: {
      CI: true,
      NODE_ENV: 'test'
    },
    
    // Configuración de retry para estabilidad en CI
    retries: {
      runMode: 2,  // 2 retries en CI
      openMode: 0  // 0 retries en modo interactivo
    },
    
    // Configuración experimental deshabilitada para mayor compatibilidad
    experimentalStudio: false,
    experimentalSourceRewriting: false,
    experimentalModifyObstructiveThirdPartyCode: false,
    
    // Configuración específica para evitar problemas de tsx
    experimentalWebKitSupport: false,
    
    setupNodeEvents(on, config) {
      // Configurar tasks para logging en CI
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        table(message) {
          console.table(message)
          return null
        }
      })

      // Configuración específica para CI
      if (process.env.CI) {
        // Configuraciones adicionales para CI
        config.video = true
        config.screenshotOnRunFailure = true
        config.defaultCommandTimeout = 15000
        config.requestTimeout = 20000
        config.responseTimeout = 20000
      }

      // Event listeners para debugging
      on('before:browser:launch', (browser = {}, launchOptions) => {
        console.log(`[CI] Launching browser: ${browser.name}`)
        
        // Optimizaciones para electron en CI
        if (browser.name === 'electron') {
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-setuid-sandbox')
          launchOptions.args.push('--disable-extensions')
          launchOptions.args.push('--disable-background-timer-throttling')
          launchOptions.args.push('--disable-backgrounding-occluded-windows')
          launchOptions.args.push('--disable-renderer-backgrounding')
        }
        
        return launchOptions
      })

      on('after:spec', (spec, results) => {
        console.log(`[CI] Completed spec: ${spec.name}`)
        console.log(`[CI] Tests passed: ${results.stats.passes}`)
        console.log(`[CI] Tests failed: ${results.stats.failures}`)
      })

      // Configuración de base URL dinámica
      if (process.env.CYPRESS_baseUrl) {
        config.baseUrl = process.env.CYPRESS_baseUrl
      }

      return config
    },
  },
})