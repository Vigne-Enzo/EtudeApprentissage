const TraitementDonnees = {
    STORAGE_KEY: 'donnees_experience',

    sauvegarderIntro: function(infosFormulaire) {
        const session = {
            participant: infosFormulaire,
            reponses: [],
            sondageConnaissances: { relativite: null, ia: null },
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        console.log("Session initialisée dans le navigateur.");
    }
};