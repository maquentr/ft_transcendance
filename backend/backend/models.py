from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import JSONField

class GameResult(models.TextChoices):
    WIN = 'W', 'Win'
    LOSS = 'L', 'Loss'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, default=1)
    display_name = models.CharField(max_length=255, unique=True)
    avatar = models.ImageField(upload_to='avatars/', default='avatars/default.png')
    online = models.BooleanField(default=False)
    ongame = models.BooleanField(default=False)
    is_avatar = models.BooleanField(default=False)
    game_history = JSONField(default=list) # Object dans la liste : {"date": "2024-03-26", "result": "W", "opponent": "username", "game_type": "TypeOfGame"}
    friends = models.ManyToManyField('self', blank=True)
    blocked = models.ManyToManyField('self', blank=True)

    @property
    def total_games_played(self):
        return len(self.game_history)

    @property
    def winrate(self):
        total_games = len(self.game_history)
        wins = sum(1 for game in self.game_history if game['result'] == GameResult.WIN)
        return (wins / total_games * 100) if total_games > 0 else 0

    @property
    def winNumber(self):
        total_games = len(self.game_history)
        wins = sum(1 for game in self.game_history if game['result'] == GameResult.WIN)
        return wins if total_games > 0 else 0

    @property
    def lossNumber(self):
        total_games = len(self.game_history)
        loss = sum(1 for game in self.game_history if game['result'] == GameResult.LOSS)
        return loss if total_games > 0 else 0

    def __str__(self):
        return self.user.username

    @property
    def avatar_url(self):
        if str(self.avatar).startswith('http'):
            return self.avatar
        return f'/media/{self.avatar}'

# creation automatique ou maj du profil utilisateur
def create_or_update_user_profile(sender, instance, created, **kwargs):
    user_profile, created = UserProfile.objects.get_or_create(user=instance)
    if not created:
        # Le profil existe déjà, vous pouvez choisir de mettre à jour certaines informations ici si nécessaire
        user_profile.save()


class ChatMessage(models.Model):
    room_name = models.CharField(max_length=255, null=True, blank=True)
    author = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        null=False,
        related_name="messages",
    )
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.author.username} at {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"
        )


# GameSession ? 
class GameSession(models.Model):
    players = models.ManyToManyField(User, related_name='game_sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    settings = models.JSONField(default=dict) # pour stocker des configuration de jeu personnalisées ??
    
    def __str__(self):
        return f"Session started at {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}"

