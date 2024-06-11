from django.http import JsonResponse, HttpResponseBadRequest
from django.core import serializers
from django.shortcuts import render, redirect, get_object_or_404
from .forms import SignUpForm
from django.contrib.auth.decorators import login_required
from .forms import UserProfileForm
from .models import ChatMessage, UserProfile, GameResult
from django.contrib.auth.views import LoginView
from django.contrib.auth import logout, login, authenticate
from .utils import send_otp
from datetime import datetime
import pyotp
import os
from django.http import JsonResponse, HttpResponseBadRequest
from requests_oauthlib import OAuth2Session
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse
import requests
from django.conf import settings
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages


def custom_404(request, exception):
    return render(request, '404.html', status=404)

def custom_500(request):
    return render(request, '404.html', status=500)

@login_required
def game1v1(request):
    user_profile = request.user.userprofile
    user_profile.ongame = True
    user_profile.save()

    player1_display = request.GET.get('player1')
    player2_display = request.GET.get('player2')

    if player1_display and player2_display:
        player2_user = get_object_or_404(UserProfile, display_name=player2_display)
        player2_user.ongame = True
        player2_user.save()

    return render(request, 'game1v1.html', {
        'user': request.user
    })

@login_required
def tournament_view(request):
    user_profile = request.user.userprofile
    user_profile.ongame = True
    user_profile.save()
    return render(request, 'tournament.html', {
        'user': request.user
    })


@csrf_exempt
def verify_user(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            print(f"Received username: {username}, password: {password}")

            user = authenticate(request, username=username, password=password)

            if user is not None:
                user_profile = user.userprofile
                user_profile.ongame = True
                user_profile.save()
                print(f"User authenticated: {user.username}")
                return JsonResponse({'success': True, 'display_name': user_profile.display_name})
            else:
                print("Authentication failed")
                return JsonResponse({'success': False, 'error': 'Invalid username or password'})
        except Exception as e:
            print(f"Error in verify_user: {e}")
            return JsonResponse({'success': False, 'error': 'Invalid data format'})
    return JsonResponse({'success': False, 'error': 'Invalid request method'})

def custom_logout_view(request):
    #mettre a jour l'etat online de l'utilisateur
    if request.user.is_authenticated:
        user_profile = request.user.userprofile
        user_profile.online = False
        user_profile.ongame = False
        user_profile.save()
    #deconnecter l'utilisateur
    logout(request)
    #redirection vers la page d'acceuil
    return redirect('home')

class CustomLoginView(LoginView):
    template_name = 'login.html'

    def form_valid(self, form):
        # appel de la méthode form_valid originale pour effectuer la connexion
        response = super().form_valid(form)
        user = self.request.user

        # Mettre à jour le statut en ligne de l'utilisateur
        user.userprofile.online = True
        user.userprofile.save()

        return response

@login_required
def chat_view(request):
    all_users = UserProfile.objects.all()
    blocked_users = request.user.userprofile.blocked.all()
    users = all_users.exclude(user=request.user).exclude(id__in=blocked_users)
    return render(
        request, "chat.html", {"users": users}
    )


def get_messages(request, chat_room_id):
    print("hello hello")
    messages = ChatMessage.objects.filter(room_name=chat_room_id)
    json_data = serializers.serialize("json", messages)

    print(json_data)
    return JsonResponse(json_data, safe=False)

from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseBadRequest
from .forms import SignUpForm
from .models import UserProfile

from django.shortcuts import render, redirect
from django.http import HttpResponseBadRequest
from .forms import SignUpForm
from .models import UserProfile

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST, request.FILES)
        if form.is_valid():
            display_name = form.cleaned_data['display_name']
            if UserProfile.objects.filter(display_name=display_name).exists():
                form.add_error('display_name', "This display name is already taken.")
            else:
                user = form.save()
                return redirect('/login/')
        return render(request, 'signup.html', {'form': form})
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})



