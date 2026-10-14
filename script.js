// =============================================
// REFLORESER - JAVASCRIPT
// =============================================

// Seleciona as áreas do HTML que vamos utilizar.
const areaQuestionario = document.getElementById("area-questionario");
const resultadoEstimativa = document.getElementById("resultado-estimativa");
const formularioAcoes = document.getElementById("formulario-acoes");
const listaAcoes = document.getElementById("lista-acoes");

// Nome utilizado para salvar os dados no navegador.
const CHAVE_ACOES = "refloreser_acoes";

// Carrega os cadastros que já foram salvos.
let acoes = carregarAcoes();


// =============================================
// 1. SALVAR E CARREGAR DADOS
// =============================================

// Recupera os dados do localStorage.
function carregarAcoes() {
    try {
        const dados = localStorage.getItem(CHAVE_ACOES);
        return dados ? JSON.parse(dados) : [];
    } catch (erro) {
        console.error("Erro ao carregar ações:", erro);
        return [];
    }
}

// Salva os cadastros no navegador.
function salvarAcoes() {
    try {
        localStorage.setItem(CHAVE_ACOES, JSON.stringify(acoes));
        return true;
    } catch (erro) {
        console.error("Erro ao salvar ações:", erro);
        return false;
    }
}


// =============================================
// 2. CRIAR ELEMENTOS HTML
// =============================================

// Cria um elemento HTML com texto e uma classe opcional.
function criarElemento(tag, texto, classe = "") {
    const elemento = document.createElement(tag);
    elemento.textContent = texto;

    if (classe) {
        elemento.className = classe;
    }

    return elemento;
}

// Cria um campo para os formulários.
function criarCampo(rotuloTexto, nome, tipo, opcoes = null) {
    const grupo = document.createElement("div");
    grupo.className = "campo-formulario";

    const rotulo = document.createElement("label");
    rotulo.textContent = rotuloTexto;
    rotulo.htmlFor = nome;

    let campo;

    // Cria uma lista de opções.
    if (tipo === "select") {
        campo = document.createElement("select");

        const inicial = document.createElement("option");
        inicial.value = "";
        inicial.textContent = "Selecione uma opção";
        campo.appendChild(inicial);

        opcoes.forEach(function (texto) {
            const opcao = document.createElement("option");
            opcao.value = texto;
            opcao.textContent = texto;
            campo.appendChild(opcao);
        });
    } else {
        campo = document.createElement("input");
        campo.type = tipo;
    }

    campo.id = nome;
    campo.name = nome;
    campo.required = true;

    if (tipo === "number") {
        campo.min = "0";
        campo.step = "any";
    }

    grupo.appendChild(rotulo);
    grupo.appendChild(campo);

    return grupo;
}


// =============================================
// 3. QUESTIONÁRIO DE CONSUMO
// =============================================

function montarQuestionario() {
    const formulario = document.createElement("form");
    formulario.id = "questionario-consumo";

    formulario.appendChild(
        criarElemento("h3", "Consumo da sua residência")
    );

    formulario.appendChild(
        criarElemento(
            "p",
            "Responda para conhecer alguns dos seus hábitos."
        )
    );

    // Pergunta sobre os moradores da casa.
    formulario.appendChild(
        criarCampo(
            "Quantas pessoas moram na casa?",
            "moradores",
            "number"
        )
    );

    // Pergunta sobre a duração dos banhos.
    formulario.appendChild(
        criarCampo(
            "Quanto tempo dura cada banho, em minutos?",
            "minutosBanho",
            "number"
        )
    );

    // Pergunta sobre a quantidade de banhos.
    formulario.appendChild(
        criarCampo(
            "Quantos banhos por dia, por pessoa?",
            "banhosDia",
            "number"
        )
    );

    // Pergunta sobre o consumo de energia.
    formulario.appendChild(
        criarCampo(
            "Como você considera o uso de energia?",
            "usoEnergia",
            "select",
            ["Baixo", "Moderado", "Alto"]
        )
    );

    // Pergunta sobre o desperdício de alimentos.
    formulario.appendChild(
        criarCampo(
            "Com que frequência há desperdício de alimentos?",
            "desperdicio",
            "select",
            ["Raramente", "Às vezes", "Frequentemente"]
        )
    );

    const botao = criarElemento("button", "Calcular estimativa");
    botao.type = "submit";
    botao.className = "botao-principal";
    formulario.appendChild(botao);

    // Calcula os resultados quando o formulário é enviado.
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const moradores = Number(formulario.elements.moradores.value);
        const minutosBanho = Number(formulario.elements.minutosBanho.value);
        const banhosDia = Number(formulario.elements.banhosDia.value);
        const usoEnergia = formulario.elements.usoEnergia.value;
        const desperdicio = formulario.elements.desperdicio.value;

        if (
            moradores <= 0 ||
            minutosBanho < 0 ||
            banhosDia < 0 ||
            !Number.isFinite(moradores) ||
            !Number.isFinite(minutosBanho) ||
            !Number.isFinite(banhosDia)
        ) {
            alert("Confira os números informados.");
            return;
        }

        calcularEstimativa({
            moradores,
            minutosBanho,
            banhosDia,
            usoEnergia,
            desperdicio
        });
    });

    areaQuestionario.replaceChildren(formulario);
}


