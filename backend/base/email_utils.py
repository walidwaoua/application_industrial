from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_credentials_email(user_email, nom, prenom, username, password, role):
    """
    Fonction utilitaire pour envoyer les identifiants par email
    """
    subject = f"Vos identifiants de connexion - Système de Gestion ({role.capitalize()})"
    
    message = f"""
Bonjour {prenom} {nom},

Votre compte {role} a été créé avec succès. Voici vos identifiants de connexion :

Nom d'utilisateur : {username}
Mot de passe temporaire : {password}

IMPORTANT : Pour des raisons de sécurité, nous vous recommandons fortement de changer votre mot de passe lors de votre première connexion.

Informations de votre compte :
- Nom : {nom}
- Prénom : {prenom}
- Email : {user_email}


{"En tant qu'administrateur, vous avez accès à toutes les fonctionnalités du système." if role == 'admin' else "Vous pouvez maintenant accéder au système avec vos identifiants."}

Cordialement,
L'équipe de gestion système

---
Ce message a été généré automatiquement. Veuillez ne pas répondre à cet email.
    """
    
    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )
        logger.info(f"Email envoyé avec succès à {user_email}")
        print(f"✅ Email envoyé avec succès à {user_email}")
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
