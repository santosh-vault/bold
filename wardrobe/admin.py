from django.contrib import admin
from .models import WardrobeItem, Outfit, OutfitItem

@admin.register(WardrobeItem)
class WardrobeItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'color', 'brand', 'price', 'wear_count', 'user', 'created_at')
    list_filter = ('category', 'color', 'brand', 'created_at')
    search_fields = ('name', 'brand', 'color', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)

class OutfitItemInline(admin.TabularInline):
    model = OutfitItem
    extra = 1

@admin.register(Outfit)
class OutfitAdmin(admin.ModelAdmin):
    list_display = ('name', 'occasion', 'season', 'rating', 'user', 'created_at')
    list_filter = ('occasion', 'season', 'rating', 'created_at')
    search_fields = ('name', 'occasion', 'user__username')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [OutfitItemInline]
    ordering = ('-created_at',)