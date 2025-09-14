from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.decorators import api_view, action
from rest_framework.authentication import BaseAuthentication
from django.contrib.auth.hashers import check_password, make_password
from django.utils import timezone
from django.db import transaction
from datetime import date, timedelta
import secrets
import string

from .models import Technicien, Admin, ConnexUser, ConnexionLog, Formulaire, Equipement, Atelier, Stock
from .email_utils import send_credentials_email
from .serializers import (
    TechnicienSerializer, AdminSerializer, ConnexUserSerializer, ConnexionLogSerializer,
    FormulaireSerializer, StockSerializer, AtelierSerializer, EquipementSerializer
)

# ---------- AUTH LÉGÈRE ----------
class SessionIdAuthentication(BaseAuthentication):
    """
    Attend un header: Authorization: Session <connex_user_id>
    """
    keyword = "session"

    def authenticate(self, request):
        auth = request.META.get("HTTP_AUTHORIZATION")
        if not auth:
            return None
        parts = auth.split()
        if len(parts) != 2 or parts[0].lower() != "session":
            return None
        try:
            uid = int(parts[1])
            user = ConnexUser.objects.get(id=uid)
            # Accroche l'objet ConnexUser sur la requête pour les permissions
            request.connex_user = user
            return (user, None)
        except (ValueError, ConnexUser.DoesNotExist):
            return None

class IsAdminConnex(permissions.BasePermission):
    """
    Autorise uniquement si request.connex_user.role == 'admin'
    """
    def has_permission(self, request, view):
        user = getattr(request, "connex_user", None)
        return bool(user and getattr(user, "role", None) == "admin")


# ---------- TECHNICIENS ----------
class TechnicienViewSet(viewsets.ModelViewSet):
    queryset = Technicien.objects.all()
    serializer_class = TechnicienSerializer
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]  # libre, si tu veux ensuite restreindre, remplace par IsAuthenticated

    def list(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        tech = self.get_object()
        cu = getattr(tech, "connexuser", None)
        if cu:
            cu.delete()
        tech.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------- ADMINS ----------
class AdminViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        admin = self.get_object()
        cu = getattr(admin, "connexuser", None)
        if cu:
            cu.delete()
        admin.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ---------- UTILISATEURS DE CONNEXION (PAGE USERS) ----------
class ConnexUserViewSet(viewsets.ModelViewSet):
    queryset = ConnexUser.objects.all()
    serializer_class = ConnexUserSerializer
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [IsAdminConnex]  #  Admin uniquement (liste, création, suppression, change-password)

    def list(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.admin_id:
            user.admin.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        if user.technicien_id:
            user.technicien.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='change-password')
    def change_password(self, request, pk=None):
        """
        Modifie le mot de passe du compte ciblé (admin only).
        Body: { "password": "nouveauMotDePasse" } (min 6)
        """
        user = self.get_object()
        new_pwd = request.data.get("password")
        if not new_pwd or len(new_pwd) < 6:
            return Response({"error": "Mot de passe invalide (min 6 caractères)."}, status=status.HTTP_400_BAD_REQUEST)
        user.password = make_password(new_pwd)
        user.save(update_fields=["password"])
        return Response({"message": "Mot de passe mis à jour."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reset-password')
    def reset_password(self, request, pk=None):
        """
        Génère un mot de passe aléatoire pour l'utilisateur cible et l'envoie par email.
        Admin uniquement (protégé par IsAdminConnex).
        """
        user = self.get_object()

        # Générer un mot de passe temporaire (8-10 chars alphanum)
        alphabet = string.ascii_letters + string.digits
        new_pwd = ''.join(secrets.choice(alphabet) for _ in range(10))

        user.password = make_password(new_pwd)
        user.save(update_fields=["password"])

        # Déterminer l'email de destination selon le rôle
        email = None
        nom = None
        prenom = None
        if user.role == 'admin' and getattr(user, 'admin', None):
            email = user.admin.email
            nom = getattr(user.admin, 'nom', '') or ''
            prenom = getattr(user.admin, 'prenom', '') or ''
        elif user.role == 'technicien' and getattr(user, 'technicien', None):
            email = user.technicien.email
            nom = getattr(user.technicien, 'nom', '') or ''
            prenom = getattr(user.technicien, 'prenom', '') or ''

        if not email:
            return Response({"error": "Adresse email indisponible pour cet utilisateur."}, status=status.HTTP_400_BAD_REQUEST)

        # Envoyer l'email avec les nouvelles informations
        try:
            send_credentials_email(
                email,
                nom or user.username,
                prenom or '',
                user.username,
                new_pwd,
                user.role,
            )
        except Exception:
            # Même si l'email échoue, le mot de passe est modifié
            return Response({"message": "Mot de passe réinitialisé, mais l'envoi d'email a échoué."}, status=status.HTTP_200_OK)

        return Response({"message": "Mot de passe réinitialisé et envoyé par email."}, status=status.HTTP_200_OK)


# ---------- LOGS CONNEXION ----------
class ConnexionLogViewSet(viewsets.ModelViewSet):
    queryset = ConnexionLog.objects.all()
    serializer_class = ConnexionLogSerializer
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# ---------- FORMULAIRE / STOCK / ATELIER / EQUIPEMENT ----------
class FormulaireViewSet(viewsets.ModelViewSet):
    queryset = Formulaire.objects.select_related("atelier", "equipement").order_by("-date_defaillance", "-id")
    serializer_class = FormulaireSerializer
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]


class AtelierViewSet(viewsets.ModelViewSet):
    queryset = Atelier.objects.all()
    serializer_class = AtelierSerializer
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]


class EquipementViewSet(viewsets.ModelViewSet):
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]


