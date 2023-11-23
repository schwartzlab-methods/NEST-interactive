from django.urls import path
from . import views

#URLConf
urlpatterns = [
    path(r'json/<int:edge>/', views.load_json)
]