export function verifyEmailEmail(displayName: string, url: string): string {
  return `
    <p>Bonjour ${displayName},</p>
    <p>Merci de vous être inscrit sur The Good Corner !</p>
    <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
    <p><a href="${url}">${url}</a></p>
    <p>Ce lien expire dans 24 heures.</p>
    <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
  `;
}
