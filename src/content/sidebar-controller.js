/**
 * Sidebar Controller
 * Gerencia a lógica e interações do sidebar
 */

(function () {
  /**
   * Aguarda o sidebar estar pronto (HTML injetado no DOM)
   * Escuta o evento 'dts-ready' emitido pelo sidebar.js após injetar o HTML
   */
  function waitForDependencies(callback) {
    const sidebar = document.getElementById('data-testid-scanner-sidebar');
    if (sidebar) {
      callback();
      return;
    }

    // O sidebar.js emite 'dts-ready' quando termina de injetar o HTML
    window.addEventListener(
      'dts-ready',
      () => {
        callback();
      },
      { once: true },
    );
  }

  /**
   * Classe controladora do sidebar
   */
  class SidebarController {
    constructor() {
      this.scannedData = [];
      this.filteredData = [];
      this.missingData = [];
      this.elements = {};
      this.currentLanguage = 'pt';
      this.searchQuery = '';
      this.sortOrder = 'asc';
    }

    /**
     * Inicializa o controlador
     */
    init() {
      this.cacheElements();
      this.setupEventListeners();
      this.updatePageLanguage();
      this.setLanguageFromStorage();
      this.loadThemeFromStorage();
    }

    /**
     * Cache dos elementos do DOM para melhor performance
     */
    cacheElements() {
      this.elements = {
        sidebar: document.getElementById('data-testid-scanner-sidebar'),
        toggleBtn: document.getElementById('dts-toggle-btn'),
        scanBtn: document.getElementById('dts-scan-btn'),
        exportBtn: document.getElementById('dts-export-btn'),
        copyBtn: document.getElementById('dts-copy-btn'),
        closeBtn: document.getElementById('dts-close-btn'),
        themeBtn: document.getElementById('dts-theme-btn'),
        languageSelect: document.getElementById('dts-language-select'),
        tableBody: document.getElementById('dts-table-body'),
        totalCount: document.getElementById('dts-total-count'),
        alert: document.getElementById('dts-alert'),
        alertMessage: document.getElementById('dts-alert-message'),
        tabFound: document.getElementById('dts-tab-found'),
        tabMissing: document.getElementById('dts-tab-missing'),
        panelFound: document.getElementById('dts-panel-found'),
        panelMissing: document.getElementById('dts-panel-missing'),
        foundCount: document.getElementById('dts-found-count'),
        missingCount: document.getElementById('dts-missing-count'),
        missingBody: document.getElementById('dts-missing-body'),
        searchInput: document.getElementById('dts-search-input'),
        sortTypeBtn: document.getElementById('dts-sort-type'),
      };

      if (!this.elements.scanBtn) {
        console.error(
          '[DTS] ❌ ERRO CRÍTICO: scanBtn não encontrado! Verifique o ID #dts-scan-btn em sidebar.html',
        );
      }
      if (!this.elements.languageSelect) {
        console.error(
          '[DTS] ❌ ERRO CRÍTICO: languageSelect não encontrado! Verifique o ID #dts-language-select em sidebar.html',
        );
      }
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
      try {
        // Botão Escanear
        if (this.elements.scanBtn) {
          this.elements.scanBtn.addEventListener('click', () =>
            this.handleScan(),
          );
        }

        // Botão Exportar
        if (this.elements.exportBtn) {
          this.elements.exportBtn.addEventListener('click', () =>
            this.handleExport(),
          );
        }

        // Botão Copiar
        if (this.elements.copyBtn) {
          this.elements.copyBtn.addEventListener('click', () =>
            this.handleCopy(),
          );
        }

        // Botão Fechar
        if (this.elements.closeBtn) {
          this.elements.closeBtn.addEventListener('click', () =>
            this.closeSidebar(),
          );
        }

        // Tabs
        if (this.elements.tabFound) {
          this.elements.tabFound.addEventListener('click', () =>
            this.switchTab('found'),
          );
        }
        if (this.elements.tabMissing) {
          this.elements.tabMissing.addEventListener('click', () =>
            this.switchTab('missing'),
          );
        }

        // Botão Tema
        if (this.elements.themeBtn) {
          this.elements.themeBtn.addEventListener('click', () =>
            this.toggleTheme(),
          );
        }

        // Seletor de Idioma
        if (this.elements.languageSelect) {
          this.elements.languageSelect.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
          });
        }

        // Campo de Busca
        if (this.elements.searchInput) {
          this.elements.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterAndSortData();
          });
        }

        // Botão de Ordenação por Tipo
        if (this.elements.sortTypeBtn) {
          this.elements.sortTypeBtn.addEventListener('click', () => {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            const icon = this.elements.sortTypeBtn.querySelector('i');
            icon.className =
              this.sortOrder === 'asc' ? 'ph ph-arrow-up' : 'ph ph-arrow-down';
            this.filterAndSortData();
          });
        }
      } catch (error) {
        console.error('[DTS] ❌ Erro ao configurar event listeners:', error);
      }
    }

    /**
     * Executa o scan de data-test-id
     */
    async handleScan() {
      try {
        this.setButtonLoading(this.elements.scanBtn, true);

        // 1. Extrair elementos COM data-test-id
        const elements = document.querySelectorAll('[data-test-id]');
        this.scannedData = [];

        elements.forEach((element) => {
          this.scannedData.push({
            dataTestId: element.getAttribute('data-test-id'),
            tagName: element.tagName.toLowerCase(),
          });
        });

        // 2. Detectar elementos interativos SEM data-test-id
        this.missingData = this.findMissingTestIds();

        // Inicializar filteredData
        this.filteredData = [...this.scannedData];

        // Renderizar tabelas
        this.filterAndSortData();
        this.renderMissingTable();

        // Atualizar badges das tabs
        this.elements.foundCount.textContent = this.scannedData.length;
        this.elements.missingCount.textContent = this.missingData.length;
        this.elements.totalCount.textContent = this.scannedData.length;

        // Mostrar mensagem
        const message =
          this.scannedData.length > 0
            ? `${this.scannedData.length} ${this.t('elementsFound')}` +
              (this.missingData.length > 0
                ? ` | ${this.missingData.length} ${this.t('missingCount')}`
                : '')
            : this.t('noDataFound');

        this.showAlert(
          message,
          this.scannedData.length > 0 ? 'success' : 'info',
        );

        // Habilitar botões de exportação e cópia
        this.elements.exportBtn.disabled = this.scannedData.length === 0;
        this.elements.copyBtn.disabled = this.scannedData.length === 0;

        // Se tem missing, destacar a tab
        if (this.missingData.length > 0) {
          this.elements.missingCount.classList.add('dts-tab__badge--warning');
        } else {
          this.elements.missingCount.classList.remove(
            'dts-tab__badge--warning',
          );
        }
      } catch (error) {
        console.error('[DTS] ❌ Erro ao escanear:', error);
        this.showAlert(`${this.t('scanError')}`, 'error');
      } finally {
        this.setButtonLoading(this.elements.scanBtn, false);
      }
    }

    /**
     * Seletores de elementos interativos que devem ter data-test-id
     */
    static INTERACTIVE_SELECTORS = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      'form',
      '[role="button"]',
      '[role="link"]',
      '[role="tab"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="switch"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[contenteditable="true"]',
    ];

    /**
     * Encontra elementos interativos sem data-test-id
     */
    findMissingTestIds() {
      const sidebarId = 'data-testid-scanner-sidebar';
      const toggleId = 'dts-toggle-btn';
      const selector = SidebarController.INTERACTIVE_SELECTORS.join(', ');
      const allInteractive = document.querySelectorAll(selector);
      const missing = [];

      allInteractive.forEach((el) => {
        // Ignorar elementos da própria extensão
        if (el.closest(`#${sidebarId}`) || el.id === toggleId) return;
        // Ignorar elementos ocultos
        if (
          el.offsetParent === null &&
          el.tagName !== 'INPUT' &&
          el.getAttribute('type') !== 'hidden'
        )
          return;
        // Ignorar se já tem data-test-id
        if (el.hasAttribute('data-test-id')) return;

        const tagName = el.tagName.toLowerCase();
        const context = this.getElementContext(el);

        missing.push({ tagName, context, element: el });
      });

      return missing;
    }

    /**
     * Gera um contexto legível para identificar o elemento
     */
    getElementContext(el) {
      const parts = [];
      const tag = el.tagName.toLowerCase();

      // Tipo do input
      if (tag === 'input' || tag === 'select' || tag === 'textarea') {
        const type = el.getAttribute('type') || tag;
        const name = el.getAttribute('name');
        const placeholder = el.getAttribute('placeholder');
        const label = el.getAttribute('aria-label');
        parts.push(`type="${type}"`);
        if (name) parts.push(`name="${name}"`);
        else if (placeholder) parts.push(`"${placeholder}"`);
        else if (label) parts.push(`"${label}"`);
      }

      // Links
      if (tag === 'a') {
        const text = el.textContent.trim().substring(0, 30);
        if (text) parts.push(`"${text}"`);
      }

      // Botões
      if (tag === 'button' || el.getAttribute('role') === 'button') {
        const text = el.textContent.trim().substring(0, 30);
        const label = el.getAttribute('aria-label');
        if (text) parts.push(`"${text}"`);
        else if (label) parts.push(`aria="${label}"`);
      }

      // ID ou classes
      if (el.id) {
        parts.push(`#${el.id}`);
      } else if (el.className && typeof el.className === 'string') {
        const cls = el.className.split(' ').slice(0, 2).join('.');
        if (cls) parts.push(`.${cls}`);
      }

      return parts.join(' ') || tag;
    }

    /**
     * Wrapper para tradução com fallback
     */
    t(key) {
      try {
        const i18n = window.I18N || (typeof I18N !== 'undefined' ? I18N : null);
        if (i18n && typeof i18n.t === 'function') {
          const translated = i18n.t(key);
          return translated || key;
        }
        return key;
      } catch (e) {
        return key;
      }
    }

    /**
     * Exporta os dados como CSV
     */
    handleExport() {
      if (this.scannedData.length === 0) {
        this.showAlert(this.t('noDataToExport'), 'error');
        return;
      }

      try {
        const csvContent = [
          ['#', 'data-test-id', this.t('elementType')],
          ...this.scannedData.map((item, index) => [
            index + 1,
            item.dataTestId,
            item.tagName,
          ]),
        ]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `data-test-ids-${Date.now()}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showAlert(this.t('exportSuccess'), 'success');
      } catch (error) {
        this.showAlert(this.t('copyError'), 'error');
      }
    }

    /**
     * Copia todos os data-test-id para o clipboard
     */
    handleCopy() {
      if (this.scannedData.length === 0) {
        this.showAlert(this.t('noDataToCopy'), 'error');
        return;
      }

      try {
        const textToCopy = this.scannedData
          .map(
            (item, index) =>
              `${index + 1}. ${item.dataTestId} (${item.tagName})`,
          )
          .join('\n');

        const button = this.elements.copyBtn;
        const span = button.querySelector('span');
        const originalText = span.textContent;

        navigator.clipboard.writeText(textToCopy).then(() => {
          this.showAlert(this.t('copySuccess'), 'success');
          span.textContent = this.t('copied');

          setTimeout(() => {
            span.textContent = originalText;
          }, 1000);
        });
      } catch (error) {
        this.showAlert(this.t('copyError'), 'error');
      }
    }

    /**
     * Filtra e ordena os dados
     */
    filterAndSortData() {
      this.filteredData = [...this.scannedData];

      // Filtrar por data-test-id ou tipo
      if (this.searchQuery) {
        this.filteredData = this.filteredData.filter(
          (item) =>
            item.dataTestId.toLowerCase().includes(this.searchQuery) ||
            item.tagName.toLowerCase().includes(this.searchQuery),
        );
      }

      // Ordenar por tipo
      this.filteredData.sort((a, b) => {
        if (this.sortOrder === 'asc') {
          return a.tagName.localeCompare(b.tagName);
        } else {
          return b.tagName.localeCompare(a.tagName);
        }
      });

      this.renderTable();
    }

    /**
     * Renderiza a tabela com os dados
     */
    renderTable() {
      const dataToRender =
        this.filteredData.length > 0 || this.searchQuery
          ? this.filteredData
          : this.scannedData;

      if (dataToRender.length === 0) {
        this.elements.tableBody.innerHTML = `
          <tr>
            <td colspan="3" class="dts-table__empty" data-i18n="emptyScan">
              ${this.t('emptyScan')}
            </td>
          </tr>
        `;
        this.elements.totalCount.textContent = '0';
        return;
      }

      this.elements.tableBody.innerHTML = dataToRender
        .map(
          (item, index) => `
            <tr>
              <td class="dts-table__index">${index + 1}</td>
              <td class="dts-table__id">
                <code class="dts-table__id-code dts-table__clickable" data-data-testid="${this.escapeHtml(item.dataTestId)}">${this.escapeHtml(
                  item.dataTestId,
                )}</code>
              </td>
              <td>
                <span class="dts-table__tag">${this.escapeHtml(
                  item.tagName,
                )}</span>
              </td>
            </tr>
          `,
        )
        .join('');

      this.elements.totalCount.textContent = dataToRender.length;

      // Adicionar event listeners para clique no data-test-id copiar para clipboard
      document.querySelectorAll('.dts-table__clickable').forEach((code) => {
        code.addEventListener('click', (e) => {
          const dataTestId = e.currentTarget.dataset.dataTestid;
          this.copyItemToClipboard(dataTestId, e.currentTarget);
        });
      });
    }

    /**
     * Renderiza a tabela de elementos sem data-test-id
     */
    renderMissingTable() {
      if (!this.elements.missingBody) return;

      if (this.missingData.length === 0) {
        this.elements.missingBody.innerHTML = `
          <tr>
            <td colspan="3" class="dts-table__empty">
              <i class="ph ph-check-circle" style="color: var(--color-success); margin-right: 6px;"></i>
              ${this.t('noMissingFound')}
            </td>
          </tr>
        `;
        return;
      }

      this.elements.missingBody.innerHTML = this.missingData
        .map(
          (item, index) => `
            <tr>
              <td class="dts-table__index">${index + 1}</td>
              <td class="dts-table__id">
                <code class="dts-table__id-code dts-table__id-code--missing">&lt;${this.escapeHtml(item.tagName)}&gt;</code>
              </td>
              <td class="dts-table__context">${this.escapeHtml(item.context)}</td>
            </tr>
          `,
        )
        .join('');

      // Hover highlight: ao passar o mouse na linha, destaca o elemento na página
      this.elements.missingBody.querySelectorAll('tr').forEach((row, index) => {
        const el = this.missingData[index]?.element;
        if (!el) return;

        row.addEventListener('mouseenter', () => {
          el.style.outline = '2px solid #f56565';
          el.style.outlineOffset = '2px';
        });
        row.addEventListener('mouseleave', () => {
          el.style.outline = '';
          el.style.outlineOffset = '';
        });
      });
    }

    /**
     * Alterna entre as tabs
     */
    switchTab(tab) {
      // Atualizar estado das tabs
      this.elements.tabFound.classList.toggle(
        'dts-tab--active',
        tab === 'found',
      );
      this.elements.tabMissing.classList.toggle(
        'dts-tab--active',
        tab === 'missing',
      );

      // Atualizar painéis visíveis
      this.elements.panelFound.classList.toggle(
        'dts-panel--active',
        tab === 'found',
      );
      this.elements.panelMissing.classList.toggle(
        'dts-panel--active',
        tab === 'missing',
      );
    }

    /**
     * Copia um item específico para o clipboard
     */
    copyItemToClipboard(text, element) {
      navigator.clipboard.writeText(text).then(() => {
        const originalText = element.textContent;

        element.textContent = this.t('copied');
        element.style.backgroundColor = 'var(--color-success)';
        element.style.color = 'white';

        setTimeout(() => {
          element.textContent = originalText;
          element.style.backgroundColor = '';
          element.style.color = '';
        }, 2000);
      });
    }

    /**
     * Mostra um alerta
     * @param {string} message - Mensagem a exibir
     * @param {string} type - Tipo: 'info', 'success', 'error'
     */
    showAlert(message, type = 'info') {
      this.elements.alertMessage.textContent = message;
      this.elements.alert.className = `dts-alert dts-alert--${type}`;

      // Definir ícone apropriado
      let iconClass = 'ph-info';
      if (type === 'success') iconClass = 'ph-check-circle';
      if (type === 'error') iconClass = 'ph-warning-circle';

      const icon = this.elements.alert.querySelector('.dts-alert__icon i');
      icon.className = `ph ${iconClass}`;

      // Mostrar e esconder após 4 segundos
      this.elements.alert.classList.remove('dts-alert--hidden');
      setTimeout(() => {
        this.elements.alert.classList.add('dts-alert--hidden');
      }, 4000);
    }

    /**
     * Define estado de loading do botão
     */
    setButtonLoading(button, isLoading) {
      if (isLoading) {
        button.disabled = true;
        const span = button.querySelector('span');
        const originalText = span.textContent;
        button.dataset.originalText = originalText;
        span.textContent = this.t('scanning');

        const icon = button.querySelector('i');
        icon.className = 'ph ph-spinning-loader dts-spinner';
      } else {
        button.disabled = false;
        const span = button.querySelector('span');
        span.textContent = button.dataset.originalText || this.t('scanButton');

        const icon = button.querySelector('i');
        icon.className = 'ph ph-magnifying-glass';
      }
    }

    /**
     * Define estado do botão (normal ou copiado)
     */
    setButtonState(button, state) {
      if (state === 'copied') {
        button.classList.add('dts-table__copy-btn--copied');
        const icon = button.querySelector('i');
        icon.className = 'ph ph-check';
        const span = button.querySelector(':not(i)');
        if (span) span.textContent = this.t('copied');
      } else {
        button.classList.remove('dts-table__copy-btn--copied');
        const icon = button.querySelector('i');
        icon.className = 'ph ph-copy';
        const textNode = Array.from(button.childNodes).find(
          (node) => node.nodeType === Node.TEXT_NODE,
        );
        if (textNode) textNode.textContent = this.t('copy');
      }
    }

    /**
     * Define o idioma
     */
    setLanguage(lang) {
      if (window.I18N && window.I18N.isSupported(lang)) {
        window.I18N.setLanguage(lang);
        this.currentLanguage = lang;
        this.updatePageLanguage();
      }
    }

    /**
     * Carrega idioma do storage
     */
    setLanguageFromStorage() {
      if (window.I18N) {
        const savedLang = window.I18N.getLanguage();
        if (savedLang) {
          this.elements.languageSelect.value = savedLang;
          this.currentLanguage = savedLang;
        }
      }
    }

    /**
     * Atualiza textos da página com novas traduções
     */
    updatePageLanguage() {
      document.querySelectorAll('[data-i18n]').forEach((element) => {
        const key = element.getAttribute('data-i18n');
        element.textContent = this.t(key);
      });

      // Atualizar tabelas se houver dados
      if (this.scannedData.length > 0) {
        this.renderTable();
      }
      if (this.missingData.length > 0) {
        this.renderMissingTable();
      }
    }

    /**
     * Alterna entre tema light e dark
     */
    toggleTheme() {
      const isDark = this.elements.sidebar.classList.toggle('dts-dark');

      // Aplicar no toggle button também
      if (this.elements.toggleBtn) {
        this.elements.toggleBtn.classList.toggle('dts-dark', isDark);
      }

      // Atualizar ícone do botão
      const icon = this.elements.themeBtn.querySelector('i');
      icon.className = isDark ? 'ph ph-sun' : 'ph ph-moon';

      // Persistir preferência no localStorage
      localStorage.setItem('dts_theme', isDark ? 'dark' : 'light');
    }

    /**
     * Carrega tema salvo do localStorage
     */
    loadThemeFromStorage() {
      const savedTheme = localStorage.getItem('dts_theme');
      const isDark = savedTheme === 'dark';

      if (isDark) {
        this.elements.sidebar.classList.add('dts-dark');
        if (this.elements.toggleBtn) {
          this.elements.toggleBtn.classList.add('dts-dark');
        }
      }

      const icon = this.elements.themeBtn.querySelector('i');
      icon.className = isDark ? 'ph ph-sun' : 'ph ph-moon';
    }

    /**
     * Fecha o sidebar (esconde, não remove)
     */
    closeSidebar() {
      window.dispatchEvent(new CustomEvent('dts-toggle-sidebar'));
    }

    /**
     * Escapa HTML
     */
    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Inicializar quando dependências estiverem prontas
  waitForDependencies(() => {
    const controller = new SidebarController();
    controller.init();
  });
})();
