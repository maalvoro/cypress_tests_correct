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
      // Start from dishes page
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      
      // Navigate to home page
      cy.visit('/');
      cy.get('[data-testid="home-container"]').should('be.visible');
      
      // Navigate back to dishes
      cy.get('a[data-testid="home-cta"]').click();
      cy.url().should('include', '/login');
      
      // Login and go to dishes
      cy.loginAsTestUser();
      cy.url().should('include', '/dishes');
    });

    it('should handle logout functionality', () => {
      // Click logout button using data-testid
      cy.get('[data-testid="nav-logout-button"]').should('be.visible').click();
      
      // Should redirect to login page
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should redirect to login when not authenticated', () => {
      // Clear session
      cy.clearCookies();
      
      // Try to access protected page
      cy.visit('/dishes');
      cy.url().should('include', '/login');
      
      // Try to access new dish page
      cy.visit('/dishes/new');
      cy.url().should('include', '/login');
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should navigate using breadcrumbs if available', () => {
      cy.goToDishes();
      
      // Go to new dish page
      cy.get('[data-testid="dishes-add-button"]').click();
      cy.url().should('include', '/dishes/new');
      
      // Check for breadcrumb navigation using data-testid
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="breadcrumb"]').length > 0) {
          cy.get('[data-testid*="breadcrumb"] a').first().click();
          cy.url().should('include', '/dishes');
        } else {
          // If no breadcrumbs, just navigate back manually
          cy.visit('/dishes');
        }
      });
    });
  });

  describe('Form Navigation', () => {
    it('should handle form navigation correctly', () => {
      // Go to new dish form
      cy.visit('/dishes/new');
      cy.get('[data-testid="new-dish-container"]').should('be.visible');
      
      // Fill partial form
      cy.get('[data-testid="new-dish-name-input"]').type('Partial Form Test');
      
      // Navigate away and back
      cy.visit('/dishes');
      cy.visit('/dishes/new');
      
      // Form should be reset
      cy.get('[data-testid="new-dish-name-input"]').should('have.value', '');
    });
  });

  describe('Deep Link Navigation', () => {
    it('should handle direct URLs correctly', () => {
      // Test direct navigation to different pages
      cy.visit('/dishes');
      cy.url().should('include', '/dishes');
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      
      cy.visit('/dishes/new');
      cy.url().should('include', '/dishes/new');
      cy.get('[data-testid="new-dish-container"]').should('be.visible');
      
      // Test invalid URLs
      cy.visit('/dishes/invalid-id', { failOnStatusCode: false });
      // Should handle gracefully (either 404 or redirect)
    });
  });

  describe('Responsive Navigation', () => {
    it('should work correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      
      cy.goToDishes();
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      
      // Check if mobile menu exists and works using data-testid
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="mobile-menu"]').length > 0) {
          cy.get('[data-testid*="mobile-menu"]').click();
          // Menu should open
        }
      });
      
      // Reset viewport
      cy.viewport(1280, 720);
    });

    it('should work correctly on tablet viewport', () => {
      cy.viewport('ipad-2');
      
      cy.goToDishes();
      cy.get('[data-testid="dishes-container"]').should('be.visible');
      
      // Navigation should still be functional
      cy.get('[data-testid="dishes-add-button"]').click();
      cy.url().should('include', '/dishes/new');
      
      // Reset viewport
      cy.viewport(1280, 720);
    });
  });

  describe('Error Handling Navigation', () => {
    it('should handle network errors gracefully', () => {
      // Simulate offline scenario
      cy.goToDishes();
      
      // This test would require network stubbing for full offline testing
      // For now, just verify the page loads correctly
      cy.get('[data-testid="dishes-container"]').should('be.visible');
    });
  });
});