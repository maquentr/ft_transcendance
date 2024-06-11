from django.urls import include, path

from .consumers import ChatConsumer

# Here, "" is routing to the URL ChatConsumer which
# will handle the chat functionality.
websocket_urlpatterns = [
    path("ws/<str:room_name>/", ChatConsumer.as_asgi()),
]
