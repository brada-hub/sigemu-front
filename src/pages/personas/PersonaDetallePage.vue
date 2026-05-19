<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" color="primary" class="q-mr-sm" @click="router.push('/personas')" />
      <div>
        <div class="text-h6 q-mb-none">Perfil del Fraterno</div>
        <div class="text-caption text-grey">Detalles e historial</div>
      </div>
    </div>

    <AppLoadingSpinner v-if="store.cargando" />

    <div class="row q-gutter-md" v-else-if="persona">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="text-center q-pa-md">
          <q-avatar size="100px" color="primary" text-color="white" class="q-mb-md shadow-2">
            <span class="text-h3">{{ (persona.primer_apellido as string)?.charAt(0) || (persona.nombres as string)?.charAt(0) }}</span>
          </q-avatar>
          <div class="text-h6 text-weight-bold">{{ `${String(persona.nombres || '')} ${String(persona.primer_apellido || '')} ${String(persona.segundo_apellido || '')}`.trim() }}</div>
          <div class="text-subtitle2 text-grey-7">CI: {{ persona.ci }}</div>

          <q-list class="text-left q-mt-md">
            <q-item>
              <q-item-section avatar><q-icon name="phone" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Celular</q-item-label>
                <q-item-label>{{ persona.celular || 'No registrado' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section avatar><q-icon name="wc" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Sexo</q-item-label>
                <q-item-label>{{ (persona.sexo as Record<string, string>)?.sexo || 'No registrado' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center">
              <div class="text-h6">Historial de Participación</div>
              <q-space />
              <q-btn flat icon="download" color="primary" label="Exportar" size="sm" @click="descargarHistorial" />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section v-if="historial.length === 0">
            <AppEmptyState icon="history" title="Sin historial" message="Esta persona aún no tiene participación registrada." />
          </q-card-section>

          <q-list separator v-else>
            <q-item v-for="item in historial" :key="(item.id_inscripcion as number)">
              <q-item-section avatar>
                <q-icon name="celebration" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ item.festividad }}</q-item-label>
                <q-item-label caption>Tipo: {{ item.tipo_fraterno || 'No asignado' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip :color="item.saldo_pendiente > 0 ? 'warning' : 'positive'" text-color="white" size="sm">
                  Deuda: Bs {{ item.saldo_pendiente }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePersonasStore } from 'src/stores/personas.store'
import { personasApi } from 'src/api/personas.api'
import { useExport } from 'src/composables/useExport'
import AppLoadingSpinner from 'src/components/common/AppLoadingSpinner.vue'
import AppEmptyState from 'src/components/common/AppEmptyState.vue'

const route = useRoute()
const router = useRouter()
const store = usePersonasStore()
const { exportarPersona } = useExport()

const persona = ref<Record<string, unknown> | null>(null)
const historial = ref<Record<string, any>[]>([])

onMounted(async () => {
  const id = route.params.id as string
  await store.cargarUna(id)
  persona.value = store.persona
  await cargarHistorial(id)
})

async function cargarHistorial(id: string | number) {
  try {
    const { data } = await personasApi.historial(id)
    // The new response doesn't have data.data for this route in ReporteController
    historial.value = Array.isArray(data) ? data : (data.data || [])
  } catch {
    historial.value = []
  }
}

function descargarHistorial() {
  if (!persona.value) return
  exportarPersona(personasApi.exportar, persona.value.id_persona as number, persona.value.ci as string)
}
</script>
