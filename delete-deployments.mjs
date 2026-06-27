const REPO = 'antoniocranga/verificat.ai';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GHCR_TOKEN;

if (!TOKEN) {
  console.error("❌ Please provide a GITHUB_TOKEN environment variable.");
  console.error("Usage: GITHUB_TOKEN=your_token node delete-deployments.mjs");
  console.error("Or via Infisical: infisical run -- node delete-deployments.mjs");
  process.exit(1);
}

const HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'Authorization': `Bearer ${TOKEN}`,
  'X-GitHub-Api-Version': '2022-11-28'
};

async function fetchAllDeployments() {
  let deployments = [];
  let page = 1;
  
  while (true) {
    const url = `https://api.github.com/repos/${REPO}/deployments?per_page=100&page=${page}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Failed to fetch deployments: ${res.statusText}`);
    
    const data = await res.json();
    if (data.length === 0) break;
    
    deployments = deployments.concat(data);
    if (data.length < 100) break;
    page++;
  }
  return deployments;
}

async function setInactive(id) {
  const url = `https://api.github.com/repos/${REPO}/deployments/${id}/statuses`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'inactive' })
  });
  
  if (!res.ok) {
     const err = await res.text();
     console.error(`⚠️ Failed to set deployment ${id} to inactive: ${err}`);
  }
}

async function deleteDeployment(id) {
  const url = `https://api.github.com/repos/${REPO}/deployments/${id}`;
  const res = await fetch(url, { method: 'DELETE', headers: HEADERS });
  
  if (!res.ok) {
     const err = await res.text();
     console.error(`❌ Failed to delete deployment ${id}: ${err}`);
  } else {
     console.log(`✅ Deleted deployment ${id}`);
  }
}

async function main() {
  console.log(`Fetching deployments for ${REPO}...`);
  const deployments = await fetchAllDeployments();
  console.log(`Found ${deployments.length} deployments.`);

  if (deployments.length <= 1) {
    console.log("Not enough deployments to delete.");
    return;
  }

  // Sort deployments chronologically (oldest first, so the last one is the newest)
  deployments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Keep the last deployment
  const toKeep = deployments[deployments.length - 1];
  console.log(`Keeping latest deployment ${toKeep.id} (Created at: ${toKeep.created_at})`);

  const toDelete = deployments.slice(0, deployments.length - 1);
  console.log(`Will delete ${toDelete.length} deployments...`);

  for (const d of toDelete) {
    console.log(`Processing deployment ${d.id}...`);
    // GitHub requires a deployment to be inactive before it can be deleted
    await setInactive(d.id);
    await deleteDeployment(d.id);
  }
  
  console.log("Done.");
}

main().catch(console.error);
