import json
import csv
import os

data_folder = 'data/'
# Création du dossier csv s'il n'existe pas
os.makedirs('csv', exist_ok=True)
participants_file = 'csv/participants.csv'
results_file = 'csv/results.csv'

def get_illustration_value(parcours, sujet):
    """
    Logique :
    AD ou DA : Relativité = False, Réseaux = True
    BC ou CB : Relativité = True, Réseaux = False
    """
    p = parcours.upper()
    if p in ['AD', 'DA']:
        return True if sujet == 'reseaux' else False
    elif p in ['BC', 'CB']:
        return True if sujet == 'relativite' else False
    return False # Valeur par défaut si parcours inconnu

def process_json_files():
    all_participants = []
    all_results = []

    if not os.path.exists(data_folder):
        print(f"Erreur : Dossier '{data_folder}' absent.")
        return

    for filename in os.listdir(data_folder):
        if filename.endswith('.json'):
            file_path = os.path.join(data_folder, filename)
            file_id = os.path.splitext(filename)[0]

            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # --- 1. PARTICIPANTS ---
                part = data.get('participant', {}).copy()
                parcours_client = part.get('parcours', '')
                sond = data.get('sondageConnaissances', {}).copy()
                
                if 'connaissancesInitiales' in part:
                    del part['connaissancesInitiales']
                
                row_p = {'id': file_id}
                row_p.update(part)
                row_p['connaissancesRelativite'] = sond.get('relativite')
                row_p['connaissancesIA'] = sond.get('ia')
                all_participants.append(row_p)

                # --- 2. RÉSULTATS ---
                for resp in data.get('reponses', []):
                    sujet = resp.get('sujet')
                    
                    # On construit le dictionnaire manuellement pour l'ordre des colonnes
                    row_r = {
                        'id': file_id,
                        'sujet': sujet,
                        'questionId': resp.get('questionId'),
                        'reponseChoisie': resp.get('reponseChoisie'),
                        'illustration': get_illustration_value(parcours_client, sujet), # Nouveau champ
                        'estCorrect': resp.get('estCorrect'),
                        'certitude': resp.get('certitude'),
                        'tempsSecondes': resp.get('tempsSecondes')
                    }
                    all_results.append(row_r)

    save_csv(participants_file, all_participants)
    save_csv(results_file, all_results)

def save_csv(filename, data_list):
    if not data_list: return
    
    headers = []
    for d in data_list:
        for k in d.keys():
            if k not in headers:
                headers.append(k)
                
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data_list)
    print(f"Fichier {filename} généré.")

if __name__ == "__main__":
    process_json_files()