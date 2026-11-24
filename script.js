// =====================================================
// REFLORESER - JAVASCRIPT
// -----------------------------------------------------
// 1. Valores de referência (com fonte)
// 2. Elementos da página
// 3. Utilidades
// 4. Ler as respostas do questionário
// 5. Cálculos de água, energia e alimentos
// 6. Monitor ao vivo (instrumentos animados)
// 7. Etapas do questionário
// 8. Laudo (resultado completo)
// 9. Iniciativas de Foz do Iguaçu
// 10. Ações sustentáveis e painel de impacto
// 11. Início: liga tudo quando a página abre
// =====================================================


// =====================================================
// 1. VALORES DE REFERÊNCIA
// Todos aparecem na tabela "Fontes" do index.html.
// =====================================================

const REFERENCIA = {
    // Água (litros)
    aguaMediaBrasil: 180,       // L por pessoa por dia (Sinisa)
    aguaOnu: 110,               // L por pessoa por dia (ONU, via Idec)
    vazaoChuveiroEletrico: 4,   // L por minuto (estudo USP)
    vazaoChuveiroGas: 9,        // L por minuto (estudo USP)
    dentesTorneiraAberta: 12,   // L por escovação (Sabesp)
    dentesTorneiraFechada: 0.5, // L por escovação (Sabesp)
    vazaoTorneira: 9,           // L por minuto (faixa de 6 a 15, Iguá)
    aguaMaquinaRoupa: 135,      // L por lavagem (Sabesp)

    // Energia (kWh)
    energiaMediaSul: 216.8,     // kWh por casa por mês (EPE, 2025)
    energiaMediaBrasil: 177,    // kWh por casa por mês (cálculo com dados da EPE)
    geladeiraMes: 28,           // kWh por mês (ANEEL)
    arPorHoraDia: 128.8 / 8,    // kWh por mês para cada hora diária (Procel)
    tvPorHoraDia: 30.45 / 5,    // kWh por mês para cada hora diária (TV LED 42")
    maquinaPorLavagem: 0.31,    // kWh por lavagem (Eletrobras)
    ferroPorHora: 7.2 / 12,     // kWh por hora de uso (Eletrobras)
    economiaChaveVerao: 0.3,    // 30% a menos (Copel)

    // Alimentos (kg)
    alimentoMediaAno: 94,       // kg por pessoa por ano (PNUMA)
    semanasPorMes: 365 / 7 / 12 // cerca de 4,35 semanas em um mês
};

// Média de alimentos convertida para kg por pessoa por mês (cerca de 7,8 kg)
REFERENCIA.alimentoMediaMes = REFERENCIA.alimentoMediaAno / 12;

// Nome usado para salvar as ações no navegador
const CHAVE_ACOES = "refloreser_acoes";


// =====================================================
// 2. ELEMENTOS DA PÁGINA
// =====================================================

const questionario = document.getElementById("questionario");
const etapas = document.querySelectorAll(".etapa");
const botoesEtapa = document.querySelectorAll(".etapa-botao");
const botaoVoltar = document.getElementById("botao-voltar");
const botaoAvancar = document.getElementById("botao-avancar");
const botaoLaudo = document.getElementById("botao-laudo");
const areaLaudo = document.getElementById("laudo");

const listaIniciativas = document.getElementById("lista-iniciativas");
const botoesFiltro = document.querySelectorAll(".filtro");

const formularioAcao = document.getElementById("formulario-acao");
const mensagemAcao = document.getElementById("mensagem-acao");
const listaAcoes = document.getElementById("lista-acoes");


// =====================================================
// 3. UTILIDADES
// =====================================================

// Formata um número no padrão brasileiro (vírgula decimal).
function formatar(numero, casas = 0) {
    return numero.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

// Garante que um número fique entre um mínimo e um máximo.
function limitar(numero, minimo, maximo) {
    return Math.min(Math.max(numero, minimo), maximo);
}

// Cria um elemento HTML com classe e texto.
// Usamos textContent para textos digitados pelo usuário:
// assim nenhum código HTML digitado é executado.
function criarElemento(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
        elemento.className = classe;
    }
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}


// =====================================================
// 4. LER AS RESPOSTAS DO QUESTIONÁRIO
// =====================================================

function lerRespostas() {
    const campos = questionario.elements;

    return {
        moradores: Number(campos.moradores.value),

        tipoChuveiro: campos.tipoChuveiro.value,
        minutosBanho: Number(campos.minutosBanho.value),
        banhosDia: Number(campos.banhosDia.value),
        torneiraDentes: campos.torneiraDentes.value,
        escovacoes: Number(campos.escovacoes.value),
        descargas: Number(campos.descargas.value),
        litrosDescarga: Number(campos.tipoDescarga.value),
        minutosLouca: Number(campos.minutosLouca.value),
        lavagensRoupa: Number(campos.lavagensRoupa.value),

        potenciaChuveiro: Number(campos.potenciaChuveiro.value),
        chaveChuveiro: campos.chaveChuveiro.value,
        geladeiras: Number(campos.geladeiras.value),
        horasAr: Number(campos.horasAr.value),
        horasTv: Number(campos.horasTv.value),
        lampadas: Number(campos.lampadas.value),
        horasLuz: Number(campos.horasLuz.value),
        wattsLampada: Number(campos.tipoLampada.value),
        horasFerro: Number(campos.horasFerro.value),

        kgSemana: Number(campos.kgSemana.value),
        separaReciclavel: campos.separaReciclavel.value,
        planejaCompras: campos.planejaCompras.value
    };
}


// =====================================================
// 5. CÁLCULOS
// Cada função devolve o total e as "partes" do consumo,
// usadas no gráfico de composição do laudo.
// =====================================================

