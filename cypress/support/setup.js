/// <reference types="cypress" />

// ***********************************************
// Setup utilities for test user and data
// ***********************************************

/**
 * Creates the test user if it doesn't exist
 * This ensures we always have a consistent user for testing
 */
Cypress.Commands.add('ensureTestUser', () => {
  const testUser = {
    email: 'test@nutriapp.com',
    password: 'nutriapp123',
    name: 'Test User'
  };

  // First try to login - if it fails, we'll create the user
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: {
      email: testUser.email,
      password: testUser.password
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      // User doesn't exist or login failed, create the user
      cy.log('Test user not found, creating it...');
      cy.request({
        method: 'POST',
        url: '/api/register',
        body: testUser,
        failOnStatusCode: false
      }).then((registerResponse) => {
        if (registerResponse.status === 201) {
          cy.log('Test user created successfully');
        } else if (registerResponse.body.error && registerResponse.body.error.includes('already exists')) {
          cy.log('Test user already exists');
        } else {
          cy.log('Error creating test user:', registerResponse.body);
        }
      });
    } else {
      cy.log('Test user login successful');
    }
  });
});

/**
 * Sets up the test environment
 * Should be called before running any test suite
 */
Cypress.Commands.add('setupTestEnvironment', () => {
  cy.ensureTestUser();
});

/**
 * Cleans up test data (dishes, etc.) but preserves the test user
 */
Cypress.Commands.add('cleanupTestData', () => {
  // Login first to get session
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: {
      email: 'test@nutriapp.com',
      password: 'nutriapp123'
    }
  }).then((response) => {
    // Get all dishes
    cy.request({
      method: 'GET',
      url: '/api/dishes',
      headers: {
        'Cookie': response.headers['set-cookie'] ? response.headers['set-cookie'][0] : ''
      }
    }).then((dishesResponse) => {
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
    });
  });
});