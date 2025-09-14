from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from email.mime.image import MIMEImage
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def send_credentials_email(user_email, nom, prenom, username, password, role):
    """Envoie des identifiants avec un email HTML vert/blanc + fallback texte.

    - Utilise un logo Lafarge si disponible (frontend/public/lafarge-placo-logo.png)
    - Ajoute un contenu stylé côté HTML (vert/blanc)
    - Conserve un message texte comme fallback
    """
    subject = f"Vos identifiants de connexion — {role.capitalize()}"

    # Texte brut (fallback)
    text_body = f"""
Bonjour {prenom} {nom},

Votre compte {role} a été configuré.

Identifiant: {username}
Mot de passe temporaire: {password}

IMPORTANT: changez votre mot de passe après connexion.

Cordialement,
L'équipe Lafarge
"""

    # HTML élégant (vert/blanc)
    html_body = f"""
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bienvenue</title>
  </head>
  <body style="margin:0;background:#f6faf7;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6faf7;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d7ead9;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(46,125,50,.10)">
            <tr>
              <td style="background:linear-gradient(135deg,#2e7d32,#43a047);padding:18px 20px;">
                <table width="100%"><tr>
                  <td valign="middle" style="width:56px">
                    <img src="cid:logo_lafarge" width="56" height="56" alt="Lafarge" style="display:block;border-radius:8px;background:rgba(255,255,255,.15)" />
                  </td>
                  <td valign="middle" style="padding-left:12px">
                    <div style="font-size:20px;font-weight:800;color:#fff;letter-spacing:.3px">Bienvenue</div>
                    <div style="font-size:13px;color:#eaffea;opacity:.9">Accès au portail — {role.capitalize()}</div>
                  </td>
                </tr></table>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 24px">
                <p style="margin:0 0 12px 0;font-size:16px">Bonjour <strong>{prenom} {nom}</strong>,</p>
                <p style="margin:0 0 16px 0;color:#334155">Votre compte <strong>{role}</strong> est prêt. Voici vos identifiants:</p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #d7ead9;border-radius:12px;background:#f8fff9;margin:6px 0 16px 0">
                  <tr>
                    <td style="padding:14px 16px">
                      <div style="font-size:13px;color:#1b5e20;opacity:.85">Nom d'utilisateur</div>
                      <div style="font-size:16px;font-weight:700">{username}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:14px 16px;border-top:1px dashed #d7ead9">
                      <div style="font-size:13px;color:#1b5e20;opacity:.85">Mot de passe temporaire</div>
                      <div style="font-size:16px;font-weight:700;letter-spacing:.4px">{password}</div>
                    </td>
                  </tr>
                </table>

                <div style="padding:12px 14px;border:1px solid #d7ead9;border-radius:12px;background:#ffffff">
                  <div style="font-size:13px;color:#1b5e20;opacity:.85;margin-bottom:6px">Recommandation</div>
                  <div style="font-size:14px;color:#0f172a">Veuillez <strong>changer votre mot de passe</strong> après votre première connexion.</div>
                </div>

                <p style="margin:18px 0 0 0;font-size:12px;color:#64748b">Cet email a été envoyé automatiquement — ne pas répondre.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
 </html>
    """

    try:
      # Prépare email multi-part (texte + HTML)
      msg = EmailMultiAlternatives(
          subject=subject,
          body=text_body,
          from_email=settings.DEFAULT_FROM_EMAIL,
          to=[user_email],
      )

      # Attache le HTML
      msg.attach_alternative(html_body, "text/html")

      # Tente d'attacher le logo (CID) — recherche dans plusieurs emplacements
      try:
          candidates = []
          # 1) Dossier media de l'app: backend/base/media
          app_dir = Path(__file__).resolve().parent
          candidates.append(app_dir / 'media' / 'lafarge-placo-logo.png')
          candidates.append(app_dir / 'media' / 'lafarge.png')
          candidates.append(app_dir / 'media' / 'logo.png')
          # 2) Dossier public du frontend (fallback précédent)
          base_dir = Path(settings.BASE_DIR)  # backend/backend
          repo_root = base_dir.parent  # backend
          candidates.append(repo_root.parent / 'frontend' / 'public' / 'lafarge-placo-logo.png')
          candidates.append(repo_root.parent / 'frontend' / 'public' / 'logo.png')

          logo_file = None
          for p in candidates:
              if p.exists():
                  logo_file = p
                  break

          if logo_file:
              with open(logo_file, 'rb') as f:
                  img = MIMEImage(f.read())
                  img.add_header('Content-ID', '<logo_lafarge>')
                  img.add_header('Content-Disposition', 'inline', filename=logo_file.name)
                  msg.attach(img)
              logger.info(f"Logo attaché depuis: {logo_file}")
          else:
              logger.warning("Logo introuvable dans les emplacements connus (backend/base/media ou frontend/public)")
      except Exception as e:
          logger.warning(f"Impossible d'attacher le logo: {e}")

      msg.send(fail_silently=False)
      logger.info(f"Email HTML envoyé avec succès à {user_email}")
      print(f"✅ Email HTML envoyé avec succès à {user_email}")
      return True
    except Exception as e:
      error_msg = f"Erreur lors de l'envoi de l'email à {user_email}: {str(e)}"
      logger.error(error_msg)
      print(f"❌ {error_msg}")
      return False

def test_email_configuration():
    """
    Fonction pour tester la configuration email
    """
    try:
        send_mail(
            'Test de configuration email',
            'Si vous recevez ce message, la configuration email fonctionne correctement.',
            settings.DEFAULT_FROM_EMAIL,
            [settings.DEFAULT_FROM_EMAIL],
            fail_silently=False,
        )
        print("✅ Configuration email testée avec succès")
        return True
    except Exception as e:
        print(f"❌ Erreur de configuration email: {str(e)}")
        return False
