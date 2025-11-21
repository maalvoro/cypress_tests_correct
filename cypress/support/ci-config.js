// ============================================================================
// CONFIGURACIÓN DE ENTORNO PARA CI - CYPRESS
// ============================================================================

// Variables de ambiente para diferentes entornos
const environments = {
  // Configuración para CI (GitHub Actions)
  ci: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 15000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    pageLoadTimeout: 30000,
    video: true,
    screenshotOnRunFailure: true,
    retries: 2,
    viewportWidth: 1280,
    viewportHeight: 720
  },
  
  // Configuración para desarrollo local
  local: {
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 60000,
    video: false,
    screenshotOnRunFailure: true,
    retries: 0,
    viewportWidth: 1280,
    viewportHeight: 720
  },
  
  // Configuración para staging (futuro)
  staging: {
    baseUrl: 'https://staging.happytesting.com',
    defaultCommandTimeout: 20000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    pageLoadTimeout: 45000,
    video: true,
    screenshotOnRunFailure: true,
    retries: 3,
    viewportWidth: 1280,
    viewportHeight: 720
  }
};

// ============================================================================
// DATOS DE PRUEBA PARA CI
// ============================================================================

const testData = {
  // User configurations are now handled dynamically
  // See commands.js getTestUserCredentials() for dynamic user generation
  users: {
    // Legacy configuration - now handled by dynamic system
    testUser: {
      name: 'Dynamic Test User',
      email: 'dynamic-user@nutriapp.com', // Placeholder - actual email is generated dynamically
      password: 'dynamic-password'         // Placeholder - actual password is generated dynamically
    },
    adminUser: {
      name: 'CI Admin User',
      email: 'admin@nutriapp.com',
      password: 'admin123'
    }
  },
  
  dishes: {
    sampleDish: {
      name: 'CI Sample Dish',
      description: 'A dish created by CI automation',
      prepTime: '10',
      cookTime: '15',
      calories: '250',
      steps: [
        'Step 1: CI preparation',
        'Step 2: CI cooking',
        'Step 3: CI serving'
      ]
    },
    
    quickDish: {
      name: 'CI Quick Dish',
      description: 'A quick dish for CI testing',
      quickPrep: true,
      calories: '150',
      steps: ['Quick step: Ready to serve']
    }
  }
};

// ============================================================================
// SELECTORES COMUNES PARA CI
// ============================================================================

const selectors = {
  // Autenticación
  auth: {
    emailInput: '[data-testid="login-email-input"]',
    passwordInput: '[data-testid="login-password-input"]',
    submitButton: '[data-testid="login-submit"]',
    registerLink: '[data-testid="register-link"]'
  },
  
  // Navegación
  navigation: {
    homeLink: '[data-testid="nav-home"]',
    dishesLink: '[data-testid="nav-dishes"]',
    loginLink: '[data-testid="nav-login"]',
    logoutButton: '[data-testid="nav-logout"]'
  },
  
  // Gestión de platillos
  dishes: {
    container: '[data-testid="dishes-container"]',
    header: '[data-testid="dishes-header"]',
    addButton: '[data-testid="add-dish-button"]',
    dishCard: '[data-testid="dish-card"]',
    
    // Formulario nuevo platillo
    form: {
      nameInput: '[data-testid="new-dish-name-input"]',
      descriptionInput: '[data-testid="new-dish-description-input"]',
      prepTimeInput: '[data-testid="new-dish-preptime-input"]',
      cookTimeInput: '[data-testid="new-dish-cooktime-input"]',
      caloriesInput: '[data-testid="new-dish-calories-input"]',
      imageUrlInput: '[data-testid="new-dish-image-url-input"]',
      quickPrepCheckbox: '[data-testid="new-dish-quickprep-checkbox"]',
      stepInput: '[data-testid="new-dish-step-input"]',
      addStepButton: '[data-testid="new-dish-add-step-button"]',
      submitButton: '[data-testid="new-dish-submit-button"]'
    }
  }
};

// ============================================================================
// UTILIDADES PARA CI
// ============================================================================

const ciUtils = {
  // Generar timestamp único para CI
  generateTimestamp: () => Date.now(),
  
  // Generar ID único para evitar conflictos en CI paralelo
  generateUniqueId: () => Math.random().toString(36).substring(7),
  
  // Generar nombre único para tests en CI
  generateUniqueName: (prefix = 'CI Test') => {
    const timestamp = Date.now();
    const id = Math.random().toString(36).substring(7);
    return `${prefix} ${timestamp}-${id}`;
  },
  
  // Verificar si estamos ejecutando en CI
  isCI: () => Cypress.env('CI') || process.env.CI || false,
  
  // Obtener configuración según ambiente
  getEnvironmentConfig: (env = 'local') => {
    if (ciUtils.isCI()) {
      return environments.ci;
    }
    return environments[env] || environments.local;
  }
};

// ============================================================================
// EXPORTACIONES
// ============================================================================

// Hacer disponibles globalmente en Cypress
if (typeof window !== 'undefined') {
  window.testData = testData;
  window.selectors = selectors;
  window.ciUtils = ciUtils;
  window.environments = environments;
}

// Para uso en Node.js (comandos personalizados)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testData,
    selectors,
    ciUtils,
    environments
  };
}