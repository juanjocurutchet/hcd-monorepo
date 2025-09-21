// Script para reorganizar solo archivos de años recientes (2023-2025)
// Este script reorganizará solo los archivos que subimos recientemente

async function reorganizeRecentFiles() {
  const years = [2025, 2024, 2023];
  
  for (const year of years) {
    console.log(`🗂️ Reorganizing files for year ${year}...`);
    
    try {
      const response = await fetch('http://localhost:5002/api/ordinances/reorganize-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          limit: 100,
          dryRun: false,
          year: year  // Esto lo agregaremos al API
        })
      });
      
      const result = await response.json();
      console.log(`✅ Year ${year}:`, result.summary);
      
      if (result.summary.errors > 0) {
        console.log(`❌ Errors for ${year}:`, result.results.filter(r => r.status === 'error'));
      }
      
    } catch (error) {
      console.error(`❌ Error reorganizing year ${year}:`, error);
    }
    
    // Pausa entre años para no saturar Cloudinary
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

reorganizeRecentFiles();