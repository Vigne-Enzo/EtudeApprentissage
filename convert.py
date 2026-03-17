import json
import csv
import os

data_folder = 'data/'
participants_file = 'csv/participants.csv'
results_file = 'csv/results.csv'

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
                # On récupère les deux blocs
                part = data.get('participant', {}).copy()
                sond = data.get('sondageConnaissances', {}).copy()
                
                # Suppression de la colonne indésirable
                if 'connaissancesInitiales' in part:
                    del part['connaissancesInitiales']
                
                # Construction de la ligne avec RENOMMAGE explicite
                row_p = {'id': file_id}
                row_p.update(part)
                row_p['connaissancesRelativite'] = sond.get('relativite')
                row_p['connaissancesIA'] = sond.get('ia')
                
                all_participants.append(row_p)

                # --- 2. RÉSULTATS ---
                for resp in data.get('reponses', []):
                    row_r = {'id': file_id}
                    row_r.update(resp)
                    all_results.append(row_r)

    # Sauvegarde des fichiers
    save_csv(participants_file, all_participants)
    save_csv(results_file, all_results)

def save_csv(filename, data_list):
    if not data_list: return
    
    # On détermine les headers à partir de toutes les clés possibles
    # (Sécurité si un JSON a des champs en moins)
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