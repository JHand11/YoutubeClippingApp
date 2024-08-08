from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClipViewSet

router = DefaultRouter()
router.register(r'clips', ClipViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
