from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets, permissions
from .models import Technicien, Admin, ConnexUser, ConnexionLog,Formulaire,Equipement,Atelier,Stock
from .serializers import TechnicienSerializer, AdminSerializer, ConnexUserSerializer, ConnexionLogSerializer ,FormulaireSerializer, StockSerializer, AtelierSerializer, EquipementSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status


class TechnicienViewSet(viewsets.ModelViewSet):
    queryset = Technicien.objects.all()
    serializer_class = TechnicienSerializer
    permission_classes = [permissions.AllowAny]  # Allow all methods without authentication

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    def update(self, request, *args, **kwargs):
        Technicien = self.get_object()
        serializer = self.get_serializer(Technicien, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        instance = self.get_object()
        instance.delete()
        return Response(status=204)


class AdminViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [permissions.AllowAny]  # Allow all methods without authentication

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    def update(self, request, *args, **kwargs):
        Technicien = self.get_object()
        serializer = self.get_serializer(Technicien, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
       Technicien=self.queryset.get(pk=pk) 
       Technicien.delete()
       return Response(status=204)

class ConnexUserViewSet(viewsets.ModelViewSet):
    queryset = ConnexUser.objects.all()
    serializer_class = ConnexUserSerializer
    permission_classes = [permissions.AllowAny]  # Allow all methods without authentication

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        ConnexUser = self.get_object()
        serializer = self.get_serializer(ConnexUser, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        ConnexUser = self.queryset.get(pk=pk)
        ConnexUser.delete()
        return Response(status=204)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({"error": "New passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)

class ConnexionLogViewSet(viewsets.ModelViewSet):
    queryset = ConnexionLog.objects.all()
    serializer_class = ConnexionLogSerializer
    permission_classes = [permissions.AllowAny]  # Allow all methods without authentication

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        ConnexionLog = self.get_object()
        serializer = self.get_serializer(ConnexionLog, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        ConnexionLog = self.queryset.get(pk=pk)
        ConnexionLog.delete()
        return Response(status=204)

class FormulaireViewSet(viewsets.ModelViewSet):
    queryset = Formulaire.objects.all()
    serializer_class = FormulaireSerializer
    permission_classes = [permissions.AllowAny]  # Allow all methods without authentication

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        Formulaire = self.get_object()
        serializer = self.get_serializer(Formulaire, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        Formulaire = self.queryset.get(pk=pk)
        Formulaire.delete()
        return Response(status=204)
    

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all()
    serializer_class = StockSerializer
    permission_classes = [permissions.AllowAny]  # Allow all methods without authentication

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        Stock = self.get_object()
        serializer = self.get_serializer(Stock, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        Stock = self.queryset.get(pk=pk)
        Stock.delete()
        return Response(status=204)
    

class AtelierViewSet(viewsets.ModelViewSet):
    queryset = Atelier.objects.all()
    serializer_class = AtelierSerializer
    permission_classes = [permissions.AllowAny]  # Allow all methods without authentication

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        Atelier = self.get_object()
        serializer = self.get_serializer(Atelier, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        Atelier = self.queryset.get(pk=pk)
        Atelier.delete()
        return Response(status=204)
    

class EquipementViewSet(viewsets.ModelViewSet):
    queryset = Equipement.objects.all()
    serializer_class = EquipementSerializer
    permission_classes = [permissions.AllowAny]  # Allow all methods without authentication

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def update(self, request, *args, **kwargs):
        Equipement = self.get_object()
        serializer = self.get_serializer(Equipement, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def destroy(self, request, pk=None):
        Equipement = self.queryset.get(pk=pk)
        Equipement.delete()
        return Response(status=204)