// ÁGUA: litros por pessoa, por dia.
function calcularAgua(r) {
    const vazaoChuveiro = r.tipoChuveiro === "eletrico"
        ? REFERENCIA.vazaoChuveiroEletrico
        : REFERENCIA.vazaoChuveiroGas;

    const litrosPorEscovacao = r.torneiraDentes === "aberta"
        ? REFERENCIA.dentesTorneiraAberta
        : REFERENCIA.dentesTorneiraFechada;

    // Primeiro calculamos o consumo da casa inteira, por dia...
    const chuveiro = r.moradores * r.banhosDia * r.minutosBanho * vazaoChuveiro;
    const descarga = r.moradores * r.descargas * r.litrosDescarga;
    const dentes = r.moradores * r.escovacoes * litrosPorEscovacao;
    const louca = r.minutosLouca * REFERENCIA.vazaoTorneira;
    const roupa = r.lavagensRoupa * REFERENCIA.aguaMaquinaRoupa / 7;

    // ...depois dividimos pelo número de moradores.
    const partes = [
        { nome: "Chuveiro", valor: chuveiro / r.moradores },
        { nome: "Descarga", valor: descarga / r.moradores },
        { nome: "Louça", valor: louca / r.moradores },
        { nome: "Roupa", valor: roupa / r.moradores },
        { nome: "Escovar dentes", valor: dentes / r.moradores }
    ];

    return { total: somarPartes(partes), partes: partes };
}

// ENERGIA: kWh por casa, por mês.
function calcularEnergia(r) {
    let chuveiro = 0;

    if (r.tipoChuveiro === "eletrico") {
        const fatorChave = r.chaveChuveiro === "verao"
            ? 1 - REFERENCIA.economiaChaveVerao
            : 1;
        const horasPorMes = (r.minutosBanho / 60) * r.banhosDia * r.moradores * 30;
        // kWh = potência em kW × horas de uso
        chuveiro = (r.potenciaChuveiro / 1000) * fatorChave * horasPorMes;
    }

    const partes = [
        { nome: "Chuveiro", valor: chuveiro },
        { nome: "Geladeira", valor: r.geladeiras * REFERENCIA.geladeiraMes },
        { nome: "Ar-condicionado", valor: r.horasAr * REFERENCIA.arPorHoraDia },
        { nome: "Televisão", valor: r.horasTv * REFERENCIA.tvPorHoraDia },
        { nome: "Lâmpadas", valor: r.lampadas * r.horasLuz * r.wattsLampada * 30 / 1000 },
        { nome: "Máquina de lavar", valor: r.lavagensRoupa * REFERENCIA.maquinaPorLavagem * REFERENCIA.semanasPorMes },
        { nome: "Ferro", valor: r.horasFerro * REFERENCIA.ferroPorHora }
    ];

    return { total: somarPartes(partes), partes: partes };
}

// ALIMENTOS: kg por pessoa, por mês.
function calcularAlimentos(r) {
    const total = r.kgSemana * REFERENCIA.semanasPorMes / r.moradores;
    return { total: total, partes: [{ nome: "Desperdício", valor: total }] };
}

function somarPartes(partes) {
    let soma = 0;
    partes.forEach(function (parte) {
        soma += parte.valor;
    });
    return soma;
}

// Compara o valor com a média e devolve a situação.
function classificar(valor, media) {
    const razao = valor / media;

    if (razao < 0.9) {
        return { codigo: "abaixo", texto: "Abaixo da média", razao: razao };
    }
    if (razao <= 1.1) {
        return { codigo: "media", texto: "Na média", razao: razao };
    }
    return { codigo: "acima", texto: "Acima da média", razao: razao };
}


// =====================================================
// 6. MONITOR AO VIVO
// =====================================================

function atualizarMonitor() {
    const r = lerRespostas();
    const agua = calcularAgua(r).total;
    const energia = calcularEnergia(r).total;
    const alimento = calcularAlimentos(r).total;

    // Leituras em número
    document.getElementById("leitura-agua").textContent = formatar(agua);
    document.getElementById("leitura-energia").textContent = formatar(energia);
    document.getElementById("leitura-alimento").textContent = formatar(alimento, 1);

    // TANQUE: o tanque cheio vale o dobro da média (a linha da média fica no meio).
    // A parte interna do tanque tem 130 unidades de altura.
    const nivel = limitar(agua / (REFERENCIA.aguaMediaBrasil * 2), 0, 1);
    document.getElementById("nivel-agua").style.transform =
        "translateY(" + (-130 * nivel) + "px)";

    // PONTEIRO: vai de -120 graus (zero) até +120 graus (dobro da média).
    // A média fica em 0 grau (ponteiro em pé).
    const proporcaoEnergia = limitar(energia / (REFERENCIA.energiaMediaSul * 2), 0, 1);
    const angulo = -120 + 240 * proporcaoEnergia;
    document.getElementById("ponteiro-energia").style.transform =
        "rotate(" + angulo + "deg)";

    // BALANÇA: o prato "você" desce quando o desperdício passa da média.
    const razaoAlimento = alimento / REFERENCIA.alimentoMediaMes;
    const inclinacao = limitar((razaoAlimento - 1) * 20, -20, 20);
    moverBalanca(-inclinacao);
}

