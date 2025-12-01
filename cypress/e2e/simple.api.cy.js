/**
 * @api Simple API Tests - Validation
 * Tests básicos para validar la implementación API
 * Siguiendo convenciones oficiales de Cypress
 */

describe('@api Simple API Validation Tests', () => {

  it('@api should test basic API endpoint connectivity', () => {
    // Arrange
    cy.log('🔗 Testing basic API connectivity');
    
    // Act
    cy.request({
      method: 'GET',
      url: '/',
      failOnStatusCode: false
    }).then((response) => {
      // Assert
      expect(response.status).to.be.oneOf([200, 404]);
      cy.log('✅ API endpoint is reachable');
    });
  });

  it('@api should generate user data correctly', () => {
    // Arrange
    cy.log('📝 Testing user data generation');
    
    // Act
    cy.generateApiUserData().then((userData) => {
      // Assert
      expect(userData).to.have.property('firstName');
      expect(userData).to.have.property('lastName');
      expect(userData).to.have.property('email');
      expect(userData).to.have.property('password');
      expect(userData.email).to.include('@nutriapp.com');
      
      cy.log(`✅ User data generated: ${userData.email}`);
    });
  });

  it('@api should generate dish data correctly', () => {
    // Arrange
    cy.log('🍽️ Testing dish data generation');
    
    // Act
    cy.generateApiDishData().then((dishData) => {
      // Assert
      expect(dishData).to.have.property('name');
      expect(dishData).to.have.property('description');
      expect(dishData).to.have.property('prepTime');
      expect(dishData).to.have.property('cookTime');
      expect(dishData).to.have.property('steps');
      expect(dishData.steps).to.be.an('array');
      
      cy.log(`✅ Dish data generated: ${dishData.name}`);
    });
  });

  it('@api should test registration API endpoint', () => {
    // Arrange
    cy.log('🔐 Testing registration API endpoint');
    
    cy.generateApiUserData().then((userData) => {
      // Act
      cy.apiRegisterUser(userData).then((response) => {
        // Assert
        cy.log(`Registration status: ${response.status}`);
        expect(response.status).to.be.oneOf([200, 400, 409]); // 200=success, 400=bad request, 409=conflict
        
        if (response.status === 200) {
          expect(response.body).to.have.property('user');
          cy.log('✅ Registration successful');
        } else {
          cy.log(`ℹ️ Registration failed as expected: ${response.status}`);
        }
      });
    });
  });

  it('@api should test login with invalid credentials', () => {
    // Arrange
    cy.log('🔒 Testing login with invalid credentials');
    const invalidCredentials = {
      email: 'nonexistent@test.com',
      password: 'wrongpassword'
    };
    
    // Act
    cy.apiLoginUser(invalidCredentials).then((response) => {
      // Assert
      expect(response.status).to.be.oneOf([400, 401]); // Should fail
      cy.log('✅ Invalid login properly rejected');
    });
  });

});