from django.urls import path, include
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response


def api_root(request):
    """API root endpoint"""
    return JsonResponse({
        "message": "Energy Monitoring API",
        "version": "1.0",
        "endpoints": {
            "api_root": "/api/",
            "energy_monitor": "/api/energy/",
            "health": "/health/",
        }
    })


def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        "status": "healthy",
        "message": "Energy Monitoring Backend is running"
    })


urlpatterns = [
    path("api/", api_root, name="api-root"),
    path("api/energy/", include("apps.energy_monitor.urls")),
    path("health/", health_check, name="health-check"),
]
