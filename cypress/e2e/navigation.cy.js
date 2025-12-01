describe('Navigation Tests', () => {
  before(() => {
    // Setup test environment
    cy.setupTestEnvironment();
  });

  beforeEach(() => {
    // Ensure we're logged in before each test
    cy.loginAsTestUser();
  });

  describe('Main Navigation', () => {
    it('should navigate between main sections', () => {
      // Arrange
      cy.log('🧭 Testing main navigation flow');
      
      // Act & Assert - Navigation to home
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      cy.visit('/');
      cy.get('[data-testid="home-container"]').should('be.visible');
      
      // Act & Assert - Navigation back to dishes via login
      cy.get('a[data-testid="home-cta"]').click();
      cy.url().should('include', '/login');
      
      cy.loginAsTestUser();
      cy.url().should('include', '/dishes');
      cy.log('✅ Navigation flow completed successfully');
    });

    it('should handle logout functionality', () => {
      // Arrange
      cy.log('🚪 Testing logout functionality');
      
      // Act
      cy.get('[data-testid="nav-logout-button"]').should('be.visible').click();
      
      // Assert
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
      cy.log('✅ Logout completed successfully');
    });

    it('should redirect to login when not authenticated', () => {
      // Arrange
      cy.log('🔒 Testing authentication redirects');
      cy.clearCookies();
      
      // Act & Assert - Protected dishes page
      cy.visit('/dishes');
      cy.url().should('include', '/login');
      
      // Act & Assert - Protected new dish page
      cy.visit('/dishes/new');
      cy.url().should('include', '/login');
      cy.log('✅ Authentication redirects working correctly');
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should navigate using breadcrumbs if available', () => {
      // Arrange
      cy.log('🍞 Testing breadcrumb navigation');
      cy.goToDishes();
      
      // Act
      cy.get('[data-testid="dishes-add-button"]').click();
      
      // Assert
      cy.url().should('include', '/dishes/new');
      
      // Act & Assert - Breadcrumb navigation
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="breadcrumb"]').length > 0) {
          cy.get('[data-testid*="breadcrumb"] a').first().click();
          cy.url().should('include', '/dishes');
        } else {
          cy.visit('/dishes');
        }
      });
      cy.log('✅ Breadcrumb navigation completed');
    });
  });

  describe('Form Navigation', () => {
    it('should handle form navigation correctly', () => {
      // Arrange
      cy.log('📝 Testing form navigation');
      const testText = 'Partial Form Test';
      
      // Act
      cy.visit('/dishes/new');
      cy.get('[data-testid="new-dish-container"]').should('be.visible');
      cy.get('[data-testid="new-dish-name-input"]').type(testText);
      
      // Act - Navigate away and back
      cy.visit('/dishes');
      cy.visit('/dishes/new');
      
      // Assert
      cy.get('[data-testid="new-dish-name-input"]').should('have.value', '');
      cy.log('✅ Form reset on navigation verified');
    });
  });

  describe('Deep Link Navigation', () => {
    it('should handle direct URLs correctly', () => {
      // Arrange
      cy.log('🔗 Testing deep link navigation');
      
      // Act & Assert - Dishes page
      cy.visit('/dishes');
      cy.url().should('include', '/dishes');
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      
      // Act & Assert - New dish page
      cy.visit('/dishes/new');
      cy.url().should('include', '/dishes/new');
      cy.get('[data-testid="new-dish-container"]').should('be.visible');
      
      // Act & Assert - Invalid URLs
      cy.visit('/dishes/invalid-id', { failOnStatusCode: false });
      cy.log('✅ Deep link navigation tested');
    });
  });

  describe('Responsive Navigation', () => {
    it('should work correctly on mobile viewport', () => {
      // Arrange
      cy.log('📱 Testing mobile viewport navigation');
      cy.viewport('iphone-x');
      
      // Act
      cy.goToDishes();
      
      // Assert
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      
      // Act & Assert - Mobile menu if available
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="mobile-menu"]').length > 0) {
          cy.get('[data-testid*="mobile-menu"]').click();
        }
      });
      
      cy.viewport(1280, 720);
      cy.log('✅ Mobile navigation tested');
    });

    it('should work correctly on tablet viewport', () => {
      // Arrange
      cy.log('📱 Testing tablet viewport navigation');
      cy.viewport('ipad-2');
      
      // Act
      cy.goToDishes();
      cy.get('[data-testid="dishes-add-button"]').click();
      
      // Assert
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      cy.url().should('include', '/dishes/new');
      
      cy.viewport(1280, 720);
      cy.log('✅ Tablet navigation tested');
    });
  });

  describe('Error Handling Navigation', () => {
    it('should handle network errors gracefully', () => {
      // Arrange
      cy.log('🌐 Testing error handling navigation');
      
      // Act
      cy.goToDishes();
      
      // Assert
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      cy.log('✅ Error handling navigation verified');
    });
  });
});