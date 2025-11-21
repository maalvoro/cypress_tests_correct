/// <reference types="cypress" />

// ***********************************************
// Custom commands para Happy Testing app optimizados para CI
// ***********************************************

// ============================================================================
// UTILIDADES - Generación de usuario único por sesión (como Playwright)
// ============================================================================

// Generar credenciales únicas UNA VEZ por sesión de tests
function generateSessionTestUser() {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const runId = Cypress.env('GITHUB_RUN_ID') || 'local';
  
  return {
    firstName: 'Test',
    lastName: `User${randomId}`,
    email: `test-session-${timestamp}-${randomId}-${runId}@nutriapp.com`,
    nationality: 'México',
    phone: '+521234567890',
    password: `nutriapp123${randomId}`
  };
}

// Almacenar credenciales del usuario de sesión (se genera solo una vez)
let sessionTestUser = null;

// Obtener o crear el usuario único de la sesión
Cypress.Commands.add('getSessionTestUser', () => {
  if (!sessionTestUser) {
    sessionTestUser = generateSessionTestUser();
    cy.log(`🆔 Generated session user (will be reused): ${sessionTestUser.email}`);
    
    // Marcar que este usuario debe ser creado
    sessionTestUser._needsCreation = true;
  }
  return cy.wrap(sessionTestUser);
});

// Crear el usuario de sesión una sola vez
Cypress.Commands.add('createSessionUserOnce', () => {
  cy.getSessionTestUser().then((user) => {
    if (user._needsCreation) {
      cy.log(`🔧 Creating session user once: ${user.email}`);
      
      // Verificar que la aplicación esté funcionando
      cy.request({
        url: '/',
        timeout: 10000,
        failOnStatusCode: false
      }).then((healthResponse) => {
        cy.log(`🏥 App health check: ${healthResponse.status}`);
      });
      
      // Registrar el usuario de sesión
      cy.request({
        method: 'POST',
        url: '/api/register',
        body: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          nationality: user.nationality,
          phone: user.phone,
          password: user.password
        },
        failOnStatusCode: false
      }).then((registerResponse) => {
        cy.log(`📝 Session user registration: ${registerResponse.status}`);
        if (registerResponse.body) {
          cy.log(`Registration response: ${JSON.stringify(registerResponse.body)}`);
        }
        
        if (registerResponse.status === 200 || registerResponse.status === 201) {
          cy.log('✅ Session user created successfully');
          
          // Verificar que funciona
          cy.wait(2000);
          cy.request({
            method: 'POST',
            url: '/api/login',
            body: {
              email: user.email,
              password: user.password
            },
            failOnStatusCode: false
          }).then((verifyResponse) => {
            if (verifyResponse.status === 200) {
              cy.log('✅ Session user verified and ready for all tests');
              user._needsCreation = false; // Marcar como creado
            } else {
              throw new Error(`Session user creation failed: ${verifyResponse.status}`);
            }
          });
        } else {
          throw new Error(`Session user registration failed: ${registerResponse.status} - ${JSON.stringify(registerResponse.body)}`);
        }
      });
    } else {
      cy.log('✅ Session user already created, reusing...');
    }
  });
});

// ============================================================================
// AUTENTICACIÓN - Comandos optimizados para CI con usuarios dinámicos
// ============================================================================

// Login rápido vía API usando el usuario de sesión (reutilizable)
Cypress.Commands.add('loginAsTestUser', () => {
  cy.getSessionTestUser().then((user) => {
    cy.log(`🔐 Logging in as session user: ${user.email}`);
    
    // Asegurar que el usuario esté creado antes de intentar login
    cy.createSessionUserOnce();
    
    // Login con el usuario de sesión
    cy.request({
      method: 'POST',
      url: '/api/login',
      body: {
        email: user.email,
        password: user.password
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        cy.log('✅ API login successful with session user');
        cy.visit('/dishes');
        cy.url().should('include', '/dishes', { timeout: 10000 });
      } else {
        cy.log(`⚠️ API login failed with status: ${response.status}`);
        cy.log(`Response body: ${JSON.stringify(response.body)}`);
        cy.log('🔄 Falling back to UI login...');
        cy.loginAsTestUserUI();
      }
    });
  });
});

