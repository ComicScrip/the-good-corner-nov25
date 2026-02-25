export function resetPasswordEmail(displayName: string, url: string): string {
  return `
    <p>Bonjour ${displayName},</p>
    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
    <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
    <p><a href="${url}">${url}</a></p>
    <p>Ce lien expire dans 1 heure.</p>
    <p>Si vous n'avez pas effectué cette demande, ignorez cet email.</p>
  `;
}
