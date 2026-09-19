# AchadoEsperto Site

Site público do AchadoEsperto, publicado automaticamente pela Vercel a partir da branch `main`.

## Fluxo de publicação

1. Alterações são feitas neste repositório.
2. O Vercel detecta commits na `main`.
3. O deploy é automático em https://achadoesperto-site.vercel.app/

## Produtos

A fonte de dados atual é `assets/js/products.js`.

Cada produto possui:
- nome, categoria e descrição;
- imagens;
- link de afiliado;
- especificações e benefícios;
- URL da página de detalhes.

As páginas usam uma estrutura única e dinâmica em `/produto/?id=<slug>`, portanto novos produtos não exigem recriar o site.

## Links de oferta

Os botões **Ver oferta** apontam diretamente para o link de afiliado da loja em uma nova aba. Não dependem de rotas internas para funcionar.

## Transparência

Preço, estoque, frete e cupons pertencem à loja parceira e podem mudar. Alguns links podem gerar comissão de afiliado sem custo adicional para o visitante.
