# 🧪 Cypress Tests - Happy Testing App con CI/CD

Este repositorio contiene las pruebas automatizadas **E2E** para la aplicación Happy Testing utilizando **Cypress** con **CI/CD completo en GitHub Actions**.

## 🎯 Características

- ✅ **Tests E2E con Cypress** optimizados para CI/CD
- ✅ **CI/CD en GitHub Actions** con PostgreSQL y multi-repo strategy
- ✅ **Comandos personalizados** para mejor reutilización
- ✅ **Data-testid selectors** para estabilidad en CI
- ✅ **Videos y screenshots** automáticos en fallos
- ✅ **Retry automático** y timeouts optimizados para CI
- ✅ **Multi-browser support** (Chrome, Firefox, Edge)

## 🚀 Configuración del Proyecto

### Requisitos Previos
- Node.js 18+ o superior
- npm 9+ o superior
- Aplicación Happy Testing corriendo en `http://localhost:3000`

### Instalación
```bash
npm install
```

### Verificación de Cypress
```bash
npm run cy:verify
npm run cy:version
```

## 🧪 Ejecución de Tests

### Desarrollo Local

#### Modo Interactivo (con interfaz gráfica)
```bash
npm run cy:open
```

#### Modo Headless (sin interfaz)
```bash
npm run cy:run
```

#### Con navegador visible
```bash
npm run cy:run:headed
```

### Tests Específicos
```bash
npm run cy:run:setup        # Solo setup del ambiente
npm run cy:run:auth         # Solo tests de autenticación  
npm run cy:run:dishes       # Solo tests de platillos
npm run cy:run:navigation   # Solo tests de navegación
```

### Ejecución para CI
```bash
npm run test:ci             # Configuración optimizada para CI
npm run test:ci:record      # Con recording en Cypress Dashboard
```

### Multi-Browser Testing
```bash
npm run test:chrome         # Ejecutar en Chrome
npm run test:firefox        # Ejecutar en Firefox  
npm run test:edge           # Ejecutar en Edge
```

## 🏗️ Estructura del Proyecto

```
cypress_tests_correct/
├── 📁 .github/workflows/          # CI/CD Configuration
│   └── cypress-ci.yml             # GitHub Actions workflow
├── 📁 cypress/
│   ├── 📁 e2e/                    # Tests E2E
│   │   ├── 00-setup.cy.js         # Setup del ambiente
│   │   ├── auth.cy.js             # Tests de autenticación
│   │   ├── dishes.cy.js           # Tests CRUD de platillos
│   │   └── navigation.cy.js       # Tests de navegación
│   ├── 📁 support/                # Soporte y utilidades
│   │   ├── commands.js            # Comandos personalizados para CI
│   │   ├── ci-config.js           # Configuraciones específicas de CI
│   │   ├── e2e.js                 # Setup global optimizado para CI
│   │   └── setup.js               # Configuración del ambiente
│   ├── 📁 screenshots/            # Screenshots automáticos (generados)
│   └── 📁 videos/                 # Videos de tests (generados)
├── cypress.config.js              # Configuración base de Cypress
├── cypress.config.ci.js           # Configuración optimizada para CI
├── package.json                   # Scripts y dependencias
├── CI_SETUP_GUIDE.md              # Guía completa de CI/CD
└── README.md                      # Esta documentación
```

## 🔧 Comandos Personalizados Optimizados para CI

### Autenticación
```javascript
cy.loginAsTestUser()           // Login rápido vía API (optimizado para CI)
cy.loginAsTestUserUI()         // Login vía UI para tests específicos
cy.setupTestUser()             // Crear usuario de prueba para CI
```

### Gestión de Datos
```javascript
cy.createTestDish(dishData)    // Crear platillo con datos únicos para CI
cy.goToDishes()                // Navegar con verificaciones robustas
cy.setupTestEnvironment()      // Setup completo del ambiente para CI
cy.cleanupTestData()           // Limpieza de datos después de tests
```

### Utilidades CI
```javascript
cy.waitForElement(selector)    // Espera robusta con timeouts de CI
cy.verifyAppHealth()           // Verificación de estado de la aplicación
cy.ciLog(message, data)        // Logging optimizado para CI
```

## 🎯 CI/CD con GitHub Actions

### Workflow Automático

El CI se ejecuta automáticamente en:
- **Push a main/master** - Validación completa
- **Pull Requests con label `e2e-tests`** - Control de recursos
- **Ejecución manual** - Con parámetros personalizados

