# Fullmetal Tower Defense
A única coisa desse jogo que foi feita com auxílio de IA é esse readme e os sons, pq sinceramente no tp0 fiz os sons manualmente mas não fiquei suficientemente satisfeito e o readme é a parte mais chata de fazer

## O Jogo

Um tower defense 2D inspirado em Fullmetal Alchemist, feito para o [TP1 de Computação Gráfica](https://github.com/fegemo/utf-cg/tree/main/assignments/tp1-td). Você controla o Alphonse e precisa proteger a Shao May no centro do cenário. Para isso, dá para atirar, construir torres e coletar os drops dos bosses.

**Controles**

| Comando | O que faz |
| --- | --- |
| WASD | Move o Alphonse |
| Clique esquerdo | Atira na direção do mouse |
| E | Constrói uma torre na posição do mouse |
| 1 | Evolui a torre básica sob o mouse para fogo, depois de coletar o fogo |
| 2 | Evolui a torre básica sob o mouse para gelo, depois de coletar o gelo |

A alquimia leva 1,25 segundo e deixa o Alphonse parado. Depois de construir ou evoluir, é preciso esperar 20 segundos. A barra com o relógio mostra quanto falta. Também precisa deixar espaço entre as torres, inclusive perto da Shao May.

As torres atiram sozinhas. A básica tem 10 de vida; as evoluções têm 15. Fogo tira 1 de vida por segundo até o inimigo morrer. Gelo corta a velocidade pela metade por 3 segundos, e novos acertos renovam o tempo. Os dois efeitos podem funcionar juntos.

**Fases e bosses**

Cada fase começa com 20 soldados, um a cada 5 segundos, surgindo fora da tela. Depois que todos morrem, aparecem mais cinco soldados pela direita e o boss atrás deles. Os inimigos atacam a torre mais próxima.

- **Fase 1 — Envy:** ataca de perto e causa 2 de dano. Seu item de fogo libera os tiros de fogo do Alphonse e a evolução da torre de fogo.
- **Fase 2 — Gluttony:** ataca de longe, com um efeito sob a torre que causa 5 de dano. Depois da animação, espera 3 segundos. Seu item libera a torre de gelo.

Para pegar os itens, basta encostar neles. Os soldados têm 10 de vida e os bosses têm 20. As barras mostram a vida e os efeitos ativos; a do boss fica maior, no topo da tela.

Se Shao May morrer nas fases 1 ou 2, é derrota. Ao completar a fase 2, começa o **modo infinito**: o intervalo entre inimigos diminui de 3 até 1 segundo. A vitória já está garantida nessa etapa; quando Shao May cair, aparece a tela de vitória. Tanto vitória quanto derrota mostram o total de inimigos derrotados, incluindo bosses. Reiniciar zera tudo.

**Como rodar**

Abra a pasta com o Live Server do VS Code ou rode este comando na raiz, se tiver Python instalado:

```sh
python -m http.server 8000
```

Depois acesse `http://localhost:8000` em um navegador com WebGL2. Use um servidor local para os módulos e shaders carregarem corretamente.

O jogo usa JavaScript e WebGL2, com um canvas 2D por cima para barras e textos. O cenário tem três variações de grama, arbustos e o piso da Shao May. O mapa dos sprites está no [guia de assets](assets/guia_assets.txt).

## Criador

- **Nome:** Heitor Augusto Botelho.
- **Contato:** heitorhab123@gmail.com.

## Media kit

Faltam adicionar aqui de 1 a 3 capturas reais do jogo: por exemplo, o cenário com as torres, a luta contra Gluttony e a tela de resultado. Os sprites em `assets` são recursos do jogo, não capturas da partida.

## Opcionais

Os nomes seguem os tópicos do enunciado. Aqui está o que entrou no jogo:

- **Texturas animadas:** movimentos para todos os lados, alquimia para construção e ataque, animação idle, ataques, queimadura e morte do Envy usando spritesheets (fiz no asepite).
- **Telas:** menu inicial, dicas em popup, vitória, derrota e reinício. O popup fecha pelo botão, por Esc ou clicando fora.
- **Sons:** música em loop e 15 efeitos para tiros, impactos, ataques, mortes, alquimia, construção, evolução, coleta, cooldown e resultado.
- **Inimigos diferentes:** soldados em enxame, Envy (boss corpo a corpo) e Gluttony (boss à distância).
- **Inimigos em ondas:** duas fases com bosses e modo infinito com dificuldade crescente.
- **Novas torres:** construção com E, animação de surgimento, cooldown e distância mínima entre torres.
- **Torres diferentes:** básica, fogo e gelo, cada uma com sua arma e projétil.
- **Progressão da torre:** a torre básica pode virar fogo ou gelo depois do desbloqueio. Evoluir também recupera a vida para 15.
- **Power-ups:** os bosses deixam itens giratórios de fogo e gelo, coletados pelo Alphonse.
- **Herói:** Alphonse anda pelo teclado e atira pelo mouse, com intervalo de 0,3 segundo. O ataque dele é manual.

Alguns detalhes da versão atual: os efeitos são sprites animados, sem sistema de partículas. O canvas acompanha a janela, mas não há botão de tela cheia. Não há moedas, caminhos por pontos ou colisão entre inimigos. Shao May é o objetivo a defender; quem atira são Alphonse e as torres construídas. O contador aparece na tela de resultado, não durante a partida.

## Créditos

- **Proposta:** [TP1 — Defesa de Torres, de fegemo/utf-cg](https://github.com/fegemo/utf-cg/tree/main/assignments/tp1-td).
- **Tema:** inspirado nos personagens e no universo de Fullmetal Alchemist.
- **Arte:** spritesheets montadas e editadas para o projeto no Aseprite. tudo feito por Heitor Augusto Botelho.
- **Áudio:** música e efeitos sintetizados por código com auxílio do Codex, sem samples externos. Os arquivos usados estão em `audios`.
- **Ferramentas:** JavaScript, WebGL2, Canvas 2D e Aseprite. O código foi feito por Heitor Augusto, apenas o readme e o código python para gerar os áudios foi feito pelo codex, o mesmo foi retirado do repositório, mantive somente os arquivos de áudio (codex fdp, escrevi o trem todo e ele queria levar o credito, vou fazer um commit so pra arrumar essa merda de readme aqui que ele fez).
