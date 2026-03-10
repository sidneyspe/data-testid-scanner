/**
 * Background Service Worker
 * Gerencia eventos globais da extensão
 */

// Listener para quando a extensão é instalada
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      dts_preferred_language: 'pt',
    });
    console.log('Data-TestID Scanner instalado com sucesso!');
  }
});

// Listener para ícone da extensão ser clicado
chrome.action.onClicked.addListener((tab) => {
  // Enviar mensagem para o content script fazer toggle do sidebar
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' }, (response) => {
    if (chrome.runtime.lastError) {
      // Content script não está carregado ainda, injetar manualmente
      console.log('Content script não encontrado, injetando...');
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['src/i18n/i18n.js', 'src/content/sidebar.js', 'src/content/sidebar-controller.js'],
      });
    }
  });
});

console.log('Data-TestID Scanner Background Service Worker carregado');