# ---------- LOGIN ----------
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        try:
            connex_user = ConnexUser.objects.get(username=username)
            if not check_password(password, connex_user.password):
                return Response({"error": "Nom d'utilisateur ou mot de passe invalide."}, status=status.HTTP_401_UNAUTHORIZED)

            # On garde le payload tel que tu l’as déjà
            return Response({
                "token": f"session-{connex_user.id}",  # fake token
                "role": connex_user.role,
                "user": {
                    "id": connex_user.id,
                    "username": connex_user.username,
                    "full_name": connex_user.get_full_name(),
                },
            }, status=status.HTTP_200_OK)

        except ConnexUser.DoesNotExist:
            return Response({"error": "Nom d'utilisateur ou mot de passe invalide."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def get_user_stats(request):
    return Response({
        'technicien_count': Technicien.objects.count(),
        'admin_count': Admin.objects.count(),
        'user_count': ConnexUser.objects.count()
    })


@api_view(['GET'])
def anomalies_timeseries(request):
    tf = request.query_params.get('timeframe', 'week')
    today = timezone.now().date()

    def count_day(d):
        return Formulaire.objects.filter(date_defaillance=d).count()

    if tf == 'year':
        labels, data = [], []
        y, m = today.year, today.month
        for i in range(11, -1, -1):
            total_months = (y * 12 + m - 1) - i
            year = total_months // 12
            month = total_months % 12 + 1
            start = date(year, month, 1)
            end = date(year + 1, 1, 1) if month == 12 else date(year, month + 1, 1)
            c = Formulaire.objects.filter(date_defaillance__gte=start, date_defaillance__lt=end).count()
            labels.append(start.strftime("%b %y"))
            data.append(c)
    elif tf == 'month':
        start = today - timedelta(days=29)
        labels, data = [], []
        for i in range(30):
            d = start + timedelta(days=i)
            labels.append(d.strftime("%d/%m"))
            data.append(count_day(d))
    else:
        start = today - timedelta(days=6)
        labels, data = [], []
        for i in range(7):
            d = start + timedelta(days=i)
            labels.append(d.strftime("%a"))
            data.append(count_day(d))

    return Response({"labels": labels, "data": data})


# ---------- changer mon mot de passe ----------
class ChangeMyPasswordView(APIView):
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user = getattr(request, "connex_user", None)
        if not user:
            return Response({"error": "Non authentifié."}, status=status.HTTP_401_UNAUTHORIZED)
        new_pwd = request.data.get("password")
        if not new_pwd or len(new_pwd) < 6:
            return Response({"error": "Mot de passe invalide (min 6 caractères)."}, status=status.HTTP_400_BAD_REQUEST)
        user.password = make_password(new_pwd)
        user.save(update_fields=["password"])
        return Response({"message": "Mot de passe mis à jour."}, status=status.HTTP_200_OK)


# ---------- ME (profil courant) ----------
class MeView(APIView):
    authentication_classes = [SessionIdAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        u = getattr(request, "connex_user", None)
        if not u:
            return Response({"error": "Non authentifié."}, status=status.HTTP_401_UNAUTHORIZED)

        payload = {
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "full_name": u.get_full_name(),
            "created_at": u.created_at,
        }
        # Ajoute les infos détaillées selon le rôle
        if u.role == 'admin' and getattr(u, 'admin', None):
            a = u.admin
            payload.update({
                "details": {
                    "nom": getattr(a, 'nom', ''),
                    "prenom": getattr(a, 'prenom', ''),
                    "email": getattr(a, 'email', ''),
                    "date_naissance": getattr(a, 'date_naissance', None),
                    "date_embauche": getattr(a, 'date_embauche', None),
                    "type": "admin",
                }
            })
        elif u.role == 'technicien' and getattr(u, 'technicien', None):
            t = u.technicien
            payload.update({
                "details": {
                    "nom": getattr(t, 'nom', ''),
                    "prenom": getattr(t, 'prenom', ''),
                    "email": getattr(t, 'email', ''),
                    "date_naissance": getattr(t, 'date_naissance', None),
                    "date_embauche": getattr(t, 'date_embauche', None),
                    "type": "technicien",
                }
            })

        return Response(payload, status=status.HTTP_200_OK)
