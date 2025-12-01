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
      // Arrange
      cy.log('🍽️ Testing dishes page display');
      
      // Act
      cy.goToDishes();
      
      // Assert
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      cy.get('[data-testid="dishes-header"]').should('be.visible');
      cy.get('[data-testid="dishes-title"]').should('contain.text', 'Sugerencias de Platillos');
      cy.get('[data-testid="dishes-add-button"]').should('be.visible');
      cy.log('✅ Dishes page displayed correctly');
    });

    it('should navigate to new dish form', () => {
      // Arrange
      cy.log('➕ Testing navigation to new dish form');
      cy.goToDishes();
      
      // Act
      cy.get('[data-testid="dishes-add-button"]').click();
      
      // Assert
      cy.url().should('include', '/dishes/new');
      cy.get('[data-testid="new-dish-title"]').should('contain.text', 'Agregar Platillo');
      cy.log('✅ Navigation to new dish form successful');
    });
  });

  describe('Create New Dish', () => {
    it('should create a new dish successfully', () => {
      // Arrange
      const timestamp = Date.now();
      const dishData = {
        name: `Test Creation ${timestamp}`,
        description: 'This is for testing creation functionality'
      };
      cy.log(`🍽️ Creating dish: ${dishData.name}`);
      
      // Act
      cy.createTestDish(dishData);
      
      // Assert
      cy.url().should('include', '/dishes');
      cy.contains(dishData.name, { timeout: 10000 }).should('be.visible');
      cy.log('✅ Dish created successfully');
    });

    it('should create a quick prep dish', () => {
      // Arrange
      const timestamp = Date.now();
      const dishData = {
        name: `Quick Test ${timestamp}`,
        description: 'Quick prep dish test',
        quickPrep: true
      };
      cy.log(`⚡ Creating quick prep dish: ${dishData.name}`);
      
      // Act
      cy.createTestDish(dishData);
      
      // Assert
      cy.url().should('include', '/dishes');
      cy.contains(dishData.name, { timeout: 10000 }).should('be.visible');
      cy.log('✅ Quick prep dish created successfully');
    });

    it('should create dish with prep and cook times', () => {
      // Arrange
      const timestamp = Date.now();
      const dishData = {
        name: `Time Test ${timestamp}`,
        description: 'Testing with cooking times',
        prepTime: '15',
        cookTime: '25'
      };
      cy.log(`⏰ Creating dish with times: ${dishData.name}`);
      
      // Act
      cy.createTestDish(dishData);
      
      // Assert
      cy.url().should('include', '/dishes');
      cy.contains(dishData.name, { timeout: 10000 }).should('be.visible');
      cy.log('✅ Dish with times created successfully');
    });
  });

  describe('View Dish Details', () => {
    it('should view dish details correctly', () => {
      // Arrange
      const timestamp = Date.now();
      const dishData = {
        name: `View Test ${timestamp}`,
        description: 'This is for testing view functionality',
        prepTime: '15',
        cookTime: '25'
      };
      cy.log(`👁️ Testing dish view: ${dishData.name}`);
      
      // Act - Create dish first
      cy.createTestDish(dishData);
      cy.goToDishes();
      
      cy.get('[data-testid="dish-card"]')
        .contains(dishData.name)
        .parents('[data-testid="dish-card"]')
        .find('[data-testid="dish-view-link"]')
        .click();
      
      // Assert
      cy.url().should('match', /\/dishes\/\d+\/view$/);
      cy.get('[data-testid="view-dish-container"]').should('be.visible');
      cy.get('[data-testid="view-dish-name"]').should('contain.text', dishData.name);
      cy.get('[data-testid="view-dish-description"]').should('contain.text', dishData.description);
      cy.get('[data-testid="view-dish-steps-section"]').should('be.visible');
      cy.get('[data-testid="view-dish-step-text"]').should('have.length.at.least', 1);
      cy.log('✅ Dish details viewed successfully');
    });
  });

  describe('Edit Dish', () => {
    it('should navigate to edit page successfully', () => {
      // Arrange
      const timestamp = Date.now();
      const dishData = {
        name: `Edit Test ${timestamp}`,
        description: 'To be edited',
        prepTime: '10',
        cookTime: '20'
      };
      cy.log(`✏️ Testing dish edit navigation: ${dishData.name}`);
      
      // Act - Create dish and navigate to edit
      cy.createTestDish(dishData);
      cy.goToDishes();
      
      cy.get('[data-testid="dish-card"]')
        .contains(dishData.name)
        .parents('[data-testid="dish-card"]')
        .find('[data-testid="dish-edit-link"]')
        .click();
      
      // Assert
      cy.url().should('contain', '/dishes/');
      cy.get('[data-testid="edit-dish-container"]').should('be.visible');
      cy.get('[data-testid="edit-dish-form"]').should('be.visible');
      cy.get('[data-testid="edit-dish-name"]').should('be.visible');
      cy.get('[data-testid="edit-dish-description"]').should('be.visible');
      cy.get('[data-testid="edit-dish-name"]').should('have.value', dishData.name);
      cy.get('[data-testid="edit-dish-description"]').should('have.value', dishData.description);
      cy.log('✅ Edit page navigation successful');
    });
  });

  describe('Delete Dish', () => {
    it('should delete a dish', () => {
      // Arrange
      const timestamp = Date.now();
      const dishData = {
        name: `Delete Test ${timestamp}`,
        description: 'To be deleted'
      };
      cy.log(`🗑️ Testing dish deletion: ${dishData.name}`);
      
      // Act - Create dish and delete
      cy.createTestDish(dishData);
      cy.goToDishes();
      
      cy.get('[data-testid="dish-card"]')
        .contains(dishData.name)
        .parents('[data-testid="dish-card"]')
        .find('[data-testid="dish-delete-button"]')
        .click();
      
      // Assert
      cy.contains(dishData.name, { timeout: 10000 }).should('not.exist');
      cy.log('✅ Dish deleted successfully');
    });
  });
});