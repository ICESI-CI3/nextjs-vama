# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - heading "Iniciar Sesión" [level=1] [ref=e5]
    - paragraph [ref=e6]: Bienvenido a TriviaTime
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Correo electrónico
        - textbox "Correo electrónico" [ref=e10]:
          - /placeholder: tu@email.com
      - generic [ref=e11]:
        - generic [ref=e12]: Contraseña
        - textbox "Contraseña" [ref=e13]:
          - /placeholder: ••••••••
      - button "Iniciar Sesión" [ref=e14] [cursor=pointer]
    - paragraph [ref=e16]:
      - text: ¿No tienes una cuenta?
      - link "Regístrate aquí" [ref=e17] [cursor=pointer]:
        - /url: /auth/register
```