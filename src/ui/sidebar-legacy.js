// Sistema de Internacionalização
const translations = {
  pt: {
    appTitle: 'Data-TestID Scanner',
    appDescription: 'Escaneia todos os data-test-id da página',
    scanButton: 'Escanear',
    exportButton: 'Exportar CSV',
    copyButton: 'Copiar',
    elementType: 'Tipo de Elemento',
    actions: 'Ações',
    emptyScan: 'Clique em "Escanear" para listar todos os data-test-id',
    totalElements: 'Total de elementos encontrados',
    scanning: 'Escaneando...',
    copied: 'Copiado!',
    copy: 'Copiar',
    exportedSuccess: 'CSV exportado com sucesso!',
    noDataToExport: 'Nenhum dado para exportar',
    noDataToCopy: 'Nenhum dado para copiar',
    noDataFound: 'Nenhum data-test-id encontrado',
    errorScanning: 'Erro ao acessar a página. Recarregue e tente novamente.',
    errorScanningSub: 'Erro ao escanear: ',
    elementsFound: 'elemento(s) encontrado(s)'
  },
  en: {
    appTitle: 'Data-TestID Scanner',
    appDescription: 'Scan all data-test-id from the page',
    scanButton: 'Scan',
    exportButton: 'Export CSV',
    copyButton: 'Copy',
    elementType: 'Element Type',
    actions: 'Actions',
    emptyScan: 'Click "Scan" to list all data-test-id',
    totalElements: 'Total elements found',
    scanning: 'Scanning...',
    copied: 'Copied!',
    copy: 'Copy',
    exportedSuccess: 'CSV exported successfully!',
    noDataToExport: 'No data to export',
    noDataToCopy: 'No data to copy',
    noDataFound: 'No data-test-id found',
    errorScanning: 'Error accessing the page. Reload and try again.',
    errorScanningSub: 'Scanning error: ',
    elementsFound: 'element(s) found'
  },
  es: {
    appTitle: 'Data-TestID Scanner',
    appDescription: 'Escanea todos los data-test-id de la página',
    scanButton: 'Escanear',
    exportButton: 'Exportar CSV',
    copyButton: 'Copiar',
    elementType: 'Tipo de Elemento',
    actions: 'Acciones',
    emptyScan: 'Haga clic en "Escanear" para enumerar todos los data-test-id',
    totalElements: 'Total de elementos encontrados',
    scanning: 'Escaneando...',
    copied: '¡Copiado!',
    copy: 'Copiar',
    exportedSuccess: '¡CSV exportado exitosamente!',
    noDataToExport: 'Sin datos para exportar',
    noDataToCopy: 'Sin datos para copiar',
    noDataFound: 'No se encontró data-test-id',
    errorScanning: 'Error al acceder a la página. Recargue e intente de nuevo.',
    errorScanningSub: 'Error de escaneo: ',
    elementsFound: 'elemento(s) encontrado(s)'
  }
};

let currentLanguage = 'pt';
let scannedData = [];

// Elementos do DOM
const scanBtn = document.getElementById('scanBtn');
const exportBtn = document.getElementById('exportBtn');
const copyBtn = document.getElementById('copyBtn');
const tableBody = document.getElementById('tableBody');
const totalCount = document.getElementById('totalCount');
const infoBox = document.getElementById('infoBox');
const infoText = document.getElementById('infoText');
const languageSelect = document.getElementById('languageSelect');

// Função de tradução
function t(key) {
  return translations[currentLanguage][key] || translations['pt'][key];
}

// Atualiza todos os textos da página
function updatePageLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });

  // Atualizar tabela se houver dados
  if (scannedData.length > 0) {
    renderTable();
  } else {
    updateEmptyTableMessage();
  }
}

// Atualiza mensagem vazia da tabela
function updateEmptyTableMessage() {
  const emptyRow = tableBody.querySelector('tr');
  if (emptyRow && emptyRow.children.length === 1) {
    const td = emptyRow.querySelector('td');
    if (scannedData.length === 0) {
      td.textContent = t('emptyScan');
    } else {
      td.textContent = t('noDataFound');
    }
  }
}

// Evento de mudança de idioma
languageSelect.addEventListener('change', (e) => {
  currentLanguage = e.target.value;
  chrome.storage.local.set({ preferredLanguage: currentLanguage });
  updatePageLanguage();
});

// Carrega idioma salvo
chrome.storage.local.get(['preferredLanguage'], (result) => {
  if (result.preferredLanguage) {
    currentLanguage = result.preferredLanguage;
    languageSelect.value = currentLanguage;
  }
  updatePageLanguage();
});

