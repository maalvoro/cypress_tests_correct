describe('Dishes CRUD Tests', () => {
  before(() => {
    // Setup test environment
    cy.setupTestEnvironment();
    cy.cleanupTestData();
  });

  beforeEach(() => {
    // Ensure we're logged in before each test
    cy.loginAsTestUser();
  });

  after(() => {
    // Cleanup after all tests
    cy.cleanupTestData();
  });

  describe('Dishes List Page', () => {
    it('should display dishes page correctly', () => {
      cy.goToDishes();
      
      // Verify page elements
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      cy.get('[data-testid="dishes-header"]').should('be.visible');
      cy.get('[data-testid="dishes-title"]').should('contain.text', 'Sugerencias de Platillos');
      cy.get('[data-testid="dishes-add-button"]').should('be.visible');
    });

    it('should navigate to new dish form', () => {
      cy.goToDishes();
      
      cy.get('[data-testid="dishes-add-button"]').click();
      cy.url().should('include', '/dishes/new');
      cy.get('[data-testid="new-dish-title"]').should('contain.text', 'Agregar Platillo');
    });
  });

  describe('Create New Dish', () => {
    it('should create a new dish successfully', () => {
      const timestamp = Date.now();
      const dishName = `Test Creation ${timestamp}`;
      
      cy.createTestDish({
        name: dishName,
        description: 'This is for testing creation functionality'
      });
      
      // Verify we're back on dishes page and dish appears
      cy.url().should('include', '/dishes');
      cy.contains(dishName, { timeout: 10000 }).should('be.visible');
    });

    it('should create a quick prep dish', () => {
      const timestamp = Date.now();
      const dishName = `Quick Test ${timestamp}`;
      
      cy.createTestDish({
        name: dishName,
        description: 'Quick prep dish test',
        quickPrep: true
      });
      
      // Verify creation
      cy.url().should('include', '/dishes');
      cy.contains(dishName, { timeout: 10000 }).should('be.visible');
    });

    it('should create dish with prep and cook times', () => {
      const timestamp = Date.now();
      const dishName = `Time Test ${timestamp}`;
      
      cy.createTestDish({
        name: dishName,
        description: 'Testing with cooking times',
        prepTime: '15',
        cookTime: '25'
      });
      
      // Verify creation
      cy.url().should('include', '/dishes');
      cy.contains(dishName, { timeout: 10000 }).should('be.visible');
    });
  });

  describe('View Dish Details', () => {
    it('should view dish details correctly', () => {
      const timestamp = Date.now();
      const dishName = `View Test ${timestamp}`;
      
      // Create a dish first
      cy.createTestDish({
        name: dishName,
        description: 'This is for testing view functionality',
        prepTime: '15',
        cookTime: '25'
      });
      
      // Go to dishes list and click view
      cy.goToDishes();
      
      cy.get('[data-testid="dish-card"]')
        .contains(dishName)
        .parents('[data-testid="dish-card"]')
        .find('[data-testid="dish-view-link"]')
        .click();
      
      // Should be on view page
      cy.url().should('match', /\/dishes\/\d+\/view$/);
      
      // Verify dish details are displayed
      cy.get('[data-testid="view-dish-container"]').should('be.visible');
      cy.get('[data-testid="view-dish-name"]').should('contain.text', dishName);
      cy.get('[data-testid="view-dish-description"]').should('contain.text', 'This is for testing view functionality');
      cy.get('[data-testid="view-dish-steps-section"]').should('be.visible');
      cy.get('[data-testid="view-dish-step-text"]').should('have.length.at.least', 1);
    });
  });

  describe('Edit Dish', () => {
    it('should navigate to edit page successfully', () => {
      const timestamp = Date.now();
      const originalName = `Edit Test ${timestamp}`;
      
      // Create a dish first
      cy.createTestDish({
        name: originalName,
        description: 'To be edited',
        prepTime: '10',
        cookTime: '20'
      });
      
      // Go to dishes list and click edit
      cy.goToDishes();
      
      cy.get('[data-testid="dish-card"]')
        .contains(originalName)
        .parents('[data-testid="dish-card"]')
        .find('[data-testid="dish-edit-link"]')
        .click();
      
      // Should be on edit page
      cy.url().should('contain', '/dishes/');
      
      // Verify edit form elements are present
      cy.get('[data-testid="edit-dish-container"]').should('be.visible');
      cy.get('[data-testid="edit-dish-form"]').should('be.visible');
      cy.get('[data-testid="edit-dish-name"]').should('be.visible');
      cy.get('[data-testid="edit-dish-description"]').should('be.visible');
      
      // Verify the form is populated with current data
      cy.get('[data-testid="edit-dish-name"]').should('have.value', originalName);
      cy.get('[data-testid="edit-dish-description"]').should('have.value', 'To be edited');
    });
  });

  describe('Delete Dish', () => {
    it('should delete a dish', () => {
      const timestamp = Date.now();
      const dishName = `Delete Test ${timestamp}`;
      
      // Create a dish first
      cy.createTestDish({
        name: dishName,
        description: 'To be deleted'
      });
      
      // Go to dishes list
      cy.goToDishes();
      
      // Find the specific dish card and click delete
      cy.get('[data-testid="dish-card"]')
        .contains(dishName)
        .parents('[data-testid="dish-card"]')
        .find('[data-testid="dish-delete-button"]')
        .click();
      
      // Verify dish disappears
      cy.contains(dishName, { timeout: 10000 }).should('not.exist');
    });
  });
});