import json
from typing import Optional

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.shortcuts import get_object_or_404
from django.utils.timesince import timesince

from .models import ChatMessage, User, UserProfile

# from .templatetags.chatextras import initials


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"
        self.user = self.scope["user"]

        # Join room group
        # await self.get_room()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        # Receive message from WebSocket (front end)
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        author = text_data_json["author"]

        # new_message = await sync_to_async(self.create_message)(author.user, message)
        new_message = await self.create_message(self.room_name, author, message)

        # Send message to group / room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "author": new_message.author.display_name,
                "timestamp": timesince(new_message.timestamp),
            },
        )

    async def chat_message(
        self, event
    ):  # le nom de la fonction doit etre le meme de la ligne 60
        # Send message to WebSocket (front end)
        await self.send(
            text_data=json.dumps(
                {
                    "type": event["type"],
                    "message": event["message"],
                    "author": event["author"],
                    #'initials': event['initials'],
                    "created_at": event["timestamp"],
                }
            )
        )

        """     async def notification_for_game(self, event):
        # Send writing is active to room
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'message': event['message'],
            'author': event['aut'],
            #'initials': event['initials'],
        })) """

    # async def users_update(self, event):
    # Send information to the web socket (front end)
    #    await self.send(text_data=json.dumps({
    #        'type': 'users_update'
    #    }))

    # @sync_to_async
    # def get_room(self):
    #     self.room = Room.objects.get(uuid=self.room_name)

    # @sync_to_async
    # def set_room_closed(self):
    #    self.room = Room.objects.get(uuid=self.room_name)
    #    self.room.status = Room.CLOSED
    #    self.room.save()

    @database_sync_to_async
    def get_user(self, username):
        return get_object_or_404(UserProfile, display_name=username)

    # @database_sync_to_async  # @sysync_to_async
    @database_sync_to_async
    def create_message(
        self, room_name: str, sent_by: str, message: str, *, agent: Optional[int] = None
    ) -> ChatMessage:
        room_name = room_name.lower()
        author = UserProfile.objects.get(display_name=sent_by)
        print(f"author = {author}")
        chat_message = ChatMessage.objects.create(
        message=message, author=author, room_name=room_name
        )
        if agent is not None:
            chat_message.created_by = UserProfile.objects.get(pk=agent)
        chat_message.save()
        # self.room.messages.add(chat_message)
        return chat_message
        print()
