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
      cy.visit('/login');
      
      // Verificar elementos de la página usando data-testid
      cy.get('[data-testid="login-container"]').should('be.visible');
      cy.get('[data-testid="login-title"]').should('contain.text', 'Bienvenido');
      cy.get('[data-testid="login-subtitle"]').should('contain.text', 'Inicia sesión para continuar');
      cy.get('[data-testid="login-email-input"]').should('be.visible');
      cy.get('[data-testid="login-password-input"]').should('be.visible');
      cy.get('[data-testid="login-submit"]').should('be.visible');
      cy.get('[data-testid="login-register-link"]').should('be.visible');
    });

    it('should show error with invalid credentials', () => {
      cy.visit('/login');
      
      // Llenar formulario con credenciales inválidas
      cy.get('[data-testid="login-email-input"]').type('invalid@example.com');
      cy.get('[data-testid="login-password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-submit"]').click();
      
      // Verificar que muestra error
      cy.get('[data-testid="login-error"]').should('be.visible');
    });

    it('should navigate to register page', () => {
      cy.visit('/login');
      
      // Hacer clic en enlace de registro
      cy.get('[data-testid="login-register-link"]').click();
      
      // Verificar navegación a página de registro
      cy.url().should('include', '/register');
      cy.get('[data-testid="register-title"]').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.visit('/login');
      
      // Usar las credenciales del usuario de sesión
      cy.getSessionTestUser().then((user) => {
        cy.get('[data-testid="login-email-input"]').type(user.email);
        cy.get('[data-testid="login-password-input"]').type(user.password);
        cy.get('[data-testid="login-submit"]').click();
        
        // Verificar redirección a dishes
        cy.url().should('include', '/dishes');
      });
    });
  });

  describe('Register Page', () => {
    it('should display register page correctly', () => {
      cy.visit('/register');
      
      // Verificar elementos de la página
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
    });

    it('should navigate to login page', () => {
      cy.visit('/register');
      
      // Hacer clic en enlace de login
      cy.get('[data-testid="register-login-link"]').click();
      
      // Verificar navegación a página de login
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-title"]').should('be.visible');
    });

    it('should register a new user successfully', () => {
      cy.visit('/register');
      
      const timestamp = Date.now();
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test${timestamp}@example.com`,
        nationality: 'Mexican',
        phone: '1234567890',
        password: 'Test1234!'
      };
      
      // Llenar formulario de registro
      cy.get('[data-testid="register-firstname"]').type(userData.firstName);
      cy.get('[data-testid="register-lastname"]').type(userData.lastName);
      cy.get('[data-testid="register-email"]').type(userData.email);
      cy.get('[data-testid="register-nationality"]').type(userData.nationality);
      cy.get('[data-testid="register-phone"]').type(userData.phone);
      cy.get('[data-testid="register-password"]').type(userData.password);
      
      // Enviar formulario
      cy.get('[data-testid="register-submit"]').click();
      
      // Verificar redirección a login
      cy.url().should('include', '/login');
    });
  });

  describe('Home Page', () => {
    it('should display home page correctly', () => {
      cy.visit('/');
      
      // Verificar elementos de la página
      cy.get('[data-testid="home-container"]').should('be.visible');
      cy.get('[data-testid="home-title"]').should('contain.text', 'Welcome to NutriApp!');
      cy.get('[data-testid="home-subtitle"]').should('be.visible');
      cy.get('[data-testid="home-cta"]').should('be.visible');
    });

    it('should navigate to login from home', () => {
      cy.visit('/');
      
      // Hacer clic en botón "Go to Login" (el enlace, no el div de credenciales)
      cy.get('a[data-testid="home-cta"]').click();
      
      // Verificar navegación a página de login
      cy.url().should('include', '/login');
      cy.get('[data-testid="login-title"]').should('be.visible');
    });
  });

  describe('End-to-End User Flow', () => {
    it('should complete full registration and login flow', () => {
      const timestamp = Date.now();
      const email = `e2e${timestamp}@example.com`;
      const password = 'Test1234!';
      
      // 1. Registrar nuevo usuario
      cy.visit('/register');
      cy.get('[data-testid="register-firstname"]').type('E2E');
      cy.get('[data-testid="register-lastname"]').type('User');
      cy.get('[data-testid="register-email"]').type(email);
      cy.get('[data-testid="register-nationality"]').type('Mexican');
      cy.get('[data-testid="register-phone"]').type('1234567890');
      cy.get('[data-testid="register-password"]').type(password);
      cy.get('[data-testid="register-submit"]').click();
      
      // 2. Verificar redirección a login
      cy.url().should('include', '/login');
      
      // 3. Hacer login con usuario recién creado
      cy.get('[data-testid="login-email-input"]').type(email);
      cy.get('[data-testid="login-password-input"]').type(password);
      cy.get('[data-testid="login-submit"]').click();
      
      // 4. Verificar acceso a dishes
      cy.url().should('include', '/dishes');
    });
  });
});