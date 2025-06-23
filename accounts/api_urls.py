from django.urls import path
from . import api_views

app_name = 'accounts_api'

urlpatterns = [
    path('profile/', api_views.ProfileView.as_view(), name='profile'),
    path('register/', api_views.RegisterView.as_view(), name='register'),
    path('login/', api_views.LoginView.as_view(), name='login'),
    path('logout/', api_views.LogoutView.as_view(), name='logout'),
]