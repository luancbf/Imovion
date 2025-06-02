const cidadesComBairros: Record<string, string[]> = {
  Alta_Floresta: [
    'Centro', 'Jardim Universitário', 'Jardim Imperial', 'Jardim Panorama', 'Jardim das Araras', 'Jardim Primavera',
    'Jardim Oliveira', 'Jardim Renascer', 'Jardim Redentor', 'Jardim Flamboyant', 'Jardim do Lago', 'Jardim das Oliveiras',
    'Jardim Cidade Alta', 'Jardim Aeroporto', 'Jardim Europa', 'Jardim América', 'Jardim das Flores', 'Jardim dos Ipês',
    'Jardim das Palmeiras', 'Jardim das Violetas', 'Jardim Imperial II', 'Jardim Imperial III', 'Jardim Imperial IV',
    'Jardim Imperial V', 'Jardim Imperial VI', 'Jardim Imperial VII', 'Jardim Imperial VIII', 'Jardim Imperial IX',
    'Jardim Imperial X', 'Jardim Imperial XI', 'Jardim Imperial XII', 'Jardim Imperial XIII', 'Jardim Imperial XIV',
    'Jardim Imperial XV', 'Jardim Imperial XVI', 'Jardim Imperial XVII', 'Jardim Imperial XVIII', 'Jardim Imperial XIX',
    'Jardim Imperial XX', 'Jardim Imperial XXI', 'Jardim Imperial XXII', 'Jardim Imperial XXIII', 'Jardim Imperial XXIV',
    'Jardim Imperial XXV', 'Jardim Imperial XXVI', 'Jardim Imperial XXVII', 'Jardim Imperial XXVIII', 'Jardim Imperial XXIX',
    'Jardim Imperial XXX', 'Jardim Imperial XXXI', 'Jardim Imperial XXXII', 'Jardim Imperial XXXIII', 'Jardim Imperial XXXIV',
    'Jardim Imperial XXXV', 'Jardim Imperial XXXVI', 'Jardim Imperial XXXVII', 'Jardim Imperial XXXVIII', 'Jardim Imperial XXXIX',
    'Jardim Imperial XL', 'Jardim Imperial XLI', 'Jardim Imperial XLII', 'Jardim Imperial XLIII', 'Jardim Imperial XLIV',
    'Jardim Imperial XLV', 'Jardim Imperial XLVI', 'Jardim Imperial XLVII', 'Jardim Imperial XLVIII', 'Jardim Imperial XLIX',
    'Jardim Imperial L'
  ],
  Araputanga: [
    'Centro', 'Jardim Imperial', 'Jardim Primavera', 'Jardim Aeroporto', 'Jardim América', 'Jardim Bela Vista',
    'Jardim das Flores', 'Jardim dos Ipês', 'Jardim Europa', 'Jardim Glória', 'Jardim Paraíso', 'Jardim Paulista',
    'Jardim Planalto', 'Jardim São José', 'Jardim São Paulo', 'Jardim União', 'Vila Nova', 'Vila Rica', 'Vila União'
  ],
  Barra_do_Bugres: [
    'Centro', 'Jardim Imperial', 'Jardim Paraíso', 'Jardim Primavera', 'Jardim América', 'Jardim Bela Vista',
    'Jardim das Palmeiras', 'Jardim dos Ipês', 'Jardim Europa', 'Jardim Glória', 'Jardim Paulista', 'Jardim Planalto',
    'Jardim São José', 'Jardim São Paulo', 'Jardim União', 'Vila Nova', 'Vila Rica', 'Vila União', 'Vila São João'
  ],
  Barra_do_Garças: [
    'Centro', 'Novo Horizonte', 'Jardim Pitaluga', 'Jardim Araguaia', 'Jardim Amazônia', 'Jardim Nova Barra',
    'Vila Maria', 'Vila Santo Antônio', 'Jardim dos Ipês', 'Jardim das Palmeiras', 'Jardim das Acácias',
    'Jardim das Mangueiras', 'Jardim das Oliveiras', 'Jardim das Paineiras', 'Jardim das Violetas',
    'Jardim Esmeralda', 'Jardim Europa', 'Jardim Imperial', 'Jardim Nova Esperança', 'Jardim Nova Era',
    'Jardim Nova União', 'Jardim Paraíso', 'Jardim Piracema', 'Jardim Planalto', 'Jardim Primavera',
    'Jardim Progresso', 'Jardim Santo Antônio', 'Jardim São José', 'Jardim São Paulo', 'Jardim União',
    'Setor Industrial', 'Setor Universitário', 'Vila Delfino', 'Vila Maria', 'Vila Real', 'Vila São João'
  ],
  Cáceres: [
    'Centro', 'Jardim Paraíso', 'Jardim Imperial', 'Jardim Cidade Nova', 'Jardim Panorama', 'Jardim Universitário',
    'Jardim Guanabara', 'Jardim Padre Paulo', 'Jardim das Oliveiras', 'Jardim das Palmeiras', 'Jardim das Acácias',
    'Jardim das Araras', 'Jardim das Flores', 'Jardim dos Ipês', 'Jardim Europa', 'Jardim Primavera',
    'Jardim São Luiz', 'Jardim São Paulo', 'Jardim União', 'Maracanãzinho', 'Maracanã', 'Nova Era',
    'Parque das Águas', 'Parque Universitário', 'Planalto', 'Santo Antônio', 'Santo Expedito', 'Santo Onofre',
    'Santos Dumont', 'São José', 'Vila Irene', 'Vila Mariana', 'Vila Nova', 'Vila Real', 'Vila Santo Antônio'
  ],
  Campo_Novo_do_Parecis: [
    'Centro', 'Jardim das Palmeiras', 'Jardim das Flores', 'Jardim Itália', 'Jardim Primavera',
    'Jardim Bela Vista', 'Jardim das Acácias', 'Jardim dos Ipês', 'Jardim Europa', 'Jardim Imperial',
    'Jardim Paraíso', 'Jardim São Paulo', 'Jardim União', 'Parque das Águas', 'Residencial Buritis',
    'Residencial Jardim das Palmeiras', 'Residencial Jardim Itália', 'Residencial Jardim Primavera',
    'Residencial Jardim União', 'Residencial Paraíso', 'Residencial São Paulo', 'Vila Nova', 'Vila Rica'
  ],
  Canarana: [
    'Centro', 'Jardim União', 'Jardim Primavera', 'Jardim Bela Vista', 'Jardim Imperial', 'Jardim Paraíso',
    'Jardim das Flores', 'Jardim dos Ipês', 'Jardim Europa', 'Jardim América', 'Jardim das Palmeiras',
    'Jardim São Paulo', 'Jardim Vitória', 'Setor Industrial', 'Setor Leste', 'Setor Oeste', 'Setor Sul',
    'Vila Nova', 'Vila Rica'
  ],
  Chapada_dos_Guimarães: [
    'Centro', 'Altos do Mirante', 'Cohab', 'Jardim da Chapada', 'Jardim das Palmeiras', 'Sol Nascente',
    'Vila Guimarães', 'Vila Real', 'Vila São Sebastião', 'Vila Nova', 'Vila Bom Jesus', 'Vila União',
    'Vila Santa Cruz', 'Vila Santa Bárbara', 'Vila Santa Clara', 'Vila Santa Luzia', 'Vila Santa Maria',
    'Vila São José', 'Vila São Pedro', 'Vila São Vicente', 'Vila Varginha', 'Comunidade Água Fria',
    'Comunidade Água Limpa', 'Comunidade Água Suja', 'Comunidade Bom Jardim', 'Comunidade Cachoeira Rica',
    'Comunidade Capão Verde', 'Comunidade Coxipó do Ouro', 'Comunidade Jangada Roncador', 'Comunidade Jatobá',
    'Comunidade Morro do Chapéu', 'Comunidade Paraíso', 'Comunidade Pindaíba', 'Comunidade Ponte Alta',
    'Comunidade Ribeirão do Ouro', 'Comunidade Rio da Casca', 'Comunidade Rio dos Peixes', 'Comunidade Santa Terezinha'
  ],
  Colíder: [
    'Centro', 'Jardim América', 'Jardim Imperial', 'Jardim Primavera'
  ],
  Cuiabá: [
    'Centro', 'Alvorada', 'Altos do Coxipó', 'Altos da Serra', 'Altos do Parque', 'Areão', 'Araés', 'Bela Vista',
    'Boa Esperança', 'Bosque da Saúde', 'Cohab São Gonçalo', 'Coophema', 'Coophamil', 'CPA', 'CPA I', 'CPA II', 'CPA III', 'CPA IV',
    'Coxipó', 'Desbarrancado', 'Dom Aquino', 'Duque de Caxias', 'Fazendinha', 'Jardim Aclimação', 'Jardim América',
    'Jardim Califórnia', 'Jardim Cuiabá', 'Jardim das Américas', 'Jardim Europa', 'Jardim Florianópolis', 'Jardim Imperial',
    'Jardim Independência', 'Jardim Itália', 'Jardim Leblon', 'Jardim Mariana', 'Jardim Mossoró', 'Jardim Novo Colorado',
    'Jardim Paulista', 'Jardim Passaredo', 'Jardim Petrópolis', 'Jardim Primavera', 'Jardim Renascer', 'Jardim Santa Amália',
    'Jardim Santa Isabel', 'Jardim Santa Marta', 'Jardim Santa Rosa', 'Jardim São Gonçalo', 'Jardim Tropical', 'Jardim União',
    'Jardim Vitória', 'Jardim Industriário', 'Jardim Industriário I', 'Jardim Industriário II', 'Jardim Universitário',
    'Lixeira', 'Morada da Serra', 'Morada do Ouro', 'Novo Horizonte', 'Novo Mato Grosso', 'Novo Paraíso', 'Ouro Fino',
    'Parque Atalaia', 'Parque Cuiabá', 'Parque Georgia', 'Parque Ohara', 'Parque Residencial Universitário', 'Pedra 90',
    'Pico do Amor', 'Planalto', 'Ponte Nova', 'Porto', 'Praeiro', 'Quilombo', 'Recanto dos Pássaros', 'Residencial Belvedere',
    'Residencial Coxipó', 'Residencial Ilza Terezinha Picolli Pagot', 'Residencial Paiaguás', 'Residencial São Carlos',
    'Santa Cruz', 'Santa Helena', 'Santa Isabel', 'Santa Marta', 'Santa Rosa', 'Santo Antônio do Pedregal', 'São Francisco',
    'São Gonçalo', 'São João Del Rey', 'São Mateus', 'Sol Nascente', 'Três Barras', 'Verdão', 'Vila Aurora', 'Vila Birigui',
    'Vila Congonhas', 'Vila Operária', 'Vila Real', 'Vista Alegre', 'Despraiado', 'Distrito Industrial', 'Distrito Industrial I',
    'Distrito Industrial II', 'Distrito Industrial III'
  ],
  Guarantã_do_Norte: [
    'Centro', 'Jardim Vitória', 'Jardim América', 'Jardim Primavera'
  ],
  Jaciara: [
    'Centro', 'Jardim Aeroporto', 'Jardim Aurora', 'Jardim Esmeralda'
  ],
  Juara: [
    'Centro', 'Jardim América', 'Jardim Califórnia', 'Jardim Paranaguá', 'Jardim Primavera'
  ],
  Juína: [
    'Centro', 'Jardim América', 'Jardim Primavera', 'Jardim Universitário', 'Jardim São José'
  ],
  Lucas_do_Rio_Verde: [
    'Centro', 'Menino Deus', 'Jardim das Palmeiras', 'Jardim Imperial', 'Jardim Primavera', 'Parque das Emas',
    'Parque das Américas', 'Tessele Junior'
  ],
  Matupá: [
    'Centro', 'Jardim Primavera', 'Jardim América'
  ],
  Mirassol_d_Oeste: [
    'Centro', 'Jardim São Paulo', 'Jardim Imperial', 'Jardim Primavera'
  ],
  Nobres: [
    'Centro', 'Jardim Glória', 'Jardim Primavera'
  ],
  Nova_Mutum: [
    'Centro', 'Jardim das Orquídeas', 'Jardim América', 'Jardim Primavera', 'Jardim Imperial'
  ],
  Nossa_Senhora_do_Livramento: [
    'Centro', 'Comunidade Barreiro', 'Comunidade Capão Verde', 'Comunidade Engenho', 'Comunidade Mata Cavalo',
    'Comunidade Morrinhos', 'Comunidade Brejinho', 'Comunidade Baús', 'Comunidade Cangas', 'Comunidade Morrinho',
    'Comunidade Ribeirão do Ouro', 'Comunidade São Gonçalo Beira Rio', 'Comunidade Santa Luzia', 'Comunidade Santa Maria',
    'Comunidade São José', 'Comunidade São Lourenço', 'Comunidade São Pedro', 'Comunidade São Vicente', 'Comunidade Varginha'
  ],
  Peixoto_de_Azevedo: [
    'Centro', 'Jardim das Palmeiras', 'Jardim América', 'Jardim Primavera'
  ],
  Poconé: [
    'Centro', 'Cohab Nova', 'Jardim das Palmeiras', 'Jardim das Oliveiras', 'Jardim Planalto', 'Santa Tereza',
    'Jardim Aeroporto', 'Jardim Boa Esperança', 'Jardim das Acácias', 'Jardim dos Ipês', 'Jardim Primavera',
    'Jardim São Paulo', 'Jardim Vitória', 'Morada do Sol', 'Parque das Águas', 'Residencial São Benedito', 'Vila Nova'
  ],
  Pontes_e_Lacerda: [
    'Centro', 'Jardim Alvorada', 'Jardim Morada da Serra', 'Jardim Primavera', 'Jardim São Paulo'
  ],
  Primavera_do_Leste: [
    'Centro', 'Jardim Riva', 'Jardim Luciana', 'Jardim das Américas', 'Jardim Itália', 'Jardim Vitória',
    'Jardim São Cristóvão', 'Jardim Bela Vista'
  ],
  Rondonópolis: [
    'Centro', 'Vila Aurora', 'Jardim Atlântico', 'Parque Universitário', 'Jardim Sumaré', 'Jardim Tropical',
    'Jardim Liberdade', 'Jardim Iguaçu', 'Jardim Belo Horizonte', 'Jardim Santa Marta', 'Jardim Eldorado',
    'Jardim Adriana', 'Jardim Brasília', 'Jardim Buriti', 'Jardim Canaã', 'Jardim das Flores', 'Jardim das Paineiras',
    'Jardim Liberdade', 'Jardim Maracanã', 'Jardim Maria Vetorasso', 'Jardim Mato Grosso', 'Jardim Morumbi',
    'Jardim Paulista', 'Jardim Petrópolis', 'Jardim Primavera', 'Jardim Progresso', 'Jardim Rondônia',
    'Jardim Santa Clara', 'Jardim Santa Cruz', 'Jardim Santa Fé', 'Jardim Santa Maria', 'Jardim Santa Terezinha',
    'Jardim São Francisco', 'Jardim São João', 'Jardim São José', 'Jardim São Lourenço', 'Jardim São Luiz',
    'Jardim São Sebastião', 'Jardim Sion', 'Jardim Universitário', 'Parque das Laranjeiras', 'Parque Residencial Buriti',
    'Residencial Farias', 'Residencial Margaridas', 'Residencial Maria Amélia', 'Residencial Morumbi', 'Residencial Paraíso',
    'Residencial Sagrada Família', 'Residencial São José', 'Residencial Vila Rica', 'Vila Birigui', 'Vila Cardoso',
    'Vila Esperança', 'Vila Goulart', 'Vila Operária', 'Vila Paulista', 'Vila Planalto', 'Vila Roseli', 'Vila União'
  ],
  Rosário_Oeste: [
    'Centro', 'Jardim Primavera', 'Jardim Imperial'
  ],
  Sapezal: [
    'Centro', 'Jardim Primavera', 'Jardim Itália', 'Jardim das Flores'
  ],
  Sinop: [
    'Centro', 'Menino Jesus', 'Boa Esperança', 'Jardim Primavera', 'Jardim das Palmeiras', 'Jardim Imperial',
    'Jardim América', 'Jardim Violetas', 'Residencial Jequitibás', 'Residencial Daury Riva', 'Jardim Jacarandás',
    'Jardim Botânico', 'Jardim Celeste', 'Jardim das Acácias', 'Jardim das Azaléias', 'Jardim das Nações',
    'Jardim Europa', 'Jardim Florença', 'Jardim Itália', 'Jardim Maringá', 'Jardim Novo Estado', 'Jardim Oliveiras',
    'Jardim Orquídeas', 'Jardim Paraíso', 'Jardim Paulista', 'Jardim Pérola', 'Jardim São Cristóvão',
    'Jardim São Francisco', 'Jardim São Paulo', 'Jardim Veneza', 'Parque das Araras', 'Parque das Nações',
    'Residencial Brasília', 'Residencial Cidade Jardim', 'Residencial Gente Feliz', 'Residencial Paris',
    'Residencial Sul', 'Setor Comercial', 'Setor Industrial', 'Setor Residencial Norte', 'Setor Residencial Sul',
    'Vila América', 'Vila Mariana', 'Vila Nova', 'Vila Rica'
  ],
  Sorriso: [
    'Centro', 'São Domingos', 'Jardim Aurora', 'Jardim Primavera', 'Jardim Bela Vista', 'Jardim Carolina',
    'Jardim Itália', 'Jardim dos Ipês', 'Residencial Mário Raiter'
  ],
  Santo_Antonio_do_Leverger: [
    'Centro', 'Barra do Aricá', 'Barra do São Lourenço', 'Engenho Velho', 'Faval', 'Mimoso', 'Pirizal',
    'Comunidade Agrovila das Palmeiras', 'Comunidade Agrovila das Palmeiras II', 'Comunidade Bom Sucesso',
    'Comunidade Capão Grande', 'Comunidade Capão Verde', 'Comunidade Coxipó do Ouro', 'Comunidade Morrinhos',
    'Comunidade Passagem da Conceição', 'Comunidade Pindaíba', 'Comunidade Piraim', 'Comunidade Porto de Fora',
    'Comunidade Porto de Fora II', 'Comunidade Santa Luzia', 'Comunidade Santa Maria', 'Comunidade São Gonçalo',
    'Comunidade São Lourenço', 'Comunidade São Pedro', 'Comunidade São Vicente', 'Comunidade Varginha'
  ],
  Tangará_da_Serra: [
    'Centro', 'Jardim dos Ipês', 'Vila Alta', 'Jardim Europa', 'Jardim Shangri-lá', 'Jardim Tarumã',
    'Jardim Califórnia', 'Jardim Paraíso', 'Jardim Presidente'
  ],
  Várzea_Grande: [
    'Centro', 'Aeroporto', 'Água Vermelha', 'Alameda', 'Altos da Serra', 'Bonsucesso', 'Capão Grande',
    'Cohab Cristo Rei', 'Cohab Dom Orlando Chaves', 'Cohab Jaime Campos', 'Cohab Nossa Senhora da Guia',
    'Cohab Primavera', 'Cohab Santa Isabel', 'Cohab São Gonçalo', 'Cohab São Mateus', 'Cohab São Simão',
    'Cohab Serra Dourada', 'Cohab União', 'Cristo Rei', 'Costa Verde', 'Figueirinha', 'Formigueiro',
    'Glória', 'Imperial', 'Ipiranga', 'Jardim Aeroporto', 'Jardim América', 'Jardim Atlântico',
    'Jardim Bela Vista', 'Jardim Eldorado', 'Jardim Glória', 'Jardim Imperial', 'Jardim Ipanema',
    'Jardim Itororó', 'Jardim Marajoara', 'Jardim Mariana', 'Jardim Nova Era', 'Jardim Novo Mundo',
    'Jardim Ouro Verde', 'Jardim Paula I', 'Jardim Paula II', 'Jardim Potiguar', 'Jardim Primavera',
    'Jardim União', 'Jardim Vitória', 'Jardim dos Estados', 'Jardim dos Ipês', 'Jardim dos Lagos',
    'Mapim', 'Marajoara', 'Manga', 'Nova Várzea Grande', 'Parque do Lago', 'Parque Paiaguás',
    'Ponte Nova', 'Residencial São Benedito', 'São Mateus', 'Tarumã', 'Unipark', 'Vila Arthur',
    'Vila Sadia', 'Vila Operária', 'Vila Rica', 'Vila São João', 'Vila União', 'Vila Vitória'
  ],
  Vila_Rica: [
    'Centro', 'Jardim Primavera', 'Jardim América'
  ]
};

export default cidadesComBairros;