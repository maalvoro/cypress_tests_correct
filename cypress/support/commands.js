/// <reference types="cypress" />

// ***********************************************
// Custom commands for Happy Testing app
// ***********************************************

// Command to login with test user
Cypress.Commands.add('loginAsTestUser', () => {
  // Use API login for faster execution
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: {
      email: 'test@nutriapp.com',
      password: 'nutriapp123'
    }
  }).then((response) => {
    // Visit dishes page after successful login
    cy.visit('/dishes');
    cy.url().should('include', '/dishes');
  });
});

// Alternative UI login for tests that specifically need to test the login flow
Cypress.Commands.add('loginAsTestUserUI', () => {
  cy.visit('/login');
  cy.get('[data-testid="login-email-input"]').type('test@nutriapp.com');
  cy.get('[data-testid="login-password-input"]').type('nutriapp123');
  cy.get('[data-testid="login-submit"]').click();
  cy.url().should('include', '/dishes');
});

// Command to create a dish with random data
Cypress.Commands.add('createTestDish', (dishData = {}) => {
  const timestamp = Date.now();
  const defaultData = {
    name: `Test Dish ${timestamp}`,
    description: `Description for test dish ${timestamp}`,
    prepTime: '10',
    cookTime: '15',
    calories: '250',
    imageUrl: '', // Empty to avoid Next.js image configuration issues
    steps: ['Step 1: Prepare ingredients', 'Step 2: Cook the dish', 'Step 3: Serve']
  };
  
  const data = { ...defaultData, ...dishData };
  
  cy.visit('/dishes/new');
  cy.get('[data-testid="new-dish-name-input"]').type(data.name);
  cy.get('[data-testid="new-dish-description-input"]').type(data.description);
  
  if (!data.quickPrep) {
    cy.get('[data-testid="new-dish-preptime-input"]').clear().type(data.prepTime);
    cy.get('[data-testid="new-dish-cooktime-input"]').clear().type(data.cookTime);
  } else {
    cy.get('[data-testid="new-dish-quickprep-checkbox"]').check();
  }
  
  // Handle calories only if provided (like Playwright)
  if (data.calories) {
    cy.get('[data-testid="new-dish-calories-input"]').clear().type(data.calories);
  }
  
  // Handle image URL only if provided
  if (data.imageUrl && data.imageUrl.trim() !== '') {
    cy.get('[data-testid="new-dish-image-url-input"]').type(data.imageUrl);
  }
  
  // Add steps
  data.steps.forEach((step, index) => {
    if (index === 0) {
      // Use the first step input that already exists
      cy.get('[data-testid="new-dish-step-input"]').first().type(step);
    } else {
      // Add new step inputs for additional steps
      cy.get('[data-testid="new-dish-add-step-button"]').click();
      cy.get('[data-testid="new-dish-step-input"]').last().type(step);
    }
  });
  
  cy.get('[data-testid="new-dish-submit-button"]').click();
  cy.url().should('include', '/dishes');
  
  // Wait for the dish to appear in the list before returning
  cy.contains(data.name, { timeout: 10000 }).should('be.visible');
  
  return cy.wrap(data);
});

// Command to delete all test dishes (cleanup) - deprecated, use cleanupTestData instead
Cypress.Commands.add('cleanupTestDishes', () => {
  cy.cleanupTestData();
});

// Command to go to dishes list
Cypress.Commands.add('goToDishes', () => {
  cy.visit('/dishes');
  cy.get('[data-testid="dishes-container"]').should('be.visible');
});