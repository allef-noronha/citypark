let listaFiltrada = [];

document.addEventListener("DOMContentLoaded", () => {
  const url = "https://docs.google.com/spreadsheets/d/18dPPkPvjb6HCutlX6UE-SFCXfsfeUPgoufV9xDctN5c/gviz/tq?tqx=out:json&sheet=Tabela%20de%20Vendas";

  fetch(url)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const rows = json.table.rows;
      const data = rows.map(row => {
        const c = row.c;
        return {
          unidade: c[0]?.v || "-",
          preco: c[1]?.v ?? "-",
          area: c[2]?.v || "-",
          sinal: c[3]?.v || "-",
          parcela: c[4]?.v || "-",
          intercalada: c[5]?.v || "-",
          chaves: c[6]?.v || "-",
          status: c[7]?.v || "-",
          tipologia: c[8]?.v || "-",
          imagem: c[9]?.v || "-"
        };
      });

      window.dadosTabela = data;
      renderTabela(data);

      const form = document.getElementById("filtro-form");
      const fUnidade = document.getElementById("filtro-unidade");
      const fStatus = document.getElementById("filtro-status");
      const fTipologia = document.getElementById("filtro-tipologia");
      const fValor = document.getElementById("filtro-valor");

      form.addEventListener("input", () => {
        const unidade = fUnidade.value.toLowerCase();
        const status = fStatus.value.toLowerCase();
        const tipo = fTipologia.value.toLowerCase();
        const valorRaw = fValor.value.trim();
        const valorLimpo = valorRaw.replace(/\./g, "").replace(",", ".");
        const valorMax = parseFloat(valorLimpo) || Infinity;

        console.log("=== FILTRO ===");
        console.log("Valor bruto do input:", valorRaw);
        console.log("Valor limpo:", valorLimpo);
        console.log("Valor máximo convertido:", valorMax);

        listaFiltrada = data.filter(item => {
          let precoTratado = item.preco;

          if (typeof precoTratado === "number") {
            precoTratado = precoTratado.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL"
            });
          }

          const precoNumerico = parseFloat(
            precoTratado.toString().replace(/[R$\s.]/g, "").replace(",", ".")
          ) || 0;

          console.log(`→ Unidade ${item.unidade} - Preço numérico:`, precoNumerico);

          return (
            item.unidade.toLowerCase().includes(unidade) &&
            item.status.toLowerCase().includes(status) &&
            item.tipologia.toLowerCase().includes(tipo) &&
            precoNumerico <= valorMax
          );
        });

        renderTabela(listaFiltrada);
      });
    });
});

function renderTabela(data) {
  const container = document.getElementById("tabela-vendas");
  container.innerHTML = "";
  listaFiltrada = data;
  data.forEach((item, index) => {
    const statusClass = item.status.toLowerCase().includes("disponível") ? "status-disponivel" :
                        item.status.toLowerCase().includes("reservado") ? "status-reservado" :
                        item.status.toLowerCase().includes("vendido") ? "status-vendido" : "";

    const div = document.createElement("div");
    div.className = `unidade-card ${statusClass}`;

    div.innerHTML = `
      <div class="unidade-info">
        <span><strong>Unidade:</strong> ${item.unidade}</span>
        <span><strong>Tipologia:</strong> ${item.tipologia}</span>
        <span><strong>Área:</strong> ${item.area}</span>
        <span class="unidade-status"><strong>Status:</strong> <span class="status-texto ${statusClass}">${item.status}</span></span>
      </div>
      <button class="ver-btn" onclick="mostrarDetalhes(${index})">VER</button>
    `;
    container.appendChild(div);
  });
}

