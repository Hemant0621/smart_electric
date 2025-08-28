from django.apps import AppConfig

class EnergyMonitorConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.energy_monitor'
    verbose_name = 'Energy Monitor'
    
    def ready(self):
        """Import signal handlers when app is ready"""
        try:
            import apps.energy_monitor.signals  # noqa
            import mongoengine
            import os
            MONGO_URI = os.getenv("MONGO_URI")
            mongoengine.connect(host=MONGO_URI)
        except ImportError:
            pass
