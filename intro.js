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
                dureeNonEtudiant: formData.get('duree') || "N/A",
                consentement: formData.get('consentement')
            };

            if (typeof TraitementDonnees !== 'undefined') {
                TraitementDonnees.sauvegarderIntro(infos);
            }
        });
    }
});