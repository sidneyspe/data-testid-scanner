/**
 * Content Script - Injetar e gerenciar o sidebar
 * Executa no contexto da página para extrair data-test-id
 *
 * i18n.js é carregado antes deste script pelo manifest.json
 * sidebar-controller.js é carregado depois deste script pelo manifest.json
 */

// Evitar múltiplas injeções
if (window.__DTS_LOADED__) {
  window.dispatchEvent(new CustomEvent('dts-toggle-sidebar'));
} else {
  window.__DTS_LOADED__ = true;

  /**
   * Classe para gerenciar o scanner de data-test-id
   */
  class DataTestIDScanner {
    constructor() {
      this.scannedData = [];
      this.sidebarVisible = false;
      this.init();
    }

    /**
     * Inicializa o scanner
     */
    async init() {
      try {
        // Inicializar I18N (já carregado pelo manifest como content script)
        if (window.I18N && typeof window.I18N.init === 'function') {
          window.I18N.init();
        }

        // Injetar CSS
        await this.injectCSS();

        // Injetar HTML do sidebar e toggle button
        await this.injectHTML();

        // Carregar Phosphor Icons (não blocking)
        this.loadPhosphorIcons();

        // Configurar toggle
        this.setupToggle();

        // Configurar event listeners
        this.setupEventListeners();

        // Emitir evento de conclusão (sidebar-controller.js escuta isso)
        window.dispatchEvent(new CustomEvent('dts-ready'));
      } catch (error) {
        console.error('Erro ao inicializar Data-TestID Scanner:', error);
      }
    }

    /**
     * Injeta o CSS da extensão
     */
    async injectCSS() {
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = chrome.runtime.getURL('src/ui/styles.css');
      styleLink.id = 'dts-styles';
      document.head.appendChild(styleLink);
    }

    /**
     * Injeta o HTML do sidebar e toggle button
     */
    async injectHTML() {
      try {
        const response = await fetch(
          chrome.runtime.getURL('src/ui/sidebar.html'),
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sidebarHTML = await response.text();

        // Verificar se o sidebar já existe
        const existing = document.getElementById('data-testid-scanner-sidebar');
        if (existing) {
          return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sidebarHTML;

        // Injetar todos os elementos (toggle button + sidebar)
        while (tempDiv.firstElementChild) {
          document.body.appendChild(tempDiv.firstElementChild);
        }
      } catch (error) {
        console.error('[DTS] ❌ Erro ao injetar HTML:', error);
        throw error;
      }
    }

    /**
     * Carrega Phosphor Icons (font + CSS) localmente
     * Usa @font-face com URL absoluta da extensão para evitar problemas de caminho
     */
    async loadPhosphorIcons() {
      // 1. Registrar a fonte com URL absoluta da extensão
      const fontUrl = chrome.runtime.getURL(
        'src/vendor/phosphor/Phosphor.woff2',
      );
      const fontFace = new FontFace('Phosphor', `url("${fontUrl}")`, {
        weight: 'normal',
        style: 'normal',
        display: 'block',
      });

      try {
        const loadedFont = await fontFace.load();
        document.fonts.add(loadedFont);
      } catch (error) {
        console.error('[DTS] ❌ Erro ao carregar Phosphor font:', error);
      }

      // 2. Carregar o CSS de classes dos ícones
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = chrome.runtime.getURL('src/vendor/phosphor/style.css');
      link.id = 'dts-phosphor-icons';
      document.head.appendChild(link);
    }

    /**
     * Configura o toggle button e eventos de abrir/fechar
     */
    setupToggle() {
      const toggleBtn = document.getElementById('dts-toggle-btn');
      const sidebar = document.getElementById('data-testid-scanner-sidebar');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => this.toggleSidebar());
      }

      // Escutar evento de toggle (disparado pelo background ou re-injeção)
      window.addEventListener('dts-toggle-sidebar', () => this.toggleSidebar());
    }

    /**
     * Alterna visibilidade do sidebar
     */
    toggleSidebar() {
      const sidebar = document.getElementById('data-testid-scanner-sidebar');
      const toggleBtn = document.getElementById('dts-toggle-btn');

      if (!sidebar) return;

      this.sidebarVisible = !this.sidebarVisible;

      if (this.sidebarVisible) {
        sidebar.classList.remove('dts-sidebar--hidden');
        sidebar.style.animation = 'slideIn 0.3s ease-out';
        if (toggleBtn) toggleBtn.classList.add('dts-toggle-btn--active');
      } else {
        sidebar.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
          sidebar.classList.add('dts-sidebar--hidden');
          sidebar.style.animation = '';
        }, 300);
        if (toggleBtn) toggleBtn.classList.remove('dts-toggle-btn--active');
      }
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
      // Escutar mensagens do background
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'toggleSidebar') {
          this.toggleSidebar();
          sendResponse({ success: true });
        } else if (request.action === 'getDataTestIds') {
          const data = this.extractDataTestIds();
          sendResponse({ success: true, data });
        }
      });
    }

    /**
     * Extrai todos os data-test-id da página
     */
    extractDataTestIds() {
      const elements = document.querySelectorAll('[data-test-id]');
      const dataTestIds = [];

      elements.forEach((element) => {
        const dataTestId = element.getAttribute('data-test-id');
        const tagName = element.tagName.toLowerCase();

        dataTestIds.push({
          dataTestId,
          tagName,
          elementInfo: `<${tagName}>`,
        });
      });

      return dataTestIds;
    }
  }

  // Guardar referência global para toggle
  let scanner;

  // Inicializar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scanner = new DataTestIDScanner();
    });
  } else {
    scanner = new DataTestIDScanner();
  }
}
