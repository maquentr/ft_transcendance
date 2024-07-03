DC = docker-compose

up: ## Démarrer l'application
	@$(DC) up --build -d
	@sleep 3
	@$(MAKE) migrate

down: ## Arrêter et supprimer tous les conteneurs
	@$(DC) down

clean: down ## Nettoyer l'application
	@$(DC) rm -v
	@$(DC) down --volumes

re: fclean up ## Reconstruire et démarrer l'application

ref: fresh up ## Gros redémarrage de l'application

fclean:
	@if [ -n "$$(docker ps -aq)" ]; then \
        docker stop $$(docker ps -aq); \
        docker rm $$(docker ps -aq); \
    fi
	@docker system prune -af
	@docker volume rm $$(docker volume ls -q)

fresh: ## Réinitialiser l'environnement Docker à un état complètement propre
	@if [ -n "$$(docker ps -aq)" ]; then \
        echo "Arrêt et suppression de tous les conteneurs..."; \
        docker stop $$(docker ps -aq); \
        docker rm $$(docker ps -aq); \
    fi
	@if [ -n "$$(docker images -q)" ]; then \
        echo "Suppression de toutes les images..."; \
        docker rmi -f $$(docker images -q); \
    fi
	@echo "Suppression de tous les volumes..."
	@docker volume prune -f
	@echo "Suppression de tous les réseaux..."
	@docker network prune -f
	@echo "Suppression de tous les caches de construction..."
	@docker builder prune -af
	@echo "L'environnement Docker est maintenant propre !"

flushdb: ## Nettoyer la base de données Django
	@$(DC) exec backend python manage.py flush --no-input

migrate: ## Appliquer les migrations Django
	@$(DC) exec backend python manage.py migrate

makemigrations: ## Créer les migrations Django
	@$(DC) exec backend python manage.py makemigrations

tail: ## Afficher les journaux des conteneurs en cours d'exécution en mode "suivre"
	@$(DC) logs -f

logs: ## Afficher les journaux de tous les conteneurs
	@$(DC) logs

# Déclarer les cibles fictives
.PHONY: all up down clean fclean re ref fresh tail logs flushdb migrate makemigrations

