describe('Setup Test Environment', () => {
  before(() => {
    cy.log('Setting up test environment...');
    cy.setupTestEnvironment();
  });

  it('should have test user ready', () => {
    // Arrange
    cy.log('🔧 Setting up test user for navigation');
    
    // Act
    cy.loginAsTestUser();
    cy.visit('/dishes');
    
    // Assert
    cy.url().should('include', '/dishes');
    cy.get('[data-testid="dishes-container"]').should('be.visible');
    cy.log('✅ Test user setup completed and verified');
  });
});