// =============================================
// 4. CALCULAR ESTIMATIVAS
// =============================================

function calcularEstimativa(respostas) {
    // Referência provisória, que deve ser pesquisada e validada.
    const litrosPorMinuto = 9;

    // Estima a água utilizada nos banhos por dia.
    const aguaDiaria =
        respostas.moradores *
        respostas.minutosBanho *
        respostas.banhosDia *
        litrosPorMinuto;

    // Estima a água utilizada nos banhos em 30 dias.
    const aguaMensal = aguaDiaria * 30;

    const energia = {
        "Baixo": "baixo",
        "Moderado": "moderado",
        "Alto": "alto"
    };

    const alimentos = {
        "Raramente": "baixo",
        "Às vezes": "moderado",
        "Frequentemente": "alto"
    };

    // Limpa os resultados anteriores.
    resultadoEstimativa.replaceChildren();

    resultadoEstimativa.appendChild(
        criarElemento("h3", "Sua estimativa inicial")
    );

    resultadoEstimativa.appendChild(
        criarElemento(
            "p",
            "Água usada nos banhos: aproximadamente " +
            aguaMensal.toLocaleString("pt-BR") +
            " litros por mês."
        )
    );

    resultadoEstimativa.appendChild(
        criarElemento(
            "p",
            "Consumo de energia informado: " +
            energia[respostas.usoEnergia] + "."
        )
    );

    resultadoEstimativa.appendChild(
        criarElemento(
            "p",
            "Desperdício de alimentos informado: " +
            alimentos[respostas.desperdicio] + "."
        )
    );

    resultadoEstimativa.appendChild(
        criarElemento(
            "p",
            "A água considera apenas os banhos. " +
            "Energia e alimentos são classificações informadas, " +
            "não medições reais."
        )
    );

    // Permite refazer o questionário.
    const botao = criarElemento("button", "Refazer questionário");
    botao.type = "button";
    botao.className = "botao-principal";

    botao.addEventListener("click", function () {
        resultadoEstimativa.replaceChildren();
        areaQuestionario.scrollIntoView({ behavior: "smooth" });
    });

    resultadoEstimativa.appendChild(botao);
}


// =============================================
// 5. CADASTRAR AÇÕES SUSTENTÁVEIS
// =============================================