// Inclina o braço da balança e pendura os pratos nas pontas.
function moverBalanca(graus) {
    const centroX = 80;
    const centroY = 40;
    const metadeBraco = 50;
    const radianos = graus * Math.PI / 180;

    // Pontas do braço depois de girar (trigonometria: seno e cosseno)
    const esquerdaX = centroX - metadeBraco * Math.cos(radianos);
    const esquerdaY = centroY - metadeBraco * Math.sin(radianos);
    const direitaX = centroX + metadeBraco * Math.cos(radianos);
    const direitaY = centroY + metadeBraco * Math.sin(radianos);

    document.getElementById("braco-balanca").style.transform = "rotate(" + graus + "deg)";
    document.getElementById("prato-voce").style.transform =
        "translate(" + esquerdaX + "px, " + esquerdaY + "px)";
    document.getElementById("prato-media").style.transform =
        "translate(" + direitaX + "px, " + direitaY + "px)";
}

// Atualiza o texto ao lado de cada controle deslizante.
function atualizarSaidas() {
    const controles = questionario.querySelectorAll('input[type="range"]');

    controles.forEach(function (controle) {
        const saida = questionario.querySelector('output[for="' + controle.id + '"]');
        saida.textContent = controle.value + " " + saida.dataset.unidade;
    });
}

// Esconde as perguntas de chuveiro elétrico se o chuveiro for a gás.
function ajustarPerguntasChuveiro() {
    const eletrico = questionario.elements.tipoChuveiro.value === "eletrico";
    document.getElementById("bloco-chuveiro-eletrico").hidden = !eletrico;
    document.getElementById("bloco-chave").hidden = !eletrico;
    document.getElementById("aviso-chuveiro-gas").hidden = eletrico;
}


// =====================================================
// 7. ETAPAS DO QUESTIONÁRIO
// =====================================================

let etapaAtual = 0;

function mostrarEtapa(numero) {
    etapaAtual = numero;

    etapas.forEach(function (etapa, indice) {
        etapa.classList.toggle("ativa", indice === numero);
    });

    botoesEtapa.forEach(function (botao, indice) {
        botao.classList.toggle("ativa", indice === numero);
        botao.classList.toggle("feita", indice < numero);
    });

    const ultima = numero === etapas.length - 1;
    botaoVoltar.disabled = numero === 0;
    botaoAvancar.hidden = ultima;
    botaoLaudo.hidden = !ultima;
}

// Ao trocar de etapa, volta para o topo do formulário se ele saiu da tela
function irParaTopoDoQuestionario() {
    const topo = questionario.getBoundingClientRect().top;
    if (topo < 0) {
        questionario.scrollIntoView({ behavior: "smooth" });
    }
}


// =====================================================
// 8. LAUDO
// O laudo é montado com "template strings" (textos com `crase`).
// Aqui é seguro porque só entram números calculados pelo site,
// nunca textos digitados pelo usuário.
// =====================================================

// Tons de cada recurso para o gráfico de composição
const TONS = {
    agua: ["#0b6f96", "#3b98bf", "#76bcd9", "#a9d6e8", "#d3eaf3"],
    energia: ["#9a6a00", "#c08a14", "#d9a940", "#e8c677", "#f2deae", "#f7ead0", "#faf3e3"],
    alimento: ["#c2441f"]
};

