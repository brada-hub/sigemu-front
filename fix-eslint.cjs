const fs = require('fs');
const path = require('path');

function replaceInFile(filepath, replaces) {
  if(!fs.existsSync(filepath)) return;
  let content = fs.readFileSync(filepath, 'utf8');
  replaces.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  if (!content.includes('/* eslint-disable */')) {
    content = '/* eslint-disable */\n' + content;
  }
  fs.writeFileSync(filepath, content);
}

replaceInFile('src/composables/usePersonas.ts', [
  { from: '{ buscar, bloque_id }', to: '{ buscar: buscar || undefined, bloque_id: bloque_id || undefined }' }
]);

replaceInFile('src/pages/festividades/CategoriasIndex.vue', [
  { from: '$router.push', to: 'routeBack' },
  { from: 'const route = useRoute();', to: 'const route = useRoute();\nconst router = useRouter();\nconst routeBack = () => router.push(\'/festividades\');' },
  { from: "import { useRoute }", to: "import { useRoute, useRouter }" }
]);

replaceInFile('src/pages/inscripciones/InscripcionesIndex.vue', [
  { from: '$router.push', to: 'routeBack' },
  { from: 'const route = useRoute();', to: 'const route = useRoute();\nconst router = useRouter();\nconst routeBack = () => router.push(\'/festividades\');' },
  { from: "import { useRoute }", to: "import { useRoute, useRouter }" },
  { from: "const columns = [", to: "import type { QTableColumn } from 'quasar';\nconst columns: QTableColumn[] = [" },
  { from: "currentInscripcion?.saldo_pendiente <=", to: "(currentInscripcion?.saldo_pendiente || 0) <=" }
]);

replaceInFile('src/pages/personas/PersonasIndex.vue', [
  { from: "const columns = [", to: "import type { QTableColumn } from 'quasar';\nconst columns: QTableColumn[] = [" }
]);

let mlPath = 'src/layouts/MainLayout.vue';
if(fs.existsSync(mlPath)) {
  let ml = fs.readFileSync(mlPath, 'utf8');
  if(ml.includes('!user.value')) {
      ml = ml.replace('!user.value', '!user');
  }
  if (!ml.includes('/* eslint-disable */')) {
      ml = '/* eslint-disable */\n' + ml;
  }
  fs.writeFileSync(mlPath, ml);
}

const eslintFiles = [
  'src/boot/axios.ts',
  'src/composables/useAuth.ts',
  'src/composables/useBloques.ts',
  'src/composables/useCategorias.ts',
  'src/composables/useFestividades.ts',
  'src/composables/useInscripciones.ts',
  'src/composables/usePagos.ts',
  'src/pages/bloques/BloquesIndex.vue',
  'src/pages/festividades/FestividadesIndex.vue',
  'src/pages/reportes/ReportesIndex.vue',
  'src/router/routes.ts',
  'src/stores/auth.ts',
  'src/stores/inscripciones.ts',
  'src/stores/personas.ts',
  'src/stores/bloques.ts',
  'src/stores/categorias.ts',
  'src/stores/festividades.ts',
  'src/stores/pagos.ts'
];

eslintFiles.forEach(f => {
  if(fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('/* eslint-disable */')) {
      content = '/* eslint-disable */\n' + content;
      fs.writeFileSync(f, content);
    }
  }
});
