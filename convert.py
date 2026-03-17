import json
import csv
import os

# Chemins des dossiers et fichiers
data_folder = 'data/'
participants_file = 'csv/participants.csv'
results_file = 'csv/results.csv'

def process_json_files():
    all_participants = []
    all_results = []

    # Vérifier si le dossier existe
    if not os.path.exists(data_folder):
        print(f"Erreur : Le dossier '{data_folder}' est introuvable.")
        return

    # Parcourir tous les fichiers du dossier
    for filename in os.listdir(data_folder):
        if filename.endswith('.json'):
            file_path = os.path.join(data_folder, filename)
            file_id = os.path.splitext(filename)[0] # Nom du fichier sans .json

            with open(file_path, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                    
                    # 1. Extraction des données Participant & Sondage
                    participant_info = data.get('participant', {})
                    sondage_info = data.get('sondageConnaissances', {})
                    
                    # On fusionne les dictionnaires et on ajoute l'ID
                    participant_row = {'id': file_id, **participant_info, **sondage_info}
                    all_participants.append(participant_row)

                    # 2. Extraction des Réponses
                    responses = data.get('reponses', [])
                    for resp in responses:
                        result_row = {'id': file_id, **resp}
                        all_results.append(result_row)
                        
                except Exception as e:
                    print(f"Erreur lors de la lecture de {filename}: {e}")

    # --- Écriture des fichiers CSV ---

    if all_participants:
        save_to_csv(participants_file, all_participants)
        print(f"Succès : '{participants_file}' généré.")

    if all_results:
        save_to_csv(results_file, all_results)
        print(f"Succès : '{results_file}' généré.")

def save_to_csv(filename, data_list):
    # Récupérer tous les noms de colonnes possibles (clés des dicts)
    keys = data_list[0].keys()
    with open(filename, 'w', newline='', encoding='utf-8') as output_file:
        dict_writer = csv.DictWriter(output_file, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(data_list)

if __name__ == "__main__":
    process_json_files()