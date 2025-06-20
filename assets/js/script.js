var menu = document.querySelector("header")
var menuHamburguer = document.querySelector(".navMenuHamburguer")

menuHamburguer.addEventListener("click", ()=> {
    menu.classList.toggle("ativo")
})

  document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.querySelector('.carousel-container .flex.overflow-x-auto');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    const card = carousel.querySelector('.divDadosEstatisticos');
    const cardWidth = card.offsetWidth + 16; 

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

        function esconderTodasSecoes() {
            Object.values(secoes).forEach(secao => {
                secao.style.display = 'none';
            });
        }

        esconderTodasSecoes();
        secoes["Identificação"].style.display = 'flex';

        botoes.forEach(botao => {
            botao.addEventListener('click', () => {
                botoes.forEach(b => b.classList.remove('ativo'));

                botao.classList.add('ativo');

                esconderTodasSecoes();

                const textoBotao = botao.textContent.trim();
                if (secoes[textoBotao]) {
                    secoes[textoBotao].style.display = 'flex';
                }
            });
        });
    });

document.querySelectorAll('.acordeaoQuestao').forEach(questao => {
  questao.addEventListener('click', () => {
    const acordeao = questao.closest('.acordeao');
    const resposta = acordeao.querySelector('.acordeaoResposta');
    const icone = acordeao.querySelector('.checkAcordeao');
    
    // Fecha todos os outros acordeões
    document.querySelectorAll('.acordeao').forEach(item => {
      if (item !== acordeao) {
        item.classList.remove('ativo');
        item.querySelector('.checkAcordeao').classList.replace('fa-chevron-up', 'fa-chevron-down');
      }
    });
    
    // Alterna o atual
    acordeao.classList.toggle('ativo');
    
    // Alterna ícone
    if (acordeao.classList.contains('ativo')) {
      icone.classList.replace('fa-chevron-down', 'fa-chevron-up');
    } else {
      icone.classList.replace('fa-chevron-up', 'fa-chevron-down');
    }
  });
});


const expandButton = document.getElementById('expandButton');
const expandableSection = document.getElementById('expandableSection');

expandButton.addEventListener('click', () => {
    expandableSection.classList.toggle('expanded');
    expandableSection.classList.toggle('fade-mask');
    expandButton.textContent = expandableSection.classList.contains('expanded') 
    ? 'Recolher Todas as Questões' 
    : 'Explorar Todas as Questões';
});