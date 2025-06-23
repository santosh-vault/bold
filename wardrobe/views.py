from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q, Count, Sum, Avg
from django.http import JsonResponse
from django.core.paginator import Paginator
from .models import WardrobeItem, Outfit
from .forms import WardrobeItemForm, OutfitForm, WardrobeFilterForm
import json

def landing_page(request):
    """Landing page for non-authenticated users"""
    if request.user.is_authenticated:
        return redirect('wardrobe:dashboard')
    return render(request, 'wardrobe/landing.html')

@login_required
def dashboard(request):
    """Main dashboard with analytics"""
    user = request.user
    
    # Get wardrobe statistics
    wardrobe_items = WardrobeItem.objects.filter(user=user)
    outfits = Outfit.objects.filter(user=user)
    
    stats = {
        'total_items': wardrobe_items.count(),
        'total_value': wardrobe_items.aggregate(Sum('price'))['price__sum'] or 0,
        'total_outfits': outfits.count(),
        'avg_wear_count': wardrobe_items.aggregate(Avg('wear_count'))['wear_count__avg'] or 0,
    }
    
    # Category breakdown
    category_stats = wardrobe_items.values('category').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Most worn items
    most_worn = wardrobe_items.order_by('-wear_count')[:5]
    
    # Least worn items
    least_worn = wardrobe_items.filter(wear_count__lt=3)[:5]
    
    # Recent items
    recent_items = wardrobe_items[:3]
    recent_outfits = outfits[:2]
    
    context = {
        'stats': stats,
        'category_stats': category_stats,
        'most_worn': most_worn,
        'least_worn': least_worn,
        'recent_items': recent_items,
        'recent_outfits': recent_outfits,
    }
    
    return render(request, 'wardrobe/dashboard.html', context)

@login_required
def wardrobe_list(request):
    """List all wardrobe items with filtering"""
    form = WardrobeFilterForm(request.GET)
    items = WardrobeItem.objects.filter(user=request.user)
    
    if form.is_valid():
        search = form.cleaned_data.get('search')
        category = form.cleaned_data.get('category')
        color = form.cleaned_data.get('color')
        brand = form.cleaned_data.get('brand')
        
        if search:
            items = items.filter(
                Q(name__icontains=search) |
                Q(brand__icontains=search) |
                Q(color__icontains=search)
            )
        
        if category:
            items = items.filter(category=category)
        
        if color:
            items = items.filter(color__icontains=color)
        
        if brand:
            items = items.filter(brand__icontains=brand)
    
    # Pagination
    paginator = Paginator(items, 12)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'form': form,
        'page_obj': page_obj,
        'items': page_obj,
    }
    
    return render(request, 'wardrobe/wardrobe_list.html', context)

@login_required
def wardrobe_add(request):
    """Add new wardrobe item"""
    if request.method == 'POST':
        form = WardrobeItemForm(request.POST)
        if form.is_valid():
            item = form.save(commit=False)
            item.user = request.user
            item.save()
            messages.success(request, f'"{item.name}" added to your wardrobe!')
            return redirect('wardrobe:wardrobe_list')
    else:
        form = WardrobeItemForm()
    
    return render(request, 'wardrobe/wardrobe_form.html', {
        'form': form,
        'title': 'Add New Item'
    })

@login_required
def wardrobe_edit(request, pk):
    """Edit wardrobe item"""
    item = get_object_or_404(WardrobeItem, pk=pk, user=request.user)
    
    if request.method == 'POST':
        form = WardrobeItemForm(request.POST, instance=item)
        if form.is_valid():
            form.save()
            messages.success(request, f'"{item.name}" updated successfully!')
            return redirect('wardrobe:wardrobe_list')
    else:
        # Pre-populate tags field
        initial_data = {}
        if item.tags:
            initial_data['tags'] = ', '.join(item.tags)
        form = WardrobeItemForm(instance=item, initial=initial_data)
    
    return render(request, 'wardrobe/wardrobe_form.html', {
        'form': form,
        'title': f'Edit {item.name}',
        'item': item
    })

@login_required
def wardrobe_delete(request, pk):
    """Delete wardrobe item"""
    item = get_object_or_404(WardrobeItem, pk=pk, user=request.user)
    
    if request.method == 'POST':
        item_name = item.name
        item.delete()
        messages.success(request, f'"{item_name}" removed from your wardrobe.')
        return redirect('wardrobe:wardrobe_list')
    
    return render(request, 'wardrobe/wardrobe_confirm_delete.html', {'item': item})

