from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TechnicienViewSet, AdminViewSet,ConnexUserViewSet,FormulaireViewSet, StockViewSet, AtelierViewSet, EquipementViewSet, LoginView, get_user_stats, anomalies_timeseries, ChangeMyPasswordView, MeView

router = DefaultRouter()
router.register('techniciens', TechnicienViewSet,basename='technicien')
router.register('admins', AdminViewSet,basename='admin')
router.register('connexusers', ConnexUserViewSet, basename='connexuser')
router.register('formulaires', FormulaireViewSet, basename='formulaire')
router.register('stocks', StockViewSet, basename='stock')
router.register('ateliers', AtelierViewSet, basename='atelier')
router.register('equipements', EquipementViewSet, basename='equipement')


urlpatterns = router.urls

urlpatterns += [
    path('login/', LoginView.as_view(), name='login'),
    path('stats/', get_user_stats, name='user-stats'),
    path('api/anomalies/', anomalies_timeseries, name='anomalies-timeseries'),
    path('me/change-password/', ChangeMyPasswordView.as_view(), name='me-change-password'),
    path('me/', MeView.as_view(), name='me'),
]
