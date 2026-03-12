// JavaScript für das Lebenslauf-Modal mit PDF.js Integration für iOS-Kompatibilität

document.addEventListener('DOMContentLoaded', function() {
    // Referenzen zu den Elementen
    const resumeBtn = document.querySelector('.resume-btn');
    const modal = document.getElementById('resume-modal');
    const closeBtn = document.querySelector('.close-modal');
    const downloadBtn = document.getElementById('download-resume');
    const pdfContainer = document.getElementById('pdf-container');
    const pdfIframe = document.getElementById('pdf-iframe');
    const pdfJsContainer = document.getElementById('pdfjs-container');
    const modalTitle = document.querySelector('#resume-modal .modal-title');
    const downloadText = document.querySelector('#download-resume span');
    const iosHint = document.getElementById('ios-download-hint');
    
    // Erkennung von iOS/Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // PDF.js Worker konfigurieren
    if (isIOS || isSafari) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    
    // Übersetzungsfunktion für das Modal
    function updateModalTranslations(lang) {
        if (modalTitle) modalTitle.textContent = translations[lang]['resume_title'];
        if (downloadText) downloadText.textContent = translations[lang]['resume_download'];
        if (iosHint) iosHint.textContent = translations[lang]['resume_ios_hint'];
    }
    
    // Event-Listener für Sprachänderungen
    document.addEventListener('languageChanged', function(e) {
        updateModalTranslations(e.detail.language);
    });
    
    // Modal öffnen, wenn auf den Lebenslauf-Button geklickt wird
    resumeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Verhindert Scrollen im Hintergrund
        
        // Aktualisiere Übersetzungen basierend auf der aktuellen Sprache
        const currentLang = document.documentElement.getAttribute('lang') || 'de';
        updateModalTranslations(currentLang);
        
        // Sanfte Einblendung
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // PDF mit PDF.js laden für iOS/Safari, sonst iframe verwenden
        if (isIOS || isSafari) {
            pdfIframe.style.display = 'none';
            pdfJsContainer.style.display = 'block';
            
            if (!pdfJsContainer.hasAttribute('data-loaded')) {
                loadPdfWithPdfJs('assets/pdf/Lebenslauf_AstridKraft.pdf', pdfJsContainer);
                pdfJsContainer.setAttribute('data-loaded', 'true');
            }
        } else {
            pdfIframe.style.display = 'block';
            pdfJsContainer.style.display = 'none';
        }
    });
    
    // PDF mit PDF.js laden
    function loadPdfWithPdfJs(url, container) {
        // PDF laden
        const loadingTask = pdfjsLib.getDocument(url);
        loadingTask.promise.then(function(pdf) {
            // Anzahl der Seiten
            const numPages = pdf.numPages;
            
            // Container leeren
            container.innerHTML = '';
            
            // Für jede Seite
            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                // Seite laden
                pdf.getPage(pageNum).then(function(page) {
                    // Skalierung für die Anzeige
                    const viewport = page.getViewport({ scale: 1.0 });
                    
                    // Canvas für die Seite erstellen
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    
                    // Seitencontainer erstellen
                    const pageContainer = document.createElement('div');
                    pageContainer.className = 'pdf-page';
                    pageContainer.appendChild(canvas);
                    container.appendChild(pageContainer);
                    
                    // Seite rendern
                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    
                    page.render(renderContext);
                });
            }
        });
    }
    
    // Modal schließen, wenn auf das X geklickt wird
    closeBtn.addEventListener('click', function() {
        closeModal();
    });
    
    // Modal schließen, wenn außerhalb des Inhalts geklickt wird
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Modal schließen, wenn ESC gedrückt wird
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Funktion zum Schließen des Modals
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Scrollen wieder erlauben
        }, 300); // Entspricht der Übergangszeit in CSS
    }
    
    // Download-Funktion mit iOS-Anpassung
    downloadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (isIOS || isSafari) {
            // Für iOS/Safari: Hinweis anzeigen und Link öffnen
            const downloadHint = document.getElementById('ios-download-hint');
            downloadHint.style.display = 'block';
            
            // Link in neuem Tab öffnen
            window.open('assets/pdf/Lebenslauf_AstridKraft.pdf', '_blank');
            
            // Hinweis nach 5 Sekunden ausblenden
            setTimeout(() => {
                downloadHint.style.display = 'none';
            }, 5000);
        } else {
            // Für andere Browser: Direkter Download
            const link = document.createElement('a');
            link.href = 'assets/pdf/Lebenslauf_AstridKraft.pdf';
            link.download = 'Lebenslauf_AstridKraft.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
});
