from allauth.socialaccount.providers.oauth2.provider import OAuth2Provider

class FortyTwoProvider(OAuth2Provider):
    id = '42'
    name = '42'
    access_token_url = 'https://api.intra.42.fr/oauth/token'
    authorize_url = 'https://api.intra.42.fr/oauth/authorize'
    profile_url = 'https://api.intra.42.fr/v2/me'

    def extract_uid(self, data):
        return str(data['id'])

    def extract_common_fiels(self, data):
        return dict(username=data['login'], email=data['email'])