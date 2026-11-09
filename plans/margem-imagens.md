# Margem — fotos de demonstração

Fotos de demonstração do template Margem (estúdio fictício de design de marcas no Recife). Todas vêm do Unsplash,
sob a [Unsplash License](https://unsplash.com/license): uso comercial livre, sem atribuição obrigatória (nenhuma é
Unsplash+). Os dados ficam em `packages/site-builder/src/templates/margem/images.ts`; o usuário troca qualquer foto no
editor do site.

Critérios: luz natural suave, paleta quente (off-white, terracota, verde-floresta), sem marca real legível como assunto,
sem rosto reconhecível, sem imagem gerada por IA. As 35 foram conferidas com HTTP 200 + `access-control-allow-origin`
no CDN (são desenhadas em WebGL) e vistas uma a uma.

**Pendência:** copiar os arquivos para o storage do Atlas e trocar os IDs por URLs próprias antes de depender delas em
produção.

Base da URL: `https://images.unsplash.com/photo-<id>`. "Página" é o link da foto no Unsplash, quando conhecido.

| Papel | URL | Página no Unsplash | Autor | Original | O que mostra |
| --- | --- | --- | --- | --- | --- |
| t01 | `https://images.unsplash.com/photo-1780660231448-7f0aa4d236e9` | [7I0rU4R1OA8](https://unsplash.com/photos/7I0rU4R1OA8) | Monaz Hastam | 4016×6016, 0,668 | Sacos kraft empilhados com etiquetas brancas |
| t02 | `https://images.unsplash.com/photo-1597696929736-6d13bed8e6a8` | [R0qthXq3jec](https://unsplash.com/photos/R0qthXq3jec) | Chloe Bolton | 5881×3921, 1,5 | Coleção de vasos de cerâmica em tons neutros sobre madeira |
| t03 | `https://images.unsplash.com/photo-1790345835845-bda0548978b2` | — | Sergio Alcázar Mondéjar | 4000×3000, 1,333 | Brochura aberta ("Gráfico") sobre madeira clara |
| t04 | `https://images.unsplash.com/photo-1633414654227-2b5ea828b3ef` | — | Brando Makes Branding | 3900×2600, 1,5 | Sacola kraft lisa sobre bancada de mármore |
| t05 | `https://images.unsplash.com/photo-1793100123538-396050d9f5c1` | [Yt-PlvbOGGs](https://unsplash.com/photos/Yt-PlvbOGGs) | Nataliya Melnychuk | 4160×6240, 0,667 | Frasco âmbar conta-gotas sobre pedra, sombra de palmeira (Âmbar Botica) |
| t06 | `https://images.unsplash.com/photo-1676747995218-5c38799cd71b` | — | SJ Objio | 4160×6240, 0,667 | Parede de reboco terracota, textura de barro (Taipa) |
| t07 | `https://images.unsplash.com/photo-1579101403413-a02d6b3727fa` | — | Katsia Jazwinska | 4896×3264, 1,5 | Mesa posta: pratos brancos, linho terracota e conchas (Sururu) |
| t08 | `https://images.unsplash.com/photo-1436918898788-ebce04d38e46` | — | Bruno Martins | 5279×3519, 1,5 | Tipos de madeira de letterpress numa estante |
| t09 | `https://images.unsplash.com/photo-1654124803533-a51f169e1971` | — | Kelly Sikkema | 3712×5568, 0,667 | Livro encadernado em tecido cru com lombada vermelha |
| t10 | `https://images.unsplash.com/photo-1592119748016-a61c40a44320` | — | a confirmar (servida por images.unsplash.com, não plus.unsplash.com: não é Unsplash+) | 2333×3500, 0,667 | Garrafa com rótulo em branco sobre mesa de madeira, parede de tijolo (Engenho Vau). Trocada: a primeira escolha tinha rótulos de uma marca provavelmente real |
| t11 | `https://images.unsplash.com/photo-1725169412537-acd1cd15e10f` | [M4ZGZwkraVs](https://unsplash.com/photos/M4ZGZwkraVs) | Ionela Mat | 5717×3811, 1,5 | Copos de cerâmica empilhados em tons pastel, luz de janela |
| t12 | `https://images.unsplash.com/photo-1498075702571-ecb018f3752d` | — | Kelly Sikkema | 3000×1982, 1,514 | Mão fazendo lettering a lapiseira em papel vegetal |
| t13 | `https://images.unsplash.com/photo-1677753670021-123aba554171` | — | Ian Talmacs | 5828×3885, 1,5 | Sacola de papel com padrão gráfico rosa e verde-petróleo |
| t14 | `https://images.unsplash.com/photo-1778567148288-233997494476` | — | Avtar Singh | 3000×2000, 1,5 | Cartão de visita em branco sobre tecido amassado |
| t15 | `https://images.unsplash.com/photo-1576501161309-37635f837061` | — | karl muscat | 2808×3983, 0,705 | Placa de madeira "Farmshop" em fachada de tijolo |
| t16 | `https://images.unsplash.com/photo-1791831611666-ce460985a9b1` | — | Pierre Bamin | 5472×3648, 1,5 | Pilha de papéis artesanais coloridos de borda irregular |
| t17 | `https://images.unsplash.com/photo-1558707538-c56435bdcdf3` | — | Claudio Schwarz | 7952×5304, 1,499 | Parede de cartazes tipográficos em preto, branco e laranja (Maré Mansa) |
| t18 | `https://images.unsplash.com/photo-1557499305-bd68d0ad468d` | — | Louis Hansel | 4879×2942, 1,658 | Capas de cardápio kraft "Food" / "Menu" (Prato Raso) |
| t19 | `https://images.unsplash.com/photo-1536936812504-0e77dc3f0b40` | [CipURjPCXOo](https://unsplash.com/photos/CipURjPCXOo) | Katja Vogt | 3977×5965, 0,667 | Canecas artesanais numa prateleira |
| t20 | `https://images.unsplash.com/photo-1679941279735-b3b35e8bc476` | [JwTJ4t4aKPc](https://unsplash.com/photos/JwTJ4t4aKPc) | Anita Austvika | 4584×6880, 0,666 | Pote de mel com tampa de linho e rótulo hexagonal sem marca (Jandaíra) |
| t21 | `https://images.unsplash.com/photo-1777151409209-8bdbbe478497` | — | Adam Kring | 5419×3613, 1,5 | Placa pintada à mão "Groceries / Snacks" em verde-escuro (Feira Aurora) |
| t22 | `https://images.unsplash.com/photo-1790861286814-0fcb8ed0a4c9` | — | Vitalii Abakumov | 6240×4160, 1,5 | Embalagem kraft lisa selada sobre fundo branco |
| t23 | `https://images.unsplash.com/photo-1635621456241-16e4a3a009a0` | — | Saturday Books | 6667×10000, 0,667 | Revista aberta, matéria "Island Life" com foto (Quadrante) |
| t24 | `https://images.unsplash.com/photo-1643569556871-91ec60671ed7` | [giRMqme_f-Q](https://unsplash.com/photos/giRMqme_f-Q) | Jocelyn Morales | 2681×3681, 0,728 | Vaso de cerâmica bege em forma de anel (foto no lugar da palavra "cerâmica") |
| t25 | `https://images.unsplash.com/photo-1675552561484-f11fca689bc4` | — | Kelly Sikkema | 4529×6794, 0,667 | Envelopes kraft e laranja em grade sobre preto (Casa Cajá) |
| t26 | `https://images.unsplash.com/photo-1633504798516-2cf5e3f94621` | — | Agnivesh Jayadeep | 6480×8100, 0,8 | Dois livros em tecido, vinho e petróleo, sem título |
| t27 | `https://images.unsplash.com/photo-1508368941103-de02f9ad7b4d` | — | Katherine Hanlon | 5100×3300, 1,545 | Livro botânico aberto ao lado de flores |
| t28 | `https://images.unsplash.com/photo-1755830806360-f0d49b40994b` | — | Russel Bailo | 5184×3456, 1,5 | Letreiro "Cinema" de lâmpadas, vermelho sobre madeira (Cine Ladeira) |
| destaque torra-alta | `https://images.unsplash.com/photo-1695245503558-5cdb37f49092` | [wizWrRZJXSg](https://unsplash.com/photos/wizWrRZJXSg) | With Mahdy | 5906×3937, 1,5 | Saco de café kraft sem marca, fundo areia |
| destaque sol | `https://images.unsplash.com/photo-1610701596007-11502861dcfa` | [NPPIq1XFdck](https://unsplash.com/photos/NPPIq1XFdck) | Vladimir Gladkov | 5184×3456, 1,5 | Copos de cerâmica artesanal (esmalte creme e base crua) |
| destaque restinga | `https://images.unsplash.com/photo-1741118806217-1f38e2faa6be` | — | Alisa Bright | 5184×3456, 1,5 | Livro em tecido verde sobre madeira, com folhas e lápis de galho |
| destaque preamar | `https://images.unsplash.com/photo-1759488820765-5cf0755965ea` | — | Dawn Patrol Surf Tracking | 5120×3414, 1,5 | Mão segurando celular com app de surfe diante do mar e da praia |
| método rascunho | `https://images.unsplash.com/photo-1742130847739-f7728ae50176` | — | pure julia | 3168×4752, 0,667 | Caderno espiral com esboços a lápis e lápis ao lado |
| método sistema | `https://images.unsplash.com/photo-1740324974144-046b3538e89e` | — | Annie Spratt | 5162×6556, 0,787 | Amostras de papel artesanal em tons terracota, rosa e branco (paleta) |
| método rua | `https://images.unsplash.com/photo-1777451440988-3995bb93f78f` | — | Nguyen Phuc Hau | 6000×4000, 1,5 | Sacos de café em prateleira de madeira de uma loja, luz quente |
