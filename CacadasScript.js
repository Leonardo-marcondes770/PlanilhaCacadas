function gerarCacadas() {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  
  const abaListas = planilha.getSheetByName("Arquivo");  // onde estão os dados
  const abaDestino = planilha.getSheetByName("Quadro de Postagens"); // onde serão colocadas as postagens

  celulaTempo = planilha.getRange("O2");

  const hoje = new Date()
  const formatted = Utilities.formatDate(hoje, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm ");
  celulaTempo.setValue(formatted);

  if (!abaListas) throw new Error("A aba 'Listas' não foi encontrada!");
  if (!abaDestino) throw new Error("A aba 'Caçadas' não foi encontrada!");

  // Listas
  const nomes = abaListas.getRange("A2:A").getValues().flat().filter(String);
  const descricoes = abaListas.getRange("B2:B").getValues().flat().filter(String);
  const ranks = abaListas.getRange("C2:C").getValues().flat().filter(String);
  const graus = abaListas.getRange("D2:D").getValues().flat().filter(String);

  // Estrutura normal das postagens
  const colunas = ["B", "D", "F", "H", "J", "L"]; // 6 colunas
  const blocos = [
    [2, 3, 4, 5, 6, 7, 8],   // primeira postagem (linhas 2–7)
    [10, 11, 12, 13, 14, 15, 16], // segunda postagem (linhas 10–15)
    [18, 19, 20, 21, 22, 23, 24] // terceira postagem (linhas 18–23)
  ];

  let indicesNomes = Array.from({length: nomes.length}, (_, i) => i);
  indicesNomes = embaralharArray(indicesNomes);

  // Gerando postagens
  for (let c = 0; c < colunas.length; c++) {
    const coluna = colunas[c];
    for (let b = 0; b < blocos.length; b++) {
      const linhas = blocos[b];

      // Nome e descrição pareados
      const indiceNome = indicesNomes.shift();
      const nomeEscolhido = nomes[indiceNome];
      const descricaoEscolhida = descricoes[indiceNome] || "";

      const tipo = Math.random() < 0.5 ? "Eliminação" : "Captura";
      const narracao = Math.random() < 0.5 ? "Narrada" : "Autonarrada";

      const rank = escolherAleatorio(ranks);
      const grau = escolherAleatorio(graus);

      const recompensa = gerarRecompensa(rank, tipo, narracao, grau);

      // Preenche os campos na aba caçadas
      abaDestino.getRange(coluna + linhas[0]).setValue(nomeEscolhido);
      abaDestino.getRange(coluna + linhas[1]).setValue(tipo);
      abaDestino.getRange(coluna + linhas[2]).setValue(`${descricaoEscolhida}\n`);
      abaDestino.getRange(coluna + linhas[3]).setValue(`${grau} e Rank ${rank}`);
      abaDestino.getRange(coluna + linhas[4]).setValue(narracao);
      abaDestino.getRange(coluna + linhas[5]).setValue(recompensa);
      abaDestino.getRange(coluna + linhas[6]).setValue("[Jogador]");
    }
  }
}

// Função auxiliar pra escolher um item aleatório de uma lista
function escolherAleatorio(lista) {
  if (!lista || lista.length === 0) return "";
  return lista[Math.floor(Math.random() * lista.length)];
}

function gerarRecompensa(rank, tipo, narracao, grau) {
  // Base
  let renome = 50;
  //const xpTrabalho = 100; // sempre fixo
  let xp = 0;
  let dinheiro = 0;
  let bonusExtra = "";

  // --- Dinheiro por Rank ---
  const valoresRank = {
    "F": 50000,
    "E": 80000,
    "D": 100000,
    "C": 130000,
    "B": 150000,
    "A": 200000,
    "S": 250000,
    "SS": 350000
  };
  dinheiro += valoresRank[rank] || 0;

  // Bônus por Tipo
  if (tipo === "Eliminação") {
    bonusExtra += "+1 Cristal de Maldição\n";
  } else if (tipo === "Captura") {
    xp += 150;
  }

  // Bônus por Narraçã
  if (narracao && !narracao.toLowerCase().includes("autonarrada")) {
    dinheiro += 30000;
    renome += 50;
    xp += 50;

    // bônus de narrador
    const quarto = Math.round((valoresRank[rank] / 4) / 5) * 5; // arredonda ao múltiplo de 5
    bonusExtra += `\nRecompensa de Narrador: \n+200 XP + ${(50000 + quarto).toLocaleString("pt-BR")}¥\n\n`;
  }

  // Bônus por Grau
  const bonusGrau = {
    "Grau 4": 200,
    "Grau 3": 250,
    "Grau 2": 300,
    "Grau 1": 350,
    "Grau Especial": 500
  };
  if (grau && bonusGrau[grau]) {
    xp += bonusGrau[grau];
  }

  // Montagem final
  let recompensa = `${dinheiro.toLocaleString("pt-BR")}¥\n`;
  recompensa += `${renome} Renome\n`;
  //recompensa += `${xpTrabalho} XP de Trabalho\n`;
  if (xp > 0) recompensa += `${xp} XP\n`;
  if (bonusExtra) recompensa += bonusExtra;

  return recompensa.trim();
}

function embaralharArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