function mostrarDetalhes(index) {
  const item = listaFiltrada[index];
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popup-content");

  // Formatar preço (caso seja número)
  const precoFormatado = typeof item.preco === "number"
    ? item.preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })
    : item.preco;

  popupContent.innerHTML = `
    <h2>Condições - Unidade ${item.unidade}</h2>
    <p><strong>Preço à vista:</strong> ${precoFormatado}</p>
    <p><strong>Sinal:</strong> ${item.sinal}</p>
    <p><strong>Parcelas mensais (80x):</strong> ${item.parcela}</p>
    <p><strong>Intercaladas semestrais (12x):</strong> ${item.intercalada}</p>
    <p><strong>Chaves:</strong> ${item.chaves}</p>

    <div class="popup-botoes">
      <button class="ver-btn" onclick="enviarProposta('${item.unidade}')">Enviar proposta</button>
      <button class="ver-btn" onclick="fecharPopup()">Fechar</button>
      ${item.imagem && item.imagem !== "-" ? `<button class="ver-btn" onclick="mostrarPlanta('${item.imagem}')">Planta</button>` : ""}
    </div>
  `;

  popup.style.display = "flex";
}


function fecharPopup() {
  document.getElementById("popup").style.display = "none";
}

function mostrarPlanta(imagemUrl) {
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popup-content");

  popupContent.innerHTML = `
    <h2>Planta da Unidade</h2>
    <img src="img/${imagemUrl}" alt="Planta da unidade" class="planta-popup" />
    <div class="popup-botoes">
      <button class="ver-btn" onclick="fecharPopup()">Fechar</button>
    </div>
  `;
  popup.style.display = "flex";
}



// function enviarProposta(unidade) {
//   alert(`A proposta para a unidade ${unidade} será enviada ao setor comercial.`);
//   fecharPopup();
// }


function enviarProposta(unidade) {
  const item = listaFiltrada.find(i => i.unidade === unidade);
  if (!item) return;

  // Criar popup personalizado para coleta de dados do cliente
  const popup = document.getElementById("popup");
  const popupContent = document.getElementById("popup-content");

  popupContent.innerHTML = `
    <h2>Solicitar Proposta - Unidade ${unidade}</h2>
    <form id="proposta-form">
      <div class="form-group">
        <label>Nome Completo:</label>
        <input type="text" name="nome" required>
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input type="email" name="email" required>
      </div>
      <div class="form-group">
        <label>Telefone:</label>
        <input type="tel" name="telefone" required>
      </div>
      <div class="form-group">
        <label>CPF:</label>
        <input type="text" name="cpf" required>
      </div>
      <div class="form-group">
        <label>CRECI:</label>
        <input type="text" name="creci" required>
      </div>
      <div class="form-group">
        <label>Observações:</label>
        <textarea name="observacoes" rows="3"></textarea>
      </div>
      <div class="popup-botoes">
        <button type="submit" class="ver-btn">Enviar Solicitação</button>
        <button type="button" class="ver-btn" onclick="fecharPopup()">Cancelar</button>
      </div>
    </form>
  `;

  popup.style.display = "flex";

  // Adicionar listener para envio do formulário
  document.getElementById("proposta-form").addEventListener("submit", function(e) {
    e.preventDefault();
    enviarSolicitacao(this, item);
  });
}

async function enviarSolicitacao(form, item) {
  const formData = new FormData(form);
  const dados = {
    unidade: item.unidade,
    preco: item.preco,
    tipologia: item.tipologia,
    area: item.area,
    nome: formData.get('nome'),
    email: formData.get('email'),
    telefone: formData.get('telefone'),
    cpf: formData.get('cpf'),
    cpf: formData.get('creci'),
    observacoes: formData.get('observacoes'),
    timestamp: new Date().toLocaleString('pt-BR')
  };

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbyJwcKLWWH-lAyOSyXGhtm62-bvM0HoVuLYqEyMdIC9fvqSOzVK8Nv6iommJO-SDOH-aw/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados)
    });

    if (response.ok) {
      alert('Solicitação enviada com sucesso! Você receberá um retorno em breve.');
      fecharPopup();
    } else {
      throw new Error('Erro no envio');
    }
  } catch (error) {
    alert('Erro ao enviar solicitação. Tente novamente.');
    console.error('Erro:', error);
  }
}


