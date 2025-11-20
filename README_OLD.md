# Cypress Tests - Happy Testing App

Este repositorio contiene las pruebas automatizadas E2E para la aplicación Happy Testing utilizando Cypress.

## 🚀 Configuración del Proyecto

### Requisitos Previos
- Node.js v25.1.0 o superior
- npm v11.6.0 o superior
- Aplicación Happy Testing corriendo en `http://localhost:3000`

### Instalación
```bash
npm install
```

## 🧪 Ejecución de Tests

### Modo Interactivo (con interfaz gráfica)
```bash
npm run cy:open
```

### Modo Headless (sin interfaz)
```bash
npm run cy:run
```

### Con navegador visible
```bash
npm run cy:run:headed
```

### Tests específicos
```bash
npm run cy:run:auth  # Solo tests de autenticación
```

## 📋 Estructura de Tests

- **00-setup.cy.js** - Configuración del entorno de testing
- **auth.cy.js** - Tests de autenticación (login, registro, navegación)
- **dishes.cy.js** - Tests CRUD para platillos
- **navigation.cy.js** - Tests de navegación general

## 🔧 Comandos Personalizados

### `cy.loginAsTestUser()`
Login rápido via API con usuario de prueba

### `cy.createTestDish(dishData)`
Crear platillo de prueba con datos personalizables

### `cy.goToDishes()`
Navegar a la página de platillos

### `cy.setupTestEnvironment()`
Configurar entorno de testing

### `cy.cleanupTestData()`
Limpiar datos de prueba

## 📊 Estado Actual

- **28 tests totales**
- **27 tests pasando** (96.4% éxito)
- **Setup**: 1/1 ✅
- **Auth**: 10/10 ✅ 
- **Navigation**: 9/9 ✅
- **Dishes**: 8/8 ✅

## 🏗️ Buenas Prácticas

- Uso consistente de `data-testid` para selectores
- API login para mejor performance
- Cleanup automático de datos de prueba
- Tests independientes y reproducibles
- Comandos reutilizables

## 🔗 Aplicación Relacionada

Este proyecto testea la aplicación Happy Testing disponible en:
- **Repositorio**: [happy_testing](../happy_testing)
- **URL Local**: http://localhost:3000

## 👤 Usuario de Prueba

- **Email**: test@nutriapp.com
- **Password**: nutriapp123

## 📝 Notas

- Los tests requieren que la aplicación esté corriendo en localhost:3000
- Se utiliza PostgreSQL con usuario 'admin'
- Tests optimizados para velocidad usando API calls donde es posible