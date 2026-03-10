// Script de conteúdo para extrair data-test-id dos elementos
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDataTestIds') {
    const elements = document.querySelectorAll('[data-test-id]');
    const dataTestIds = [];

    elements.forEach(element => {
      const dataTestId = element.getAttribute('data-test-id');
      const tagName = element.tagName.toLowerCase();

      dataTestIds.push({
        dataTestId: dataTestId,
        tagName: tagName,
        elementInfo: `<${tagName}>`
      });
    });

    sendResponse({ success: true, data: dataTestIds });
  }
});
