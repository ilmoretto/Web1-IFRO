// Espera a página carregar completamente, antes de executar o código
document.addEventListener('DOMContentLoaded', function () {


    const botaoSimples = document.getElementById('botao-simples');
    const resultadoClick = document.getElementById('resultado-click');

    botaoSimples.addEventListener('click', function () {
        resultadoClick.textContent = "Você clicou no botão. O evento 'click' foi disparado!";
        resultadoClick.classList.add('pulsar');
    });

    const botaoContador = document.getElementById('botao-contador');
    let contador = 0;

    botaoContador.addEventListener('click', function () {
        contador++;
        botaoContador.textContent = `Contador: ${contador}`;
        if (contador > 1) {
            resultadoClick.textContent = `Você clicou ${contador} vezes!`;
        }
        else {
            resultadoClick.textContent = `Você clicou ${contador} vez!`;
        }

    });

    const areaMouse = document.getElementById("area-mouse");
    const resultadoMouse = document.getElementById("resultado-mouse");

    // mouse dentro da área
    areaMouse.addEventListener('mouseover', function () {
        resultadoMouse.textContent = "Mouse entrou na área.";
        areaMouse.style.backgroundColor = '#ff6a13';
        areaMouse.style.color = '#fff';
    });

    // mouse fora da área
    areaMouse.addEventListener('mouseout', function () {
        resultadoMouse.textContent = "Mouse saiu da área.";
        areaMouse.style.backgroundColor = '#e2e8f0';
        areaMouse.style.color = '#000';
    });

    // Quando movimentar o mouse
    areaMouse.addEventListener('mousemove', function (evento) {
        // O parâmetro definido na função faz referência ao elemento que recebe o evento
        const x = evento.offsetX;
        const y = evento.offsetY;

        resultadoMouse.textContent = `Mouse movendo em X: ${x}, Y: ${y}`;
    });


    //teclado

    const inputTexto = document.getElementById("input-texto");
    const resultadoTeclado = document.getElementById("resultado-teclado");


    // Evento para detectar teclas pressionadas
    inputTexto.addEventListener('keydown', function (evento) {

        if (evento.key === "Enter") {
            resultadoTeclado.textContent = "Você está pressionando o Enter.";
        }else{
            resultadoTeclado.textContent = `Você está pressionando: ${evento.key}`;
        }
    });

    // Evento para limpar o conteúdo quando a tecla for liberada
    inputTexto.addEventListener('keyup', function () {
        resultadoTeclado.textContent = "Você está pressionando: ";
    });

});