@login_required
def outfit_list(request):
    """List all outfits"""
    outfits = Outfit.objects.filter(user=request.user).prefetch_related('items')
    
    # Pagination
    paginator = Paginator(outfits, 9)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'wardrobe/outfit_list.html', {
        'page_obj': page_obj,
        'outfits': page_obj,
    })

@login_required
def outfit_add(request):
    """Add new outfit"""
    if request.method == 'POST':
        form = OutfitForm(user=request.user, data=request.POST)
        if form.is_valid():
            outfit = form.save(commit=False)
            outfit.user = request.user
            outfit.save()
            form.save_m2m()  # Save many-to-many relationships
            messages.success(request, f'Outfit "{outfit.name}" created successfully!')
            return redirect('wardrobe:outfit_list')
    else:
        form = OutfitForm(user=request.user)
    
    return render(request, 'wardrobe/outfit_form.html', {
        'form': form,
        'title': 'Create New Outfit'
    })

@login_required
def outfit_detail(request, pk):
    """View outfit details"""
    outfit = get_object_or_404(Outfit, pk=pk, user=request.user)
    return render(request, 'wardrobe/outfit_detail.html', {'outfit': outfit})

@login_required
def outfit_delete(request, pk):
    """Delete outfit"""
    outfit = get_object_or_404(Outfit, pk=pk, user=request.user)
    
    if request.method == 'POST':
        outfit_name = outfit.name
        outfit.delete()
        messages.success(request, f'Outfit "{outfit_name}" deleted successfully.')
        return redirect('wardrobe:outfit_list')
    
    return render(request, 'wardrobe/outfit_confirm_delete.html', {'outfit': outfit})

@login_required
def increment_wear_count(request, pk):
    """Increment wear count for an item (AJAX)"""
    if request.method == 'POST':
        item = get_object_or_404(WardrobeItem, pk=pk, user=request.user)
        item.wear_count += 1
        item.save()
        return JsonResponse({'success': True, 'new_count': item.wear_count})
    
    return JsonResponse({'success': False})

@login_required
def analytics(request):
    """Advanced analytics page"""
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
    most_worn = items.order_by('-wear_count')[:10]
    least_worn = items.filter(wear_count__lt=3)
    
    # Price analysis
    price_ranges = {
        'under_50': items.filter(price__lt=50).count(),
        '50_to_100': items.filter(price__gte=50, price__lt=100).count(),
        '100_to_200': items.filter(price__gte=100, price__lt=200).count(),
        'over_200': items.filter(price__gte=200).count(),
    }
    
    context = {
        'category_data': category_data,
        'color_data': color_data,
        'brand_data': brand_data,
        'most_worn': most_worn,
        'least_worn': least_worn,
        'price_ranges': price_ranges,
        'total_items': items.count(),
        'total_outfits': outfits.count(),
    }
    
    return render(request, 'wardrobe/analytics.html', context)

@login_required
def recommendations(request):
    """AI-style recommendations page"""
    user = request.user
    items = WardrobeItem.objects.filter(user=user)
    
    # Simple recommendation logic
    recommendations = []
    
    # Suggest items to wear more
    underused_items = items.filter(wear_count__lt=3)[:5]
    if underused_items:
        recommendations.append({
            'title': 'Items to Wear More',
            'description': 'These items in your wardrobe could use more love!',
            'items': underused_items,
            'type': 'wear_more'
        })
    
    # Suggest category gaps
    user_categories = set(items.values_list('category', flat=True))
    all_categories = set(dict(WardrobeItem.CATEGORY_CHOICES).keys())
    missing_categories = all_categories - user_categories
    
    if missing_categories:
        recommendations.append({
            'title': 'Complete Your Wardrobe',
            'description': f'Consider adding {", ".join(missing_categories)} to your collection.',
            'categories': missing_categories,
            'type': 'category_gap'
        })
    
    # Color diversity suggestion
    user_colors = items.values_list('color', flat=True).distinct()
    if len(user_colors) < 5:
        recommendations.append({
            'title': 'Add Color Variety',
            'description': 'Adding more colors could increase your outfit possibilities.',
            'type': 'color_variety'
        })
    
    context = {
        'recommendations': recommendations,
        'total_items': items.count(),
    }
    
    return render(request, 'wardrobe/recommendations.html', context)