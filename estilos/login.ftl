<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Página de Login Personalizada</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
</head>
<body>
  <div class="login-container">
    <h1>Inicia Sesión en Mi Aplicación</h1>
    <#-- El formulario de login se genera dinámicamente -->
    <form id="kc-form-login" action="${url.loginAction}" method="post">
      <div>
        <label for="username">Usuario:</label>
        <input type="text" id="username" name="username" autofocus>
      </div>
      <div>
        <label for="password">Contraseña:</label>
        <input type="password" id="password" name="password">
      </div>
      <div>
        <button type="submit">Ingresar</button>
      </div>
    </form>
  </div>
</body>
</html>
