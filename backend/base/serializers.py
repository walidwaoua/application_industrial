from rest_framework import serializers
from .models import Technicien, Admin, ConnexUser, ConnexionLog,Formulaire,Stock,Atelier,Equipement
from django.contrib.auth.hashers import make_password


class _BasePersonSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True, required=False, allow_blank=True)
    date_naissance = serializers.DateField(input_formats=["%Y-%m-%d", "%d/%m/%Y"])
    date_embauche = serializers.DateField(required=False, allow_null=True, input_formats=["%Y-%m-%d", "%d/%m/%Y"])

    def create(self, validated_data):
        validated_data.pop("role", None)
        if validated_data.get("date_embauche") in ("",):
            validated_data["date_embauche"] = None
        return super().create(validated_data)


class TechnicienSerializer(_BasePersonSerializer):
    class Meta:
        model = Technicien
        fields = ('id', 'nom', 'prenom', 'email', 'date_naissance', 'date_embauche', 'created_at', 'role')
        read_only_fields = ('id', 'created_at')


class AdminSerializer(_BasePersonSerializer):
    class Meta:
        model = Admin
        fields = ('id', 'nom', 'prenom', 'email', 'date_naissance', 'date_embauche', 'created_at', 'role')
        read_only_fields = ('id', 'created_at')


class ConnexUserSerializer(serializers.ModelSerializer):
    """
    Serializer des comptes de connexion.
    - 'password' est write_only (jamais renvoyé)
    - hash automatique à la création/mise à jour
    - 'full_name' est calculé en lecture (si tu as nom/prénom côté Admin/Technicien)
    """
    full_name = serializers.SerializerMethodField(read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = ConnexUser
        fields = (
            'id', 'username', 'role', 'password', 'full_name',
            'created_at', 'technicien', 'admin'
        )
        read_only_fields = ('id', 'created_at', 'full_name')

    def get_full_name(self, obj):
        try:
            if obj.role == 'admin' and getattr(obj, 'admin', None):
                a = obj.admin
                nom = getattr(a, 'nom', '') or ''
                prenom = getattr(a, 'prenom', '') or ''
                full = f"{nom} {prenom}".strip()
                return full or obj.username
            if obj.role == 'technicien' and getattr(obj, 'technicien', None):
                t = obj.technicien
                nom = getattr(t, 'nom', '') or ''
                prenom = getattr(t, 'prenom', '') or ''
                full = f"{nom} {prenom}".strip()
                return full or obj.username
        except Exception:
            pass
        return obj.username

    def validate(self, attrs):
        role = attrs.get('role', getattr(self.instance, 'role', None))
        technicien = attrs.get('technicien', getattr(self.instance, 'technicien', None))
        admin = attrs.get('admin', getattr(self.instance, 'admin', None))
        if role == 'technicien' and not technicien:
            raise serializers.ValidationError("Le champ 'technicien' est requis pour le rôle 'technicien'.")
        if role == 'admin' and not admin:
            raise serializers.ValidationError("Le champ 'admin' est requis pour le rôle 'admin'.")
        return attrs

    def create(self, validated_data):
        raw_pwd = validated_data.pop('password', None)
        instance = super().create(validated_data)
        if raw_pwd:
            instance.password = make_password(raw_pwd)
            instance.save(update_fields=["password"])
        return instance

    def update(self, instance, validated_data):
        raw_pwd = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if raw_pwd:
            instance.password = make_password(raw_pwd)
            instance.save(update_fields=["password"])
        return instance
    
class ConnexionLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = ConnexionLog
        fields = ('id', 'user', 'username', 'user_full_name', 'date_connexion', 'heure_connexion', 
                 'date_deconnexion', 'heure_deconnexion', 'duree_connexion', 'ip_address', 'user_agent')
        read_only_fields = ('id', 'date_connexion', 'heure_connexion', 'duree_connexion')


class AtelierSerializer(serializers.ModelSerializer):
    # inclure les équipements liés (read-only)
    equipements = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Atelier
        fields = ("id", "nom", "equipements") 

    def get_equipements(self, obj):
        qs = obj.equipements.all().order_by("id")
        return EquipementSerializer(qs, many=True).data


class EquipementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipement
        fields = "__all__"


class FormulaireSerializer(serializers.ModelSerializer):
   
    atelier = serializers.PrimaryKeyRelatedField(queryset=Atelier.objects.all())
    equipement = serializers.PrimaryKeyRelatedField(queryset=Equipement.objects.all())

   
    atelier_details = AtelierSerializer(source="atelier", read_only=True)
    equipement_details = EquipementSerializer(source="equipement", read_only=True)

    class Meta:
        model = Formulaire
        fields = "__all__"
        # Si tu veux n'exposer que certains champs, remplace "__all__"
        # par la liste explicite + 'atelier_details' et 'equipement_details'.

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = '__all__'


