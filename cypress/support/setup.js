/// <reference types="cypress" />

// ***********************************************
// Setup utilities for dynamic test user and data
// ***********************************************

/**
 * Creates a session test user if it doesn't exist
 * Uses the session-based user system for optimal CI performance
 */
Cypress.Commands.add('ensureTestUser', () => {
  // Use the session user system
  cy.setupTestUser(); // This will create the session user once
});

/**
 * Sets up the test environment with session user
 * Should be called once at the beginning of the test suite
 */
Cypress.Commands.add('setupTestEnvironment', () => {
  cy.ensureTestUser();
});

/**
 * Cleans up test data (dishes, etc.) but preserves the session user
 * Uses session user credentials for cleanup operations
 */
Cypress.Commands.add('cleanupTestData', () => {
  // Use session user for cleanup
  cy.getSessionTestUser().then((user) => {
    // Login first to get session
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
        // Get all dishes
        cy.request({
          method: 'GET',
          url: '/api/dishes',
          headers: {
            'Cookie': response.headers['set-cookie'] ? response.headers['set-cookie'][0] : ''
          },
          failOnStatusCode: false
        }).then((dishesResponse) => {
          if (dishesResponse.status === 200) {
            const dishes = dishesResponse.body.dishes || [];
            
            // Delete all test dishes (those with "Test" in the name)
            dishes.forEach((dish) => {
              if (dish.name && dish.name.includes('Test')) {
                cy.request({
                  method: 'DELETE',
                  url: `/api/dishes/${dish.id}`,
                  headers: {
                    'Cookie': response.headers['set-cookie'] ? response.headers['set-cookie'][0] : ''
                  },
                  failOnStatusCode: false
                });
              }
            });
          }
        });
      } else {
        cy.log('⚠️ Could not login session user for cleanup, skipping...');
      }
    });
  });
});