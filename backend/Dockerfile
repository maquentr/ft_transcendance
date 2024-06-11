# Utiliser l'image officielle de Python 3.12.2 comme base
FROM python:3.12.2

# Définir une variable d'environnement pour que la sortie Python soit envoyée directement au terminal sans être mise en tampon
ENV PYTHONUNBUFFERED=1

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires
COPY requirements.txt .
COPY . /app

# Exposer les ports 8443 pour HTTPS et 8000 pour Daphne
EXPOSE 8443 8000

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y postgresql-client

# Copier les certificats
COPY localhost.crt /app/localhost.crt
COPY localhost.key /app/localhost.key

# Collecter les fichiers statiques
RUN python manage.py collectstatic --noinput

# Définir la commande par défaut pour exécuter l'application Django en mode HTTPS avec Gunicorn et Daphne
CMD ["sh", "-c", "daphne -b 0.0.0.0 -p 8000 backend.asgi:application & gunicorn backend.wsgi:application --bind 0.0.0.0:8443 --certfile=/app/localhost.crt --keyfile=/app/localhost.key"]

