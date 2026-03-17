# Como Instalar a Extensão Data-TestID Scanner

## Método 1: Carregar Extensão Descompactada (Recomendado para Desenvolvimento)

1. Abra o Chrome/Edge e vá para `chrome://extensions/` ou `edge://extensions/`
2. Ative o **"Modo do desenvolvedor"** (canto superior direito)
3. Clique em **"Carregar sem compactação"** (Load unpacked)
4. Selecione a pasta raiz do projeto (`data-test-id-scanner`)
5. A extensão será carregada e habilitada automaticamente

## Método 2: Instalar Extensão Compactada

### ⚠️ Nota Importante

Se o botão de habilitar não fica ativo ao instalar o ZIP, pode ser por um dos seguintes motivos:

1. **Chrome bloqueia extensões não verificadas**
   - Solução: Use o Método 1 (carregar descompactado)
   - Ou: Ajuste as configurações de segurança do Chrome

2. **ZIP corrompido ou incompleto**
   - Execute `npm run build` para gerar um novo ZIP
   - Verifique se o arquivo `data-test-id-scanner.zip` foi criado

3. **Permissões insuficientes**
   - Verifique se o Chrome tem permissão para acessar o arquivo

### Passos para Instalação Compactada

1. Execute `npm run build` para gerar o arquivo ZIP
2. Abra `chrome://extensions/`
3. Ative o **"Modo do desenvolvedor"**
4. Arraste o arquivo `data-test-id-scanner.zip` para a página de extensões
5. Se o botão de habilitar estiver disponível, clique nele

## Como Usar

1. Clique no ícone da extensão na barra do navegador
2. Ou use o botão flutuante que aparece no canto inferior direito da página
3. Clique em **"Escanear"** para listar todos os data-test-id da página

## Solução de Problemas

### Extensão não funciona após instalação

- Recarregue a página (F5)
- Verifique se há erros no console (F12)
- Tente reinstalar usando o Método 1

### Botão de habilitar não fica ativo

- Use o **Método 1** (carregar descompactado)
- Verifique se o Chrome está atualizado
- Reinicie o navegador

### Erro "Extension is invalid"

- O ZIP pode estar corrompido
- Execute `npm run build` novamente
- Verifique se todos os arquivos necessários estão no ZIP

## Desenvolvimento

Para desenvolvimento, sempre use o **Método 1** (Carregar sem compactação) para evitar ter que reempacotar a cada mudança.

### Recarregar a extensão

- Vá para `chrome://extensions/`
- Clique no ícone de recarregar 🔄 na extensão
- Ou recarregue a página onde está testando
