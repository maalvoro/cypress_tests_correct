describe('Authentication Tests', () => {
  before(() => {
    // Ensure test user exists
    cy.setupTestEnvironment();
  });

  beforeEach(() => {
    // Limpiar cookies antes de cada test
    cy.clearCookies();
  });

  describe('Login Page', () => {
    it('should display login page correctly', () => {
      // Arrange
      cy.log('🔐 Testing login page display');
      
      // Act
      cy.visit('/login');
      
      // Assert
      cy.get('[data-testid="login-container"]').should('be.visible');
      cy.get('[data-testid="login-title"]').should('contain.text', 'Bienvenido');
      cy.get('[data-testid="login-subtitle"]').should('contain.text', 'Inicia sesión para continuar');
      cy.get('[data-testid="login-email-input"]').should('be.visible');
      cy.get('[data-testid="login-password-input"]').should('be.visible');
      cy.get('[data-testid="login-submit"]').should('be.visible');
      cy.get('[data-testid="login-register-link"]').should('be.visible');
      cy.log('✅ Login page displayed correctly');
    });

    it('should show error with invalid credentials', () => {
      // Arrange
      cy.log('❌ Testing invalid credentials');
      const invalidCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };
      cy.visit('/login');
      
      // Act
      cy.get('[data-testid="login-email-input"]').type(invalidCredentials.email);
      cy.get('[data-testid="login-password-input"]').type(invalidCredentials.password);
      cy.get('[data-testid="login-submit"]').click();
      
      // Assert
      cy.get('[data-testid="login-error"]').should('be.visible');
      cy.log('✅ Invalid credentials error shown correctly');
    });

    it('should navigate to register page', () => {
      // Arrange
      cy.log('🔗 Testing navigation to register page');
      cy.visit('/login');
      
      // Act
      cy.get('[data-testid="login-register-link"]').click();
      
      // Assert
      cy.url().should('include', '/register');
      cy.get('[data-testid="register-title"]').should('be.visible');
      cy.log('✅ Navigation to register page successful');
    });

    it('should login successfully with valid credentials', () => {
      // Arrange
      cy.log('✅ Testing successful login');
      cy.visit('/login');
      
      cy.getSessionTestUser().then((user) => {
        // Act
        cy.get('[data-testid="login-email-input"]').type(user.email);
        cy.get('[data-testid="login-password-input"]').type(user.password);
        cy.get('[data-testid="login-submit"]').click();
        
        // Assert
        cy.url().should('include', '/dishes');
        cy.log('✅ Login successful');
      });
    });
  });

  describe('Register Page', () => {
    it('should display register page correctly', () => {
      // Arrange
      cy.log('📝 Testing register page display');
      
      // Act
      cy.visit('/register');
      
      // Assert
      cy.get('[data-testid="register-container"]').should('be.visible');
      cy.get('[data-testid="register-title"]').should('contain.text', 'Crear cuenta');
      cy.get('[data-testid="register-subtitle"]').should('contain.text', 'Regístrate para comenzar');
      cy.get('[data-testid="register-firstname"]').should('be.visible');
      cy.get('[data-testid="register-lastname"]').should('be.visible');
      cy.get('[data-testid="register-email"]').should('be.visible');
      cy.get('[data-testid="register-nationality"]').should('be.visible');
      cy.get('[data-testid="register-phone"]').should('be.visible');
      cy.get('[data-testid="register-password"]').should('be.visible');
      cy.get('[data-testid="register-submit"]').should('be.visible');
      cy.log('✅ Register page displayed correctly');
    });

    it('should navigate to login page', () => {
      // Arrange
      cy.log('🔗 Testing navigation to login page');
      cy.visit('/register');
      
      // Act
      cy.get('[data-testid="register-login-link"]').click();
      
      // Assert
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-title"]').should('be.visible');
      cy.log('✅ Navigation to login page successful');
    });

    it('should register a new user successfully', () => {
      // Arrange
      const timestamp = Date.now();
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${timestamp}@example.com`,
        nationality: 'Mexican',
        phone: '1234567890',
        password: 'Test1234!'
      };
      cy.log(`👤 Registering new user: ${userData.email}`);
      cy.visit('/register');
      
      // Act
      cy.get('[data-testid="register-firstname"]').type(userData.firstName);
      cy.get('[data-testid="register-lastname"]').type(userData.lastName);
      cy.get('[data-testid="register-email"]').type(userData.email);
      cy.get('[data-testid="register-nationality"]').type(userData.nationality);
      cy.get('[data-testid="register-phone"]').type(userData.phone);
      cy.get('[data-testid="register-password"]').type(userData.password);
      cy.get('[data-testid="register-submit"]').click();
      
      // Assert
      cy.url().should('include', '/login');
      cy.log('✅ User registration successful');
    });
  });

  describe('Home Page', () => {
    it('should display home page correctly', () => {
      // Arrange
      cy.log('🏠 Testing home page display');
      
      // Act
      cy.visit('/');
      
      // Assert
      cy.get('[data-testid="home-container"]').should('be.visible');
      cy.get('[data-testid="home-title"]').should('contain.text', 'Welcome to NutriApp!');
      cy.get('[data-testid="home-subtitle"]').should('be.visible');
      cy.get('[data-testid="home-cta"]').should('be.visible');
      cy.log('✅ Home page displayed correctly');
    });

    it('should navigate to login from home', () => {
      // Arrange
      cy.log('🔗 Testing navigation from home to login');
      cy.visit('/');
      
      // Act
      cy.get('a[data-testid="home-cta"]').click();
      
      // Assert
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-title"]').should('be.visible');
      cy.log('✅ Navigation to login from home successful');
    });
  });

  describe('End-to-End User Flow', () => {
    it('should complete full registration and login flow', () => {
      // Arrange
      const timestamp = Date.now();
      const credentials = {
        email: `e2e${timestamp}@example.com`,
        password: 'Test1234!'
      };
      cy.log(`🔄 Starting E2E flow for user: ${credentials.email}`);
      
      // Act & Assert - Registration
      cy.visit('/register');
      cy.get('[data-testid="register-firstname"]').type('E2E');
      cy.get('[data-testid="register-lastname"]').type('User');
      cy.get('[data-testid="register-email"]').type(credentials.email);
      cy.get('[data-testid="register-nationality"]').type('Mexican');
      cy.get('[data-testid="register-phone"]').type('1234567890');
      cy.get('[data-testid="register-password"]').type(credentials.password);
      cy.get('[data-testid="register-submit"]').click();
      
      cy.url().should('include', '/login');
      
      // Act & Assert - Login
      cy.get('[data-testid="login-email-input"]').type(credentials.email);
      cy.get('[data-testid="login-password-input"]').type(credentials.password);
      cy.get('[data-testid="login-submit"]').click();
      
      cy.url().should('include', '/dishes');
      cy.log('✅ E2E registration and login flow completed');
    });
  });
});