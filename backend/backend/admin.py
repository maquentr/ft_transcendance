from django.contrib import admin
from .models import UserProfile, ChatMessage, GameSession, GameResult

# enregistrement du UserProfile
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'display_wins', 'display_losses', 'winrate')

    def display_wins(self, obj):
        return sum(1 for game in obj.game_history if game['result'] == GameResult.WIN)
    
    display_wins.short_description = "Wins"

    def display_losses(self, obj):
        return sum(1 for game in obj.game_history if game['result'] == GameResult.LOSS)

    display_losses.short_description = "Losses"

# enregistrement du ChatMessage
@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('author', 'message', 'timestamp')

# enregistrement du GameSession
@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('start_time', 'end_time', 'settings')