### Infraestructura CI

```yaml
# El workflow incluye:
✅ PostgreSQL 18 con health checks
✅ Multi-repository checkout automático  
✅ Setup de Node.js con cache optimizado
✅ Instalación y verificación de Cypress
✅ Database migrations automáticas
✅ Startup de la aplicación con health checks
✅ Ejecución de tests con retry automático
✅ Captura de videos/screenshots en fallos
✅ Upload automático de artifacts
```

### Métricas de CI

```
📈 Tiempos Típicos:
├── Setup de infraestructura: 2-3 min
├── Instalación de dependencias: 2-4 min
├── Ejecución de tests: 3-8 min
└── Recolección de artifacts: 30 seg
═══════════════════════════════════════
Total: 8-17 minutos
```

## 📊 Estado Actual de Tests

### Cobertura Completa
- **✅ Setup**: 1 test - Configuración del ambiente
- **✅ Autenticación**: 10 tests - Login, registro, logout, validaciones  
- **✅ Navegación**: 9 tests - Navegación general y responsive
- **✅ Gestión de Platillos**: 8 tests - CRUD completo

### Métricas de Éxito
- **28 tests totales**
- **96.4% tasa de éxito** en desarrollo
- **Retry automático** en CI para mayor estabilidad
- **Videos/screenshots** para debugging de fallos

## 🔒 Configuración de CI

### Variables de Ambiente

```bash
# Configuración automática en CI:
CYPRESS_baseUrl=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_test
NODE_ENV=test
CI=true
```

### Usuario de Prueba CI

```javascript
// Configurado automáticamente:
email: 'test@nutriapp.com'
password: 'nutriapp123'
```

## 🔍 Debugging y Troubleshooting

### Logs de CI
- Videos automáticos de tests fallidos
- Screenshots en cada error
- Logs detallados en GitHub Actions
- Artifacts descargables por 7 días

### Ejecución Local de Debug
```bash
npm run test:headed           # Ver ejecución en navegador
npm run cy:open              # Modo interactivo para debugging
```

### Verificación de Estado
```bash
npm run cy:info              # Información del sistema
npm run cy:verify            # Verificar instalación de Cypress
```

## 🚀 Optimizaciones para CI

### Performance
- **API login** en lugar de UI cuando es posible
- **Timeouts extendidos** para compensar latencia de CI
- **Retry automático** (2 intentos) para tests flaky
- **Paralelización** preparada para múltiples containers

### Estabilidad
- **Data-testid selectors** consistentes
- **Esperas explícitas** con timeouts generosos
- **Cleanup automático** después de cada test
- **Error handling** para casos edge en CI

### Monitoreo
- **Health checks** de aplicación y base de datos
- **Métricas de performance** en logs
- **Artifact collection** automático
- **Notifications** de estado de CI

## 📚 Documentación Adicional

- **[CI_SETUP_GUIDE.md](./CI_SETUP_GUIDE.md)** - Guía completa de configuración CI/CD
- **[Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)** - Mejores prácticas oficiales
- **[GitHub Actions](https://docs.github.com/en/actions)** - Documentación de CI/CD

## 🔗 Aplicación Relacionada

Este proyecto testea la aplicación Happy Testing:
- **Repositorio**: [maalvoro/happy_testing](https://github.com/maalvoro/happy_testing)
- **URL Local**: http://localhost:3000
- **URL CI**: Checkout automático en GitHub Actions

## 🎉 Próximas Mejoras

### Fase 1 - Mejoras Inmediatas
- [ ] **Visual Regression Testing** con Percy.io
- [ ] **Accessibility Testing** con cypress-axe
- [ ] **API Testing** directo desde Cypress
- [ ] **Mobile Testing** con viewports móviles

### Fase 2 - Optimizaciones Avanzadas  
- [ ] **Parallel Execution** en múltiples containers
- [ ] **Cross-browser Matrix** en CI
- [ ] **Performance Testing** con Lighthouse
- [ ] **Cypress Dashboard** integration para analytics

---

## 📞 Soporte

Para problemas o mejoras:
1. Revisar **[CI_SETUP_GUIDE.md](./CI_SETUP_GUIDE.md)** para troubleshooting
2. Verificar **GitHub Actions logs** para errores específicos  
3. Crear issue con logs detallados y pasos de reproducción

**🚀 ¡Framework de Testing E2E listo para producción con CI/CD completo!**