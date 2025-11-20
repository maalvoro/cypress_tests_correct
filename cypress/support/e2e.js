// ***********************************************************
// CYPRESS E2E SUPPORT - OPTIMIZADO PARA CI/CD
// 
// Este archivo se procesa y carga automáticamente antes de todos
// los archivos de prueba. Es el lugar ideal para configuración
// global y comportamientos que modifican Cypress para CI.
// ***********************************************************

// Importar comandos personalizados optimizados para CI
import './commands'
import './setup'
import './ci-config'

// ============================================================================
// CONFIGURACIÓN GLOBAL PARA CI
// ============================================================================

// Configuración de timeouts globales para CI
Cypress.config('defaultCommandTimeout', Cypress.env('CI') ? 15000 : 10000);
Cypress.config('requestTimeout', Cypress.env('CI') ? 20000 : 15000);
Cypress.config('responseTimeout', Cypress.env('CI') ? 20000 : 15000);

// ============================================================================
// MANEJO DE ERRORES PARA CI
// ============================================================================

// Capturar errores no manejados para mejor debugging en CI
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log del error para debugging en CI
  cy.log(`❌ Uncaught exception in CI: ${err.message}`);
  
  // Lista de errores que podemos ignorar en CI
  const ignorableErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Loading chunk',
    'Loading CSS chunk'
  ];
  
  // No fallar el test por errores específicos de la aplicación
  const shouldIgnore = ignorableErrors.some(ignorableError => 
    err.message.includes(ignorableError)
  );
  
  if (shouldIgnore) {
    cy.log(`⚠️ Ignoring known error in CI: ${err.message}`);
    return false; // Prevenir que Cypress falle el test
  }
  
  // Para otros errores, continuar con el comportamiento por defecto
  return true;
});

// ============================================================================
// HOOKS GLOBALES PARA CI
// ============================================================================

// Before hook global para setup de CI
beforeEach(() => {
  // Verificar estado de la aplicación antes de cada test en CI
  if (Cypress.env('CI')) {
    cy.log('🔧 CI: Verifying application state before test');
    
    // Verificar que la aplicación responde
    cy.request({
      url: '/',
      failOnStatusCode: false,
      timeout: 30000
    }).then((response) => {
      if (response.status !== 200) {
        cy.log(`⚠️ CI: Application returned status ${response.status}`);
      } else {
        cy.log('✅ CI: Application is responding normally');
      }
    });
  }
});

// After hook global para cleanup de CI
afterEach(() => {
  if (Cypress.env('CI')) {
    cy.log('🧹 CI: Post-test cleanup');
    
    // Limpiar cookies y storage después de cada test en CI
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.clearSessionStorage();
    
    cy.log('✅ CI: Cleanup completed');
  }
});

// ============================================================================
// CONFIGURACIONES ESPECÍFICAS PARA CI
// ============================================================================

// Aumentar timeouts para elementos en CI
if (Cypress.env('CI')) {
  // Override de comandos para mejor estabilidad en CI
  const originalGet = Cypress.Commands._commands.get[0].fn;
  
  Cypress.Commands.overwrite('get', (originalFn, selector, options = {}) => {
    // Timeouts más generosos en CI
    const ciOptions = {
      timeout: 15000,
      ...options
    };
    
    return originalFn(selector, ciOptions);
  });
  
  console.log('✅ CI-specific configurations loaded');
}

// ============================================================================
// LOGGING PARA CI
// ============================================================================

// Logger personalizado para CI
Cypress.Commands.add('ciLog', (message, data = null) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[CI ${timestamp}] ${message}`;
  
  cy.log(logMessage);
  
  if (data) {
    cy.log('📊 CI Data:', data);
  }
  
  // En CI, también enviar a console para logs de GitHub Actions
  if (Cypress.env('CI')) {
    cy.task('log', logMessage, { log: false });
    if (data) {
      cy.task('table', data, { log: false });
    }
  }
});

console.log('🚀 Cypress E2E Support loaded successfully for CI/CD environment');