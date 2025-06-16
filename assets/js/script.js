var menu = document.querySelector("header")
var menuHamburguer = document.querySelector(".navMenuHamburguer")

menuHamburguer.addEventListener("click", ()=> {
    menu.classList.toggle("ativo")
})

  document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.carousel-container .flex.overflow-x-auto');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    // Captura a largura de um card (já renderizado)
    const card = carousel.querySelector('.divDadosEstatisticos');
    const cardWidth = card.offsetWidth + 16; // 16px se tiver gap-4 (1rem)

    prevButton.addEventListener('click', () => {
      carousel.scrollBy({
        left: -cardWidth,
        behavior: 'smooth'
      });
    });

    nextButton.addEventListener('click', () => {
      carousel.scrollBy({
        left: cardWidth,
        behavior: 'smooth'
      });
    });
  });

    document.addEventListener('DOMContentLoaded', () => {
        const botoes = document.querySelectorAll('.btnMostarPassoInvestimento');
        const secoes = {
            "Identificação": document.getElementById('secaoIdentificacao'),
            "Pagamento": document.getElementById('secaoPagamento'),
            "Hora da riqueza": document.getElementById('horaRiqueza')
        };

        // Função para ocultar todas as seções
        function esconderTodasSecoes() {
            Object.values(secoes).forEach(secao => {
                secao.style.display = 'none';
            });
        }

        // Inicialização: mostrar apenas a primeira seção
        esconderTodasSecoes();
        secoes["Identificação"].style.display = 'flex';

        // Adiciona evento de clique a cada botão
        botoes.forEach(botao => {
            botao.addEventListener('click', () => {
                // Remove classe 'ativo' de todos os botões
                botoes.forEach(b => b.classList.remove('ativo'));

                // Adiciona classe 'ativo' ao botão clicado
                botao.classList.add('ativo');

                // Esconde todas as seções
                esconderTodasSecoes();

                // Mostra a seção correspondente
                const textoBotao = botao.textContent.trim();
                if (secoes[textoBotao]) {
                    secoes[textoBotao].style.display = 'flex';
                }
            });
        });
    });