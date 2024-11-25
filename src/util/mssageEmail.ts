interface Htmlmail {
  email: string;
  password: string;
}

interface HtmlUpdatemail {
  email: string;
  password: string;
  type: string;
}

export const htmlContentUser = ({ email, password }: Htmlmail) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto;">
      <h1 style="color: #5CA4DA; text-align: center;">Fonelli</h1>
      <h2 style="color: #000; text-align: center;">¡Bienvenido a Fonelli!</h2>
      <p>Estas son tus credenciales temporales para acceder a nuestra app:</p>
      <ul>
        <li><strong>Email:</strong> ${email} </li>
        <li><strong>Contraseña:</strong> ${password} </li>
      </ul>
      <p>Al iniciar sesión en la aplicación, se te pedirá que cambies tu contraseña por una de tu preferencia para mayor seguridad.</p>
      <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para apoyarte.</p>
      <p style="text-align: center; font-weight: bold;">Gracias por confiar en <strong>Fonelli</strong>.</p>
    </div>
    `;
};

export const htmlContentUpdateUser = ({
  email,
  password,
  type,
}: HtmlUpdatemail) => {
  return `<div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto;">
<h1 style="color: #5CA4DA; text-align: center;">Fonelli</h1>
      <h2 style="color: #000; text-align: center;">Se han realizado cambios en los datos de tu cuenta por nuestra parte</h2>
      <ul>
          ${email ? `<li>Email: ${email}</li>` : ""}
          ${password ? `<li>Contraseña: ${password}</li>` : ""}
          ${type ? `<li>Tipo: ${type}</li>` : ""}
        </ul>
        <p>Por favor, inicia sesión y actualiza tu contraseña si es necesario.</p>
        <p>Gracias,</p>
        <p>El equipo de Fonelli</p>
</div>
`;
};