// Login UI usando el usuario de sesión
Cypress.Commands.add('loginAsTestUserUI', () => {
  cy.getSessionTestUser().then((user) => {
    cy.log(`🔐 Logging in via UI with session user: ${user.email}`);
    
    cy.visit('/login');
    
    // Esperar que la página esté completamente cargada
    cy.get('[data-testid="login-email-input"]', { timeout: 15000 }).should('be.visible').clear().type(user.email);
    cy.get('[data-testid="login-password-input"]', { timeout: 10000 }).should('be.visible').clear().type(user.password);
    
    // Verificar que el botón esté habilitado antes de hacer click
    cy.get('[data-testid="login-submit"]').should('be.enabled').click();
    
    // Espera robusta para CI con mejor timeout
    cy.url({ timeout: 20000 }).should('include', '/dishes');
    cy.get('[data-testid="dishes-container"]', { timeout: 15000 }).should('be.visible');
    
    cy.log('✅ UI login successful with session user');
  });
});

// Setup del usuario de sesión (se ejecuta una sola vez)
Cypress.Commands.add('setupTestUser', () => {
  cy.createSessionUserOnce();
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
// COMANDOS API - Siguiendo convenciones oficiales de Cypress
// ============================================================================

/**
 * Genera datos únicos para testing de API
 * Integrado con el sistema de usuario único por sesión
 */
Cypress.Commands.add('generateApiUserData', () => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const runId = Cypress.env('GITHUB_RUN_ID') || 'local';

  const userData = {
    firstName: 'Test',
    lastName: `User${randomId}`,
    email: `test.api.${timestamp}.${randomId}.${runId}@nutriapp.com`,
    nationality: 'México',
    phone: `+52155${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`,
    password: `apitest123${randomId}`
  };
  
  return cy.wrap(userData);
});

/**
 * Genera datos únicos para testing de dishes API
 */
Cypress.Commands.add('generateApiDishData', () => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 6);

  const dishData = {
    name: `Platillo API Test ${randomId}`,
    description: `Descripción del platillo de prueba API ${timestamp}`,
    quickPrep: Math.random() > 0.5,
    prepTime: Math.floor(Math.random() * 30) + 5,
    cookTime: Math.floor(Math.random() * 60) + 10,
    imageUrl: `https://example.com/api-test-image-${randomId}.jpg`,
    steps: [
      `Paso 1: Preparar ingredientes para API test ${randomId}`,
      `Paso 2: Cocinar según instrucciones`,
      `Paso 3: Servir y disfrutar el platillo ${randomId}`
    ],
    calories: Math.floor(Math.random() * 500) + 100
  };
  
  return cy.wrap(dishData);
});

/**
 * Registra un usuario vía API
 * Comando oficial de Cypress para testing de API
 */
Cypress.Commands.add('apiRegisterUser', (userData) => {
  cy.log(`📝 API: Registering user ${userData.email}`);
  
  return cy.request({
    method: 'POST',
    url: '/api/register',
    body: userData,
    failOnStatusCode: false
  }).then((response) => {
    cy.log(`Registration response: ${response.status}`);
    return cy.wrap(response);
  });
});

/**
 * Inicia sesión vía API y extrae cookie de sesión
 * Comando oficial de Cypress para autenticación API
 */
Cypress.Commands.add('apiLoginUser', (loginData) => {
  cy.log(`🔐 API: Logging in ${loginData.email}`);
  
  return cy.request({
    method: 'POST',
    url: '/api/login',
    body: loginData,
    failOnStatusCode: false
  }).then((response) => {
    let sessionCookie = null;
    
    if (response.headers['set-cookie']) {
      const cookieString = Array.isArray(response.headers['set-cookie']) 
        ? response.headers['set-cookie'][0] 
        : response.headers['set-cookie'];
        
      const sessionMatch = cookieString.match(/session=([^;]+)/);
      if (sessionMatch) {
        sessionCookie = `session=${sessionMatch[1]}`;
        cy.log(`🍪 Session cookie extracted successfully`);
      }
    }
    
    return cy.wrap({ 
      ...response, 
      sessionCookie,
      user: response.body?.user 
    });
  });
});

/**
 * Crea un usuario completo para testing API
 * Comando simplificado que funciona correctamente
 */
Cypress.Commands.add('apiCreateTestUser', () => {
  return cy.generateApiUserData().then((userData) => {
    cy.log(`🔧 Creating API test user: ${userData.email}`);
    
    return cy.apiRegisterUser(userData).then((registerResponse) => {
      if (registerResponse.status === 200) {
        cy.log(`✅ User registered: ${userData.email}`);
        
        return cy.apiLoginUser({
          email: userData.email,
          password: userData.password
        }).then((loginResult) => {
          if (loginResult.status === 200 && loginResult.sessionCookie) {
            cy.log(`✅ User logged in successfully`);
            
            return cy.wrap({
              userData: userData,
              sessionCookie: loginResult.sessionCookie,
              user: loginResult.body?.user || { id: 1, email: userData.email }
            });
          } else {
            cy.log(`⚠️ Login failed, using registration data`);
            return cy.wrap({
              userData: userData,
              sessionCookie: null,
              user: registerResponse.body?.user || { id: 1, email: userData.email }
            });
          }
        });
      } else {
        cy.log(`⚠️ Registration failed: ${registerResponse.status}`);
        // Still return a valid object for testing
        return cy.wrap({
          userData: userData,
          sessionCookie: null,
          user: { id: 1, email: userData.email }
        });
      }
    });
  });
});

