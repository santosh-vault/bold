from django.urls import path
from . import api_views

app_name = 'wardrobe_api'

urlpatterns = [
    path('wardrobe-items/', api_views.WardrobeItemListCreateView.as_view(), name='wardrobe-items'),
    path('wardrobe-items/<int:pk>/', api_views.WardrobeItemDetailView.as_view(), name='wardrobe-item-detail'),
    path('wardrobe-items/<int:pk>/wear/', api_views.IncrementWearCountView.as_view(), name='increment-wear'),
    path('wardrobe-items/<int:pk>/recommendations/', api_views.AIRecommendationsView.as_view(), name='ai-recommendations'),
    path('outfits/', api_views.OutfitListCreateView.as_view(), name='outfits'),
    path('outfits/<int:pk>/', api_views.OutfitDetailView.as_view(), name='outfit-detail'),
    path('analytics/', api_views.AnalyticsView.as_view(), name='analytics'),
]