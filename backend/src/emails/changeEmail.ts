export function changeEmailEmail(
  displayName: string,
  newEmail: string,
  url: string,
): string {
  return `
    <p>Bonjour ${displayName},</p>
    <p>Vous avez demandé à changer votre adresse email vers <strong>${newEmail}</strong>.</p>
    <p>Cliquez sur le lien ci-dessous pour confirmer cette demande depuis votre ancienne adresse :</p>
    <p><a href="${url}">${url}</a></p>
    <p>Ce lien expire dans 24 heures.</p>
    <p>Si vous n'avez pas effectué cette demande, ignorez cet email.</p>
  `;
}
