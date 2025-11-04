# Guía de Testing - VAMA Trivia Frontend

## 📋 Contenido

- [Pruebas Unitarias](#pruebas-unitarias)
- [Pruebas E2E](#pruebas-e2e)
- [Instalación](#instalación)
- [Comandos](#comandos)
- [Estructura](#estructura)

## 🔧 Instalación

Instalar las dependencias de testing:

```bash
npm install
```

Las dependencias incluyen:
- **Jest**: Framework de testing unitario
- **React Testing Library**: Testing de componentes React
- **Playwright**: Testing E2E automatizado

## 🧪 Pruebas Unitarias

### Qué se prueba

- **Componentes**: TriviaCard, QuestionCard
- **Hooks**: useAuth, useGameSession
- **Servicios**: auth.service, trivias.service, game-sessions.service
- **Utilidades**: html-decoder, sessionHelpers

### Comandos

```bash
# Ejecutar todas las pruebas unitarias
npm test

# Ejecutar pruebas en modo watch (desarrollo)
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar un archivo específico
npm test -- TriviaCard.test.tsx
```

### Ejemplos de Pruebas

#### Componentes
```typescript
// src/app/my-trivias/components/__tests__/TriviaCard.test.tsx
- Renderizado correcto
- Interacciones de usuario (clicks)
- Estados condicionales (draft, published, archived)
- Props y callbacks
```

#### Servicios
```typescript
// src/services/__tests__/auth.service.test.ts
- Login y registro
- Almacenamiento de tokens
- Manejo de errores
- Autenticación
```

#### Hooks
```typescript
// src/hooks/__tests__/useAuth.test.tsx
- Estado inicial
- Cambios de estado
- Efectos secundarios
- Sincronización con localStorage
```

## 🌐 Pruebas E2E (End-to-End)

### Qué se prueba

- **Autenticación**: Login, registro, logout
- **Navegación**: Rutas protegidas, redirects
- **Gestión de trivias**: Crear, editar, eliminar
- **Flujo de juego**: Sesiones, respuestas, resultados

### Comandos

```bash
# Ejecutar todas las pruebas E2E
npm run test:e2e

# Ejecutar con UI interactiva
npm run test:e2e:ui

# Ver reporte de la última ejecución
npm run test:e2e:report

# Ejecutar en un navegador específico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Configuración

Las pruebas E2E requieren que el servidor de desarrollo esté corriendo. Playwright lo iniciará automáticamente en `http://localhost:3000`.

Si quieres ejecutar contra un servidor específico:

```bash
# Modificar playwright.config.ts
baseURL: 'https://tu-servidor.com'
```

### Ejemplos de Pruebas E2E

```typescript
// e2e/auth.spec.ts
- Navegación a login/registro
- Validación de formularios
- Flujo completo de autenticación

// e2e/game-flow.spec.ts
- Iniciar sesión de juego
- Responder preguntas
- Ver resultados
- Historial de sesiones
```

## 📁 Estructura de Pruebas

```
nextjs-vama/
├── src/
│   ├── app/
│   │   └── my-trivias/
│   │       └── components/
│   │           └── __tests__/
│   │               └── TriviaCard.test.tsx
│   ├── hooks/
│   │   └── __tests__/
│   │       └── useAuth.test.tsx
│   ├── services/
│   │   └── __tests__/
│   │       └── auth.service.test.ts
│   └── lib/
│       └── __tests__/
│           └── html-decoder.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── navigation.spec.ts
│   ├── trivias.spec.ts
│   └── game-flow.spec.ts
├── jest.config.js
├── jest.setup.js
└── playwright.config.ts
```

## 🎯 Mejores Prácticas

### Pruebas Unitarias

1. **Aislamiento**: Cada prueba debe ser independiente
2. **Mocks**: Usa mocks para dependencias externas (API, localStorage)
3. **Nombres descriptivos**: `debería hacer X cuando Y`
4. **Arrange-Act-Assert**: Organiza tu código de prueba claramente

```typescript
it('debería mostrar error con credenciales incorrectas', async () => {
  // Arrange
  const invalidCredentials = { email: 'wrong@test.com', password: 'wrong' };
  
  // Act
  const result = await authService.login(invalidCredentials);
  
  // Assert
  expect(result).toThrow();
});
```

### Pruebas E2E

1. **Esperas explícitas**: Usa `waitForTimeout` o `waitForSelector`
2. **Selectores robustos**: Prefiere `data-testid` sobre selectores CSS frágiles
3. **Limpieza**: Cada test debe dejar el sistema en estado limpio
4. **Datos de prueba**: Usa datos consistentes y predecibles

## 📊 Cobertura

Para ver el reporte de cobertura:

```bash
npm run test:coverage
```

El reporte se generará en `coverage/lcov-report/index.html`

### Objetivos de Cobertura

- **Componentes críticos**: >80%
- **Servicios**: >90%
- **Utilidades**: >95%
- **Hooks**: >80%

## 🐛 Debugging

### Jest

```bash
# Ejecutar con Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Playwright

```bash
# Ejecutar con headed mode (ver el navegador)
npx playwright test --headed

# Ejecutar con debug mode
npx playwright test --debug

# Ejecutar paso a paso
npx playwright test --ui
```

## 🔄 CI/CD

Las pruebas se ejecutan automáticamente en:

- **Pull Requests**: Todas las pruebas unitarias y E2E
- **Push a main**: Cobertura completa + reportes
- **Deploy**: Smoke tests antes del deploy

Configuración en `.github/workflows/test.yml` (si aplica)

## 📝 Notas Adicionales

### Limitaciones Actuales

1. **Autenticación E2E**: Las pruebas E2E usan tokens simulados. Para pruebas completas, considera usar usuarios de prueba en BD.

2. **API Mocking**: Los servicios están mockeados. Para integration tests reales, considera usar MSW (Mock Service Worker).

3. **Base de datos**: Las pruebas no modifican la BD real. Considera usar una BD de testing.

### Próximos Pasos

- [ ] Agregar pruebas de integración con API real
- [ ] Implementar visual regression testing
- [ ] Agregar pruebas de performance
- [ ] Configurar CI/CD pipeline
- [ ] Agregar mutation testing

## 🆘 Solución de Problemas

### "Cannot find module"
```bash
npm install
```

### "Port 3000 is already in use"
```bash
# Matar proceso en puerto 3000
npx kill-port 3000
```

### "Playwright browsers not installed"
```bash
npx playwright install
```

### Pruebas lentas
- Usa `--maxWorkers=2` para limitar workers
- Ejecuta solo las pruebas necesarias con `--testNamePattern`

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