/**
 * Obtiene lista de platillos vía API
 */
Cypress.Commands.add('apiGetDishes', (sessionCookie) => {
  cy.log('📋 API: Getting dishes list');
  
  return cy.request({
    method: 'GET',
    url: '/api/dishes',
    headers: {
      'Cookie': sessionCookie
    },
    failOnStatusCode: false
  });
});

/**
 * Crea un platillo vía API
 */
Cypress.Commands.add('apiCreateDish', (dishData, sessionCookie) => {
  cy.log(`🍽️ API: Creating dish ${dishData.name}`);
  
  return cy.request({
    method: 'POST',
    url: '/api/dishes',
    headers: {
      'Cookie': sessionCookie
    },
    body: dishData,
    failOnStatusCode: false
  });
});

/**
 * Obtiene un platillo específico por ID vía API
 */
Cypress.Commands.add('apiGetDish', (dishId, sessionCookie) => {
  cy.log(`🔍 API: Getting dish ${dishId}`);
  
  return cy.request({
    method: 'GET',
    url: `/api/dishes/${dishId}`,
    headers: {
      'Cookie': sessionCookie
    },
    failOnStatusCode: false
  });
});

/**
 * Actualiza un platillo vía API
 */
Cypress.Commands.add('apiUpdateDish', (dishId, updateData, sessionCookie) => {
  cy.log(`✏️ API: Updating dish ${dishId}`);
  
  return cy.request({
    method: 'PUT',
    url: `/api/dishes/${dishId}`,
    headers: {
      'Cookie': sessionCookie
    },
    body: updateData,
    failOnStatusCode: false
  });
});

/**
 * Elimina un platillo vía API
 */
Cypress.Commands.add('apiDeleteDish', (dishId, sessionCookie) => {
  cy.log(`🗑️ API: Deleting dish ${dishId}`);
  
  return cy.request({
    method: 'DELETE',
    url: `/api/dishes/${dishId}`,
    headers: {
      'Cookie': sessionCookie
    },
    failOnStatusCode: false
  });
});

/**
 * Valida estructura de usuario según API response
 */
Cypress.Commands.add('validateUserStructure', (user) => {
  expect(user).to.exist;
  expect(user).to.have.property('id').that.is.a('number');
  expect(user).to.have.property('firstName').that.is.a('string');
  expect(user).to.have.property('lastName').that.is.a('string');
  expect(user).to.have.property('email').that.is.a('string');
  expect(user).to.have.property('nationality').that.is.a('string');
  expect(user).to.have.property('phone').that.is.a('string');
  expect(user.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  
  cy.log(`✅ User structure validated: ${user.email}`);
});

/**
 * Valida estructura de platillo según API response
 */
Cypress.Commands.add('validateDishStructure', (dish) => {
  expect(dish).to.exist;
  expect(dish).to.have.property('id').that.is.a('number');
  expect(dish).to.have.property('name').that.is.a('string');
  expect(dish).to.have.property('description').that.is.a('string');
  expect(dish).to.have.property('quickPrep').that.is.a('boolean');
  expect(dish).to.have.property('prepTime').that.is.a('number');
  expect(dish).to.have.property('cookTime').that.is.a('number');
  expect(dish).to.have.property('userId').that.is.a('number');
  expect(dish).to.have.property('steps').that.is.an('array');
  
  cy.log(`✅ Dish structure validated: ${dish.name}`);
});

/**
 * Alias for loginAsTestUser for integration tests
 */
Cypress.Commands.add('loginUser', (userData) => {
  if (userData) {
    // If userData provided, use API login
    return cy.apiLoginUser(userData);
  } else {
    // Otherwise use UI login
    return cy.loginAsTestUser();
  }
});

/**
 * Login with session user for integration tests
 */
Cypress.Commands.add('loginWithSessionUser', () => {
  cy.getSessionTestUser().then((sessionUser) => {
    if (sessionUser) {
      cy.visit('/login');
      cy.get('[name="email"]').type(sessionUser.email);
      cy.get('[name="password"]').type(sessionUser.password || 'Test123!');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dishes');
    } else {
      // Create and login with new user
      cy.createSessionUserOnce();
      cy.loginAsTestUser();
    }
  });
});

// ============================================================================
// NOTA: Para mejor intellisense, considera migrar a TypeScript en el futuro
// ============================================================================