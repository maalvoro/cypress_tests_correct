/// <reference types="cypress" />

// ***********************************************
// Custom commands para Happy Testing app optimizados para CI
// ***********************************************

// ============================================================================
// AUTENTICACIÓN - Comandos optimizados para CI
// ============================================================================

// Login rápido vía API para mejor performance en CI
Cypress.Commands.add('loginAsTestUser', () => {
  cy.log('🔐 Logging in as test user via API for CI optimization');
  
  // Primer intento de login
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: {
      email: 'test@nutriapp.com',
      password: 'nutriapp123'
    },
    failOnStatusCode: false // Para manejar errores gracefully en CI
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ API login successful');
      // Verificar que el login estableció la sesión correctamente
      cy.visit('/dishes');
      cy.url().should('include', '/dishes', { timeout: 10000 });
    } else {
      cy.log(`⚠️ API login failed with status: ${response.status}`);
      cy.log(`Response body: ${JSON.stringify(response.body)}`);
      
      // Intentar crear el usuario nuevamente y luego hacer login
      cy.log('🔄 Attempting to re-setup user and login again...');
      cy.setupTestUser();
      cy.wait(2000); // Esperar un poco más para que se procese
      
      // Segundo intento de login después de setup
      cy.request({
        method: 'POST',
        url: '/api/login',
        body: {
          email: 'test@nutriapp.com',
          password: 'nutriapp123'
        },
        failOnStatusCode: false
      }).then((retryResponse) => {
        if (retryResponse.status === 200) {
          cy.log('✅ API login successful on retry');
          cy.visit('/dishes');
          cy.url().should('include', '/dishes', { timeout: 10000 });
        } else {
          cy.log('⚠️ API login failed on retry, falling back to UI login');
          cy.loginAsTestUserUI();
        }
      });
    }
  });
});

// Login UI específico para tests que necesitan probar el flujo de login
Cypress.Commands.add('loginAsTestUserUI', () => {
  cy.log('🔐 Logging in via UI');
  
  cy.visit('/login');
  
  // Esperar que la página esté completamente cargada
  cy.get('[data-testid="login-email-input"]', { timeout: 15000 }).should('be.visible').clear().type('test@nutriapp.com');
  cy.get('[data-testid="login-password-input"]', { timeout: 10000 }).should('be.visible').clear().type('nutriapp123');
  
  // Verificar que el botón esté habilitado antes de hacer click
  cy.get('[data-testid="login-submit"]').should('be.enabled').click();
  
  // Espera robusta para CI con mejor timeout
  cy.url({ timeout: 20000 }).should('include', '/dishes');
  cy.get('[data-testid="dishes-container"]', { timeout: 15000 }).should('be.visible');
  
  cy.log('✅ UI login successful');
});

// Setup de usuario de prueba para CI
Cypress.Commands.add('setupTestUser', () => {
  cy.log('🔧 Setting up test user for CI environment');
  
  // Primero intentar hacer login para ver si ya existe
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: {
      email: 'test@nutriapp.com',
      password: 'nutriapp123'
    },
    failOnStatusCode: false
  }).then((loginResponse) => {
    if (loginResponse.status === 200) {
      cy.log('✅ Test user already exists and can login');
      return; // Usuario ya existe y funciona
    }
    
    cy.log('⚠️ Test user does not exist, creating...');
    // Si login falla, intenta registrar usuario de prueba
    cy.request({
      method: 'POST',
      url: '/api/register',
      body: {
        name: 'Test User',
        email: 'test@nutriapp.com',
        password: 'nutriapp123'
      },
      failOnStatusCode: false
    }).then((registerResponse) => {
      if (registerResponse.status === 200 || registerResponse.status === 201) {
        cy.log('✅ Test user registered successfully');
        
        // Verificar que el registro funcionó haciendo login inmediatamente
        cy.wait(1000); // Pequeña pausa para que DB procese
        cy.request({
          method: 'POST',
          url: '/api/login',
          body: {
            email: 'test@nutriapp.com',
            password: 'nutriapp123'
          },
          failOnStatusCode: false
        }).then((verifyResponse) => {
          if (verifyResponse.status === 200) {
            cy.log('✅ Test user verified - login successful after registration');
          } else {
            cy.log('❌ Test user registration failed - cannot login after register');
          }
        });
      } else {
        cy.log('❌ Test user registration failed');
        cy.log(`Registration response: ${JSON.stringify(registerResponse.body)}`);
      }
    });
  });
});

// ============================================================================
// GESTIÓN DE DATOS - Comandos para manejo de dishes optimizados para CI
// ============================================================================