@login_required
def profile_update_view(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')  # Assurez-vous que l'URL nommée 'profile' est bien définie
    else:
        form = UserProfileForm(instance=profile)

    return render(request, 'profile_update.html', {'form': form})


def home_view(request):
    # logique pour la page d'acceuil ici
    return render(request, 'home.html')

def profile_view(request):
    if request.user.is_authenticated:
        userprofile = request.user.userprofile
        return render(request, 'profile.html', {'user_profile': userprofile})
    else:
        return render(request, 'profile.html')



def game_view(request):
    user_profile = request.user.userprofile
    user_profile.ongame = True
    user_profile.save()
    return render(request, 'game.html')

def list_users(request):
    users = UserProfile.objects.all()
    return render(request, 'users_list.html', {'users': users})


def otp_view(request):
    user_profile = request.user.userprofile  # Assurez-vous que le profil utilisateur est attaché à l'utilisateur
    if request.method == 'POST':
        otp = request.POST['otp']
        otp_secret_key = request.session['otp_secret_key']
        otp_valid_date = request.session['otp_valid_date']

        if otp_secret_key and otp_valid_date is not None:
            valid_until = datetime.fromisoformat(otp_valid_date)
            print(f"Valid until: {valid_until}, Current time: {datetime.now()}")
            print(f"OTP entered: {otp}, OTP expected: {pyotp.TOTP(otp_secret_key, interval=60).now()}")

            if valid_until > datetime.now():
                totp = pyotp.TOTP(otp_secret_key, interval=60)
                if totp.verify(otp):
                    user_profile.online = True
                    user_profile.save()
                    del request.session['otp_secret_key']
                    del request.session['otp_valid_date']
                    return redirect('home')
                else:
                    print("Invalid one time password.")
            else:
                print("One time password has expired.")
        else:
            print("Something went wrong with the OTP logic.")
    return render(request, 'otp.html', {})
    
def chat_with_user(request, user_id):
    # Logique pour la vue chat_with_user ici
    return render(request, 'chat_with_user.html', {'user_id': user_id})

def start_auth(request):
    client_id = os.environ.get('FT_CLIENT_ID')
    redirect_uri = os.environ.get('FT_REDIRECT_URI')
    scope = ['public']
    
    if not client_id or not redirect_uri:
        raise ValueError("Les variables d'environnement FT_CLIENT_ID et FT_REDIRECT_URI doivent être définies.")

    oauth = OAuth2Session(client_id, redirect_uri=redirect_uri, scope=scope)
    authorization_url, state = oauth.authorization_url('https://api.intra.42.fr/oauth/authorize')

    request.session['oauth_state'] = state
    return redirect(authorization_url)

def callback(request):
    code = request.GET.get('code')

    if not code:
        return redirect('login')

    #obtention du token d'acces
    token_response = requests.post(
        'https://api.intra.42.fr/oauth/token',
        data={
            'grant_type': 'authorization_code',
            'client_id': settings.FT_CLIENT_ID,
            'client_secret': settings.FT_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.FT_REDIRECT_URI,
        }
    )
    token_json = token_response.json()
    access_token = token_json.get('access_token')

    if not access_token:
        return redirect('login')

    #utilisation du token d'acces pour obtenir les informations utilisateur
    user_response = requests.get(
        'https://api.intra.42.fr/v2/me',
        headers={
            'Authorization': f'Bearer {access_token}',
        }
    )
    user_json = user_response.json()

    #extraction des informations necessaire
    username = user_json.get('login')
    email = user_json.get('email')
    profile_picture = user_json.get('image', {}).get('link')

    if not username or not email or not profile_picture:
        return Response({"statusCode": 401, "detail": "Incomplete user information"})

    #creation et mise a jour de l'utilisateur dans la base de donnees
    user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    if created:
        user.set_unusable_password()
        user.save()

    #creation du UserProfile
    profile, profile_created = UserProfile.objects.get_or_create(user=user, defaults={
        'display_name': username,
        'avatar': profile_picture,
        'online': True,
        'is_avatar': True,
    })
    if not profile_created:
        profile.avatar = profile_picture
        profile.online = True
        profile.is_avatar = True
        profile.save()

    login(request, user)

    return redirect('home')

@login_required
def profilefriend_view(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        
        # Vérifiez si user_id est vide ou invalide
        if not user_id:
            return HttpResponseBadRequest("User ID is required")
        
        try:
            user_id = int(user_id)
        except ValueError:
            return HttpResponseBadRequest("Invalid User ID")
        
        # Récupérez l'objet UserProfile ou renvoyez une 404 si non trouvé
        friend = get_object_or_404(UserProfile, id=user_id)
        
        context = {
            'friend': friend,
            'friends_list': friend.friends.all(),
            'game_history': friend.game_history,
        }
        return render(request, 'profilfriend.html', context)
    
    return render(request, 'home.html')

@login_required
def add_friend(request):
    if request.method == 'POST':
        display_name = request.POST.get('display_name')
        friend = get_object_or_404(UserProfile, display_name=display_name)
        user_profile = request.user.userprofile

        if friend in user_profile.friends.all():
            message = f'{friend.user.username} est déjà votre ami.'
            message_type = 'warning'
        else:
            if friend in user_profile.blocked.all():
                user_profile.blocked.remove(friend)
            user_profile.friends.add(friend)
            user_profile.save()
            message = f'{friend.user.username} a été ajouté à votre liste d\'amis.'
            message_type = 'success'

        return JsonResponse({'message': message, 'message_type': message_type})

@login_required
def block_user(request):
    if request.method == 'POST':
        display_name = request.POST.get('display_name')
        blocked_user = get_object_or_404(UserProfile, display_name=display_name)
        user_profile = request.user.userprofile

        if blocked_user in user_profile.blocked.all():
            message = f'{blocked_user.user.username} est déjà bloqué.'
            message_type = 'warning'
        else:
            if blocked_user in user_profile.friends.all():
                user_profile.friends.remove(blocked_user)
            user_profile.blocked.add(blocked_user)
            user_profile.save()
            message = f'{blocked_user.user.username} a été bloqué.'
            message_type = 'success'

        return JsonResponse({'message': message, 'message_type': message_type})





@login_required
def callback_1v1classic(request):
    # Récupérer le paramètre 'data' de la requête
    data = request.GET.get('data', '')
    print(f"request data: {data}")  # Debug message


    # Traitez la chaîne de caractères 'data' comme nécessaire
    if data:
        try:
            # Décomposez la chaîne pour obtenir la date et les résultats des utilisateurs
            date_str, player, result = data.split(';')
            print(f"date_str: {date_str}")  # Debug message
            print(f"player is {player}")  # Debug message
            print(f"result: {result}")  # Debug message



            # Déterminez le résultat de l'utilisateur connecté et de l'adversaire
            result = result
            opponent = "Player 2"


            # Récupérez le profil de l'utilisateur connecté
            user_profile = request.user.userprofile

            # Mettez à jour le game_history de l'utilisateur
            game_entry = {
                "date": date_str,
                "result": result,
                "opponent": opponent,
                "type": "classic 1v1 local"
            }

            user_profile.game_history.append(game_entry)
            user_profile.ongame = False
            user_profile.save()

            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée
        except ValueError as e:
            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée en cas d'erreur de format

    return redirect('home')

@login_required
def callback_1v1classic_online(request):
    # Récupérer le paramètre 'data' de la requête
    data = request.GET.get('data', '')
    print(f"request data: {data}")  # Debug message

    # Traitez la chaîne de caractères 'data' comme nécessaire
    if data:
        try:
            # Décomposez la chaîne pour obtenir la date et les résultats des utilisateurs
            date_str, player, result, player1, player2 = data.split(';')
            print(f"date_str: {date_str}")  # Debug message
            print(f"player: {player}")  # Debug message
            print(f"result: {result}")  # Debug message
            print(f"player1: {player1}")  # Debug message
            print(f"player2: {player2}")  # Debug message

            if result == 'W':
                result_player1 = 'W'
                result_player2 = 'L'
            else:
                result_player1 = 'L'
                result_player2 = 'W'


            # Récupérez le profil de l'utilisateur connecté
            user_profile = UserProfile.objects.get(display_name=player1)

            # Mettez à jour le game_history de l'utilisateur connecté
            game_entry_user = {
                "date": date_str,
                "result": result_player1,
                "opponent": player2,
                "type": "classic 1v1 online"
            }
            user_profile.game_history.append(game_entry_user)
            user_profile.ongame = False
            user_profile.save()

            # Récupérez le profil de l'adversaire
            try:
                opponent_profile = UserProfile.objects.get(display_name=player2)
                game_entry_opponent = {
                    "date": date_str,
                    "result": result_player2,
                    "opponent": player1,
                    "type": "classic 1v1 online"
                }
                opponent_profile.game_history.append(game_entry_opponent)
                opponent_profile.ongame = False
                opponent_profile.save()
            except UserProfile.DoesNotExist:
                print(f"UserProfile with display_name {player2} does not exist")  # Debug message

            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée
        except ValueError as e:
            print(f"Error processing data: {e}")  # Debug message
            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée en cas d'erreur de format

    return redirect('home')


@login_required
def callback_1v1custom(request):
    # Récupérer le paramètre 'data' de la requête
    data = request.GET.get('data', '')
    print(f"request data: {data}")  # Debug message


    # Traitez la chaîne de caractères 'data' comme nécessaire
    if data:
        try:
            # Décomposez la chaîne pour obtenir la date et les résultats des utilisateurs
            date_str, player, result = data.split(';')

            # Déterminez le résultat de l'utilisateur connecté et de l'adversaire
            result = result
            opponent = "Player 2"

            # Récupérez le profil de l'utilisateur connecté
            user_profile = request.user.userprofile

            # Mettez à jour le game_history de l'utilisateur
            game_entry = {
                "date": date_str,
                "result": result,
                "opponent": opponent,
                "type": "custom 1v1 local"
            }
            user_profile.game_history.append(game_entry)
            user_profile.ongame = False
            user_profile.save()

            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée
        except ValueError:
            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée en cas d'erreur de format

    return redirect('home')

@login_required
def callback_2v2classic(request):
    # Récupérer le paramètre 'data' de la requête
    data = request.GET.get('data', '')
    print(f"request data: {data}")  # Debug message


    # Traitez la chaîne de caractères 'data' comme nécessaire
    if data:
        try:
            # Décomposez la chaîne pour obtenir la date et les résultats des utilisateurs
            date_str, player, result = data.split(';')

            # Déterminez le résultat de l'utilisateur connecté et de l'adversaire
            result = result
            opponent = "Team"

            # Récupérez le profil de l'utilisateur connecté
            user_profile = request.user.userprofile

            # Mettez à jour le game_history de l'utilisateur
            game_entry = {
                "date": date_str,
                "result": result,
                "opponent": opponent,
                "type": "classic 2v2 local"
            }
            user_profile.game_history.append(game_entry)
            user_profile.ongame = False
            user_profile.save()

            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée
        except ValueError:
            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée en cas d'erreur de format

    return redirect('home')

@login_required
def callback_2v2custom(request):
    # Récupérer le paramètre 'data' de la requête
    data = request.GET.get('data', '')
    print(f"request data: {data}")  # Debug message


     # Traitez la chaîne de caractères 'data' comme nécessaire
    if data:
        try:
            # Décomposez la chaîne pour obtenir la date et les résultats des utilisateurs
            date_str, player, result = data.split(';')

            # Déterminez le résultat de l'utilisateur connecté et de l'adversaire
            result = result
            opponent = "Team"

            # Récupérez le profil de l'utilisateur connecté
            user_profile = request.user.userprofile

            # Mettez à jour le game_history de l'utilisateur
            game_entry = {
                "date": date_str,
                "result": result,
                "opponent": opponent,
                "type": "custom 2v2 local"
            }
            user_profile.game_history.append(game_entry)
            user_profile.ongame = False
            user_profile.save()

            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée
        except ValueError:
            return redirect('home')  # Redirigez vers la page d'accueil ou une autre page appropriée en cas d'erreur de format

    return redirect('home')

@login_required
def callback_4classic(request):
    # Logique de traitement de la chaîne de caractères 'data'
    # ...
    user_profile = request.user.userprofile
    user_profile.ongame = False
    user_profile.save()
    return redirect('home')

@login_required
def callback_4custom(request):
    # Logique de traitement de la chaîne de caractères 'data'
    # ...
    user_profile = request.user.userprofile
    user_profile.ongame = False
    user_profile.save()
    return redirect('home')

@login_required
def callback_tournament(request):
    # Récupérer le paramètre 'data' de la requête
    data = request.GET.get('data', '')
    print(f"request data: {data}")  # Debug message

    # Traitez la chaîne de caractères 'data' comme nécessaire
    if data:
        try:
            # Décomposez la chaîne pour obtenir la date et les résultats des utilisateurs
            parts = data.split(';')
            date_str = parts[0]
            print(f"Parsed date: {date_str}")  # Debug message

            matches = parts[1:]  # Obtenir tous les matchs après la date
            for match in matches:
                try:
                    user_results = match.split('|')
                    user_result1 = user_results[0].split(':')
                    user_result2 = user_results[1].split(':')
                    print(f"Parsed user results: {user_result1}, {user_result2}")  # Debug message

                    for user_result, opponent_result in [(user_result1, user_result2), (user_result2, user_result1)]:
                        try:
                            user = UserProfile.objects.get(display_name=user_result[0])
                            game_entry = {
                                "date": date_str,
                                "result": user_result[1],
                                "opponent": opponent_result[0],
                                "type": "tournoi"
                            }
                            user.game_history.append(game_entry)
                            user.ongame = False
                            user.save()
                            print(f"Updated game history for user: {user.display_name}")  # Debug message
                        except UserProfile.DoesNotExist:
                            print(f"UserProfile with display_name {user_result[0]} does not exist")  # Debug message
                except (ValueError, IndexError) as e:
                    print(f"Error processing match data: {match}, Error: {e}")  # Debug message

        except (ValueError, IndexError) as e:
            print(f"Error processing data: {e}")  # Debug message

    return redirect('home')
