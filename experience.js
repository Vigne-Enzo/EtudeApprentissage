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
            // Note : On utilise data-src au lieu de src pour le lazy loading
            const media = data.intro_video 
                ? `<video loop muted playsinline class="w-100 lazy-video" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                        <source data-src="${data.intro_video}" type="video/mp4">
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
                const mediaHtml = chap.video 
                    ? `<video loop muted playsinline class="w-100 lazy-video" style="border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                            <source data-src="${chap.video}" type="video/mp4">
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

        // ==========================================
        // 5. Rendu de la FIN
        // ==========================================
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

        // ==========================================
        // 6. INITIALISATION DU LAZY LOADING
        // ==========================================
        initLazyVideos();

    } catch (e) {
        console.error("Erreur :", e);
    }
}

/**
 * Fonction qui détecte quand une vidéo entre dans le champ de vision
 * pour la charger et la lancer proprement.
 */
function initLazyVideos() {
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                const source = video.querySelector('source');
                
                // Si la source a un data-src, on le passe en vrai src
                if (source && source.dataset.src) {
                    source.src = source.dataset.src;
                    source.removeAttribute('data-src');
                    video.load(); // Charge la vidéo
                }
                
                video.play(); // Lance la lecture
                // Optionnel : on peut arrêter d'observer si on veut qu'elle tourne en boucle même en scrollant loin
                // observer.unobserve(video); 
            } else {
                // Optionnel : met la vidéo en pause quand on ne la voit plus pour économiser le processeur
                entry.target.pause();
            }
        });
    }, { threshold: 0.15 }); // Se déclenche quand 15% de la vidéo est visible

    document.querySelectorAll('.lazy-video').forEach(v => videoObserver.observe(v));
}

function goToNextStep() {
    const currentParams = new URLSearchParams(window.location.search);
    window.location.href = `qcm.html?${currentParams.toString()}`;
}

window.onload = loadExperience;