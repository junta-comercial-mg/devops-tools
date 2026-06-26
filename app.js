const TOKEN = prompt("Informe seu token:")
async function createRepo() {
  const repo = document.getElementById("repo").value;
  const area = document.getElementById("area").value;
  const domain = document.getElementById("domain").value;

  const response = await fetch(
    "https://api.github.com/repos/junta-comercial-mg/devops-tools/actions/workflows/bootstrap-repo.yml/dispatches",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
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