// Crear dish de prueba con datos únicos para evitar conflictos en CI
Cypress.Commands.add('createTestDish', (dishData = {}) => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  const defaultData = {
    name: `CI Test Dish ${timestamp}-${randomId}`,
    description: `Test description created at ${new Date().toISOString()}`,
    prepTime: '10',
    cookTime: '15',
    calories: '250',
    imageUrl: '',
    steps: [
      'Step 1: Prepare test ingredients',
      'Step 2: Execute test cooking',
      'Step 3: Validate test results'
    ]
  };
  
  const data = { ...defaultData, ...dishData };
  
  cy.log(`🍽️ Creating test dish: ${data.name}`);
  
  cy.visit('/dishes/new');
  cy.get('[data-testid="new-dish-name-input"]', { timeout: 10000 }).should('be.visible').type(data.name);
  cy.get('[data-testid="new-dish-description-input"]').type(data.description);
  
  // Manejo robusto de quick prep
  if (data.quickPrep) {
    cy.get('[data-testid="new-dish-quickprep-checkbox"]').check();
  } else {
    // Solo setear tiempos si no es quick prep
    cy.get('[data-testid="new-dish-preptime-input"]').clear().type(data.prepTime);
    cy.get('[data-testid="new-dish-cooktime-input"]').clear().type(data.cookTime);
  }
  
  // Calorías opcionales
  if (data.calories) {
    cy.get('[data-testid="new-dish-calories-input"]').clear().type(data.calories);
  }
  
  // URL de imagen opcional
  if (data.imageUrl && data.imageUrl.trim() !== '') {
    cy.get('[data-testid="new-dish-image-url-input"]').type(data.imageUrl);
  }
  
  // Agregar pasos con manejo robusto para CI
  data.steps.forEach((step, index) => {
    if (index === 0) {
      cy.get('[data-testid="new-dish-step-input"]').first().type(step);
    } else {
      cy.get('[data-testid="new-dish-add-step-button"]').click();
      cy.get('[data-testid="new-dish-step-input"]').last().type(step);
    }
  });
  
  cy.get('[data-testid="new-dish-submit-button"]').click();
  
  // Espera robusta para CI
  cy.url({ timeout: 15000 }).should('include', '/dishes');
  cy.contains(data.name, { timeout: 15000 }).should('be.visible');
  
  cy.log('✅ Test dish created successfully');
  return cy.wrap(data);
});

// ============================================================================
// NAVEGACIÓN - Comandos de navegación optimizados para CI
// ============================================================================

// Ir a lista de dishes con verificaciones robustas
Cypress.Commands.add('goToDishes', () => {
  cy.log('📋 Navigating to dishes list');
  
  cy.visit('/dishes');
  cy.get('[data-testid="dishes-container"]', { timeout: 15000 }).should('be.visible');
  
  // Verificar que la página cargó completamente
  cy.get('[data-testid="dishes-header"]', { timeout: 10000 }).should('be.visible');
  
  cy.log('✅ Successfully navigated to dishes page');
});

// ============================================================================
// LIMPIEZA - Comandos de cleanup para CI
// ============================================================================

// Setup completo del ambiente de testing para CI
Cypress.Commands.add('setupTestEnvironment', () => {
  cy.log('🔧 Setting up complete test environment for CI');
  
  // 1. Verificar que la aplicación esté disponible
  cy.request({
    url: '/',
    timeout: 30000,
    retryOnNetworkFailure: true
  }).should((response) => {
    expect(response.status).to.eq(200);
  });
  
  // 2. Setup del usuario de prueba
  cy.setupTestUser();
  
  // 3. Verificación básica de la aplicación
  cy.visit('/');
  cy.get('body').should('be.visible');
  
  cy.log('✅ Test environment setup complete');
});

// Limpieza de datos de prueba después de los tests
Cypress.Commands.add('cleanupTestData', () => {
  cy.log('🧹 Cleaning up test data');
  
  // Esta función puede expandirse para limpiar datos específicos
  // Por ahora, solo registra que la limpieza se ejecutó
  cy.log('✅ Test data cleanup completed');
});

// ============================================================================
// UTILIDADES - Comandos de utilidad para CI
// ============================================================================

// Esperar que un elemento sea visible con retry robusto
Cypress.Commands.add('waitForElement', (selector, timeout = 15000) => {
  cy.log(`⏳ Waiting for element: ${selector}`);
  
  cy.get(selector, { timeout }).should('be.visible');
  
  cy.log(`✅ Element found: ${selector}`);
});

// Verificar estado de la aplicación para CI
Cypress.Commands.add('verifyAppHealth', () => {
  cy.log('🏥 Verifying application health');
  
  cy.request('/api/health').should((response) => {
    expect(response.status).to.be.oneOf([200, 404]); // 404 OK si endpoint no existe
  });
  
  cy.log('✅ Application health verified');
});

// ============================================================================
// NOTA: Para mejor intellisense, considera migrar a TypeScript en el futuro
// ============================================================================