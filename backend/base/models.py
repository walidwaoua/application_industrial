from django.db import models
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from .email_utils import send_credentials_email
import secrets
import string
from datetime import timedelta


class Technicien(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    date_naissance = models.DateField()
    date_embauche = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.nom} {self.prenom}"
    
    def save(self, *args, **kwargs):
        # Sauvegarder d'abord le technicien
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Si c'est un nouveau technicien, créer automatiquement un ConnexUser
        if is_new:
            self.create_connex_user()
    
    def create_connex_user(self):
        # Générer un nom d'utilisateur unique
        username = f"{self.prenom.lower()}.{self.nom.lower()}"
        counter = 1
        original_username = username
        while ConnexUser.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        # Générer un mot de passe temporaire
        password = self.generate_temp_password()
        
        # Créer le ConnexUser
        connex_user = ConnexUser.objects.create(
            username=username,
            password=make_password(password),
            role='technicien',
            technicien=self,
            temp_password=password  # Stocké temporairement pour pouvoir l'afficher
        )
        
        # Envoyer l'email avec les identifiants
        send_credentials_email(
            self.email, 
            self.nom, 
            self.prenom, 
            username, 
            password, 
            'technicien'
        )
        
        return connex_user
    
    def generate_temp_password(self):
        """Génère un mot de passe temporaire de 8 caractères"""
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(8))


class Admin(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    date_naissance = models.DateField()
    date_embauche = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.nom} {self.prenom}"
    
    def save(self, *args, **kwargs):
        # Sauvegarder d'abord l'admin
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Si c'est un nouvel admin, créer automatiquement un ConnexUser
        if is_new:
            self.create_connex_user()
    
    def create_connex_user(self):
        # Générer un nom d'utilisateur unique
        username = f"{self.prenom.lower()}.{self.nom.lower()}"
        counter = 1
        original_username = username
        while ConnexUser.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        
        # Générer un mot de passe temporaire
        password = self.generate_temp_password()
        
        # Créer le ConnexUser
        connex_user = ConnexUser.objects.create(
            username=username,
            password=make_password(password),
            role='admin',
            admin=self,
            temp_password=password  # Stocké temporairement pour pouvoir l'afficher
        )
        
        # Envoyer l'email avec les identifiants
        send_credentials_email(
            self.email, 
            self.nom, 
            self.prenom, 
            username, 
            password, 
            'admin'
        )
        
        return connex_user
    
    def generate_temp_password(self):
        """Génère un mot de passe temporaire de 8 caractères"""
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(8))


class ConnexUser(models.Model):
    ROLE_CHOICES = [
        ('technicien', 'Technicien'),
        ('admin', 'Admin'),
    ]
    
    username = models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    temp_password = models.CharField(max_length=50, blank=True, null=True)  # Mot de passe temporaire
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Relations avec Technicien et Admin
    technicien = models.OneToOneField(Technicien, on_delete=models.CASCADE, null=True, blank=True)
    admin = models.OneToOneField(Admin, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    def get_full_name(self):
        """Retourne le nom complet de l'utilisateur"""
        if self.role == 'technicien' and self.technicien:
            return f"{self.technicien.nom} {self.technicien.prenom}"
        elif self.role == 'admin' and self.admin:
            return f"{self.admin.nom} {self.admin.prenom}"
        return self.username


class ConnexionLog(models.Model):
    user = models.ForeignKey(ConnexUser, on_delete=models.CASCADE, related_name='connexions')
    date_connexion = models.DateTimeField(default=timezone.now)
    heure_connexion = models.TimeField(auto_now_add=True)
    date_deconnexion = models.DateTimeField(null=True, blank=True)
    heure_deconnexion = models.TimeField(null=True, blank=True)
    duree_connexion = models.DurationField(null=True, blank=True)  # Durée automatiquement calculée
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)  # Informations sur le navigateur
    
    def __str__(self):
        return f"{self.user.username} - {self.date_connexion.strftime('%d/%m/%Y %H:%M')}"
    
    def save(self, *args, **kwargs):
        # Calculer la durée si on a une date de déconnexion
        if self.date_deconnexion and self.date_connexion:
            self.duree_connexion = self.date_deconnexion - self.date_connexion
        super().save(*args, **kwargs)
    
    def deconnecter(self):
        """Marque la fin de la connexion"""
        if not self.date_deconnexion:
            now = timezone.now()
            self.date_deconnexion = now
            self.heure_deconnexion = now.time()
            self.duree_connexion = now - self.date_connexion
            self.save()
    
    class Meta:
        ordering = ['-date_connexion']
        verbose_name = "Log de Connexion"
        verbose_name_plural = "Logs de Connexions"


class Atelier(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self):
        return self.nom


# ------------------ EQUIPEMENT ------------------
class Equipement(models.Model):
    nom = models.CharField(max_length=100)
    atelier = models.ForeignKey(Atelier, on_delete=models.CASCADE, related_name='equipements')

    def __str__(self):
        return self.nom
    

class Formulaire(models.Model):
    atelier = models.ForeignKey('Atelier', on_delete=models.CASCADE, related_name='formulaires')
    equipement = models.ForeignKey('Equipement', on_delete=models.CASCADE, related_name='formulaires')
    date_defaillance = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    heuregen = models.DurationField(editable=False, null=True, blank=True)  # Champ calculé
    methode_entretien = models.CharField(max_length=255)
    nature_panne = models.CharField(max_length=255)
    cause_panne = models.CharField(max_length=255)
    indice_gravite = models.CharField(max_length=255)
    piece_rechange = models.TextField()
    travaux_effectues = models.TextField() 
    etat_action_immediate = models.TextField()
    pilote = models.CharField(max_length=255)

    def save(self, *args, **kwargs):
        # Calculer la durée en heures et l'enregistrer dans heuregen
        if self.heure_debut and self.heure_fin:
            start = timedelta(hours=self.heure_debut.hour, minutes=self.heure_debut.minute)
            end = timedelta(hours=self.heure_fin.hour, minutes=self.heure_fin.minute)

            # Si l'heure de fin est inférieure à l'heure de début, ajouter 24 heures à l'heure de fin
            if end < start:
                end += timedelta(days=1)

            self.heuregen = end - start
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Formulaire for {self.atelier} - {self.equipement}"


class Stock(models.Model):
    reference = models.CharField(max_length=255, unique=True)
    element = models.CharField(max_length=255)
    quantite = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.reference} - {self.element} ({self.quantite})"


# Create your models here.


#les models de enregistrements de session de connexion et de deconnexion des utilisateurs (tchenicien ) ne sont pas utiliser 
#et leur views aussi ne sont pas utiliser dans le projet
#ils sont creer juste pour le cas d'une evolution future du projet