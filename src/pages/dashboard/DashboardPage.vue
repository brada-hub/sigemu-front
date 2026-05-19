<template>
  <q-page class="q-pa-lg dashboard-page">
    <!-- Header Simplificado (Solo selector de festividad y refresco) -->
    <div class="row items-center justify-between q-col-gutter-sm q-mb-lg">
      <div class="col-12 col-sm-grow">
        <div class="festiv-chip-wrap q-pa-xs rounded-borders row items-center no-wrap">
          <q-btn
            v-for="fest in (festividades.festividades as any[])"
            :key="fest.id_festividad"
            flat dense
            :color="festividadActiva === fest.id_festividad ? 'primary' : 'grey-7'"
            :class="festividadActiva === fest.id_festividad ? 'bg-blue-1 text-weight-bold px-md' : 'px-sm'"
            rounded no-caps
            style="flex-shrink: 0;"
            @click="seleccionarFestividad(fest.id_festividad)"
          >
            {{ fest.nombre }}
          </q-btn>
        </div>
      </div>
      <div class="col-12 col-sm-auto row justify-end">
        <q-btn unelevated color="primary" icon="refresh" class="full-width-xs" @click="cargarResumen" :loading="cargando" />
      </div>
    </div>

    <div v-if="cargando" class="row q-col-gutter-lg">
      <div class="col-12 col-md-8"><q-skeleton type="rect" height="500px" class="rounded-borders" /></div>
      <div class="col-12 col-md-4"><q-skeleton type="rect" height="500px" class="rounded-borders" /></div>
    </div>

    <div v-else-if="resumen">
      <!-- KPIs Principales -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-6 col-md-3" v-for="stat in statsCards" :key="stat.title">
          <q-card flat class="stat-card" :class="stat.class">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-avatar :color="stat.avatarBg" :text-color="stat.avatarColor" :icon="stat.icon" size="md" />
                <q-space />
                <q-badge v-if="stat.badge" :color="stat.badgeBg" :text-color="stat.badgeColor" rounded>{{ stat.badge }}</q-badge>
              </div>
              <div class="text-h4 text-weight-bolder">{{ stat.value }}</div>
              <div class="text-subtitle2 opacity-70">{{ stat.title }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-xl">
        <!-- Columna Izquierda: Gráficos de Análisis -->
        <div class="col-12 col-lg-8">
          <!-- Gráfico Principal: Recaudación por Bloque -->
          <q-card flat class="main-card q-mb-lg">
            <q-card-section>
              <div class="row items-center justify-between q-mb-xl">
                <div>
                  <div class="text-h6 text-weight-bold text-grey-9">Análisis de Bloques</div>
                  <div class="text-caption text-grey-6">Comparativa de metas vs recaudación real</div>
                </div>
                <q-btn-toggle
                  v-model="chartType"
                  flat stretch
                  toggle-color="primary"
                  :options="[{label: 'Distribución', value: 'donut'}, {label: 'Rendimiento', value: 'bar'}]"
                  size="sm"
                />
              </div>

              <div class="row q-col-gutter-xl">
                <div class="col-12 col-md-7">
                  <apexchart :type="chartType" height="350" :options="chartOptions" :series="chartSeries" />
                </div>
                <div class="col-12 col-md-5">
                  <div class="text-subtitle2 text-weight-bold text-grey-8 q-mb-md">Ranking de Eficiencia</div>
                  <q-list dense>
                    <q-item v-for="b in resumen.recaudacion_por_bloque" :key="b.bloque" class="q-py-md border-bottom-light">
                      <q-item-section>
                        <q-item-label class="text-weight-bold text-grey-8">{{ b.bloque }}</q-item-label>
                        <q-item-label caption>Bs {{ formatNumber(b.total_recaudado) }} / {{ formatNumber(b.total_esperado) }}</q-item-label>
                        <q-linear-progress :value="b.eficiencia / 100" color="primary" class="q-mt-xs" rounded />
                      </q-item-section>
                      <q-item-section side>
                        <q-badge :color="getEficienciaColor(b.eficiencia)" text-color="white">{{ b.eficiencia }}%</q-badge>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Segunda Fila de Análisis: Métodos de Pago y Composición -->
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <q-card flat class="main-card">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">Canales de Pago</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-6" v-for="(val, metodo) in (resumen.metodos_pago as any)" :key="metodo">
                      <div class="q-pa-md canal-card rounded-borders text-center">
                        <div class="text-caption text-grey-6 text-uppercase">{{ metodo }}</div>
                        <div class="text-h6 text-weight-bolder text-primary">Bs {{ formatNumber(val.total) }}</div>
                        <div class="text-caption text-grey-5">{{ val.cantidad }} transacciones</div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card flat class="main-card">
                <q-card-section>
                  <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">Composición y Eficiencia</div>
                  <div class="row items-center q-col-gutter-md">
                    <div class="col-6">
                      <apexchart type="donut" height="130" :options="chartFraternosOptions" :series="[resumen.nuevos, resumen.antiguos]" />
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">TOP 3 BLOQUES</div>
                      <div v-for="(b, i) in resumen.recaudacion_por_bloque.slice(0, 3)" :key="i" class="row items-center q-mb-xs">
                        <q-badge :color="i === 0 ? 'yellow-9' : 'grey-7'" rounded class="q-mr-xs" size="xs" />
                        <span class="text-caption ellipsis" style="max-width: 80px">{{ b.bloque }}: {{ b.eficiencia }}%</span>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Alertas y Actividad -->
        <div class="col-12 col-lg-4">
          <!-- Alertas Críticas (Más grandes y detalladas) -->
          <q-card flat class="main-card q-mb-lg border-negative-light bg-red-0">
            <q-card-section>
              <div class="row items-center justify-between q-mb-lg">
                <div>
                  <div class="text-subtitle1 text-weight-bold text-negative">Seguimiento de Deuda</div>
                  <div class="text-caption text-grey-6">Fraternos con mayor saldo pendiente</div>
                </div>
                <q-icon name="warning" color="negative" class="animate-pulse" size="sm" />
              </div>
              
              <q-list separator>
                <q-item v-for="alerta in resumen.alertas" :key="alerta.persona_id" clickable @click="irADetalle(alerta.persona_id)" class="q-px-none q-py-md">
                  <q-item-section avatar>
                    <q-avatar size="md" :color="alerta.nivel === 'urgente' ? 'red-1' : 'orange-1'" :text-color="alerta.nivel === 'urgente' ? 'red-7' : 'orange-7'" icon="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-grey-9">{{ alerta.nombre }}</q-item-label>
                    <q-item-label caption>{{ alerta.bloque }} · {{ alerta.porcentaje }}% pagado</q-item-label>
                    <q-linear-progress :value="alerta.porcentaje / 100" :color="alerta.nivel === 'urgente' ? 'negative' : 'warning'" size="4px" class="q-mt-xs" />
                  </q-item-section>
                  <q-item-section side class="text-right">
                    <div class="text-weight-bolder text-negative">Bs {{ formatNumber(alerta.pendiente) }}</div>
                    <div class="text-caption text-grey-5">Falta</div>
                  </q-item-section>
                </q-item>
              </q-list>
              
              <q-btn flat color="primary" label="Ver todos los morosos" class="full-width q-mt-md" @click="router.push('/inscripciones')" />
            </q-card-section>
          </q-card>

          <!-- Actividad Reciente (Timeline Estilizado) -->
          <q-card flat class="main-card">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-lg">Últimos Movimientos</div>
              <q-timeline color="primary" dense>
                <q-timeline-entry
                  v-for="(act, idx) in resumen.actividad" :key="idx"
                  :icon="getActividadIcon(act.tipo)"
                  :color="getActividadColor(act.tipo)"
                >
                  <template v-slot:title>
                    <div class="row items-center justify-between">
                      <span class="text-weight-bolder text-grey-9">Bs {{ formatNumber(act.monto) }}</span>
                      <q-badge outline color="grey-6" size="xs">{{ act.fecha }}</q-badge>
                    </div>
                  </template>
                  <div class="text-weight-bold text-grey-8">{{ act.nombre }}</div>
                  <div class="text-caption text-grey-6">{{ act.bloque }} · {{ act.metodo }}</div>
                </q-timeline-entry>
              </q-timeline>
              <q-btn outline color="primary" label="Ir a Libro de Caja" class="full-width q-mt-md" @click="router.push('/pagos')" />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <AppEmptyState 
      v-else-if="!festividades.cargando && festividades.festividades.length === 0" 
      icon="celebration" 
      title="No hay festividades" 
      message="Cree una festividad para comenzar a ver el dashboard" 
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth.store'
import { useFestividadesStore } from 'src/stores/festividades.store'
import { reportesApi } from 'src/api/reportes.api'
import AppEmptyState from 'src/components/common/AppEmptyState.vue'
import VueApexCharts from 'vue3-apexcharts'

const apexchart = VueApexCharts

interface Resumen {
  festividad: string
  total_inscritos: number
  total_esperado: number
  total_recaudado: number
  total_pendiente: number
  porcentaje_avance: number
  recaudacion_por_bloque: any[]
  nuevos: number
  antiguos: number
  generos: Record<string, number>
  metodos_pago: Record<string, any>
  alertas: any[]
  actividad: any[]
}

const router = useRouter()
const auth = useAuthStore()
const festividades = useFestividadesStore()
const festividadActiva = ref<number | null>(null)
const resumen = ref<Resumen | null>(null)
const cargando = ref(false)
const chartType = ref<'donut' | 'bar'>('donut')

const colors = ['#1976D2', '#26A69A', '#F2C037', '#9C27B0', '#E91E63', '#00BCD4']


const statsCards = computed(() => {
  if (!resumen.value) return []
  return [
    { title: 'Inscritos', value: resumen.value.total_inscritos, icon: 'groups', avatarBg: 'blue-1', avatarColor: 'blue-7', badge: `${resumen.value.nuevos} nuevos`, badgeBg: 'blue-1', badgeColor: 'blue-7' },
    { title: 'Recaudado', value: `Bs ${formatNumber(resumen.value.total_recaudado)}`, icon: 'account_balance_wallet', avatarBg: 'green-1', avatarColor: 'green-7', badge: `${resumen.value.porcentaje_avance}%`, badgeBg: 'green-1', badgeColor: 'green-7' },
    { title: 'Por Cobrar', value: `Bs ${formatNumber(resumen.value.total_pendiente)}`, icon: 'warning_amber', avatarBg: 'orange-1', avatarColor: 'orange-7', class: 'border-warning-light' },
    { title: 'Meta Global', value: `Bs ${formatNumber(resumen.value.total_esperado)}`, icon: 'flag', avatarBg: 'white', avatarColor: 'primary', class: 'bg-primary text-white' },
  ]
})

const chartSeries = computed(() => {
  if (!resumen.value) return []
  if (chartType.value === 'donut') return resumen.value.recaudacion_por_bloque.map(b => b.total_recaudado)
  return [{ name: 'Recaudado', data: resumen.value.recaudacion_por_bloque.map(b => b.total_recaudado) }]
})

const chartOptions = computed(() => {
  if (!resumen.value) return {}
  const labels = resumen.value.recaudacion_por_bloque.map(b => b.bloque)
  if (chartType.value === 'donut') return { labels, colors, legend: { show: false }, plotOptions: { pie: { donut: { size: '75%' } } } }
  return { chart: { toolbar: { show: false } }, xaxis: { categories: labels }, colors: ['#1976D2'], plotOptions: { bar: { borderRadius: 6, horizontal: true } } }
})

const chartFraternosOptions = {
  labels: ['Nuevos', 'Antiguos'],
  colors: ['#2196F3', '#4CAF50'],
  legend: { show: false },
  plotOptions: { pie: { donut: { size: '70%' } } },
  dataLabels: { enabled: false }
}

onMounted(async () => {
  await festividades.cargar()
  if (festividades.festividades.length > 0) {
    seleccionarFestividad(festividades.festividades[0]?.id_festividad as number)
  }
})

async function seleccionarFestividad(id: number) {
  festividadActiva.value = id
  await cargarResumen()
}

async function cargarResumen() {
  if (!festividadActiva.value) return
  cargando.value = true
  try {
    const { data } = await reportesApi.resumen(festividadActiva.value)
    resumen.value = data
  } finally {
    cargando.value = false
  }
}

function irADetalle(id: number) { router.push(`/personas/${id}`) }
function formatNumber(n: number) { return new Intl.NumberFormat('es-BO').format(n) }
function getActividadColor(t: string) { return t === 'pago' ? 'green-7' : 'blue-7' }
function getActividadIcon(t: string) { return t === 'pago' ? 'payments' : 'person_add' }
function getEficienciaColor(e: number) {
  if (e > 80) return 'positive'
  if (e > 40) return 'warning'
  return 'negative'
}
</script>

<style>
/* Dark mode dashboard — deep indigo (armonizado) */
.body--dark .dashboard-page { background: #0d0f21 !important; }
.body--dark .stat-card {
  background: #161a33 !important;
  border-color: rgba(79, 39, 137, 0.2) !important;
}
.body--dark .main-card {
  background: #161a33 !important;
  border-color: rgba(79, 39, 137, 0.2) !important;
}
.body--dark .canal-card {
  background: #1b2040 !important;
  border: 1px solid rgba(79, 39, 137, 0.25) !important;
}
.body--dark .festiv-chip-wrap {
  background: #161a33 !important;
  border: 1px solid rgba(79, 39, 137, 0.2) !important;
}
.body--dark .bg-red-0 {
  background: rgba(193,0,21,0.08) !important;
}
</style>

<style scoped>
.quick-action-card {
  border-radius: 18px;
  border: 1px solid rgba(0,0,0,0.04);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}
.quick-action-card:hover {
  transform: translateY(-8px);
  border-color: var(--q-primary);
  box-shadow: 0 15px 30px rgba(79, 39, 137, 0.1) !important;
}
.stat-card {
  border-radius: 22px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 15px rgba(0,0,0,0.01);
}
.main-card {
  border-radius: 28px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 10px 40px rgba(0,0,0,0.02);
}

/* Light mode */
.dashboard-page { background: #f5f3fa; }
.festiv-chip-wrap {
  background: #fff;
  border: 1px solid rgba(79,39,137,0.08);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  max-width: 100%;
}
.festiv-chip-wrap::-webkit-scrollbar {
  display: none;
}
.festiv-chip-wrap {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.canal-card {
  background: #f5f3fa;
  border: 1px solid rgba(79,39,137,0.06);
}

.border-primary-light { border: 1px solid rgba(79, 39, 137, 0.1); }
.border-negative-light { border: 1px solid rgba(193, 0, 21, 0.1); }
.border-warning-light { border: 1px solid rgba(242, 192, 55, 0.2); }
.border-bottom-light { border-bottom: 1px solid rgba(0,0,0,0.03); }
.border-all-light { border: 1px solid rgba(0,0,0,0.05); }

.bg-red-0 { background: #fffcfc; }

.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.8; }
  70% { transform: scale(1.1); opacity: 0.5; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

.opacity-10 { opacity: 0.1; }
.opacity-70 { opacity: 0.7; }
.opacity-80 { opacity: 0.8; }

.px-md { padding-left: 16px; padding-right: 16px; }
.px-sm { padding-left: 8px; padding-right: 8px; }
@media (max-width: 599px) {
  .full-width-xs {
    width: 100%;
  }
}
</style>