function gerarLaudo() {
    const r = lerRespostas();

    const agua = calcularAgua(r);
    const energia = calcularEnergia(r);
    const alimento = calcularAlimentos(r);

    const situacaoAgua = classificar(agua.total, REFERENCIA.aguaMediaBrasil);
    const situacaoEnergia = classificar(energia.total, REFERENCIA.energiaMediaSul);
    const situacaoAlimento = classificar(alimento.total, REFERENCIA.alimentoMediaMes);

    // Ponto de atenção: o recurso mais acima da sua média
    const recursos = [
        { chave: "agua", nome: "Água", tema: "agua", situacao: situacaoAgua },
        { chave: "energia", nome: "Energia", tema: "energia", situacao: situacaoEnergia },
        { chave: "alimento", nome: "Alimentos", tema: "alimentos", situacao: situacaoAlimento }
    ];
    recursos.sort(function (a, b) {
        return b.situacao.razao - a.situacao.razao;
    });
    const atencao = recursos[0];

    // Quantos recursos ficaram abaixo da média
    let abaixo = 0;
    recursos.forEach(function (recurso) {
        if (recurso.situacao.codigo === "abaixo") {
            abaixo++;
        }
    });

    const agora = new Date();

    const plano = montarPlano(r, agua, energia, atencao.chave);

    areaLaudo.innerHTML = `
        <header class="laudo-cabecalho">
            <h3>Resultado da estimativa</h3>
            <p class="laudo-meta">
                ${agora.toLocaleDateString("pt-BR")}<br>
                ${r.moradores} morador(es)
            </p>
        </header>

        <p class="laudo-resumo">
            A casa ficou <strong>abaixo da média em ${abaixo} de 3 recursos</strong>.
            O maior ponto de atenção é <strong>${atencao.nome.toLowerCase()}</strong>.
        </p>

        ${linhaResultado({
            classe: "agua",
            nome: "Água",
            valor: formatar(agua.total),
            unidade: "litros por pessoa, por dia",
            situacao: situacaoAgua,
            comparacoes: [
                { rotulo: "Você", valor: agua.total, texto: formatar(agua.total) + " L" },
                { rotulo: "Média BR", valor: REFERENCIA.aguaMediaBrasil, texto: "180 L", media: true },
                { rotulo: "ONU", valor: REFERENCIA.aguaOnu, texto: "110 L", media: true }
            ],
            partes: agua.partes,
            unidadeCurta: "L",
            tons: TONS.agua
        })}

        ${linhaResultado({
            classe: "energia",
            nome: "Energia",
            valor: formatar(energia.total),
            unidade: "kWh por casa, por mês",
            situacao: situacaoEnergia,
            comparacoes: [
                { rotulo: "Você", valor: energia.total, texto: formatar(energia.total) + " kWh" },
                { rotulo: "Média Sul", valor: REFERENCIA.energiaMediaSul, texto: "216,8 kWh", media: true },
                { rotulo: "Média BR", valor: REFERENCIA.energiaMediaBrasil, texto: "177 kWh", media: true }
            ],
            partes: energia.partes,
            unidadeCurta: "kWh",
            tons: TONS.energia
        })}

        ${linhaResultado({
            classe: "alimento",
            nome: "Alimentos",
            valor: formatar(alimento.total, 1),
            unidade: "kg desperdiçados por pessoa, por mês",
            situacao: situacaoAlimento,
            comparacoes: [
                { rotulo: "Você", valor: alimento.total, texto: formatar(alimento.total, 1) + " kg" },
                { rotulo: "Média BR", valor: REFERENCIA.alimentoMediaMes, texto: "7,8 kg", media: true }
            ],
            partes: [],
            unidadeCurta: "kg",
            tons: TONS.alimento
        })}

        <div class="laudo-atencao">
            <h4>Ponto de atenção: ${atencao.nome}</h4>
            <p>
                ${textoAtencao(atencao)}
                Há iniciativas em Foz do Iguaçu ligadas a esse tema.
            </p>
            <div class="laudo-botoes">
                <button type="button" class="botao botao-principal" id="botao-ver-iniciativas"
                        data-tema="${atencao.tema}">
                    Ver iniciativas de ${atencao.nome.toLowerCase()}
                </button>
            </div>
        </div>

        <div class="laudo-plano">
            <h4>Plano de ação</h4>
            <ol class="lista-plano">
                ${plano.map(itemPlano).join("")}
            </ol>
        </div>

        <div class="laudo-botoes">
            <button type="button" class="botao botao-contorno" id="botao-imprimir">Imprimir resultado</button>
            <button type="button" class="botao botao-contorno" id="botao-refazer">Refazer estimativa</button>
        </div>

        <p class="laudo-nota">
            Estimativa feita com valores médios publicados (veja a seção Fontes).
            O consumo real aparece nas contas de água e de luz.
        </p>
    `;

    areaLaudo.hidden = false;

    // Animação das barras: começam em 0 e crescem até o valor
    requestAnimationFrame(function () {
        areaLaudo.querySelectorAll(".comparacao-barra").forEach(function (barra) {
            barra.style.width = barra.dataset.largura + "%";
        });
    });

    // Botões dentro do laudo
    document.getElementById("botao-ver-iniciativas").addEventListener("click", function () {
        destacarIniciativas(this.dataset.tema, r.separaReciclavel === "nao");
        document.getElementById("iniciativas").scrollIntoView({ behavior: "smooth" });
    });

    // Imprimir só funciona com o site aberto direto no navegador.
    // Dentro de uma moldura (iframe), o botão fica escondido.
    const botaoImprimir = document.getElementById("botao-imprimir");
    if (window.self !== window.top) {
        botaoImprimir.hidden = true;
    }
    botaoImprimir.addEventListener("click", function () {
        try {
            window.print();
        } catch (erro) {
            console.error("Impressão indisponível:", erro);
        }
    });

    document.getElementById("botao-refazer").addEventListener("click", function () {
        mostrarEtapa(0);
        questionario.scrollIntoView({ behavior: "smooth" });
    });

    // Já destaca as iniciativas do ponto de atenção
    destacarIniciativas(atencao.tema, r.separaReciclavel === "nao");

    areaLaudo.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Monta uma linha do laudo (um recurso).
function linhaResultado(d) {
    // A maior barra ocupa 100% do trilho
    let maior = 0;
    d.comparacoes.forEach(function (c) {
        maior = Math.max(maior, c.valor);
    });

    const barras = d.comparacoes.map(function (c) {
        const largura = maior > 0 ? (c.valor / maior) * 100 : 0;
        return `
            <div class="comparacao-linha">
                <span>${c.rotulo}</span>
                <div class="comparacao-trilho">
                    <div class="comparacao-barra ${c.media ? "media" : ""}" data-largura="${largura}"></div>
                </div>
                <span>${c.texto}</span>
            </div>`;
    }).join("");

    // Gráfico de composição (só quando há mais de uma parte)
    let composicao = "";
    if (d.partes.length > 1) {
        const total = somarPartes(d.partes);
        const pedacos = [];
        const legendas = [];

        d.partes.forEach(function (parte, indice) {
            if (parte.valor <= 0) {
                return;
            }
            const cor = d.tons[indice % d.tons.length];
            const porcentagem = (parte.valor / total) * 100;
            pedacos.push(`<span style="width:${porcentagem}%; background:${cor}" title="${parte.nome}"></span>`);
            legendas.push(`<li><i style="background:${cor}"></i>${parte.nome}: ${formatar(parte.valor)} ${d.unidadeCurta} (${formatar(porcentagem)}%)</li>`);
        });

        composicao = `
            <p class="composicao-titulo">De onde vem o consumo</p>
            <div class="composicao">${pedacos.join("")}</div>
            <ul class="legenda">${legendas.join("")}</ul>`;
    }

    // Diferença em porcentagem em relação à média
    const diferenca = Math.round((d.situacao.razao - 1) * 100);
    const textoDiferenca = diferenca > 0
        ? diferenca + "% acima da média"
        : diferenca < 0
            ? Math.abs(diferenca) + "% abaixo da média"
            : "igual à média";

    return `
        <article class="resultado resultado-${d.classe}">
            <div>
                <p class="resultado-nome">${d.nome}</p>
                <p class="resultado-valor">${d.valor}</p>
                <p class="resultado-unidade">${d.unidade}</p>
            </div>
            <div>
                <div class="comparacao">${barras}</div>
                ${composicao}
            </div>
            <div>
                <span class="selo selo-${d.situacao.codigo}">${d.situacao.texto}</span>
                <p class="selo-texto">${textoDiferenca}</p>
            </div>
        </article>`;
}

function textoAtencao(recurso) {
    if (recurso.situacao.codigo === "abaixo") {
        return "Todos os recursos ficaram abaixo da média. Este é o que está mais perto dela.";
    }
    if (recurso.chave === "agua") {
        return "O consumo de água por pessoa é o que mais se afasta da média brasileira.";
    }
    if (recurso.chave === "energia") {
        return "O consumo de energia da casa é o que mais se afasta da média da região Sul.";
    }
    return "O desperdício de alimentos por pessoa é o que mais se afasta da média brasileira.";
}

// Cria a lista de sugestões, com a economia estimada de cada uma.
function montarPlano(r, agua, energia, recursoAtencao) {
    const sugestoes = [];
    const vazao = r.tipoChuveiro === "eletrico"
        ? REFERENCIA.vazaoChuveiroEletrico
        : REFERENCIA.vazaoChuveiroGas;
    const chuveiroKwh = energia.partes[0].valor;
    const aguaCasaMes = agua.total * r.moradores * 30;

    // --- Água ---
    if (r.minutosBanho > 5) {
        const litros = r.moradores * r.banhosDia * (r.minutosBanho - 5) * vazao * 30;
        sugestoes.push({
            recurso: "agua",
            texto: "Reduzir o banho para 5 minutos",
            detalhe: "Hoje cada banho dura " + r.minutosBanho + " minutos.",
            economia: "−" + formatar(litros) + " L/mês",
            peso: litros / aguaCasaMes
        });
    }

    if (r.torneiraDentes === "aberta") {
        const litros = r.moradores * r.escovacoes *
            (REFERENCIA.dentesTorneiraAberta - REFERENCIA.dentesTorneiraFechada) * 30;
        sugestoes.push({
            recurso: "agua",
            texto: "Fechar a torneira ao escovar os dentes",
            detalhe: "Use um copo de água para enxaguar a boca.",
            economia: "−" + formatar(litros) + " L/mês",
            peso: litros / aguaCasaMes
        });
    }

    if (r.litrosDescarga > 6.8) {
        const litros = r.moradores * r.descargas * (r.litrosDescarga - 6.8) * 30;
        sugestoes.push({
            recurso: "agua",
            texto: "Trocar a válvula antiga por caixa acoplada",
            detalhe: "Bacias vendidas desde 2001 usam 6,8 L por descarga.",
            economia: "−" + formatar(litros) + " L/mês",
            peso: litros / aguaCasaMes
        });
    }

    if (r.minutosLouca > 5) {
        const litros = (r.minutosLouca / 2) * REFERENCIA.vazaoTorneira * 30;
        sugestoes.push({
            recurso: "agua",
            texto: "Ensaboar a louça com a torneira fechada",
            detalhe: "Abrir a água só para o enxágue corta o tempo pela metade.",
            economia: "−" + formatar(litros) + " L/mês",
            peso: litros / aguaCasaMes
        });
    }

    // --- Energia ---
    if (r.tipoChuveiro === "eletrico" && r.chaveChuveiro === "inverno" && chuveiroKwh > 0) {
        const kwh = chuveiroKwh * REFERENCIA.economiaChaveVerao;
        sugestoes.push({
            recurso: "energia",
            texto: "Usar a chave verão do chuveiro nos dias quentes",
            detalhe: "A Copel indica economia de 30% no consumo do chuveiro.",
            economia: "−" + formatar(kwh) + " kWh/mês",
            peso: kwh / energia.total
        });
    }

    if (r.tipoChuveiro === "eletrico" && r.minutosBanho > 5 && chuveiroKwh > 0) {
        const kwh = chuveiroKwh * (r.minutosBanho - 5) / r.minutosBanho;
        sugestoes.push({
            recurso: "energia",
            texto: "Banho de 5 minutos também economiza energia",
            detalhe: "O chuveiro elétrico é o aparelho que mais pesa na conta.",
            economia: "−" + formatar(kwh) + " kWh/mês",
            peso: kwh / energia.total
        });
    }

    if (r.wattsLampada > 9 && r.lampadas > 0) {
        const kwh = r.lampadas * r.horasLuz * (r.wattsLampada - 9) * 30 / 1000;
        sugestoes.push({
            recurso: "energia",
            texto: "Trocar as lâmpadas por LED",
            detalhe: "A Copel troca 4 lâmpadas por LED no programa Trocou, Economizou.",
            economia: "−" + formatar(kwh) + " kWh/mês",
            peso: kwh / energia.total
        });
    }

    if (r.horasAr > 4) {
        const kwh = 2 * REFERENCIA.arPorHoraDia;
        sugestoes.push({
            recurso: "energia",
            texto: "Ligar o ar-condicionado 2 horas a menos por dia",
            detalhe: "Ventiladores gastam muito menos energia.",
            economia: "−" + formatar(kwh) + " kWh/mês",
            peso: kwh / energia.total
        });
    }

    // --- Alimentos (sem número de economia: são hábitos) ---
    if (r.planejaCompras !== "sim") {
        sugestoes.push({
            recurso: "alimento",
            texto: "Planejar as compras com lista e cardápio da semana",
            detalhe: "Comprar só o necessário evita que a comida estrague.",
            economia: "hábito",
            peso: 0.15
        });
    }

    if (r.kgSemana >= 3) {
        sugestoes.push({
            recurso: "alimento",
            texto: "Congelar sobras e aproveitar talos e cascas",
            detalhe: "Restos de arroz e feijão estão entre os itens desperdiçados.",
            economia: "hábito",
            peso: 0.1
        });
    }

    if (r.separaReciclavel === "nao") {
        sugestoes.push({
            recurso: "alimento",
            texto: "Separar o reciclável para a coleta seletiva",
            detalhe: "Em Foz, a coleta passa porta a porta uma vez por semana.",
            economia: "hábito",
            peso: 0.05
        });
    }

    // Ordem: primeiro o recurso do ponto de atenção, depois o maior impacto
    sugestoes.sort(function (a, b) {
        const prioridadeA = a.recurso === recursoAtencao ? 1 : 0;
        const prioridadeB = b.recurso === recursoAtencao ? 1 : 0;
        if (prioridadeA !== prioridadeB) {
            return prioridadeB - prioridadeA;
        }
        return b.peso - a.peso;
    });

    if (sugestoes.length === 0) {
        sugestoes.push({
            recurso: "agua",
            texto: "Manter os hábitos atuais",
            detalhe: "Nenhum hábito ficou acima dos valores de referência.",
            economia: "",
            peso: 0
        });
    }

    // Mostra no máximo 5 sugestões
    return sugestoes.slice(0, 5);
}

function itemPlano(sugestao) {
    const cores = {
        agua: "var(--agua-tinta)",
        energia: "var(--energia-tinta)",
        alimento: "var(--alimento-tinta)"
    };
    return `
        <li>
            <div>
                <strong>${sugestao.texto}</strong><br>
                <small>${sugestao.detalhe}</small>
            </div>
            <span class="plano-economia" style="color:${cores[sugestao.recurso]}">${sugestao.economia}</span>
        </li>`;
}


// =====================================================
// 9. INICIATIVAS DE FOZ DO IGUAÇU
// Para incluir uma nova, copie um bloco { ... } e altere.
// =====================================================

const INICIATIVAS = [
    {
        nome: "Programa de Coleta Seletiva",
        quem: "Prefeitura de Foz do Iguaçu e cooperativas de catadores",
        temas: ["residuos"],
        texto: "Recolhe recicláveis porta a porta, uma vez por semana, nas áreas urbana e rural. O material segue para Unidades de Valorização de Recicláveis (UVRs) operadas por cooperativas.",
        dado: "1.887 toneladas recolhidas em 2023, com renda para cerca de 140 famílias de catadores.",
        onde: "Separe o reciclável e deixe na calçada no dia da coleta do seu bairro.",
        link: ""
    },
    {
        nome: "COAAFI",
        quem: "Cooperativa dos Agentes Ambientais de Foz do Iguaçu",
        temas: ["residuos"],
        texto: "Cooperativa de catadores que faz triagem e venda de materiais recicláveis, em parceria com a Prefeitura e a Itaipu.",
        dado: "Uma das cooperativas que estruturaram a coleta seletiva da cidade.",
        onde: "Recebe material pela coleta seletiva municipal.",
        link: ""
    },
    {
        nome: "Banco de Alimentos Comida Boa",
        quem: "Ceasa Paraná, unidade Foz do Iguaçu",
        temas: ["alimentos"],
        texto: "Recebe frutas, verduras e legumes doados por atacadistas e produtores, que seriam descartados, e repassa a entidades sociais.",
        dado: "Cerca de 400 toneladas distribuídas em Foz do Iguaçu em 2022.",
        onde: "Ceasa de Foz do Iguaçu.",
        link: ""
    },
    {
        nome: "Mesa Brasil Sesc",
        quem: "Sesc Paraná",
        temas: ["alimentos"],
        texto: "Rede de bancos de alimentos que busca comida onde sobra e entrega onde falta, contra a fome e o desperdício. Recebe doações de pessoas e empresas.",
        dado: "No Brasil, a rede atendeu mais de 2,3 milhões de pessoas.",
        onde: "Sesc Foz do Iguaçu: Av. Tancredo Neves, 222.",
        link: "https://www.sescpr.com.br"
    },
    {
        nome: "Trocou, Economizou",
        quem: "Programa de Eficiência Energética da Copel",
        temas: ["energia"],
        texto: "Dá desconto na compra de geladeira eficiente para quem entrega a antiga. Na entrega, 4 lâmpadas antigas são trocadas por LED.",
        dado: "Mais de 16 mil geladeiras trocadas no Paraná (janeiro de 2026).",
        onde: "Regras e etapas abertas no site da Copel.",
        link: "https://www.copel.com"
    },
    {
        nome: "Coleta de óleo de cozinha",
        quem: "Sanepar, regional Foz do Iguaçu",
        temas: ["agua", "residuos"],
        texto: "As Centrais de Relacionamento da Sanepar na região recebem óleo de cozinha usado, que é destinado à cooperativa de catadores.",
        dado: "Pontos em Foz, Medianeira, Santa Terezinha de Itaipu, São Miguel do Iguaçu e outras cidades (informação de 2019).",
        onde: "Confirme o ponto de entrega antes de levar o óleo.",
        link: ""
    },
    {
        nome: "Refúgio Biológico Bela Vista",
        quem: "Itaipu Binacional",
        temas: ["agua", "energia"],
        texto: "Área de conservação criada em 1984 para receber plantas e animais afetados pelo reservatório da usina. Oferece visitas e roteiros pedagógicos de educação ambiental.",
        dado: "1.780 hectares, parte da Reserva da Biosfera da Mata Atlântica reconhecida pela Unesco.",
        onde: "Visitas pelo Complexo Turístico Itaipu.",
        link: "https://www.itaipu.gov.br"
    }
];

const NOMES_TEMAS = {
    agua: "Água",
    energia: "Energia",
    alimentos: "Alimentos",
    residuos: "Resíduos"
};

// Temas recomendados depois do laudo
let temasDestacados = [];

function mostrarIniciativas(filtro) {
    listaIniciativas.replaceChildren();

    // As recomendadas pelo laudo aparecem primeiro
    const ordenadas = INICIATIVAS.slice().sort(function (a, b) {
        return Number(eRecomendada(b)) - Number(eRecomendada(a));
    });

    ordenadas.forEach(function (item) {
        if (filtro !== "todas" && !item.temas.includes(filtro)) {
            return;
        }

        const cartao = criarElemento("article", "iniciativa");

        // Destaca se algum tema da iniciativa foi recomendado pelo laudo
        if (eRecomendada(item)) {
            cartao.classList.add("destaque");
            cartao.appendChild(criarElemento("span", "iniciativa-selo", "Relacionada ao seu resultado"));
        }

        const temas = criarElemento("div", "iniciativa-temas");
        item.temas.forEach(function (tema) {
            temas.appendChild(criarElemento("span", "tema tema-" + tema, NOMES_TEMAS[tema]));
        });
        cartao.appendChild(temas);

        cartao.appendChild(criarElemento("h3", "", item.nome));
        cartao.appendChild(criarElemento("p", "iniciativa-quem", item.quem));
        cartao.appendChild(criarElemento("p", "", item.texto));
        cartao.appendChild(criarElemento("p", "iniciativa-dado", item.dado));
        cartao.appendChild(criarElemento("p", "iniciativa-onde", item.onde));

        if (item.link) {
            const link = criarElemento("a", "", "Acessar site →");
            link.href = item.link;
            link.target = "_blank";
            link.rel = "noopener";
            cartao.appendChild(link);
        }

        listaIniciativas.appendChild(cartao);
    });
}

function eRecomendada(item) {
    return item.temas.some(function (tema) {
        return temasDestacados.includes(tema);
    });
}

function filtrarIniciativas(tema) {
    botoesFiltro.forEach(function (botao) {
        botao.classList.toggle("ativo", botao.dataset.tema === tema);
    });
    mostrarIniciativas(tema);
}

function destacarIniciativas(tema, incluirResiduos) {
    temasDestacados = [tema];
    if (incluirResiduos) {
        temasDestacados.push("residuos");
    }
    filtrarIniciativas("todas");
}


// =====================================================
// 10. AÇÕES SUSTENTÁVEIS E PAINEL DE IMPACTO
// =====================================================

let acoes = carregarAcoes();

function carregarAcoes() {
    try {
        const dados = localStorage.getItem(CHAVE_ACOES);
        return dados ? JSON.parse(dados) : [];
    } catch (erro) {
        console.error("Erro ao carregar ações:", erro);
        return [];
    }
}

function salvarAcoes() {
    try {
        localStorage.setItem(CHAVE_ACOES, JSON.stringify(acoes));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar ações:", erro);
        return false;
    }
}

function criarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function mostrarMensagem(texto, tipo) {
    mensagemAcao.textContent = texto;
    mensagemAcao.className = "mensagem " + tipo;
}

function registrarAcao(evento) {
    evento.preventDefault();

    const campos = formularioAcao.elements;
    const descricao = campos.descricaoAcao.value.trim();
    const categoria = campos.categoriaAcao.value;
    const local = campos.localAcao.value.trim();
    const participantes = Number(campos.participantesAcao.value);
    const reducao = Number(campos.reducaoAcao.value);
    const unidade = campos.unidadeAcao.value;

    // Validação: confere cada campo e avisa o que falta
    if (descricao === "" || categoria === "" || local === "") {
        mostrarMensagem("Preencha a descrição, o tema e o local.", "erro");
        return;
    }
    if (!Number.isInteger(participantes) || participantes < 1) {
        mostrarMensagem("Informe pelo menos 1 participante.", "erro");
        return;
    }
    if (campos.reducaoAcao.value === "" || !Number.isFinite(reducao) || reducao < 0) {
        mostrarMensagem("Informe a redução (pode ser 0).", "erro");
        return;
    }

    acoes.push({
        id: criarId(),
        descricao: descricao,
        categoria: categoria,
        local: local,
        participantes: participantes,
        reducao: reducao,
        unidade: unidade,
        data: new Date().toISOString()
    });

    if (!salvarAcoes()) {
        acoes.pop();
        mostrarMensagem("Não foi possível salvar no navegador.", "erro");
        return;
    }

    formularioAcao.reset();
    mostrarMensagem("Registro salvo.", "sucesso");
    atualizarAcoes();
}

function carregarExemplos() {
    const exemplos = [
        { descricao: "Troca de 6 lâmpadas por LED (exemplo)", categoria: "Energia", local: "Vila A", participantes: 4, reducao: 38, unidade: "kWh" },
        { descricao: "Mutirão de separação de recicláveis (exemplo)", categoria: "Resíduos", local: "Escola", participantes: 32, reducao: 45, unidade: "kg" },
        { descricao: "Banhos de 5 minutos em casa (exemplo)", categoria: "Água", local: "Jardim São Paulo", participantes: 3, reducao: 1800, unidade: "L" }
    ];

    exemplos.forEach(function (exemplo) {
        exemplo.id = criarId();
        exemplo.data = new Date().toISOString();
        acoes.push(exemplo);
    });

    salvarAcoes();
    mostrarMensagem("Três registros de exemplo foram adicionados.", "sucesso");
    atualizarAcoes();
}

function excluirAcao(id) {
    acoes = acoes.filter(function (acao) {
        return acao.id !== id;
    });
    salvarAcoes();
    atualizarAcoes();
}

function formatarData(texto) {
    const data = new Date(texto);
    return Number.isNaN(data.getTime()) ? "sem data" : data.toLocaleDateString("pt-BR");
}

// Lista de cartões com os registros
function mostrarAcoes() {
    listaAcoes.replaceChildren();

    if (acoes.length === 0) {
        listaAcoes.appendChild(criarElemento("p", "vazio",
            "Nenhuma ação registrada ainda. Use o formulário ou carregue exemplos."));
        return;
    }

    // Mostra os registros mais recentes primeiro
    acoes.slice().reverse().forEach(function (acao) {
        const cartao = criarElemento("article", "cartao-acao");

        const tema = criarElemento("span", "tema " + classeDoTema(acao.categoria), acao.categoria);
        cartao.appendChild(tema);
        cartao.appendChild(criarElemento("h4", "", acao.descricao));

        const lista = document.createElement("dl");
        adicionarDado(lista, "Local", acao.local);
        adicionarDado(lista, "Pessoas", acao.participantes);
        adicionarDado(lista, "Redução", formatar(acao.reducao, acao.reducao % 1 ? 1 : 0) + " " + (acao.unidade || ""));
        adicionarDado(lista, "Data", formatarData(acao.data));
        cartao.appendChild(lista);

        const botao = criarElemento("button", "botao-excluir", "×");
        botao.type = "button";
        botao.setAttribute("aria-label", "Excluir registro: " + acao.descricao);
        botao.addEventListener("click", function () {
            excluirAcao(acao.id);
        });
        cartao.appendChild(botao);

        listaAcoes.appendChild(cartao);
    });
}

function adicionarDado(lista, nome, valor) {
    lista.appendChild(criarElemento("dt", "", nome));
    lista.appendChild(criarElemento("dd", "", String(valor)));
}

function classeDoTema(categoria) {
    const classes = {
        "Água": "tema-agua",
        "Energia": "tema-energia",
        "Alimentos": "tema-alimentos",
        "Resíduos": "tema-residuos"
    };
    return classes[categoria] || "";
}

// Painel com totais e gráfico
function mostrarPainel() {
    let participantes = 0;
    const somaPorUnidade = { "L": 0, "kWh": 0, "kg": 0, "R$": 0 };
    const contagemPorTema = { "Água": 0, "Energia": 0, "Alimentos": 0, "Resíduos": 0, "Comunidade": 0 };

    acoes.forEach(function (acao) {
        participantes += Number(acao.participantes) || 0;

        if (acao.unidade in somaPorUnidade) {
            somaPorUnidade[acao.unidade] += Number(acao.reducao) || 0;
        }
        if (acao.categoria in contagemPorTema) {
            contagemPorTema[acao.categoria]++;
        }
    });

    document.getElementById("total-acoes").textContent = acoes.length;
    document.getElementById("total-participantes").textContent = participantes;

    // Blocos de redução por unidade
    const reducoes = document.getElementById("reducoes");
    reducoes.replaceChildren();
    Object.keys(somaPorUnidade).forEach(function (unidade) {
        const bloco = criarElemento("div", "reducao");
        bloco.appendChild(criarElemento("strong", "", formatar(somaPorUnidade[unidade])));
        bloco.appendChild(criarElemento("span", "", unidade + "/mês"));
        reducoes.appendChild(bloco);
    });

    // Gráfico de barras: quantas ações por tema
    const cores = {
        "Água": "var(--agua)",
        "Energia": "var(--energia)",
        "Alimentos": "var(--alimento)",
        "Resíduos": "var(--verde-principal)",
        "Comunidade": "#7b5ea7"
    };

    let maior = 1;
    Object.values(contagemPorTema).forEach(function (quantidade) {
        maior = Math.max(maior, quantidade);
    });

    const grafico = document.getElementById("grafico-temas");
    grafico.replaceChildren();

    Object.keys(contagemPorTema).forEach(function (tema) {
        const linha = criarElemento("div", "barra-tema");
        linha.appendChild(criarElemento("span", "", tema));

        const trilho = criarElemento("div", "barra-tema-trilho");
        const barra = criarElemento("div", "barra-tema-preenchida");
        barra.style.width = (contagemPorTema[tema] / maior) * 100 + "%";
        barra.style.backgroundColor = cores[tema];
        trilho.appendChild(barra);

        linha.appendChild(trilho);
        linha.appendChild(criarElemento("span", "", contagemPorTema[tema]));
        grafico.appendChild(linha);
    });
}

function atualizarAcoes() {
    mostrarAcoes();
    mostrarPainel();
}


// =====================================================
// 11. INÍCIO
// =====================================================

// Questionário: qualquer mudança atualiza o monitor
questionario.addEventListener("input", function () {
    atualizarSaidas();
    ajustarPerguntasChuveiro();
    atualizarMonitor();
});

questionario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    gerarLaudo();
});

botaoAvancar.addEventListener("click", function () {
    mostrarEtapa(etapaAtual + 1);
    irParaTopoDoQuestionario();
});

botaoVoltar.addEventListener("click", function () {
    mostrarEtapa(etapaAtual - 1);
    irParaTopoDoQuestionario();
});

botoesEtapa.forEach(function (botao) {
    botao.addEventListener("click", function () {
        mostrarEtapa(Number(botao.dataset.etapa));
    });
});

// Filtros das iniciativas
botoesFiltro.forEach(function (botao) {
    botao.addEventListener("click", function () {
        filtrarIniciativas(botao.dataset.tema);
    });
});

// Ações
formularioAcao.addEventListener("submit", registrarAcao);
document.getElementById("botao-exemplos").addEventListener("click", carregarExemplos);

// Primeira exibição
atualizarSaidas();
ajustarPerguntasChuveiro();
atualizarMonitor();
mostrarEtapa(0);
mostrarIniciativas("todas");
atualizarAcoes();
