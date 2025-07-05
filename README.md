# Carrinho Consciente Prototype

Este projeto é um protótipo do aplicativo "Carrinho Consciente", que permite aos usuários criar listas de compras e utilizar a tecnologia de reconhecimento óptico de caracteres (OCR) para escanear preços diretamente das etiquetas. O aplicativo atualiza o total da compra em tempo real e armazena as informações em um banco de dados.

## Blueprint do Projeto

- Interface web minimalista voltada para resoluções de smartphone (vertical/retrato)
- Opção de criar ou abrir uma lista existente
- A opção de criar permite dar um título e inserir: itens, quantidade e preço
- A opção de abrir permite visualizar listas já criadas e seus itens além do botão de exclusão da lista
- O usuário pode marcar itens e o subtotal da compra é calculado com base no preço inserido x qtd
- Ao lado do preço existe um botão que permite o usuário abrir a câmera do celular para escanear a etiqueta de preço
- O sistema identifica o preço por OCR e insere automaticamente no campo de text input, permitindo a edição por ser um campo editável no html

O objetivo é facilitar as minhas compras no mercado, como será um app pessoal não tem problema especializar o OCR nas etiquetas mais comuns da minha região, com fundo branco e numeração preta, moeda em Reais e qtd por unidade ou kg.

Construa de maneira simples sem stacks excessivos ou serviços mirabolantes, o simples que puder realizar essa tarefa, com design atualizado, será de bom tamanho.

Por enquanto usaremos o armazenamento local do dispositivo, elabore a persistência dos arquivos.

O serviço será hospedado no clourflare pages e workers, também elabore a lógica de configuração e comandos build necessários. antes vamos testar via live server pela rede local antes de subir no cloudflare.

