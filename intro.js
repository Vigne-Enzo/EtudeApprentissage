document.addEventListener('DOMContentLoaded', function() {
    const dataForm = document.getElementById('dataForm');
    
    if (dataForm) {
        dataForm.addEventListener('submit', function(event) {
            const formData = new FormData(this);
            
            const infos = {
                parcours: formData.get('parcours'),
                age: formData.get('age'),
                genre: formData.get('genre'),
                etudiant: formData.get('etudiant'),
                niveauEtude: formData.get('niveau') || "N/A",
                dureeNonEtudiant: formData.get('duree') || "N/A",
                connaissancesInitiales: [],
                consentement: formData.get('consentement')
            };

            if (typeof TraitementDonnees !== 'undefined') {
                TraitementDonnees.sauvegarderIntro(infos);
            }
        });
    }
});

function toggleStudentFields() {
    const isStudent = document.getElementById('student').checked;
    const isNotStudent = document.getElementById('notStudent').checked;
    
    const blocNiveau = document.getElementById('bloc-niveau');
    const blocDuree = document.getElementById('bloc-duree');
    
    const inputNiveau = document.getElementById('niveau');
    const inputDuree = document.getElementById('duree');

    // Afficher le niveau d'études dès qu'une case est cochée
    if (isStudent || isNotStudent) {
        blocNiveau.classList.remove('d-none');
        inputNiveau.disabled = false;
    }

    // Afficher la durée seulement si "Non" est coché
    if (isNotStudent) {
        blocDuree.classList.remove('d-none');
        inputDuree.disabled = false;
    } else {
        blocDuree.classList.add('d-none');
        inputDuree.disabled = true;
        inputDuree.value = ""; // On vide le champ si l'utilisateur change d'avis
    }
}