const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    
    // Configuración específica para tests API
    env: {
      apiUrl: 'http://localhost:3000/api',
      enableApiTests: true,
      retryOnNetworkFailure: true
    },
    
    // Configuración de especificaciones para diferentes tipos de tests
    specPattern: [
      'cypress/e2e/**/*.cy.js',
      'cypress/e2e/**/*.spec.js'
    ],
    
    // Configuración de timeouts específicos para API tests
    taskTimeout: 60000,
    pageLoadTimeout: 30000,
    
    // Configuración de retry para tests flaky
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Configuración para video y screenshots en modo CI
    video: true,
    screenshotOnRunFailure: true,
    
    setupNodeEvents(on, config) {
      // Configuración para tests API
      on('task', {
        log(message) {
          console.log(message);
          return null;
        },
        
        // Task para verificar salud de la API antes de ejecutar tests
        verifyApiHealth() {
          const http = require('http');
          
          return new Promise((resolve, reject) => {
            const req = http.get('http://localhost:3000/api/health', (res) => {
              resolve({ status: res.statusCode, healthy: res.statusCode === 200 || res.statusCode === 404 });
            });
            
            req.on('error', (err) => {
              resolve({ status: 'error', healthy: false, error: err.message });
            });
            
            req.setTimeout(5000, () => {
              req.destroy();
              resolve({ status: 'timeout', healthy: false });
            });
          });
        }
      });
      
      // Configuración dinámica basada en environment
      if (config.env.CI) {
        config.video = true;
        config.retries.runMode = 3;
        config.defaultCommandTimeout = 15000;
      }
      
      // Configuración específica para GitHub Actions
      if (config.env.GITHUB_ACTIONS) {
        config.env.GITHUB_RUN_ID = process.env.GITHUB_RUN_ID || 'unknown';
        config.chromeWebSecurity = false;
      }
      
      return config;
    },
  },
});
