document.addEventListener('DOMContentLoaded', () => {
    const menu = document.querySelector("header");
    const menuHamburguer = document.querySelector(".navMenuHamburguer");

    if (menuHamburguer && menu) {
        menuHamburguer.addEventListener("click", () => {
            menu.classList.toggle("ativo");
        });
    }

    const carousel = document.querySelector('.carousel-container .flex.overflow-x-auto');
    const prevButton = document.querySelector('.carousel-button.prev');
    const nextButton = document.querySelector('.carousel-button.next');

    if (carousel && prevButton && nextButton) {
        const card = carousel.querySelector('.divDadosEstatisticos');
        const cardWidth = card ? card.offsetWidth + 16 : 0;

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
    }

    const botoes = document.querySelectorAll('.btnMostarPassoInvestimento');
    const secoes = {
        "Identificação": document.getElementById('secaoIdentificacao'),
        "Alimente sua IA": document.getElementById('secaoPagamento'),
        "Hora da riqueza": document.getElementById('horaRiqueza')
    };

    function esconderTodasSecoes() {
        Object.values(secoes).forEach(secao => {
            if (secao) secao.style.display = 'none';
        });
    }

    if (botoes.length > 0 && Object.values(secoes).every(secao => secao)) {
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
    }

    const formCriar = document.querySelector(".formCriarConta");
    const formAcessar = document.querySelector(".formAcessarConta");
    const mostrarFormEntrar = document.querySelector("#botaoMostrarFormEntrar");
    const mostrarFormCriar = document.querySelector("#botaoMostrarFormCriar");

    if (formCriar && formAcessar && mostrarFormEntrar && mostrarFormCriar) {
        mostrarFormEntrar.addEventListener("click", () => {
            formCriar.classList.remove("ativo");
            formAcessar.classList.add("ativo");
        });

        mostrarFormCriar.addEventListener("click", () => {
            formCriar.classList.add("ativo");
            formAcessar.classList.remove("ativo");
        });
    }

    document.querySelectorAll('.acordeaoQuestao').forEach(questao => {
        questao.addEventListener('click', () => {
            const acordeao = questao.closest('.acordeao');
            const icone = acordeao.querySelector('.checkAcordeao');

            document.querySelectorAll('.acordeao').forEach(item => {
                if (item !== acordeao) {
                    item.classList.remove('ativo');
                    const itemIcone = item.querySelector('.checkAcordeao');
                    if (itemIcone) itemIcone.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            });

            acordeao.classList.toggle('ativo');
            if (icone) {
                if (acordeao.classList.contains('ativo')) {
                    icone.classList.replace('fa-chevron-down', 'fa-chevron-up');
                } else {
                    icone.classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            }
        });
    });


    const expandButton = document.getElementById('expandButton');
    const expandableSection = document.getElementById('expandableSection');

    if (expandButton && expandableSection) {
        expandButton.addEventListener('click', () => {
            expandableSection.classList.toggle('expanded');
            expandableSection.classList.toggle('fade-mask');
            expandButton.textContent = expandableSection.classList.contains('expanded')
                ? 'Recolher Todas as Questões'
                : 'Explorar Todas as Questões';
        });
    }
});