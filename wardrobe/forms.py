from django import forms
from .models import WardrobeItem, Outfit

class WardrobeItemForm(forms.ModelForm):
    tags = forms.CharField(
        required=False,
        help_text="Enter tags separated by commas",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'e.g., casual, summer, comfortable'
        })
    )

    class Meta:
        model = WardrobeItem
        fields = ['name', 'category', 'color', 'brand', 'price', 'image_url', 'tags']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Blue Denim Jacket'
            }),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'color': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Navy Blue'
            }),
            'brand': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Levi\'s'
            }),
            'price': forms.NumberInput(attrs={
                'class': 'form-control',
                'step': '0.01',
                'placeholder': '0.00'
            }),
            'image_url': forms.URLInput(attrs={
                'class': 'form-control',
                'placeholder': 'https://example.com/image.jpg'
            }),
        }

    def clean_tags(self):
        tags_str = self.cleaned_data.get('tags', '')
        if tags_str:
            tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]
            return tags
        return []

class OutfitForm(forms.ModelForm):
    items = forms.ModelMultipleChoiceField(
        queryset=WardrobeItem.objects.none(),
        widget=forms.CheckboxSelectMultiple,
        required=True,
        help_text="Select items for this outfit"
    )

    class Meta:
        model = Outfit
        fields = ['name', 'occasion', 'season', 'rating', 'items']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Casual Friday'
            }),
            'occasion': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'e.g., Work, Party, Casual'
            }),
            'season': forms.Select(attrs={'class': 'form-select'}),
            'rating': forms.Select(
                choices=[(i, i) for i in range(1, 6)],
                attrs={'class': 'form-select'}
            ),
        }

    def __init__(self, user=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if user:
            self.fields['items'].queryset = WardrobeItem.objects.filter(user=user)

class WardrobeFilterForm(forms.Form):
    CATEGORY_CHOICES = [('', 'All Categories')] + WardrobeItem.CATEGORY_CHOICES
    
    search = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Search your wardrobe...'
        })
    )
    category = forms.ChoiceField(
        choices=CATEGORY_CHOICES,
        required=False,
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    color = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Filter by color'
        })
    )
    brand = forms.CharField(
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Filter by brand'
        })
    )