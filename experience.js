async function loadExperience() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const sujet = urlParams.get('sujet') || 'relativite'; 
        const mode = urlParams.get('mode') || 'A'; 

        const jsonFile = (sujet === 'reseaux') 
            ? './intelligenceArtificielle.json' 
            : './relativiteRestreinte.json';

        const response = await fetch(jsonFile);
        if (!response.ok) throw new Error(`Fichier ${jsonFile} non trouvé`);
        const data = await response.json();
        
        const container = document.getElementById('experience-container');
        container.innerHTML = ""; 

        // ==========================================
        // 3. Rendu de l'INTRODUCTION
        // ==========================================
        let introContent = "";

        if (mode === 'B' || mode === 'D') {
            // Utilise data.intro_video si présent, sinon placeholder
            const media = data.intro_video 
                ? `<video autoplay loop muted playsinline class="w-100" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                        <source src="${data.intro_video}" type="video/mp4">
                   </video>`
                : `<div class="video-placeholder"><span>[ Illustration Introduction ]</span></div>`;

            introContent = `
                <div class="row align-items-center w-100">
                    <div class="col-md-6 px-lg-5">
                        <div class="text-content-wrapper"><p class="text-content">${data.introduction}</p></div>
                    </div>
                    <div class="col-md-6 px-lg-5">${media}</div>
                </div>`;
        } else {
            introContent = `<div class="row justify-content-center w-100"><div class="col-md-8 text-center"><p class="text-content">${data.introduction}</p></div></div>`;
        }

        container.innerHTML += `
            <section class="section-full">
                <h1 class="display-3 text-center mb-5" style="font-weight: bold;">${data.titre}</h1>
                <div class="container-fluid">${introContent}</div>
            </section>`;

        // ==========================================
        // 4. Rendu des CHAPITRES
        // ==========================================
        data.chapitres.forEach((chap, index) => {
            let layout = "";

            if (mode === 'B' || mode === 'D') {
                // Si "video" est présent dans le chapitre du JSON, on l'affiche
                const mediaHtml = chap.video 
                    ? `<video autoplay loop muted playsinline class="w-100" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                            <source src="${chap.video}" type="video/mp4">
                       </video>`
                    : `<div class="video-placeholder"><span>[ Illustration ${sujet} - Chapitre ${index + 1} ]</span></div>`;

                layout = `
                    <div class="row align-items-center w-100">
                        <div class="col-md-6 px-lg-5">
                            <div class="text-content-wrapper">
                                <p class="text-content">${chap.contenu}</p>
                            </div>
                        </div>
                        <div class="col-md-6 px-lg-5">
                            <div class="video-container">${mediaHtml}</div>
                        </div>
                    </div>`;
            } else {
                layout = `
                    <div class="row justify-content-center w-100">
                        <div class="col-md-8"><div class="text-content-wrapper text-center"><p class="text-content">${chap.contenu}</p></div></div>
                    </div>`;
            }

            container.innerHTML += `
                <section class="section-full">
                    <h2 class="section-title text-center">${chap.titre}</h2>
                    <div class="container-fluid">${layout}</div>
                </section>`;
        });

        // 5. Rendu de la FIN (Corrigé pour le centrage)
        container.innerHTML += `
            <section class="section-full d-flex flex-column align-items-center justify-content-center text-center">
                <div class="container">
                    <h2 class="display-4 mb-4">Lecture terminée</h2>
                    <p class="lead mb-5">Vous avez parcouru l'ensemble des documents.</p>
                    <div class="d-flex justify-content-center w-100">
                        <button class="btn-start-qcm" onclick="goToNextStep()">
                            Accéder au questionnaire
                        </button>
                    </div>
                </div>
            </section>
        `;

    } catch (e) {
        console.error("Erreur :", e);
    }
}

function goToNextStep() {
    const currentParams = new URLSearchParams(window.location.search);
    window.location.href = `qcm.html?${currentParams.toString()}`;
}

window.onload = loadExperience;