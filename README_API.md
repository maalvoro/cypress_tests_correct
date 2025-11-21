# 🔬 Cypress Test Suite - NutriApp

Comprehensive test suite for the NutriApp platform featuring both UI and API testing capabilities following official Cypress conventions.

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🧪 Test Types](#-test-types)
- [🏗️ Project Structure](#-project-structure)
- [⚙️ Configuration](#-configuration)
- [📊 Running Tests](#-running-tests)
- [🔗 API Testing](#-api-testing)
- [🌐 CI/CD Integration](#-cicd-integration)
- [🛠️ Development](#-development)

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Application**
   ```bash
   # In the main application directory
   npm run dev
   ```

3. **Run Tests**
   ```bash
   # UI Tests
   npm run cy:run

   # API Tests  
   npm run cy:run -- --spec "cypress/e2e/**/*.api.cy.js"

   # Integration Tests
   npm run cy:run -- --spec "cypress/e2e/integration.api.cy.js"

   # All Tests
   npm run cy:run:all
   ```

## 🧪 Test Types

### 🖼️ UI Tests
- **Authentication**: Login, registration, session management
- **Navigation**: Menu navigation, routing, breadcrumbs  
- **Dishes**: CRUD operations, form validation, user interactions
- **Responsive**: Cross-device compatibility

### 🔌 API Tests
- **Authentication API**: Register, login, session validation
- **Dishes API**: Complete CRUD operations
- **Data Validation**: Schema validation, error handling
- **Security**: Authentication, authorization, input sanitization

### 🔗 Integration Tests
- **UI ↔ API**: Cross-validation between frontend and backend
- **Data Consistency**: Ensuring data integrity across interfaces
- **Session Management**: Consistent authentication state
- **Error Handling**: Graceful error recovery

## 🏗️ Project Structure

```
cypress_tests_correct/
├── cypress/
│   ├── e2e/                     # Test specifications
│   │   ├── auth.cy.js           # UI authentication tests
│   │   ├── auth.api.cy.js       # API authentication tests  
│   │   ├── dishes.cy.js         # UI dishes tests
│   │   ├── dishes.api.cy.js     # API dishes tests
│   │   ├── navigation.cy.js     # UI navigation tests
│   │   └── integration.api.cy.js # Integration tests
│   ├── fixtures/                # Test data
│   │   └── api-test-data.json   # API test fixtures
│   └── support/                 # Support files
│       ├── commands.js          # Custom commands (UI + API)
│       ├── e2e.js              # Global configuration
│       └── ci-config.js        # CI-specific settings
├── cypress.config.js           # Main Cypress configuration
├── cypress.config.ci.js        # CI-specific configuration  
├── cypress.config.github.js    # GitHub Actions configuration
└── package.json               # Dependencies and scripts
```

## ⚙️ Configuration

### Environment Variables
```javascript
// cypress.config.js
env: {
  apiUrl: 'http://localhost:3000/api',
  enableApiTests: true,
  retryOnNetworkFailure: true,
  CI: false,                     // Set to true in CI environments
  GITHUB_ACTIONS: false          // Automatically set in GitHub Actions
}
```

### Test Categories
Tests are organized using tags for easy filtering:

- `@ui`: User interface tests
- `@api`: API endpoint tests  
- `@integration`: Cross-system integration tests
- `@auth`: Authentication-related tests
- `@dishes`: Dishes functionality tests
- `@navigation`: Navigation and routing tests

## 📊 Running Tests

### Local Development
```bash
# Interactive mode (recommended for development)
npm run cy:open

# Headless mode (CI-style)
npm run cy:run

# Specific test types
npm run test:ui
npm run test:api  
npm run test:integration
npm run test:auth
```

### Filtering Tests
```bash
# Run only API tests
npx cypress run --spec "cypress/e2e/**/*.api.cy.js"

# Run tests with specific tags
npx cypress run --env grepTags="@api"

# Run specific test file
npx cypress run --spec "cypress/e2e/dishes.api.cy.js"
```

### Configuration Profiles
```bash
# Production environment
npx cypress run --config-file cypress.config.ci.js

# GitHub Actions
npx cypress run --config-file cypress.config.github.js

# Custom environment
npx cypress run --env baseUrl=https://staging.nutriapp.com
```

## 🔗 API Testing

### Key Features

#### 🔐 Authentication
- User registration and login via API endpoints
- Session cookie extraction and management
- Token-based authentication testing
- Security validation (unauthorized access, invalid credentials)

#### 🍽️ Dishes CRUD
- Create dishes with comprehensive validation
- Read operations (single dish, dish lists)
- Update operations (full and partial updates)  
- Delete operations with verification
- Data consistency checks

#### 📊 Data Validation
- Schema validation for all API responses
- Input sanitization testing
- Boundary value testing
- Error response validation

### Custom Commands

#### User Management
```javascript
// Generate unique test user data
cy.generateApiUserData()

// Register user via API
cy.apiRegisterUser(userData)

// Login and extract session
cy.apiLoginUser(loginData)

// Create complete test user (register + login)
cy.apiCreateTestUser()
```

#### Dishes Management  
```javascript
// Generate unique dish data
cy.generateApiDishData()

// CRUD operations
cy.apiCreateDish(dishData, sessionCookie)
cy.apiGetDishes(sessionCookie)
cy.apiGetDish(dishId, sessionCookie)
cy.apiUpdateDish(dishId, updateData, sessionCookie)
cy.apiDeleteDish(dishId, sessionCookie)
```

#### Validation
```javascript
// Validate API response structures
cy.validateUserStructure(user)
cy.validateDishStructure(dish)
```

### Example API Test
```javascript
describe('@api Dishes API Tests', () => {
  let testUser;

  beforeEach(() => {
    cy.apiCreateTestUser().then((user) => {
      testUser = user;
    });
  });

  it('@api should create dish successfully', () => {
    cy.generateApiDishData().then((dishData) => {
      cy.apiCreateDish(dishData, testUser.sessionCookie).then((response) => {
        expect(response.status).to.equal(200);
        cy.validateDishStructure(response.body.dish);
        expect(response.body.dish.name).to.equal(dishData.name);
      });
    });
  });
});
```

## 🌐 CI/CD Integration

### GitHub Actions Support
The test suite includes full GitHub Actions integration:

```yaml
# .github/workflows/cypress.yml
name: Cypress Tests
on: [push, pull_request]
jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: cypress-io/github-action@v6
        with:
          config-file: cypress.config.github.js
          build: npm run build
          start: npm start
          wait-on: 'http://localhost:3000'
          spec: 'cypress/e2e/**/*.cy.js'
```

### CI-Specific Features
- **Optimized timeouts** for CI environment variability
- **Retry configuration** for flaky network conditions
- **Screenshot and video capture** for debugging failures
- **Parallel execution** support for faster builds
- **Test result reporting** with detailed artifacts

### Environment Detection
Tests automatically adapt to CI environments:

```javascript
// Automatic CI detection and configuration
if (Cypress.env('CI')) {
  // Extended timeouts for CI
  // Enhanced retry logic
  // Optimized resource usage
}
```

## 🛠️ Development

### Adding New Tests

#### API Tests
1. Create test file: `cypress/e2e/feature.api.cy.js`
2. Use `@api` tag for categorization
3. Follow existing patterns for session management
4. Include comprehensive error scenarios

#### Integration Tests
1. Combine UI and API validations in single test
2. Use `@integration` tag
3. Test data consistency across interfaces
4. Verify error handling across systems

### Custom Commands
Add reusable functionality to `cypress/support/commands.js`:

```javascript
Cypress.Commands.add('customApiCommand', (params) => {
  // Implementation using cy.request()
  // Follow existing patterns for session management
  // Include proper error handling
});
```

### Best Practices

#### ✅ Do
- Use official Cypress patterns (cy.request, cy.fixture)
- Tag tests appropriately for easy filtering  
- Include comprehensive assertions
- Test both happy path and error scenarios
- Use the session user system for consistency
- Follow the established command patterns

#### ❌ Don't  
- Hardcode test data (use fixtures and generators)
- Skip error scenario testing
- Mix UI and API patterns inappropriately
- Ignore CI-specific considerations
- Create interdependent tests

### Troubleshooting

#### Common Issues
1. **Session Management**: Ensure proper cookie handling
2. **Network Timeouts**: Adjust timeouts for your environment
3. **Data Conflicts**: Use unique data generators
4. **CI Failures**: Check GitHub Actions logs and artifacts

#### Debug Mode
```bash
# Enable debug logging
DEBUG=cypress:* npx cypress run

# Open developer tools in interactive mode
npx cypress open --config chromeWebSecurity=false
```

## 📚 Documentation

- [Cypress Official Documentation](https://docs.cypress.io)
- [API Testing Best Practices](./docs/api-testing.md)  
- [CI Setup Guide](./CI_SETUP_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

## 🤝 Contributing

1. Follow existing patterns and conventions
2. Add appropriate test tags
3. Include both positive and negative test cases
4. Update documentation when adding new features
5. Ensure CI compatibility

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.