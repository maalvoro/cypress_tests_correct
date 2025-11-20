# 🔧 Guía de Resolución de Problemas - Cypress CI/CD

## Problemas Comunes y Soluciones

### 1. Error: "tsx must be loaded with --import instead of --loader"

#### 🚨 Síntomas
```bash
Error: tsx must be loaded with --import instead of --loader
    at Object.register (node:module:477:11)
    at MessagePort.<anonymous> (node:internal/main/worker_thread:169:9)
```

#### 🔍 Causa Raíz
- **Node.js 18.20.8+** cambió la forma de cargar módulos TypeScript
- **Cypress 15.6.0** usa el loader anterior que es incompatible
- El CI se cuelga por **17+ minutos** esperando resolución

#### ✅ Solución Implementada
```yaml
# GitHub Actions - cypress-ci.yml
- name: 🟢 Setup Node.js environment
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # ← Actualizado de 18 a 20
```

```javascript
// cypress.config.github.js - Configuración específica para GitHub
const { defineConfig } = require('cypress')  // ← CommonJS puro

module.exports = defineConfig({
  // Configuración sin características experimentales problemáticas
  experimentalSourceRewriting: false,
  experimentalStudio: false,
  experimentalWebKitSupport: false
})
```

```json
// package.json - Downgrade controlado
{
  "devDependencies": {
    "cypress": "^13.15.0"  // ← Downgraded de 15.6.0
  }
}
```

### 2. CI Colgándose en "Run Cypress E2E tests"

#### 🚨 Síntomas
- GitHub Actions se queda en "Running..." por 17+ minutos
- No hay output ni logs visibles
- Eventually timeout con error generic

#### 🔍 Causa Raíz
- Conflicto entre **Node.js version** y **Cypress binary**
- **tsx loader** incompatible en CI environment
- **Memory limits** insuficientes para Cypress + Node.js

#### ✅ Solución Implementada

```yaml
# Variables de entorno optimizadas
env:
  NODE_OPTIONS: "--max-old-space-size=4096"  # ← Más memoria
  CYPRESS_VERIFY_TIMEOUT: 180000            # ← Timeout extendido
  CYPRESS_CACHE_FOLDER: ~/.cache/Cypress    # ← Cache específico
```

```bash
# Instalación con flags de compatibilidad
npm ci --legacy-peer-deps || npm install --legacy-peer-deps
```

```bash
# Ejecución con configuración específica
npx cypress run --config-file cypress.config.github.js
```

### 3. Tests Locales Funcionan, CI Falla

#### 🚨 Síntomas
- `28/28 tests passing` localmente
- CI fails o se cuelga completamente
- Different behavior entre local y CI environment

#### 🔍 Causa Raíz
- **Environmental differences**: Node.js versions, OS, dependencies
- **Memory constraints** en GitHub Actions runners
- **Network latency** afectando timeouts

#### ✅ Solución Implementada

```javascript
// cypress.config.github.js - Timeouts específicos para CI
{
  defaultCommandTimeout: 15000,    // ← Aumentado de 4000ms
  requestTimeout: 20000,           // ← Aumentado de 5000ms  
  responseTimeout: 20000,          // ← Aumentado de 30000ms
  pageLoadTimeout: 30000,          // ← Aumentado para CI
  
  retries: {
    runMode: 2,                    // ← 2 retries en CI
    openMode: 0                    // ← 0 retries locally
  }
}
```

### 4. cy.log() Outside Test Context

#### 🚨 Síntomas
```bash
Error: `cy.log()` cannot be called outside a running test.
    at Object.cy.log (cypress/support/e2e.js:1)
```

#### 🔍 Causa Raíz
- **Support files** ejecutándose antes que tests
- **Global cy.log()** calls fuera del contexto de test
- **Setup code** intentando usar Cypress commands

#### ✅ Solución Implementada

```javascript
// cypress/support/e2e.js - ANTES ❌
cy.log('Setting up environment...')

// cypress/support/e2e.js - DESPUÉS ✅ 
console.log('Setting up environment...')
```

