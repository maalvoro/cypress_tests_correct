const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // Configuración base
    baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:3000',
    
    // Viewport y timeouts optimizados para CI
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: process.env.CI ? 15000 : 10000,
    requestTimeout: process.env.CI ? 20000 : 15000,
    responseTimeout: process.env.CI ? 20000 : 15000,
    pageLoadTimeout: process.env.CI ? 30000 : 60000,
    
    // Configuración específica para CI
    video: true,
    videoCompression: 32, // Compression para CI artifacts
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Configuración de archivos de prueba
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    
    // Configuración de ambiente
    env: {
      // Variables de ambiente para CI
      CI: process.env.CI || false,
      NODE_ENV: process.env.NODE_ENV || 'test'
    },
    
    // Configuración experimental para mejor performance en CI
    experimentalStudio: false,
    experimentalSourceRewriting: false,
    
    // Configuración de retry para CI stability
    retries: {
      runMode: process.env.CI ? 2 : 0,  // 2 retries en CI, 0 en local
      openMode: 0
    },
    
    setupNodeEvents(on, config) {
      // Plugin para mejores reports en CI
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });

      // Configuración específica para CI
      if (config.isTextTerminal) {
        // Estamos ejecutando en CI (headless)
        config.video = true;
        config.screenshotOnRunFailure = true;
      }

      // Event listeners para debugging CI
      on('before:browser:launch', (browser = {}, launchOptions) => {
        console.log(`Launching browser: ${browser.name} in CI: ${config.env.CI}`);
        
        // Optimizaciones para electron en CI
        if (browser.name === 'electron') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-setuid-sandbox');
        }
        
        return launchOptions;
      });

      on('after:spec', (spec, results) => {
        console.log(`Completed spec: ${spec.name}`);
        console.log(`Tests passed: ${results.stats.passes}`);
        console.log(`Tests failed: ${results.stats.failures}`);
      });

      // Configuración específica por ambiente
      if (process.env.NODE_ENV === 'test') {
        config.baseUrl = process.env.CYPRESS_baseUrl || 'http://localhost:3000';
      }

      return config;
    },
  },
  
  // Configuración de componentes (si se necesita en el futuro)
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
});