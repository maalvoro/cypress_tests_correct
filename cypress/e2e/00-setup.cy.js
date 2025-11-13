describe('Setup Test Environment', () => {
  before(() => {
    cy.log('Setting up test environment...');
    cy.setupTestEnvironment();
  });

  it('should have test user ready', () => {
    cy.loginAsTestUser();
    cy.visit('/dishes');
    cy.url().should('include', '/dishes');
    cy.get('[data-testid="dishes-container"]').should('be.visible');
  });
});