### 5. PostgreSQL Connection Issues en CI

#### 🚨 Síntomas
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

#### 🔍 Causa Raíz
- **PostgreSQL service** no está completamente ready
- **Database creation** timing issues
- **Connection string** incorrect para CI environment

#### ✅ Solución Implementada

```yaml
# PostgreSQL service con health check
postgres:
  image: postgres:18
  env:
    POSTGRES_PASSWORD: postgres
  options: >-
    --health-cmd pg_isready
    --health-interval 10s
    --health-timeout 5s
    --health-retries 5
```

```bash
# Wait script con timeout y verificación
timeout 30 bash -c 'until pg_isready -h localhost -p 5432 -U postgres; do sleep 2; done'
createdb -h localhost -p 5432 -U postgres myapp_test || true
```

## 🔍 Debugging Tools y Comandos

### Local Debugging
```bash
# Ver información detallada del sistema
npm run cy:info

# Verificar instalación y cache
npm run cy:verify

# Ejecutar con logs verbose
DEBUG=cypress:* npm run cy:run

# Test específico con debugging
npx cypress run --spec "cypress/e2e/auth.cy.js" --headed --no-exit
```

### CI Debugging
```bash
# Check Node.js version
node --version

# Check npm configuration
npm config list

# Verificar Cypress binary
npx cypress version
npx cypress verify

# Memory usage
free -h
```

### Configuración de Debug en CI

```yaml
# Agregar al workflow para debugging
- name: 🐛 Debug Environment
  run: |
    echo "Node version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "OS: $(uname -a)"
    echo "Available memory: $(free -h)"
    echo "Cypress cache: $CYPRESS_CACHE_FOLDER"
    ls -la ~/.cache/Cypress/ || true
```

## 📋 Checklist de Resolución

### ✅ Antes de Reportar Problemas
- [ ] **Node.js 20+** está siendo usado
- [ ] **Cypress 13.15.0** está instalado  
- [ ] **cypress.config.github.js** está siendo usado en CI
- [ ] **NODE_OPTIONS** tiene `--max-old-space-size=4096`
- [ ] **Tests pasan localmente** con la misma configuración
- [ ] **PostgreSQL service** está healthy en CI
- [ ] **App está running** en http://localhost:3000

### ✅ Variables de Entorno Críticas
```bash
NODE_OPTIONS="--max-old-space-size=4096"
CYPRESS_baseUrl="http://localhost:3000"
CYPRESS_CACHE_FOLDER="~/.cache/Cypress"
CYPRESS_VERIFY_TIMEOUT="180000"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/myapp_test"
```

### ✅ Scripts de Test Recomendados
```bash
# Para CI - usa configuración optimizada
npm run test:github

# Para local development
npm run cy:open

# Para debugging
npm run test:headed
```

## 🚀 Performance Optimization

### Memory Management
```javascript
// cypress.config.github.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Optimización de memory para CI
      if (process.env.CI) {
        config.video = true
        config.screenshotOnRunFailure = true
        config.defaultCommandTimeout = 15000
        
        // Event cleanup
        on('after:spec', () => {
          // Cleanup memory after each spec
          if (global.gc) global.gc()
        })
      }
      return config
    }
  }
})
```

### Browser Optimization para CI
```javascript
on('before:browser:launch', (browser = {}, launchOptions) => {
  if (browser.name === 'electron') {
    launchOptions.args.push('--disable-dev-shm-usage')
    launchOptions.args.push('--no-sandbox')
    launchOptions.args.push('--disable-setuid-sandbox')
    launchOptions.args.push('--disable-extensions')
    launchOptions.args.push('--disable-background-timer-throttling')
  }
  return launchOptions
})
```

## 📞 Soporte y Referencias

- **Cypress Docs**: https://docs.cypress.io/
- **Node.js Compatibility**: https://github.com/cypress-io/cypress/issues
- **GitHub Actions**: https://docs.github.com/en/actions
- **Este Proyecto**: Ver `README.md` y `CI_SETUP_GUIDE.md`