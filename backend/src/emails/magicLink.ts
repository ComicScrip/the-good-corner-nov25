export function magicLinkEmail(displayName: string, url: string): string {
  return `
    <p>Bonjour ${displayName},</p>
    <p>Voici votre lien de connexion à The Good Corner :</p>
    <p><a href="${url}">${url}</a></p>
    <p>Ce lien est valable pendant 10 minutes.</p>
    <p>Si vous n'avez pas demandé ce lien, ignorez cet email.</p>
  `;
}
