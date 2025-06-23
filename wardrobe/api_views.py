from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Sum, Avg
from .models import WardrobeItem, Outfit
from .serializers import WardrobeItemSerializer, OutfitSerializer
from .ai_recommendations import AIRecommendationEngine
import json

class WardrobeItemListCreateView(generics.ListCreateAPIView):
    serializer_class = WardrobeItemSerializer
    
    def get_queryset(self):
        return WardrobeItem.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class WardrobeItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WardrobeItemSerializer
    
    def get_queryset(self):
        return WardrobeItem.objects.filter(user=self.request.user)

class IncrementWearCountView(APIView):
    def post(self, request, pk):
        try:
            item = WardrobeItem.objects.get(pk=pk, user=request.user)
            item.wear_count += 1
            item.save()
            return Response({'success': True, 'new_count': item.wear_count})
        except WardrobeItem.DoesNotExist:
            return Response({'success': False, 'error': 'Item not found'}, 
                          status=status.HTTP_404_NOT_FOUND)

class AIRecommendationsView(APIView):
    def get(self, request, pk):
        try:
            item = WardrobeItem.objects.get(pk=pk, user=request.user)
            user_items = WardrobeItem.objects.filter(user=request.user).exclude(pk=pk)
            
            # Generate AI recommendations
            ai_engine = AIRecommendationEngine()
            recommendations = ai_engine.get_recommendations_for_item(item, user_items)
            
            return Response({
                'item': WardrobeItemSerializer(item).data,
                'recommendations': recommendations
            })
        except WardrobeItem.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

class OutfitListCreateView(generics.ListCreateAPIView):
    serializer_class = OutfitSerializer
    
    def get_queryset(self):
        return Outfit.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class OutfitDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = OutfitSerializer
    
    def get_queryset(self):
        return Outfit.objects.filter(user=self.request.user)

class AnalyticsView(APIView):
    def get(self, request):
        user = request.user
        items = WardrobeItem.objects.filter(user=user)
        outfits = Outfit.objects.filter(user=user)
        
        # Category analysis
        category_data = items.values('category').annotate(
            count=Count('id'),
            total_value=Sum('price'),
            avg_wear=Avg('wear_count')
        ).order_by('-count')
        
        # Color analysis
        color_data = items.values('color').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        # Brand analysis
        brand_data = items.exclude(brand='').values('brand').annotate(
            count=Count('id'),
            total_value=Sum('price')
        ).order_by('-count')[:10]
        
        # Wear patterns
        most_worn = WardrobeItemSerializer(items.order_by('-wear_count')[:10], many=True).data
        least_worn = WardrobeItemSerializer(items.filter(wear_count__lt=3)[:10], many=True).data
        
        # Price analysis
        price_ranges = {
            'under_50': items.filter(price__lt=50).count(),
            '50_to_100': items.filter(price__gte=50, price__lt=100).count(),
            '100_to_200': items.filter(price__gte=100, price__lt=200).count(),
            'over_200': items.filter(price__gte=200).count(),
        }
        
        return Response({
            'total_items': items.count(),
            'total_outfits': outfits.count(),
            'total_value': items.aggregate(Sum('price'))['price__sum'] or 0,
            'avg_wear_count': items.aggregate(Avg('wear_count'))['wear_count__avg'] or 0,
            'category_data': list(category_data),
            'color_data': list(color_data),
            'brand_data': list(brand_data),
            'most_worn': most_worn,
            'least_worn': least_worn,
            'price_ranges': price_ranges,
        })