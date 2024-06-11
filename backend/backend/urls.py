"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from .views import game1v1, verify_user, callback_1v1classic_online, callback_1v1classic, callback_1v1custom, callback_2v2classic, callback_2v2custom, callback_4classic, callback_4custom, callback_tournament, add_friend, block_user, start_auth, callback, CustomLoginView, get_messages, list_users, signup_view, tournament_view, profile_update_view, home_view, chat_view, profile_view, profilefriend_view, game_view, otp_view, custom_logout_view
from django.conf.urls import handler404, handler500

from . import views

from django.contrib.auth.views import LogoutView
from django.conf import settings
from django.conf.urls.static import static
from .views import chat_with_user

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

handler404 = 'backend.views.custom_404'
handler500 = 'backend.views.custom_500'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('signup/', signup_view, name='signup'),
    path(
        "api/chat/get-messages/<str:chat_room_id>/",
        get_messages,
        name="get-messages",
    ),

    path('tournament/callback-tournament', callback_tournament, name='callback_tournament'),
    path('verify-user/', verify_user, name='verify_user'),

    path('game/callback-1v1classic', callback_1v1classic, name='callback_1v1classic'),
    path('game1v1/callback-1v1classic-online', callback_1v1classic_online, name='callback_1v1classic_online'),

    path('game/callback-1v1custom', callback_1v1custom, name='callback_1v1custom'),
    path('game/callback-2v2classic', callback_2v2classic, name='callback_2v2classic'),
    path('game/callback-2v2custom', callback_2v2custom, name='callback_2v2custom'),
    path('game/callback-4classic', callback_4classic, name='callback_4classic'),
    path('game/callback-4custom', callback_4custom, name='callback_4custom'),

    path("chat/", chat_view, name="chat"),
    path('profile/update/', profile_update_view, name='profile_update'),
    path('login/', CustomLoginView.as_view(), name='login'),
    path('otp/', otp_view, name='otp'),
    path('logout/', custom_logout_view, name='logout'),
    path('', home_view, name='home'),
    path('game/', game_view, name='game'),

    path('game1v1/', game1v1, name='game1v1'),

    path('tournament/', tournament_view, name='tournament'),
    path('profile/', profile_view, name='profile'),
    path('friend/', profilefriend_view, name='profile_friend'),
    path('users/', list_users, name='list_users'),
    path('chat/<int:user_id>/', chat_with_user, name='chat_with_user'),
    path('start-oauth/', start_auth, name='start_auth'),
    path('call-back/', callback, name='callback'),
    path('add_friend/', add_friend, name='add_friend'),
    path('block_user', block_user, name='block_user'),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)