interface Htmlmail {
  email: string;
  password: string;
  customerNumber?: string | null;
}

interface HtmlUpdatemail {
  email: string;
  password: string;
  customerNumber?: string | null;
}

export const htmlContentUser = ({
  email,
  password,
  customerNumber = null,
}: Htmlmail) => {
  const textComplement = `<li><strong>Número de cliente:</strong> ${customerNumber}</li>`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 16px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
      <h1 style="color: #5CA4DA; text-align: center; margin-bottom: 16px;">Fonelli</h1>
      <h2 style="color: #000; text-align: center; margin-bottom: 24px;">¡Bienvenido a Fonelli!</h2>
      <p style="margin-bottom: 16px;">Estas son tus credenciales temporales para acceder a nuestra app:</p>
      <ul style="margin-bottom: 16px; padding-left: 20px;">
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Contraseña:</strong> ${password}</li>
        ${customerNumber ? textComplement : ""}
      </ul>
      <p style="margin-bottom: 16px;">Al iniciar sesión en la aplicación, se te pedirá que cambies tu contraseña por una de tu preferencia para mayor seguridad.</p>
      <p style="margin-bottom: 16px;">Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para apoyarte.</p>
      <p style="text-align: center; font-weight: bold;">Gracias por confiar en <strong>Fonelli</strong>.</p>
    </div>
  `;
};

export const htmlContentUpdateUser = ({
  email,
  password,
  customerNumber = null,
}: HtmlUpdatemail) => {
  const textComplement = `<li><strong>Número de cliente:</strong> ${customerNumber}</li>`;
  return `<div style="font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto;">
<h1 style="color: #5CA4DA; text-align: center;">Fonelli</h1>
      <h2 style="color: #000; text-align: center;">Se han realizado cambios en los datos de tu cuenta por nuestra parte</h2>
      <ul>
          ${email ? `<li>Email: ${email}</li>` : ""}
          ${password ? `<li>Contraseña: ${password}</li>` : ""}
          ${customerNumber ? textComplement : ""}
        </ul>
        <p>Por favor, inicia sesión y actualiza tu contraseña si es necesario.</p>
        <p>Gracias,</p>
        <p>El equipo de Fonelli</p>
</div>
`;
};
