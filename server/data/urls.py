from django.urls import path
from . import views

#URLConf
urlpatterns = [
    path(r'numEdges/', views.get_num_edge),
    path(r'vertextTypes/', views.get_vertex_types),
    path(r'json/<int:edge>/', views.load_json),
]