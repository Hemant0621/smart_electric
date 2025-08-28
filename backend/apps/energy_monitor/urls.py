from django.urls import path
from . import views

urlpatterns = [
    path("submit/", views.submit_energy_data, name="submit-energy"),
    path("tariff/update/", views.update_tariff_rates, name="update-tariff"),
    path("tariff/", views.get_tariff_rates, name="get-tariff"),
    path("graph_analytics/", views.graph_analytics, name="graph-analytics"),
]
