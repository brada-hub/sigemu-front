const fs = require('fs');

function fix(file, replacements) {
  if (!fs.existsSync(file)) { console.log('NOT FOUND: ' + file); return; }
  let t = fs.readFileSync(file, 'utf8');
  replacements.forEach(([from, to]) => { t = t.split(from).join(to); });
  fs.writeFileSync(file, t);
  console.log('OK: ' + file);
}

// ── 1. COMPOSABLES: remove unused `ref`, fix type-only imports, replace `error: any` with `error: unknown` ──

const composables = [
  ['src/composables/usePersonas.ts', 'usePersonasStore', 'Persona', 'src/stores/personas'],
  ['src/composables/useBloques.ts', 'useBloquesStore', 'Bloque', 'src/stores/bloques'],
  ['src/composables/useCategorias.ts', 'useCategoriasStore', 'CategoriaCosto', 'src/stores/categorias'],
  ['src/composables/useFestividades.ts', 'useFestividadesStore', 'Festividad', 'src/stores/festividades'],
  ['src/composables/useInscripciones.ts', 'useInscripcionesStore', 'Inscripcion', 'src/stores/inscripciones'],
  ['src/composables/usePagos.ts', 'usePagosStore', 'Pago', 'src/stores/pagos'],
];

composables.forEach(([file, storeFn, typeName, storePath]) => {
  fix(file, [
    // Remove unused `ref` import
    ["import { ref } from 'vue';\n", ''],
    // Split type-only import
    [`import { ${storeFn}, ${typeName} } from '${storePath}';`,
     `import { ${storeFn} } from '${storePath}';\nimport type { ${typeName} } from '${storePath}';`],
    // Replace `error: any` with `error: unknown` + cast
    ['} catch (error: any) {\n      $q.notify({ type: \'negative\', message: error.response?.data?.message',
     '} catch (error: unknown) {\n      const err = error as { response?: { data?: { message?: string } } };\n      $q.notify({ type: \'negative\', message: err.response?.data?.message'],
  ]);
});

// ── 2. useAuth.ts ──
fix('src/composables/useAuth.ts', [
  // Floating promises on router.push
  ["        router.push({ name: 'login' });", "        void router.push({ name: 'login' });"],
  ["      router.push({ name: 'dashboard' });", "      void router.push({ name: 'dashboard' });"],
  ["      router.push({ name: 'login' });", "      void router.push({ name: 'login' });"],
  // catch (error: any) → unknown
  ['catch (error: any) {\n      $q.notify({\n        type: \'negative\',\n        message: error.response?.data?.message',
   'catch (error: unknown) {\n      const err = error as { response?: { data?: { message?: string } } };\n      $q.notify({\n        type: \'negative\',\n        message: err.response?.data?.message'],
  // unused `error` in catch
  ['} catch (error) {\n      store.clearAuth();', '} catch (_e) {\n      store.clearAuth();'],
]);

// ── 3. stores: replace `persona?: any` etc ──
fix('src/stores/auth.ts', [
  ['persona?: any;', "persona?: Record<string, unknown>;"],
]);

fix('src/stores/inscripciones.ts', [
  ['persona?: any;', "persona?: Record<string, unknown>;"],
  ['categoria_costo?: any;', "categoria_costo?: Record<string, unknown>;"],
]);

// ── 4. boot/axios.ts: type-only AxiosInstance ──
fix('src/boot/axios.ts', [
  ["import axios, { AxiosInstance } from 'axios';",
   "import axios from 'axios';\nimport type { AxiosInstance } from 'axios';"],
]);

// ── 5. router/routes.ts ──
fix('src/router/routes.ts', [
  ["import { RouteRecordRaw } from 'vue-router';",
   "import type { RouteRecordRaw } from 'vue-router';"],
]);

// ── 6. ReportesIndex.vue ──
fix('src/pages/reportes/ReportesIndex.vue', [
  ['} catch (e) {', '} catch (_e) {'],
]);

// ── 7. InscripcionesIndex.vue ──
fix('src/pages/inscripciones/InscripcionesIndex.vue', [
  // filter callback any → Inscripcion
  ['.filter((i: any) =>', '.filter((i: Inscripcion) =>'],
  // column field callbacks any → Record
  ["field: (row: any) => row.persona?.nombre_completo", "field: (row: Record<string, Record<string, unknown>>) => (row.persona as Record<string, unknown>)?.nombre_completo as string"],
  ["field: (row: any) => row.persona?.ci", "field: (row: Record<string, Record<string, unknown>>) => (row.persona as Record<string, unknown>)?.ci as string"],
  // ref<any> → proper types
  ['const inscripcionForm = ref<any>({})',
   'const inscripcionForm = ref<Record<string, unknown>>({})'],
  ['const pagoForm = ref<any>({ metodo: \'efectivo\' })',
   'const pagoForm = ref<Record<string, unknown>>({ metodo: \'efectivo\' })'],
  // .onOk(async => misused promise
  [".onOk(async () => {\n      if (!currentInscripcion.value) return;\n      await removePago(currentInscripcion.value.id, pagoId);\n      await loadInscripciones(festividadId);\n      const updated = store.inscripciones.find(i => i.id === currentInscripcion.value?.id);\n      if(updated) currentInscripcion.value = updated;\n    });",
   ".onOk(() => {\n      void (async () => {\n        if (!currentInscripcion.value) return;\n        await removePago(currentInscripcion.value.id, pagoId);\n        await loadInscripciones(festividadId);\n        const updated = store.inscripciones.find(i => i.id === currentInscripcion.value?.id);\n        if(updated) currentInscripcion.value = updated;\n      })();\n    });"],
]);

// ── 8. PersonasIndex.vue ──
fix('src/pages/personas/PersonasIndex.vue', [
  ["field: (row: any) => row.bloque?.nombre",
   "field: (row: Record<string, Record<string, unknown>>) => (row.bloque as Record<string, unknown>)?.nombre as string"],
]);

console.log('\n=== ALL FIXES APPLIED ===');
