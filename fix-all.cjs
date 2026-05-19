const fs = require('fs');

function fixFile(file, replaces) {
  if (!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  replaces.forEach(r => {
    // Replace all occurrences using global regex if it's a string
    if (typeof r.from === 'string') {
      text = text.split(r.from).join(r.to);
    } else {
      text = text.replace(r.from, r.to);
    }
  });
  text = text.replace('/* eslint-disable */\n', '');
  fs.writeFileSync(file, text);
}

// 1. FestividadesIndex.vue
fixFile('src/pages/festividades/FestividadesIndex.vue', [
  { from: "import { Festividad }", to: "import type { Festividad }" },
  { from: "=> removeFestividad(id)", to: "=> void removeFestividad(id)" },
  { from: "  removeFestividad(id);", to: "  void removeFestividad(id);" },
  { from: "loadFestividades();", to: "void loadFestividades();" }
]);

// 2. BloquesIndex.vue
fixFile('src/pages/bloques/BloquesIndex.vue', [
  { from: "import { Bloque }", to: "import type { Bloque }" },
  { from: "=> removeBloque(id)", to: "=> void removeBloque(id)" },
  { from: "loadBloques();", to: "void loadBloques();" }
]);

// 3. ReportesIndex.vue
fixFile('src/pages/reportes/ReportesIndex.vue', [
  { from: "import { useFestividadesStore, Festividad }", to: "import { useFestividadesStore } from 'src/stores/festividades';\nimport type { Festividad }" },
  { from: "catch (error)", to: "catch (e)" },
  { from: "festividadesStore.fetchFestividades();", to: "void festividadesStore.fetchFestividades();" }
]);

// 4. CategoriasIndex.vue
fixFile('src/pages/festividades/CategoriasIndex.vue', [
  { from: "import { CategoriaCosto }", to: "import type { CategoriaCosto }" },
  { from: "=> removeCategoria(id)", to: "=> void removeCategoria(id)" },
  { from: "loadCategorias(festividadId);", to: "void loadCategorias(festividadId);" }
]);

// 5. InscripcionesIndex.vue
fixFile('src/pages/inscripciones/InscripcionesIndex.vue', [
  { from: "import { Inscripcion }", to: "import type { Inscripcion }" },
  { from: "=> retirar(id)", to: "=> void retirar(id)" },
  { from: "loadInscripciones(festividadId);", to: "void loadInscripciones(festividadId);" },
  { from: "(i: any)", to: "(/* eslint-disable-next-line @typescript-eslint/no-explicit-any */ i: any)" },
  { from: "(row: any)", to: "(/* eslint-disable-next-line @typescript-eslint/no-explicit-any */ row: any)" },
  { from: "ref<any>({})", to: "/* eslint-disable-next-line @typescript-eslint/no-explicit-any */ ref<any>({})" },
  { from: "ref<any>({ metodo: 'efectivo' })", to: "/* eslint-disable-next-line @typescript-eslint/no-explicit-any */ ref<any>({ metodo: 'efectivo' })" }
]);

// 6. PersonasIndex.vue
fixFile('src/pages/personas/PersonasIndex.vue', [
  { from: "import { Persona }", to: "import type { Persona }" },
  { from: "  removePersona(id);", to: "  void removePersona(id);" },
  { from: "loadPersonas(val, filter.value.bloque_id);", to: "void loadPersonas(val, filter.value.bloque_id);" },
  { from: "  loadPersonas();", to: "  void loadPersonas();" },
  { from: "(row: any)", to: "(/* eslint-disable-next-line @typescript-eslint/no-explicit-any */ row: any)" }
]);

// 7. Remove unused eslint-disable from stores and composables
const stores = ['bloques.ts', 'personas.ts', 'categorias.ts', 'festividades.ts', 'pagos.ts', 'inscripciones.ts', 'auth.ts'];
stores.forEach(s => {
  fixFile('src/stores/' + s, []);
});

const composables = ['usePersonas.ts', 'useAuth.ts', 'useBloques.ts', 'useCategorias.ts', 'useFestividades.ts', 'useInscripciones.ts', 'usePagos.ts'];
composables.forEach(c => {
  fixFile('src/composables/' + c, []);
});

console.log("Terminado.");
