const form = document.querySelector('#formulario');
let historico = [];

// carregar histórico do localStorage ao iniciar
function carregarHistorico() {
    const historicoSalvo = localStorage.getItem('historicoIMC');
    if (historicoSalvo) {
        historico = JSON.parse(historicoSalvo);
        exibirHistorico();
    }
}

// salvar histórico no localStorage
function salvarHistorico() {
    localStorage.setItem('historicoIMC', JSON.stringify(historico));
}

// destacar linha da tabela de acordo com o IMC
function destacarLinhaTabela(imc) {
    // remove destaque de todas as linhas
    const linhas = document.querySelectorAll('.tabela-imc tbody tr');
    linhas.forEach(linha => {
        linha.style.fontWeight = 'normal';
        linha.style.backgroundColor = '';
    });
    
    // adiciona destaque à linha correspondente
    let linhaDestacada = null;
    if (imc < 18.5) linhaDestacada = linhas[0];
    else if (imc <= 24.9) linhaDestacada = linhas[1];
    else if (imc <= 29.9) linhaDestacada = linhas[2];
    else if (imc <= 34.9) linhaDestacada = linhas[3];
    else if (imc <= 39.9) linhaDestacada = linhas[4];
    else if (imc >= 40) linhaDestacada = linhas[5];
    
    if (linhaDestacada) {
        linhaDestacada.style.fontWeight = 'bold';
        linhaDestacada.style.backgroundColor = '#ffff99';
        setTimeout(() => {
            linhaDestacada.style.backgroundColor = '';
        }, 2000);
    }
}

// exibir histórico
function exibirHistorico() {
    const listaHistorico = document.querySelector('#listaHistorico');
    
    if (historico.length === 0) {
        listaHistorico.innerHTML = '<p class="historico-vazio">Nenhum cálculo realizado ainda.</p>';
        return;
    }
    
    listaHistorico.innerHTML = '<div class="lista-historico">';
    historico.slice().reverse().forEach((item, index) => {
        const categoriaClass = getCategoriaClass(item.nivel);
        
        listaHistorico.innerHTML += `
            <div class="item-historico" data-id="${item.id}">
                <div class="info-historico">
                    <strong>${escapeHtml(item.nome)}</strong>
                    <span class="categoria ${categoriaClass}">${item.nivel}</span>
                    <div>
                        📊 IMC: ${item.imc} | ⚖️ Peso: ${item.peso}kg | 📏 Altura: ${item.altura}m
                        <br>
                        📅 ${item.data}
                    </div>
                </div>
                <button class="btn-remover" onclick="removerItem(${item.id})">✖</button>
            </div>
        `;
    });
    listaHistorico.innerHTML += '</div>';
}

function getCategoriaClass(nivel) {
    const classes = {
        'Abaixo do Peso': 'categoria-abaxo-peso',
        'Peso Normal': 'categoria-peso-normal',
        'Sobrepeso': 'categoria-sobrepeso',
        'Obesidade Grau 1': 'categoria-obesidade-1',
        'Obesidade Grau 2': 'categoria-obesidade-2',
        'Obesidade Gra3': 'categoria-obesidade-3'
    };
    return classes[nivel] || '';
}

// função para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// remover item do histórico
window.removerItem = function(id) {
    if (confirm('Tem certeza que deseja remover este item do histórico?')) {
        historico = historico.filter(item => item.id !== id);
        salvarHistorico();
        exibirHistorico();
    }
};

// limpar todo o histórico
function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        historico = [];
        salvarHistorico();
        exibirHistorico();
    }
}

form.addEventListener('submit', function (event) {
    event.preventDefault();
    
    const inputNome = event.target.querySelector('#nome');
    const inputPeso = event.target.querySelector('#peso');
    const inputAltura = event.target.querySelector('#altura');
    
    const nome = inputNome.value.trim();
    const peso = Number(inputPeso.value);
    const altura = Number(inputAltura.value);

    // Validações
    if (!nome) {
        setResultado('Por favor, digite o nome!', false);
        return;
    }

    if (isNaN(peso) || peso <= 0 || peso > 500) {
        setResultado('Peso inválido! Digite um peso entre 0.1 e 500 kg', false);
        return;
    }

    if (isNaN(altura) || altura <= 0 || altura > 2.5) {
        setResultado('Altura inválida! Digite uma altura entre 0.5 e 2.5 metros', false);
        return;
    }
     
    const imc = getImc(peso, altura);
    const nivelImc = getNivelImc(imc);
    
    // destacar linha correspondente na tabela
    destacarLinhaTabela(imc);
    
    const msg = `Seu IMC é ${imc} (${nivelImc}).`;
    setResultado(msg, true);
    
    // adicionar ao histórico
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleString('pt-BR');
    
    const registro = {
        id: Date.now(),
        nome: nome,
        peso: peso,
        altura: altura,
        imc: imc,
        nivel: nivelImc,
        data: dataFormatada
    };
    
    historico.push(registro);
    salvarHistorico();
    exibirHistorico();
    
    // limpar campos após calcular (opcional)
    // inputNome.value = '';
    inputPeso.value = '';
    inputAltura.value = '';
    inputNome.focus();
});

function getNivelImc(imc) {
    const nivel = ['Abaixo do Peso', 'Peso Normal', 'Sobrepeso', 
        'Obesidade Grau 1', 'Obesidade Grau 2', 'Obesidade Gra3'];

    if (imc >= 40) return nivel[5];
    if (imc >= 35) return nivel[4];   
    if (imc >= 30) return nivel[3];    
    if (imc >= 25) return nivel[2];  
    if (imc >= 18.5) return nivel[1];  
    if (imc < 18.5) return nivel[0];
}

function getImc(peso, altura) {
    const imc = peso / (altura * altura);
    return imc.toFixed(2);
}

function criarParagrafo() {
    const p = document.createElement('p');
    return p;
}

function setResultado(message, isValid) {
    const resultado = document.querySelector('#resultado');
    resultado.innerHTML = '';
    const p = criarParagrafo();

    if (isValid) {
        p.classList.add('paragrafo-resultado');
    } else {
        p.classList.add('bad');
    }

    p.innerHTML = message;
    resultado.appendChild(p);
    
    // rolar suavemente para o resultado
    resultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// inicializar
carregarHistorico();

// adicionar evento para o botão de limpar histórico
document.querySelector('#btnLimparHistorico').addEventListener('click', limparHistorico);