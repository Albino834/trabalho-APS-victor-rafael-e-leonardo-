const $ = (id) => document.getElementById(id);

const creatures = {
  "Fênix-dourada": {
    species: "Fênix",
    danger: "Mansa",
    status: "Apta",
    available: true,
  },
  "Dragão-de-cristal": {
    species: "Dragão",
    danger: "Cautelosa",
    status: "Destinada",
    available: false,
  },
  "Grifo-da-floresta": {
    species: "Grifo",
    danger: "Cautelosa",
    status: "Apta",
    available: true,
  },
  "Lobo-lunar": {
    species: "Lobo mágico",
    danger: "Instável",
    status: "Isolada",
    available: false,
  },
};

const sponsorRecords = {
  "Maya Sol": { pending: true },
  "Elara Moon": { pending: false },
};
let adoptions = [];
let selectedRequestId = null;
let nextId = 1048;

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((screen) => screen.classList.toggle("active", screen.id === id));
  document
    .querySelectorAll(".tab")
    .forEach((tab) =>
      tab.classList.toggle("active", tab.dataset.screen === id),
    );
}

function setRole(role) {
  const guardian = role === "guardian";
  $("sponsorRoleBtn").classList.toggle("active", !guardian);
  $("guardianRoleBtn").classList.toggle("active", guardian);
  $("sponsorTabs").classList.toggle("hidden", guardian);
  $("guardianTabs").classList.toggle("hidden", !guardian);
  $("areaLabel").textContent = guardian
    ? "Área do guardião"
    : "Área do patrocinador";
  $("pageTitle").textContent = guardian
    ? "Decisões que protegem o refúgio."
    : "Processar uma adoção.";
  $("pageSubtitle").textContent = guardian
    ? "Analise as solicitações validadas pelo sistema e registre sua decisão."
    : "Solicite o vínculo com uma criatura e acompanhe o processo até a decisão do guardião.";
  $("profileAvatar").textContent = guardian ? "GV" : "EM";
  $("profileName").textContent = guardian ? "Seraphina Vale" : "Elara Moon";
  showScreen(guardian ? "guardianQueueScreen" : "requestScreen");
  if (guardian) renderGuardianQueue();
}

function populateCreatures() {
  $("creature").innerHTML = Object.keys(creatures)
    .map((name) => `<option value="${name}">${name}</option>`)
    .join("");
  updateCreatureSummary();
}

function updateCreatureSummary() {
  const name = $("creature").value,
    creature = creatures[name];
  $("creatureSummary").innerHTML =
    `<div><strong>${name}</strong><span>${creature.species} · Periculosidade ${creature.danger}</span></div><span class="status">${creature.status}</span><small>${creature.available ? "Disponível para nova adoção" : "Não disponível para nova adoção"}</small>`;
}

function checkSponsor(name) {
  return sponsorRecords[name.trim()] || { pending: false };
}

function createAdoption(event) {
  event.preventDefault();
  const sponsor = $("sponsor").value.trim(),
    creatureName = $("creature").value,
    creature = creatures[creatureName];
  if (!sponsor) return;
  const record = checkSponsor(sponsor);
  const adoption = {
    id: `RA-${nextId++}`,
    sponsor,
    creature: creatureName,
    creatureData: creature,
    status: "Solicitada",
    pending: record.pending,
    available: creature.available,
    guardian: null,
    report: null,
    createdAt: "agora",
  };
  if (!creature.available) {
    adoption.status = "Recusada";
    adoption.reason =
      "A criatura não está disponível. Seu status atual não permite uma nova adoção.";
  } else if (record.pending) {
    adoption.status = "Recusada";
    adoption.reason =
      "Foram encontradas pendências no cadastro do patrocinador.";
  }
  adoptions.unshift(adoption);
  renderTracking(adoption);
  showScreen("trackingScreen");
  toast(
    adoption.status === "Recusada"
      ? "A solicitação foi encerrada após as verificações do sistema."
      : "Solicitação registrada com status Solicitada.",
  );
  renderGuardianQueue();
}

function processAdoption(adoption, decision) {
  if (!adoption.available) {
    adoption.status = "Recusada";
    adoption.reason =
      "A criatura não está disponível. Seu status atual não permite uma nova adoção.";
  } else if (adoption.pending) {
    adoption.status = "Recusada";
    adoption.reason =
      "Foram encontradas pendências no cadastro do patrocinador.";
  } else if (decision === "reject") {
    adoption.status = "Recusada";
    adoption.reason =
      "O guardião não autorizou a adoção após analisar a solicitação.";
  } else {
    adoption.status = "Ativa";
    adoption.guardian = "Seraphina Vale";
    adoption.report = {
      type: "Relatório inicial de bem-estar",
      createdAt: "agora",
    };
  }
  renderTracking(adoption);
  renderGuardianQueue();
  renderHistory();
  toast(
    adoption.status === "Ativa"
      ? "Adoção ativada e relatório inicial gerado."
      : "Solicitação encerrada como recusada.",
  );
}

