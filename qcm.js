/**
 * MODULE INTERNE DE GESTION DES DONNÉES
 */
const TraitementDonnees = {
    STORAGE_KEY: 'donnees_experience',

    ajouterReponseQCM: function (donneeQuestion) {
        let data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return;
        let session = JSON.parse(data);
        session.reponses.push(donneeQuestion);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
        console.log("Réponse Q" + donneeQuestion.questionId + " stockée localement.");
    },

    envoyerToutAuServeur: function (sessionFinale) {
        if (typeof savedata === "function") {
            console.log("Envoi du JSON complet au serveur...");
            savedata(sessionFinale);
        }
    }
};

/**
 * LOGIQUE DU QCM
 */
let questions = [];
let currentIndex = 0;
let selectedOption = null;
let startTime = 0;

const urlParams = new URLSearchParams(window.location.search);
let sujet = urlParams.get('sujet') || 'relativite';
const parcours = urlParams.get('parcours') || 'BC';

async function initQCM() {
    try {
        const fileName = (sujet === 'reseaux') ? './intelligenceArtificielleQCM.json' : './relativiteQCM.json';
        const response = await fetch(fileName);
        const data = await response.json();
        questions = data.questions;
        showQuestion();
    } catch (e) { console.error("Erreur JSON", e); }
}

// FONCTION DE VÉRIFICATION : Bloque le bouton si l'un des deux manque
function verifierValidation() {
    const range = document.getElementById('certitude-range');
    const nextBtn = document.getElementById('next-btn');
    const feedback = document.getElementById('feedback-msg');
    
    // Une certitude est valide seulement si elle est > 0 (l'utilisateur a bougé le curseur)
    const isOptionSelected = selectedOption !== null;
    const isCertitudeSelected = parseInt(range.value) > 0;

    nextBtn.disabled = !(isOptionSelected && isCertitudeSelected);

    if (!isOptionSelected) {
        feedback.innerText = "Sélectionnez une réponse";
    } else if (!isCertitudeSelected) {
        feedback.innerText = "Indiquez votre niveau de certitude";
    } else {
        feedback.innerText = "Vous pouvez continuer";
    }
}

function showQuestion() {
    const q = questions[currentIndex];
    selectedOption = null;
    startTime = performance.now();

    // Reset du slider à chaque question
    const range = document.getElementById('certitude-range');
    range.value = 0; 
    document.getElementById('certitude-val').innerText = "--";
    
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('next-btn').disabled = true;
    document.getElementById('step-indicator').innerHTML = `Question ${currentIndex + 1} <span class="total-steps">/ ${questions.length}</span>`;

    const progress = ((currentIndex + 1) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = progress + "%";

    const list = document.getElementById('options-list');
    list.innerHTML = "";

    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => {
            selectedOption = i;
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            verifierValidation(); 
        };
        list.appendChild(btn);
    });
}

document.getElementById('next-btn').onclick = function () {
    const temps = ((performance.now() - startTime) / 1000).toFixed(2);
    const reponseData = {
        sujet: sujet,
        questionId: questions[currentIndex].id,
        reponseChoisie: selectedOption,
        estCorrect: (selectedOption === questions[currentIndex].reponse),
        certitude: document.getElementById('certitude-range').value,
        tempsSecondes: temps
    };

    TraitementDonnees.ajouterReponseQCM(reponseData);

    currentIndex++;
    if (currentIndex < questions.length) {
        showQuestion(); // Le reset est géré au début de showQuestion()
    } else {
        document.getElementById('qcm-card').classList.add('d-none');
        document.getElementById('result-card').classList.remove('d-none');
        setTimeout(redirectionVersTheme2, 1500);
    }
};

// Gestion de l'input certitude
document.getElementById('certitude-range').oninput = function() {
    if (this.value == 0) {
        document.getElementById('certitude-val').innerText = "--";
    } else {
        document.getElementById('certitude-val').innerText = this.value;
    }
    verifierValidation();
};

function redirectionVersTheme2() {
    const estFinParcours = (sujet === "reseaux" && (parcours === "AD" || parcours === "BC")) ||
        (sujet === "relativite" && (parcours === "DA" || parcours === "CB"));

    if (estFinParcours) {
        document.getElementById('result-card').classList.add('d-none');
        document.getElementById('survey-card').classList.remove('d-none');
        const labels = { 'relativite': 'la Relativité', 'reseaux': 'l\'IA' };
        document.getElementById('survey-text').innerText = `Connaissiez-vous déjà les notions sur ${labels[sujet]} ?`;
    } else {
        let nextSujet = (sujet === "relativite") ? "reseaux" : "relativite";
        let nextMode = (parcours === "AD") ? "D" : (parcours === "BC") ? "C" : (parcours === "DA") ? "A" : "B";
        window.location.href = `experience.html?sujet=${nextSujet}&mode=${nextMode}&parcours=${parcours}`;
    }
}

window.gererSondage = function (reponse) {
    let data = localStorage.getItem(TraitementDonnees.STORAGE_KEY);
    if (!data) return;
    let session = JSON.parse(data);
    const labelReponse = reponse ? "OUI" : "NON";

    if (sujet === "relativite") {
        session.sondageConnaissances.relativite = labelReponse;
    } else {
        session.sondageConnaissances.ia = labelReponse;
    }

    localStorage.setItem(TraitementDonnees.STORAGE_KEY, JSON.stringify(session));

    if (session.sondageConnaissances.relativite === null || session.sondageConnaissances.ia === null) {
        sujet = (sujet === "relativite") ? "reseaux" : "relativite";
        const autreLabel = (sujet === "relativite") ? "la Relativité" : "l'Intelligence Artificielle";

        document.getElementById('survey-text').style.opacity = 0;
        setTimeout(() => {
            document.getElementById('survey-text').innerText = `Et connaissiez-vous déjà les notions sur ${autreLabel} ?`;
            document.getElementById('survey-text').style.opacity = 1;
        }, 500); // Réduit pour plus de fluidité
    } else {
        TraitementDonnees.envoyerToutAuServeur(session);
        document.getElementById('survey-card').innerHTML = `
            <h2 class="display-6 fw-bold">Expérience terminée</h2>
            <p class="mt-4 text-muted">Merci beaucoup ! Vos résultats complets ont été transmis.</p>
        `;
    }
};

window.onload = initQCM;