import os
from pathlib import Path
from dotenv import load_dotenv
import mongoengine
from corsheaders.defaults import default_headers, default_methods

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "dummy-secret-key")
DEBUG = True
ALLOWED_HOSTS = ["*"]

# -------------------------------------------------------------------
# Installed apps: only what's needed
# -------------------------------------------------------------------
INSTALLED_APPS = [
    'rest_framework',
    'corsheaders',
    'apps.energy_monitor',
]


# -------------------------------------------------------------------
# Middleware: stripped down (no sessions/auth/messages)
# -------------------------------------------------------------------
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = "monitoring_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
            ],
        },
    },
]

WSGI_APPLICATION = "monitoring_backend.wsgi.application"

# -------------------------------------------------------------------
# Database: MongoDB only
# -------------------------------------------------------------------
MONGO_URI = os.getenv("MONGO_URI")

mongoengine.connect(host=MONGO_URI)

# -------------------------------------------------------------------
# Password validation (not needed, but Django complains if empty)
# -------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = []

# -------------------------------------------------------------------
# Internationalization
# -------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# -------------------------------------------------------------------
# Static files
# -------------------------------------------------------------------
STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# -------------------------------------------------------------------
# Django REST Framework
# -------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [],  # disable auth
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # allow all requests
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
}

CORS_ALLOW_ALL_ORIGINS = True  # (keep this for now while testing)

# Allow common headers like Content-Type, Authorization etc.
CORS_ALLOW_HEADERS = list(default_headers) + [
    "Content-Type",
    "Authorization",
]

# Allow sending cookies/credentials (optional)
CORS_ALLOW_CREDENTIALS = True

# Allow all methods (GET, POST, PUT, DELETE, OPTIONS)
CORS_ALLOW_METHODS = list(default_methods)