function renderTracking(adoption) {
  const requested = `<div class="timeline-item done"><div><strong>Solicitação registrada</strong><span>O sistema criou ${adoption.id} com status Solicitada.</span></div></div>`;
  const checks =
    adoption.available && !adoption.pending
      ? `<div class="timeline-item done"><div><strong>Verificações concluídas</strong><span>Criatura disponível e patrocinador sem pendências.</span></div></div>`
      : `<div class="timeline-item done"><div><strong>Verificações concluídas</strong><span>${adoption.reason || "O sistema encontrou uma condição que impede o avanço."}</span></div></div>`;
  let final = `<div class="timeline-item current"><div><strong>Aguardando decisão do guardião</strong><span>A solicitação foi encaminhada para análise.</span></div></div>`;
  if (adoption.status === "Ativa")
    final = `<div class="timeline-item done"><div><strong>Adoção ativada</strong><span>Autorizada por ${adoption.guardian}.</span></div></div><div class="timeline-item done"><div><strong>Relatório inicial gerado</strong><span>${adoption.report.type} criado pelo sistema.</span></div></div>`;
  if (adoption.status === "Recusada")
    final = `<div class="timeline-item current"><div><strong>Adoção recusada</strong><span>${adoption.reason}</span></div></div>`;
  const decisionCheck =
    adoption.status === "Ativa"
      ? "Guardião autorizador registrado"
      : adoption.status === "Recusada" &&
          (!adoption.available || adoption.pending)
        ? "Processo encerrado pelo sistema"
        : "Decisão do guardião pendente";
  const checksList = `<ul class="check-list"><li>${adoption.available ? "Criatura disponível" : "Criatura indisponível"}</li><li>${adoption.pending ? "Pendências encontradas" : "Sem pendências no cadastro"}</li><li>${decisionCheck}</li></ul>`;
  $("trackingContent").innerHTML =
    `<div class="card tracking-card"><div class="adoption-overview"><p class="kicker">${adoption.id}</p><h3>${adoption.creature}</h3><p>Solicitada por ${adoption.sponsor} · ${adoption.createdAt}</p><span class="status-badge ${adoption.status === "Ativa" ? "status-active" : adoption.status === "Recusada" ? "status-refused" : "status-requested"}">${adoption.status}</span>${checksList}</div><div class="timeline"><h3>Linha do tempo do processo</h3>${requested}${checks}${final}</div></div>`;
}

function renderGuardianQueue() {
  const pending = adoptions.filter((item) => item.status === "Solicitada");
  $("pendingCount").textContent = pending.length;
  $("requestList").innerHTML = pending.length
    ? pending
        .map(
          (item) =>
            `<button class="request-item ${selectedRequestId === item.id ? "selected" : ""}" data-id="${item.id}"><span class="request-avatar">${initials(item.sponsor)}</span><div><strong>${item.sponsor}</strong><span>${item.creature} · ${item.id}</span></div><span class="mini-status">Solicitada</span></button>`,
        )
        .join("")
    : `<div class="list-empty"><strong>Nenhuma solicitação pendente.</strong><br>As novas solicitações aparecerão aqui.</div>`;
  document.querySelectorAll(".request-item").forEach((button) =>
    button.addEventListener("click", () => {
      selectedRequestId = button.dataset.id;
      renderGuardianQueue();
    }),
  );
  const selected =
    pending.find((item) => item.id === selectedRequestId) || pending[0];
  selectedRequestId = selected ? selected.id : null;
  renderGuardianDetail(selected);
}

function renderGuardianDetail(adoption) {
  if (!adoption) {
    $("guardianDetail").innerHTML =
      `<p class="kicker">Análise do guardião</p><h3>Nenhuma solicitação selecionada</h3><p>Quando um patrocinador enviar um pedido, os dados e as verificações aparecerão aqui.</p>`;
    return;
  }
  $("guardianDetail").innerHTML =
    `<p class="kicker">${adoption.id} · análise</p><h3>${adoption.creature}</h3><p>Solicitada por ${adoption.sponsor}</p><div class="detail-meta"><div class="meta-box"><small>Status da criatura</small><strong>${adoption.creatureData.status}</strong></div><div class="meta-box"><small>Periculosidade</small><strong>${adoption.creatureData.danger}</strong></div></div><div class="verification"><h4>Verificações do ProcessarAdocaoControl</h4><p><b>${adoption.available ? "✓" : "×"}</b> Criatura ${adoption.available ? "disponível" : "indisponível"}</p><p><b>${adoption.pending ? "×" : "✓"}</b> Patrocinador ${adoption.pending ? "possui pendências" : "sem pendências"}</p></div><div class="decision-actions"><button class="button primary" data-decision="approve" ${!adoption.available || adoption.pending ? "disabled" : ""}>Autorizar adoção</button><button class="button danger" data-decision="reject">Recusar</button></div>`;
  $("guardianDetail")
    .querySelectorAll("[data-decision]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        processAdoption(
          adoption,
          button.dataset.decision === "approve" ? "approve" : "reject",
        ),
      ),
    );
}

function renderHistory() {
  const history = adoptions.filter((item) => item.status !== "Solicitada");
  $("historyContent").innerHTML = history.length
    ? history
        .map(
          (item) =>
            `<div class="history-row"><div><strong>${item.sponsor}</strong><span>${item.id}</span></div><span>${item.creature}</span><span>${item.guardian ? `Guardião: ${item.guardian}` : item.reason}</span><span class="status-badge ${item.status === "Ativa" ? "status-active" : "status-refused"}">${item.status}</span></div>`,
        )
        .join("")
    : `<div class="list-empty">Ainda não há decisões registradas.</div>`;
}

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 2800);
}

$("creature").addEventListener("change", updateCreatureSummary);
$("adoptionForm").addEventListener("submit", createAdoption);
$("sponsorRoleBtn").addEventListener("click", () => setRole("sponsor"));
$("guardianRoleBtn").addEventListener("click", () => setRole("guardian"));
$("newRequestBtn").addEventListener("click", () => showScreen("requestScreen"));
document.querySelectorAll(".tab").forEach((tab) =>
  tab.addEventListener("click", () => {
    showScreen(tab.dataset.screen);
    if (tab.dataset.screen === "guardianHistoryScreen") renderHistory();
  }),
);
populateCreatures();
renderHistory();
