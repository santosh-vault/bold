from rest_framework import serializers
from .models import WardrobeItem, Outfit, OutfitItem

class WardrobeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = WardrobeItem
        fields = ['id', 'name', 'category', 'color', 'brand', 'price', 'image_url', 
                 'tags', 'wear_count', 'last_worn', 'created_at', 'updated_at']
        read_only_fields = ['id', 'wear_count', 'created_at', 'updated_at']

class OutfitItemSerializer(serializers.ModelSerializer):
    wardrobe_item = WardrobeItemSerializer(read_only=True)
    
    class Meta:
        model = OutfitItem
        fields = ['wardrobe_item']

class OutfitSerializer(serializers.ModelSerializer):
    items = WardrobeItemSerializer(many=True, read_only=True)
    item_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Outfit
        fields = ['id', 'name', 'occasion', 'season', 'rating', 'items', 'item_ids',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        item_ids = validated_data.pop('item_ids', [])
        outfit = Outfit.objects.create(**validated_data)
        
        if item_ids:
            wardrobe_items = WardrobeItem.objects.filter(
                id__in=item_ids, 
                user=validated_data['user']
            )
            outfit.items.set(wardrobe_items)
        
        return outfit
    
    def update(self, instance, validated_data):
        item_ids = validated_data.pop('item_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if item_ids is not None:
            wardrobe_items = WardrobeItem.objects.filter(
                id__in=item_ids, 
                user=instance.user
            )
            instance.items.set(wardrobe_items)
        
        return instance