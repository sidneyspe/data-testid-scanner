/**
 * Sistema de Internacionalização (i18n)
 * Gerencia tradução de textos e preferências de idioma
 */

const I18N = (() => {
  const STORAGE_KEY = 'dts_preferred_language';
  const DEFAULT_LANGUAGE = 'pt';

  const translations = {
    pt: {
      // Header
      appTitle: 'Data-TestID Scanner',
      appDescription: 'Escaneia todos os data-test-id da página',

      // Buttons
      scanButton: 'Escanear',
      exportButton: 'Exportar CSV',
      copyButton: 'Copiar Tudo',
      closeButton: 'Fechar',

      // Table
      elementType: 'Tipo',
      actions: 'Ações',
      copy: 'Copiar',
      copied: 'Copiado!',

      // Messages
      emptyScan: 'Clique em "Escanear" para listar todos os data-test-id',
      totalElements: 'Total de elementos encontrados',
      elementsFound: 'elemento(s) encontrado(s)',

      // Alerts
      scanning: 'Escaneando...',
      scanSuccess: 'Scan realizado com sucesso!',
      scanError: 'Erro ao escanear. Recarregue a página e tente novamente.',
      scanErrorDetails: 'Erro ao escanear: ',

      exportSuccess: 'CSV exportado com sucesso!',
      noDataToExport: 'Nenhum dado para exportar. Realize um scan primeiro.',
      noDataToCopy: 'Nenhum dado para copiar. Realize um scan primeiro.',
      noDataFound: 'Nenhum data-test-id encontrado nesta página.',

      // Info
      copySuccess: 'Dados copiados para o clipboard!',
      copyError: 'Erro ao copiar para o clipboard.',

      // Missing data-test-id
      missingTitle: 'Sem data-test-id',
      missingDescription: 'Elementos interativos que deveriam ter data-test-id',
      missingElement: 'Elemento',
      missingContext: 'Contexto',
      missingCount: 'elementos sem data-test-id',
      noMissingFound: 'Todos os elementos interativos possuem data-test-id!',
    },

    en: {
      // Header
      appTitle: 'Data-TestID Scanner',
      appDescription: 'Scan all data-test-id from the page',

      // Buttons
      scanButton: 'Scan',
      exportButton: 'Export CSV',
      copyButton: 'Copy All',
      closeButton: 'Close',

      // Table
      elementType: 'Type',
      actions: 'Actions',
      copy: 'Copy',
      copied: 'Copied!',

      // Messages
      emptyScan: 'Click "Scan" to list all data-test-id',
      totalElements: 'Total elements found',
      elementsFound: 'element(s) found',

      // Alerts
      scanning: 'Scanning...',
      scanSuccess: 'Scan completed successfully!',
      scanError: 'Error scanning. Reload the page and try again.',
      scanErrorDetails: 'Scanning error: ',

      exportSuccess: 'CSV exported successfully!',
      noDataToExport: 'No data to export. Perform a scan first.',
      noDataToCopy: 'No data to copy. Perform a scan first.',
      noDataFound: 'No data-test-id found on this page.',

      // Info
      copySuccess: 'Data copied to clipboard!',
      copyError: 'Error copying to clipboard.',

      // Missing data-test-id
      missingTitle: 'Missing data-test-id',
      missingDescription: 'Interactive elements that should have data-test-id',
      missingElement: 'Element',
      missingContext: 'Context',
      missingCount: 'elements missing data-test-id',
      noMissingFound: 'All interactive elements have data-test-id!',
    },

    es: {
      // Header
      appTitle: 'Data-TestID Scanner',
      appDescription: 'Escanea todos los data-test-id de la página',

      // Buttons
      scanButton: 'Escanear',
      exportButton: 'Exportar CSV',
      copyButton: 'Copiar Todo',
      closeButton: 'Cerrar',

      // Table
      elementType: 'Tipo',
      actions: 'Acciones',
      copy: 'Copiar',
      copied: '¡Copiado!',

      // Messages
      emptyScan: 'Haga clic en "Escanear" para enumerar todos los data-test-id',
      totalElements: 'Total de elementos encontrados',
      elementsFound: 'elemento(s) encontrado(s)',

      // Alerts
      scanning: 'Escaneando...',
      scanSuccess: '¡Escaneo realizado exitosamente!',
      scanError: 'Error al escanear. Recargue la página e intente de nuevo.',
      scanErrorDetails: 'Error de escaneo: ',

      exportSuccess: '¡CSV exportado exitosamente!',
      noDataToExport: 'Sin datos para exportar. Realice un escaneo primero.',
      noDataToCopy: 'Sin datos para copiar. Realice un escaneo primero.',
      noDataFound: 'No se encontró data-test-id en esta página.',

      // Info
      copySuccess: '¡Datos copiados al portapapeles!',
      copyError: 'Error al copiar al portapapeles.',

      // Missing data-test-id
      missingTitle: 'Sin data-test-id',
      missingDescription: 'Elementos interactivos que deberían tener data-test-id',
      missingElement: 'Elemento',
      missingContext: 'Contexto',
      missingCount: 'elementos sin data-test-id',
      noMissingFound: '¡Todos los elementos interactivos tienen data-test-id!',
    },
  };

  let currentLanguage = DEFAULT_LANGUAGE;

  /**
   * Inicializa o sistema i18n
   */
  function init() {
    loadPreferredLanguage();
  }

  /**
   * Carrega a linguagem preferida do armazenamento
   */
  function loadPreferredLanguage() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      if (result[STORAGE_KEY]) {
        currentLanguage = result[STORAGE_KEY];
      }
    });
  }

  /**
   * Define a linguagem atual
   * @param {string} lang - Código do idioma (pt, en, es)
   */
  function setLanguage(lang) {
    if (translations[lang]) {
      currentLanguage = lang;
      chrome.storage.local.set({ [STORAGE_KEY]: lang });
    }
  }

  /**
   * Obtém a linguagem atual
   * @returns {string} Código da linguagem atual
   */
  function getLanguage() {
    return currentLanguage;
  }

  /**
   * Traduz uma chave
   * @param {string} key - Chave de tradução
   * @returns {string} Texto traduzido
   */
  function t(key) {
    return translations[currentLanguage][key] || translations[DEFAULT_LANGUAGE][key] || key;
  }

  /**
   * Obtém todas as traduções para um idioma
   * @param {string} lang - Código do idioma
   * @returns {object} Objeto com todas as traduções
   */
  function getTranslations(lang = currentLanguage) {
    return translations[lang] || translations[DEFAULT_LANGUAGE];
  }

  /**
   * Verifica se um idioma é suportado
   * @param {string} lang - Código do idioma
   * @returns {boolean} True se suportado
   */
  function isSupported(lang) {
    return !!translations[lang];
  }

  /**
   * Obtém lista de idiomas suportados
   * @returns {array} Array com códigos de idiomas
   */
  function getSupportedLanguages() {
    return Object.keys(translations);
  }

  return {
    init,
    setLanguage,
    getLanguage,
    t,
    getTranslations,
    isSupported,
    getSupportedLanguages,
  };
})();

// Disponibilizar globalmente
// A inicialização (I18N.init()) será chamada pelo sidebar.js
window.I18N = I18N;
console.log('[DTS] ✓ I18N disponível globalmente');
