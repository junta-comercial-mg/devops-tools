const TOKEN = "11CF2VCCY09aJIcKwl8tKJ_NaA0tpDIfjSQWGTjUVwEVoXGJ6sF0zSbhZgDmJumsD0E3V4IUBOMGeKenGb";
const ORG = "junta-comercial-mg";

/* =========================
   🔐 AUTORIZAÇÃO SIMPLES
========================= */
function authorize() {
  const user = prompt("Informe seu usuário:");

  const ALLOWED_USERS = ["jose", "romario", "admin"];

  if (!ALLOWED_USERS.includes(user)) {
    alert("❌ Não autorizado");
    return false;
  }

  return true;
}

/* =========================
   ✅ VALIDAÇÃO
========================= */
function validate(repo, area, domain) {
  if (!repo || repo.length < 3) {
    alert("❌ Nome inválido (mínimo 3 chars)");
    return false;
  }

  if (!/^[a-z0-9-]+$/.test(repo)) {
    alert("❌ Use apenas letras minúsculas, números e '-'");
    return false;
  }

  if (!area) {
    alert("❌ Área obrigatória");
    return false;
  }

  if (!domain) {
    alert("❌ Domínio obrigatório");
    return false;
  }

  return true;
}

/* =========================
   🎯 CARREGAR ÁREAS
========================= */
async function loadAreas() {
  
  const res = await fetch(`https://api.github.com/user/teams`, {
    headers: {
      "Authorization": `Bearer github_pat_${TOKEN.trim()}`,
      "Accept": "application/vnd.github+json"
    }
  });
  const teams = await res.json();
  const areas = teams.filter(t => t.slug.startsWith("area-"));
  const select = document.getElementById("area");

  select.innerHTML = "";
  areas.forEach(a => {
    const value = a.slug.replace("area-", "");
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  });
  if (areas.length > 0) {
    loadDomains(select.value);
  }
}

/* =========================
   🎯 CARREGAR DOMÍNIOS
========================= */
async function loadDomains(area) {
  const res = await fetch(`https://api.github.com/orgs/${ORG}/teams`, {
    headers: {
      "Authorization": `Bearer github_pat_${TOKEN.trim()}`,
      "Accept": "application/vnd.github+json"
    }
  });

  const teams = await res.json();

  const domains = teams
    .filter(t => t.parent && t.parent.slug === `area-${area}`)
    .filter(t => t.slug.startsWith("grp-"))
    .map(t => t.slug.replace("grp-", ""));

  const select = document.getElementById("domain");
  select.innerHTML = "";

  domains.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });
}

/* =========================
   🚀 CRIAR REPOSITÓRIO
========================= */
async function createRepo() {

  /*if (!authorize()) return;*/

  const repo = document.getElementById("repo").value;
  const area = document.getElementById("area").value;
  const domain = document.getElementById("domain").value;

  if (!validate(repo, area, domain)) return;

  const response = await fetch(
    `https://api.github.com/repos/${ORG}/devops-tools/actions/workflows/bootstrap-repo.yml/dispatches`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer github_pat_${TOKEN.trim()}`,
        "Accept": "application/vnd.github+json"
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          repo_name: repo,
          area: area,
          domain: domain
        }
      })
    }
  );

  if (response.ok) {
    alert("✅ Workflow disparado!");
  } else {
    const text = await response.text();
    console.error(text);
    alert("❌ Erro: " + text);
  }
}

/* =========================
   📦 CATÁLOGO DE REPOS
========================= */
async function loadRepos() {
  const res = await fetch(`https://api.github.com/orgs/${ORG}/repos?per_page=100`, {
    headers: {
      "Authorization": `Bearer github_pat_${TOKEN.trim()}`,
      "Accept": "application/vnd.github+json, application/vnd.github.mercy-preview+json"
    }
  });

  const repos = await res.json();
  const catalog = {};

  for (const repo of repos) {
    const topics = repo.topics || [];

    topics.forEach(t => {
      if (!catalog[t]) catalog[t] = [];
      catalog[t].push(repo.name);
    });
  }
  renderCatalog(catalog);
}

function renderCatalog(catalog) {
  const div = document.getElementById("catalog");
  div.innerHTML = "";

  for (const domain in catalog) {
    const section = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = `📂 ${domain}`;

    section.appendChild(title);

    catalog[domain].forEach(repo => {
      const item = document.createElement("div");
      item.textContent = "• " + repo;
      section.appendChild(item);
    });

    div.appendChild(section);
  }
}

/* =========================
   INIT
========================= */
document.getElementById("area").addEventListener("change", e => {
  loadDomains(e.target.value);
});

loadAreas();
loadRepos();
``
