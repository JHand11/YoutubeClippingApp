from rest_framework import viewsets
from .models import Clip
from .serializers import ClipSerializer

class ClipViewSet(viewsets.ModelViewSet):
    queryset = Clip.objects.all()
    serializer_class = ClipSerializer
