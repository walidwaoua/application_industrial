from rest_framework import serializers
from .models import Technicien, Admin, ConnexUser, ConnexionLog,Formulaire,Stock,Atelier,Equipement


class TechnicienSerializer(serializers.ModelSerializer):
    class Meta:
        model = Technicien
        fields = ('id', 'nom', 'prenom', 'email', 'date_naissance', 'date_embauche', 'created_at')
        read_only_fields = ('id', 'created_at')


class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ('id', 'nom', 'prenom', 'email', 'date_naissance', 'date_embauche', 'created_at')
        read_only_fields = ('id', 'created_at')


class ConnexUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    def validate(self, data):
        role = data.get('role')
        technicien = data.get('technicien')
        admin = data.get('admin')

        if role == 'technicien' and not technicien:
            raise serializers.ValidationError("Le champ 'technicien' est requis pour le rôle 'technicien'.")
        if role == 'admin' and not admin:
            raise serializers.ValidationError("Le champ 'admin' est requis pour le rôle 'admin'.")

        return data

    class Meta:
        model = ConnexUser
        fields = ('id', 'username', 'role', 'full_name', 'password', 'created_at', 'technicien', 'admin')
        read_only_fields = ('id', 'created_at')


class ConnexionLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ConnexionLog
        fields = ('id', 'user', 'username', 'user_full_name', 'date_connexion', 'heure_connexion', 
                 'date_deconnexion', 'heure_deconnexion', 'duree_connexion', 'ip_address', 'user_agent')
        read_only_fields = ('id', 'date_connexion', 'heure_connexion', 'duree_connexion')


class FormulaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Formulaire
        fields = '__all__'


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = '__all__'


class AtelierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atelier
        fields = '__all__'


class EquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = '__all__'