function montarFormularioAcoes() {
    const formulario = document.createElement("form");
    formulario.id = "formulario-nova-acao";

    formulario.appendChild(
        criarElemento("h3", "Cadastrar uma ação sustentável")
    );

    formulario.appendChild(
        criarCampo(
            "Como você diminuiu o desperdício?",
            "descricaoAcao",
            "text"
        )
    );

    formulario.appendChild(
        criarCampo(
            "Categoria",
            "categoriaAcao",
            "select",
            ["Ambiental", "Social", "Saúde"]
        )
    );

    formulario.appendChild(
        criarCampo("Local da ação", "localAcao", "text")
    );

    formulario.appendChild(
        criarCampo(
            "Quantas pessoas participaram?",
            "participantesAcao",
            "number"
        )
    );

    formulario.appendChild(
        criarCampo(
            "Diminuição de gastos ou desperdício (valor numérico)",
            "reducaoAcao",
            "number"
        )
    );

    formulario.appendChild(
        criarElemento(
            "p",
            "Use a mesma unidade ao comparar valores de redução."
        )
    );

    const botao = criarElemento("button", "Salvar ação");
    botao.type = "submit";
    botao.className = "botao-principal";
    formulario.appendChild(botao);

    // Processa os dados enviados pelo morador.
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const descricao = formulario.elements.descricaoAcao.value.trim();
        const categoria = formulario.elements.categoriaAcao.value;
        const local = formulario.elements.localAcao.value.trim();

        const participantes = Number(
            formulario.elements.participantesAcao.value
        );

        const reducao = Number(
            formulario.elements.reducaoAcao.value
        );

        if (
            participantes <= 0 ||
            reducao < 0 ||
            !Number.isFinite(participantes) ||
            !Number.isFinite(reducao)
        ) {
            alert("Confira a quantidade de participantes e a redução.");
            return;
        }

        // Cria o registro da ação.
        const novaAcao = {
            id: criarId(),
            descricao: descricao,
            categoria: categoria,
            local: local,
            participantes: participantes,
            reducao: reducao,

            // Registra automaticamente a data e a hora.
            data: new Date().toISOString()
        };

        acoes.push(novaAcao);

        // Salva os dados no navegador.
        if (!salvarAcoes()) {
            acoes.pop();
            alert("Não foi possível salvar a ação.");
            return;
        }

        // Atualiza a lista e limpa o formulário.
        mostrarAcoes();
        formulario.reset();

        alert("Ação cadastrada com sucesso!");
    });

    formularioAcoes.replaceChildren(formulario);
}


// Cria um identificador para cada ação.
function criarId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}


// =============================================
// 6. EXIBIR AS AÇÕES CADASTRADAS
// =============================================

// Converte a data para o formato brasileiro.
function formatarData(data) {
    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
        return "Data não disponível";
    }

    return dataConvertida.toLocaleDateString("pt-BR");
}

// Mostra todas as ações salvas.
function mostrarAcoes() {
    listaAcoes.replaceChildren();

    if (acoes.length === 0) {
        listaAcoes.appendChild(
            criarElemento(
                "p",
                "Nenhuma ação cadastrada ainda."
            )
        );

        return;
    }

    acoes.forEach(function (acao) {
        const cartao = document.createElement("article");
        cartao.className = "cartao-recurso";

        cartao.appendChild(criarElemento("h3", acao.descricao));
        cartao.appendChild(criarElemento("p", "Categoria: " + acao.categoria));
        cartao.appendChild(criarElemento("p", "Local: " + acao.local));

        cartao.appendChild(
            criarElemento(
                "p",
                "Participantes: " + acao.participantes
            )
        );

        cartao.appendChild(
            criarElemento(
                "p",
                "Diminuição informada: " + acao.reducao
            )
        );

        cartao.appendChild(
            criarElemento(
                "p",
                "Data do cadastro: " + formatarData(acao.data)
            )
        );

        // Cria o botão para excluir o registro.
        const botaoExcluir = criarElemento("button", "Excluir ação");
        botaoExcluir.type = "button";
        botaoExcluir.className = "botao-principal";

        botaoExcluir.addEventListener("click", function () {
            if (!confirm("Deseja realmente excluir esta ação?")) {
                return;
            }

            const listaAnterior = acoes;

            acoes = acoes.filter(function (item) {
                return item.id !== acao.id;
            });

            if (!salvarAcoes()) {
                acoes = listaAnterior;
                alert("Não foi possível excluir a ação.");
                return;
            }

            mostrarAcoes();
        });

        cartao.appendChild(botaoExcluir);
        listaAcoes.appendChild(cartao);
    });
}


// =============================================
// 7. INICIAR O SITE
// =============================================

// Cria os formulários e mostra os registros existentes.
montarQuestionario();
montarFormularioAcoes();
mostrarAcoes();