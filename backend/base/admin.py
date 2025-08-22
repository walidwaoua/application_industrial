from django.contrib import admin
from .models import Technicien, Admin, ConnexUser, ConnexionLog


@admin.register(Technicien)
class TechnicienAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'email', 'date_naissance', 'date_embauche', 'created_at')
    list_filter = ('date_embauche', 'created_at')
    search_fields = ('nom', 'prenom', 'email')
    readonly_fields = ('created_at',)


@admin.register(Admin)
class AdminAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'email', 'date_naissance', 'date_embauche', 'created_at')
    list_filter = ('date_embauche', 'created_at')
    search_fields = ('nom', 'prenom', 'email')
    readonly_fields = ('created_at',)


@admin.register(ConnexUser)
class ConnexUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'role', 'get_full_name', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('username', 'technicien__nom', 'admin__nom')
    readonly_fields = ('created_at', 'temp_password')
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Nom complet'


@admin.register(ConnexionLog)
class ConnexionLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_connexion', 'heure_connexion', 'date_deconnexion', 'duree_connexion', 'ip_address')
    list_filter = ('date_connexion', 'user__role')
    search_fields = ('user__username', 'ip_address')
    readonly_fields = ('date_connexion', 'heure_connexion', 'duree_connexion')
    date_hierarchy = 'date_connexion'


# Register your models here.
