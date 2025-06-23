from django.urls import path
from . import views

app_name = 'wardrobe'

urlpatterns = [
    path('', views.landing_page, name='landing'),
    path('dashboard/', views.dashboard, name='dashboard'),
    
    # Wardrobe URLs
    path('wardrobe/', views.wardrobe_list, name='wardrobe_list'),
    path('wardrobe/add/', views.wardrobe_add, name='wardrobe_add'),
    path('wardrobe/<int:pk>/edit/', views.wardrobe_edit, name='wardrobe_edit'),
    path('wardrobe/<int:pk>/delete/', views.wardrobe_delete, name='wardrobe_delete'),
    path('wardrobe/<int:pk>/wear/', views.increment_wear_count, name='increment_wear'),
    
    # Outfit URLs
    path('outfits/', views.outfit_list, name='outfit_list'),
    path('outfits/add/', views.outfit_add, name='outfit_add'),
    path('outfits/<int:pk>/', views.outfit_detail, name='outfit_detail'),
    path('outfits/<int:pk>/delete/', views.outfit_delete, name='outfit_delete'),
    
    # Analytics and Recommendations
    path('analytics/', views.analytics, name='analytics'),
    path('recommendations/', views.recommendations, name='recommendations'),
]