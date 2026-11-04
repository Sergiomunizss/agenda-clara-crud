/* Agenda Clara — Tarefa 2. Autor: Sérgio Luiz Muniz Botelho Junior.
 * Front-end sem dependências e sem chamadas de rede. Todas as operações
 * utilizam localStorage. Exemplos de integração REST estão comentados abaixo.
 */
(() => {
  "use strict";
  const STORAGE_KEY = "agenda-clara-clientes-v1";
  const PAGE_SIZE = 8;
  const $ = (id) => document.getElementById(id);
  const editor = $("editor");
  const form = $("formulario");
  const confirmation = $("confirmacao");
  const fields = ["nome", "email", "telefone", "cidade", "status"];
  const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });
  const examples = [
    ["Ana Costa", "ana.costa@example.com", "São Paulo, SP", "ativo", "2025-01-15"],
    ["Bruno Lima", "bruno.lima@example.com", "Rio de Janeiro, RJ", "ativo", "2025-01-20"],
    ["Camila Rocha", "camila.rocha@example.com", "Belo Horizonte, MG", "inativo", "2025-02-05"],
    ["Diego Alves", "diego.alves@example.com", "Curitiba, PR", "ativo", "2025-02-12"],
    ["Elisa Martins", "elisa.martins@example.com", "Porto Alegre, RS", "inativo", "2025-02-25"],
    ["Felipe Souza", "felipe.souza@example.com", "Salvador, BA", "ativo", "2025-03-10"]
  ].map(([nome, email, cidade, status, criadoEm], i) => ({ id: `exemplo-${i + 1}`, nome, email, cidade, status, criadoEm, telefone: "" }));
  let clients = [];
  let page = 1;
  let editing = null;
  let originalForm = "";
  let action = null;
  let toastTimer;
  let submitting = false;
  const normalize = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const clean = (text) => text.normalize("NFC").trim().replace(/\s+/g, " ");
  const isClient = (c) => c && typeof c.id === "string" && typeof c.nome === "string" && typeof c.email === "string" && typeof c.cidade === "string" && typeof c.telefone === "string" && ["ativo", "inativo"].includes(c.status) && /^\d{4}-\d{2}-\d{2}$/.test(c.criadoEm);

  function announce(message) {
    clearTimeout(toastTimer);
    $("mensagem").textContent = message;
    toastTimer = setTimeout(() => { $("mensagem").textContent = ""; }, 4500);
  }
  function showWarning(message) { $("aviso").textContent = message; $("aviso").hidden = false; }
  function readStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved) || !saved.every(isClient) || new Set(saved.map((c) => c.id)).size !== saved.length) throw new Error("Formato de cadastro inválido.");
    return saved;
  }
  function persist(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      clients = next;
      $("aviso").hidden = true;
      return true;
    } catch {
      showWarning("Não foi possível salvar neste navegador. Verifique o espaço disponível e permita o armazenamento local. Seus campos continuam preenchidos para tentar novamente.");
      return false;
    }
  }
  function latestClients() {
    try { return readStorage() ?? clients; }
    catch { return clients; }
  }

  // READ (consulta): no futuro, substituir a leitura local por:
  // const resposta = await fetch("/api/clientes");
  // const clientes = await resposta.json();
  // Uma API real também deve verificar resposta.ok e tratar erros HTTP.
  function load() {
    try {
      const saved = readStorage();
      clients = saved ?? structuredClone(examples);
      if (saved === null) persist(clients);
    } catch {
      clients = structuredClone(examples);
      showWarning("Não foi possível ler os cadastros salvos. Exibindo os exemplos; confira as permissões de armazenamento antes de salvar alterações.");
    }
    render();
  }
  function filteredClients() {
    const query = normalize($("busca").value.trim());
    const status = $("filtro-status").value;
    return clients.filter((c) => (status === "todos" || c.status === status) && normalize(`${c.nome} ${c.email}`).includes(query)).sort((a, b) => collator.compare(a.nome, b.nome));
  }
  function cell(className, text) {
    const td = document.createElement("td");
    if (className) td.className = className;
    if (text !== undefined) td.textContent = text;
    return td;
  }
  function iconButton(type, client) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `icon-button ${type}`;
    button.dataset.action = type;
    button.dataset.id = client.id;
    const label = `${type === "edit" ? "Editar" : "Excluir"} ${client.nome}`;
    button.setAttribute("aria-label", label);
    button.title = label;
    // SVGs constantes: nenhum dado digitado é interpretado como HTML.
    button.innerHTML = type === "edit"
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l5-1L20 8a2 2 0 0 0-5-5L4 14z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg>';
    return button;
  }
  function render() {
    $("total").textContent = clients.length;
    $("ativos").textContent = clients.filter((c) => c.status === "ativo").length;
    $("inativos").textContent = clients.filter((c) => c.status === "inativo").length;
    const found = filteredClients();
    const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
    page = Math.max(1, Math.min(page, pages));
    const fragment = document.createDocumentFragment();
    found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).forEach((c, index) => {
      const row = document.createElement("tr");
      const nameCell = cell();
      const customer = document.createElement("div"); customer.className = "customer";
      const avatar = document.createElement("span"); avatar.className = "avatar"; avatar.dataset.color = index % 5; avatar.setAttribute("aria-hidden", "true");
      const parts = c.nome.trim().split(/\s+/); avatar.textContent = (parts[0][0] + (parts.length > 1 ? parts.at(-1)[0] : "")).toLocaleUpperCase("pt-BR");
      const info = document.createElement("div");
      const name = document.createElement("p"); name.className = "customer-name"; name.textContent = c.nome;
      const city = document.createElement("p"); city.className = "customer-city"; city.textContent = c.cidade || "Cidade não informada";
      info.append(name, city); customer.append(avatar, info); nameCell.append(customer);
      const contact = cell("contact");
      const email = document.createElement("span"); email.className = "contact-email"; email.textContent = c.email; contact.append(email);
      if (c.telefone) { const phone = document.createElement("p"); phone.className = "phone"; phone.textContent = c.telefone; contact.append(phone); }
      const statusCell = cell("status-cell");
      const status = document.createElement("span"); status.className = `status${c.status === "ativo" ? " is-active" : ""}`; status.textContent = c.status === "ativo" ? "Ativo" : "Inativo"; statusCell.append(status);
      const date = cell("date", c.criadoEm.split("-").reverse().join("/"));
      const actions = cell("actions-cell"); const buttons = document.createElement("div"); buttons.className = "row-actions"; buttons.append(iconButton("edit", c), iconButton("delete", c)); actions.append(buttons);
      row.append(nameCell, contact, statusCell, date, actions); fragment.append(row);
    });
    $("clientes").replaceChildren(fragment);
    $("estado-vazio").hidden = found.length > 0;
    const hasFilter = $("busca").value !== "" || $("filtro-status").value !== "todos";
    $("vazio-titulo").textContent = hasFilter ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado";
    $("vazio-texto").textContent = hasFilter ? "Tente outro nome, e-mail ou status." : "Cadastre o primeiro cliente para começar.";
    $("vazio-acao").textContent = hasFilter ? "Limpar filtros" : "Novo cliente";
    $("resultado").textContent = `${found.length} ${found.length === 1 ? "cliente encontrado" : "clientes encontrados"}`;
    $("pagina-atual").textContent = `Página ${page} de ${pages}`;
    [$("pagina-anterior"), $("proxima-pagina")].forEach((b) => { b.hidden = pages === 1; });
    $("pagina-anterior").disabled = page === 1;
    $("proxima-pagina").disabled = page === pages;
    $("limpar-busca").hidden = $("busca").value === "";
    $("exportar").disabled = found.length === 0;
  }
  function currentForm() { return Object.fromEntries(fields.map((id) => [id, clean($(id).value)])); }
  function isDirty() { return editor.open && JSON.stringify(currentForm()) !== originalForm; }
  function clearErrors() {
    fields.filter((id) => id !== "status").forEach((id) => { $(`erro-${id}`).textContent = ""; $(id).removeAttribute("aria-invalid"); });
    $("erro-formulario").hidden = true;
  }
  function openEditor(client = null) {
    form.reset(); clearErrors(); editing = client ? structuredClone(client) : null;
    fields.forEach((id) => { $(id).value = client?.[id] ?? (id === "status" ? "ativo" : ""); });
    $("editor-titulo").textContent = client ? "Editar cliente" : "Novo cliente";
    $("editor-descricao").textContent = client ? "Atualize os dados do cadastro selecionado." : "Preencha os dados para criar um cadastro.";
    $("salvar-cliente").textContent = client ? "Salvar alterações" : "Cadastrar cliente";
    originalForm = JSON.stringify(currentForm());
    editor.showModal(); $("nome").focus();
  }
  function closeEditor() {
    const id = editing?.id;
    editor.close(); editing = null;
    const restore = id ? [...document.querySelectorAll('[data-action="edit"]')].find((b) => b.dataset.id === id) : null;
    (restore ?? $("novo-cliente")).focus();
  }
  function askConfirmation(settings) {
    action = settings;
    $("confirmacao-titulo").textContent = settings.title;
    $("confirmacao-descricao").textContent = settings.description;
    $("confirmar-acao").textContent = settings.label;
    $("erro-confirmacao").hidden = true;
    confirmation.showModal(); $("cancelar-confirmacao").focus();
  }
  function cancelEditor() {
    if (!isDirty()) { closeEditor(); return; }
    askConfirmation({ type: "discard", title: "Descartar alterações?", description: "Os dados que você alterou neste formulário ainda não foram salvos.", label: "Descartar" });
  }
  function requestDeletion(client) {
    askConfirmation({ type: "delete", client, title: "Excluir cliente?", description: `O cadastro de ${client.nome} será removido deste navegador. Essa exclusão não pode ser desfeita.`, label: "Excluir cliente" });
  }
  function validation(data, latest) {
    const errors = {};
    if (data.nome.length < 2) errors.nome = "Informe um nome com pelo menos 2 caracteres.";
    if (data.nome.length > 100) errors.nome = "Use até 100 caracteres no nome.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 150) errors.email = "Informe um e-mail válido, como nome@exemplo.com.";
    else if (latest.some((c) => c.id !== editing?.id && c.email.toLowerCase() === data.email.toLowerCase())) errors.email = "Este e-mail já está cadastrado. Use outro e-mail.";
    if (data.telefone && !/^\d{10,15}$/.test(data.telefone.replace(/\D/g, ""))) errors.telefone = "Informe de 10 a 15 dígitos, incluindo o DDD.";
    if (data.cidade.length > 80) errors.cidade = "Use até 80 caracteres para cidade e estado.";
    return errors;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (submitting || event.isComposing) return;
    clearErrors();
    const data = currentForm(); const latest = latestClients();
    const errors = validation(data, latest);
    Object.entries(errors).forEach(([id, message]) => { $(`erro-${id}`).textContent = message; $(id).setAttribute("aria-invalid", "true"); });
    if (Object.keys(errors).length) { $(Object.keys(errors)[0]).focus(); return; }
    if (editing && JSON.stringify(latest.find((c) => c.id === editing.id)) !== JSON.stringify(editing)) {
      $("erro-formulario").textContent = "Este cadastro mudou em outra aba. Cancele e abra a edição novamente para trabalhar com os dados atuais."; $("erro-formulario").hidden = false; return;
    }
    submitting = true; $("salvar-cliente").disabled = true;
    const wasEditing = Boolean(editing);
    let next;
    if (editing) {
      // UPDATE: await fetch(`/api/clientes/${encodeURIComponent(editing.id)}`, {
      //   method: "PUT", headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data)
      // });
      next = latest.map((c) => c.id === editing.id ? { ...c, ...data } : c);
    } else {
      // CREATE: await fetch("/api/clientes", {
      //   method: "POST", headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data)
      // });
      const now = new Date();
      const criadoEm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      next = [...latest, { id, ...data, criadoEm }];
    }
    if (persist(next)) {
      $("busca").value = ""; $("filtro-status").value = "todos";
      const sorted = [...clients].sort((a, b) => collator.compare(a.nome, b.nome));
      const target = wasEditing ? editing.id : next.at(-1).id;
      page = Math.floor(sorted.findIndex((c) => c.id === target) / PAGE_SIZE) + 1;
      render(); closeEditor(); announce(wasEditing ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.");
    } else { $("erro-formulario").textContent = "O cadastro não foi salvo. Libere o armazenamento e tente novamente."; $("erro-formulario").hidden = false; }
    submitting = false; $("salvar-cliente").disabled = false;
  });
  $("confirmar-acao").addEventListener("click", () => {
    if (!action) return;
    if (action.type === "discard") { confirmation.close(); action = null; closeEditor(); return; }
    const latest = latestClients();
    // DELETE: await fetch(`/api/clientes/${encodeURIComponent(action.client.id)}`, {
    //   method: "DELETE"
    // });
    if (!persist(latest.filter((c) => c.id !== action.client.id))) {
      $("erro-confirmacao").textContent = "Não foi possível excluir. Verifique o armazenamento e tente novamente."; $("erro-confirmacao").hidden = false; return;
    }
    confirmation.close(); action = null; render(); $("novo-cliente").focus(); announce("Cliente excluído com sucesso.");
  });
  $("cancelar-confirmacao").addEventListener("click", () => { confirmation.close(); action = null; });
  confirmation.addEventListener("cancel", () => { action = null; });
  editor.addEventListener("cancel", (event) => { event.preventDefault(); cancelEditor(); });
  ["fechar-editor", "cancelar-editor"].forEach((id) => $(id).addEventListener("click", cancelEditor));
  $("novo-cliente").addEventListener("click", () => openEditor());
  $("clientes").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const client = clients.find((c) => c.id === button.dataset.id);
    if (!client) return;
    button.dataset.action === "edit" ? openEditor(client) : requestDeletion(client);
  });
  $("busca").addEventListener("input", (event) => { if (!event.isComposing) { page = 1; render(); } });
  $("busca").addEventListener("compositionend", () => { page = 1; render(); });
  $("filtro-status").addEventListener("change", () => { page = 1; render(); });
  $("limpar-busca").addEventListener("click", () => { $("busca").value = ""; page = 1; render(); $("busca").focus(); });
  $("vazio-acao").addEventListener("click", () => {
    if ($("busca").value || $("filtro-status").value !== "todos") { $("busca").value = ""; $("filtro-status").value = "todos"; page = 1; render(); $("busca").focus(); }
    else openEditor();
  });
  $("pagina-anterior").addEventListener("click", () => { page--; render(); });
  $("proxima-pagina").addEventListener("click", () => { page++; render(); });
  $("exportar").addEventListener("click", () => {
    // CSV de todos os resultados filtrados, inclusive outras páginas.
    const escapeCSV = (value) => {
      let text = String(value);
      if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
      return `"${text.replaceAll('"', '""')}"`;
    };
    const rows = [["Nome", "E-mail", "Telefone", "Cidade", "Status", "Cadastro"], ...filteredClients().map((c) => [c.nome, c.email, c.telefone, c.cidade, c.status === "ativo" ? "Ativo" : "Inativo", c.criadoEm.split("-").reverse().join("/")])];
    const csv = "\ufeff" + rows.map((r) => r.map(escapeCSV).join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a"); link.href = url; link.download = "clientes-agenda-clara.csv"; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000); announce("Arquivo CSV exportado.");
  });
  window.addEventListener("beforeunload", (event) => { if (isDirty()) { event.preventDefault(); event.returnValue = ""; } });
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) { try { clients = readStorage() ?? []; render(); announce("Lista atualizada com as alterações de outra aba."); } catch { showWarning("O cadastro foi alterado em outra aba, mas não pôde ser lido. Recarregue após verificar os dados salvos."); } }
  });
  load();
})();
