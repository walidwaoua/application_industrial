from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TechnicienViewSet, AdminViewSet,ConnexUserViewSet,FormulaireViewSet, StockViewSet, AtelierViewSet, EquipementViewSet
from django.http import JsonResponse

router = DefaultRouter()
router.register('techniciens', TechnicienViewSet,basename='technicien')
router.register('admins', AdminViewSet,basename='admin')
router.register('connexusers', ConnexUserViewSet, basename='connexuser')
router.register('formulaires', FormulaireViewSet, basename='formulaire')
router.register('stocks', StockViewSet, basename='stock')
router.register('ateliers', AtelierViewSet, basename='atelier')
router.register('equipements', EquipementViewSet, basename='equipement')


urlpatterns = router.urls
