from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import UserProfile
from django.core.exceptions import ValidationError
from django.db import transaction

class SignUpForm(UserCreationForm):
    display_name = forms.CharField(max_length=255, help_text='Required. Add a display name.')
    avatar = forms.ImageField(required=False, help_text='Optional. Upload an avatar')

    class Meta:
        model = User
        fields = ('username', 'display_name', 'avatar', 'password1', 'password2', )

    def clean_display_name(self):
        display_name = self.cleaned_data.get('display_name')
        if not display_name:
            raise ValidationError("Ce champs est requis.")
        return display_name

    @transaction.atomic
    def save(self, commit=True):
        user = super().save(commit=False)
        display_name = self.cleaned_data.get('display_name')
        print(f"Saving display name: {display_name}")  # Debug message
        if commit:
            user.save()
            if display_name:
                user_profile, created = UserProfile.objects.get_or_create(user=user, defaults={'display_name': display_name})
                if 'avatar' in self.cleaned_data and self.cleaned_data['avatar']:
                    user_profile.avatar = self.cleaned_data['avatar']
                    user_profile.is_avatar = True
                user_profile.save()
            return user




class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ('display_name', 'avatar')
    
    def save(self, commit=True):
        user_profile = super().save(commit=False)
        if 'avatar' in self.cleaned_data and self.cleaned_data['avatar']:
            user_profile.is_avatar = True
        if commit:
            user_profile.save()
        return user_profile
