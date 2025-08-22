from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ConnexionLog
from datetime import timedelta

@receiver(post_save, sender=ConnexionLog)
def calculate_duree_connexion(sender, instance, **kwargs):
    if instance.date_deconnexion and instance.heure_deconnexion:
        # Calculer la durée de connexion
        start = timedelta(hours=instance.heure_connexion.hour, minutes=instance.heure_connexion.minute)
        end = timedelta(hours=instance.heure_deconnexion.hour, minutes=instance.heure_deconnexion.minute)
        instance.duree_connexion = end - start
        instance.save()
