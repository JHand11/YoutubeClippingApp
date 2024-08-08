from django.db import models

class Clip(models.Model):
    title = models.CharField(max_length=255)
    keyword = models.CharField(max_length=255)
    timestamp = models.IntegerField()
    link = models.URLField()

    def __str__(self):
        return f"{self.title} - {self.keyword} at {self.timestamp}s"