// Evento do botão Escanear
scanBtn.addEventListener('click', async () => {
  scanBtn.disabled = true;
  const originalHtml = scanBtn.innerHTML;
  scanBtn.innerHTML = '<i class="ph ph-spinning-loader animate-spin"></i> <span>' + t('scanning') + '</span>';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'getDataTestIds' },
      (response) => {
        if (chrome.runtime.lastError) {
          showError(t('errorScanning'));
          scanBtn.disabled = false;
          scanBtn.innerHTML = originalHtml;
          return;
        }

        if (response && response.success) {
          scannedData = response.data;
          renderTable();
          showInfo(`${scannedData.length} ${t('elementsFound')}`);
          exportBtn.disabled = false;
          copyBtn.disabled = false;
        }

        scanBtn.disabled = false;
        scanBtn.innerHTML = originalHtml;
      }
    );
  } catch (error) {
    showError(t('errorScanningSub') + error.message);
    scanBtn.disabled = false;
    scanBtn.innerHTML = originalHtml;
  }
});

// Renderiza a tabela com os dados
function renderTable() {
  if (scannedData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4" class="px-4 py-8 text-center text-gray-400">${t('noDataFound')}</td></tr>`;
    totalCount.textContent = '0';
    return;
  }

  tableBody.innerHTML = scannedData
    .map((item, index) => `
      <tr class="border-b border-gray-100 hover:bg-blue-50 transition">
        <td class="px-4 py-3 text-gray-500 font-mono text-xs">${index + 1}</td>
        <td class="px-4 py-3">
          <code class="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-blue-600 break-all">
            ${escapeHtml(item.dataTestId)}
          </code>
        </td>
        <td class="px-4 py-3">
          <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
            ${escapeHtml(item.tagName)}
          </span>
        </td>
        <td class="px-4 py-3 text-center">
          <button
            class="copy-item-btn text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center justify-center gap-1 mx-auto"
            data-index="${index}"
            title="${t('copy')}"
          >
            <i class="ph ph-copy text-sm"></i>
            ${t('copy')}
          </button>
        </td>
      </tr>
    `)
    .join('');

  totalCount.textContent = scannedData.length;

  // Adiciona event listeners para os botões de copiar individual
  document.querySelectorAll('.copy-item-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.closest('.copy-item-btn').dataset.index);
      copyToClipboard(scannedData[index].dataTestId);
      const oldHtml = btn.innerHTML;
      btn.innerHTML = `<i class="ph ph-check text-sm"></i> ${t('copied')}`;
      btn.classList.remove('text-blue-600', 'hover:text-blue-800');
      btn.classList.add('text-green-600');
      setTimeout(() => {
        btn.innerHTML = oldHtml;
        btn.classList.add('text-blue-600', 'hover:text-blue-800');
        btn.classList.remove('text-green-600');
      }, 2000);
    });
  });
}

// Exporta os dados como CSV
exportBtn.addEventListener('click', () => {
  if (scannedData.length === 0) {
    showError(t('noDataToExport'));
    return;
  }

  const csvContent = [
    ['#', 'data-test-id', t('elementType')],
    ...scannedData.map((item, index) => [index + 1, item.dataTestId, item.tagName])
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `data-test-ids-${new Date().getTime()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showInfo(t('exportedSuccess'));
});

// Copia todos os data-test-id para o clipboard
copyBtn.addEventListener('click', () => {
  if (scannedData.length === 0) {
    showError(t('noDataToCopy'));
    return;
  }

  const textToCopy = scannedData
    .map((item, index) => `${index + 1}. ${item.dataTestId} (${item.tagName})`)
    .join('\n');

  copyToClipboard(textToCopy);
  const originalHtml = copyBtn.innerHTML;
  copyBtn.innerHTML = `<i class="ph ph-check"></i> <span>${t('copied')}</span>`;
  copyBtn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
  copyBtn.classList.add('bg-green-600', 'hover:bg-green-700');
  setTimeout(() => {
    copyBtn.innerHTML = originalHtml;
    copyBtn.classList.add('bg-purple-600', 'hover:bg-purple-700');
    copyBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
  }, 2000);
});

// Função auxiliar para copiar para o clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch((err) => {
    console.error('Erro ao copiar:', err);
  });
}

// Função auxiliar para escapar HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Mostra mensagem de sucesso
function showInfo(message) {
  infoText.textContent = message;
  infoBox.classList.remove('hidden', 'bg-red-50', 'border-red-200');
  infoBox.classList.add('bg-blue-50', 'border-blue-200');
  infoBox.querySelector('i').classList.remove('text-red-700');
  infoBox.querySelector('i').classList.add('text-blue-700');
  infoText.classList.remove('text-red-700');
  infoText.classList.add('text-blue-700');
  setTimeout(() => {
    infoBox.classList.add('hidden');
  }, 4000);
}

// Mostra mensagem de erro
function showError(message) {
  infoText.textContent = message;
  infoBox.classList.remove('hidden', 'bg-blue-50', 'border-blue-200');
  infoBox.classList.add('bg-red-50', 'border-red-200');
  infoBox.querySelector('i').classList.remove('text-blue-700');
  infoBox.querySelector('i').classList.add('text-red-700');
  infoText.classList.remove('text-blue-700');
  infoText.classList.add('text-red-700');
  setTimeout(() => {
    infoBox.classList.add('hidden');
  }, 4000);
}
