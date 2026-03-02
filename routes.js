// routes.js
document.addEventListener('submit', function(e) {
    const form = e.target;
    
    if (form.id === 'dataForm') {
        e.preventDefault(); // STOP l'envoi vers experience.html sans les paramètres

        const formData = new FormData(form);
        const parcours = formData.get('parcours');

        let sujetInitial = "";
        let modeInitial = "";

        // On définit manuellement ce qui doit être ajouté à l'URL
        if (parcours === "DA") {
            sujetInitial = "reseaux";
            modeInitial = "D";
        } else if (parcours === "AD") {
            sujetInitial = "relativite";
            modeInitial = "A";
        } else if (parcours === "BC") {
            sujetInitial = "relativite";
            modeInitial = "B";
        } else if (parcours === "CB") {
            sujetInitial = "reseaux";
            modeInitial = "C";
        }

        // On construit l'URL avec les nouveaux paramètres
        const params = new URLSearchParams(formData);
        params.set('sujet', sujetInitial);
        params.set('mode', modeInitial);

        const nouvelleUrl = "experience.html?" + params.toString();
        
        // Redirection forcée
        window.location.href = nouvelleUrl;
    }
});