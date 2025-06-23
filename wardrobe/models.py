from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class WardrobeItem(models.Model):
    CATEGORY_CHOICES = [
        ('Tops', 'Tops'),
        ('Bottoms', 'Bottoms'),
        ('Outerwear', 'Outerwear'),
        ('Shoes', 'Shoes'),
        ('Accessories', 'Accessories'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wardrobe_items')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    color = models.CharField(max_length=50)
    brand = models.CharField(max_length=50, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    image_url = models.URLField()
    tags = models.JSONField(default=list, blank=True)
    wear_count = models.PositiveIntegerField(default=0)
    last_worn = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.category})"

    def get_tags_display(self):
        return ', '.join(self.tags) if self.tags else ''

class Outfit(models.Model):
    SEASON_CHOICES = [
        ('All seasons', 'All seasons'),
        ('Spring', 'Spring'),
        ('Summer', 'Summer'),
        ('Fall', 'Fall'),
        ('Winter', 'Winter'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='outfits')
    name = models.CharField(max_length=100)
    occasion = models.CharField(max_length=50)
    season = models.CharField(max_length=20, choices=SEASON_CHOICES, default='All seasons')
    rating = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    items = models.ManyToManyField(WardrobeItem, through='OutfitItem')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def get_rating_stars(self):
        if self.rating:
            return '★' * self.rating + '☆' * (5 - self.rating)
        return ''

class OutfitItem(models.Model):
    outfit = models.ForeignKey(Outfit, on_delete=models.CASCADE)
    wardrobe_item = models.ForeignKey(WardrobeItem, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('outfit', 'wardrobe_item')

    def __str__(self):
        return f"{self.outfit.name} - {self.wardrobe_item.name}"