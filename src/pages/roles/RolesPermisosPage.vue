<template>
  <q-page class="q-pa-lg">
    <div class="row items-center q-mb-xl">
      <div class="col">
        <div class="text-h4 text-weight-bolder text-primary q-mb-xs">Roles y Permisos</div>
        <div class="text-subtitle2 text-grey-7">Gestión de roles y configuración de accesos al sistema</div>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Columna Roles -->
      <div class="col-12 col-md-4">
        <q-card flat class="main-card">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-h6 text-primary">Roles</div>
              <q-space />
              <q-btn flat round icon="add" color="positive" title="Crear Rol" @click="promptCrearRol" />
            </div>
            <q-list separator>
              <q-item 
                v-for="rol in roles" 
                :key="rol.id_rol" 
                clickable 
                v-ripple
                :active="selectedRol?.id_rol === rol.id_rol"
                active-class="bg-blue-1 text-primary text-weight-bold"
                @click="seleccionarRol(rol)"
              >
                <q-item-section avatar>
                  <q-avatar :color="getRolColor(rol.nombre)" text-color="white" icon="admin_panel_settings" size="sm" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-capitalize">{{ rol.nombre }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="chevron_right" />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-if="cargandoRoles" class="row justify-center q-pa-md">
              <q-spinner color="primary" size="2em" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Columna Permisos -->
      <div class="col-12 col-md-8">
        <q-card flat class="main-card q-pb-md">
          <q-card-section class="row items-center">
            <div class="text-h6 text-primary" v-if="selectedRol">
              Permisos del Rol: <span class="text-capitalize">{{ selectedRol.nombre }}</span>
              <q-btn flat round icon="delete" color="negative" size="sm" class="q-ml-sm" 
                @click="confirmarEliminarRol" 
                v-if="!['admin', 'tesorero', 'secretario'].includes(selectedRol.nombre.toLowerCase())" 
                title="Eliminar Rol" />
            </div>
            <div class="text-h6 text-grey" v-else>
              Seleccione un rol
            </div>
            <q-space />
            <q-btn 
              v-if="selectedRol"
              color="primary" 
              label="Guardar Permisos" 
              icon="save" 
              unelevated 
              rounded
              :loading="guardando"
              @click="guardarPermisos"
            />
          </q-card-section>
          
          <q-separator />

          <q-card-section v-if="selectedRol">
            <div v-for="(grupo, categoria) in permisosAgrupados" :key="categoria" class="q-mb-lg">
              <div class="text-subtitle1 text-weight-bold text-uppercase text-grey-8 q-mb-sm">
                {{ categoria }}
              </div>
              <div class="row q-col-gutter-md">
                <div 
                  v-for="permiso in grupo" 
                  :key="permiso.id_permiso"
                  class="col-12 col-sm-6 col-md-4"
                >
                  <q-item tag="label" v-ripple class="q-pa-sm permiso-item">
                    <q-item-section side top>
                      <q-checkbox v-model="permisosSeleccionados" :val="permiso.id_permiso" color="primary" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="text-weight-bold">{{ permiso.slug }}</q-item-label>
                      <q-item-label caption>{{ permiso.descripcion }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-section v-else class="text-center q-pa-xl">
            <q-icon name="lock_outline" size="4rem" color="grey-4" />
            <div class="text-grey-6 q-mt-md">Selecciona un rol de la lista para ver o modificar sus permisos</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { rolesApi } from 'src/api/roles.api'
import { useQuasar } from 'quasar'

const $q = useQuasar()

interface Permiso {
  id_permiso: number;
  slug: string;
  descripcion: string;
}

interface Rol {
  id_rol: number;
  nombre: string;
  permisos: Permiso[];
}

const roles = ref<Rol[]>([])
const todosPermisos = ref<Permiso[]>([])
const selectedRol = ref<Rol | null>(null)
const permisosSeleccionados = ref<number[]>([])

const cargandoRoles = ref(false)
const guardando = ref(false)

const permisosAgrupados = computed(() => {
  const grupos: Record<string, Permiso[]> = {}
  todosPermisos.value.forEach(p => {
    const categoria = p.slug.split('.')[0] || 'otros'
    if (!grupos[categoria]) {
      grupos[categoria] = []
    }
    grupos[categoria].push(p)
  })
  return grupos
})

onMounted(async () => {
  await cargarDatos()
})

async function cargarDatos() {
  cargandoRoles.value = true
  try {
    const [resRoles, resPermisos] = await Promise.all([
      rolesApi.listar(),
      rolesApi.listarPermisos()
    ])
    
    roles.value = resRoles.data
    todosPermisos.value = resPermisos.data
  } catch (error) {
    console.error('Error cargando roles y permisos:', error)
    $q.notify({ type: 'negative', message: 'Error al cargar los datos.' })
  } finally {
    cargandoRoles.value = false
  }
}

function seleccionarRol(rol: Rol) {
  selectedRol.value = rol
  // Setear los permisos que tiene este rol
  permisosSeleccionados.value = rol.permisos.map((p: Permiso) => p.id_permiso)
}

async function guardarPermisos() {
  if (!selectedRol.value) return

  guardando.value = true
  try {
    const { data } = await rolesApi.actualizarPermisos(selectedRol.value.id_rol, {
      permisos: permisosSeleccionados.value
    })
    
    // Actualizar la info del rol localmente
    const index = roles.value.findIndex(r => r.id_rol === selectedRol.value!.id_rol)
    if (index !== -1) {
      roles.value[index] = data
    }
    
    $q.notify({
      type: 'positive',
      message: 'Permisos actualizados correctamente',
      position: 'top-right'
    })
  } catch (error) {
    console.error('Error guardando permisos:', error)
    $q.notify({ type: 'negative', message: 'Error al actualizar permisos.' })
  } finally {
    guardando.value = false
  }
}

function promptCrearRol() {
  $q.dialog({
    title: 'Nuevo Rol',
    message: 'Ingrese el nombre del nuevo rol:',
    prompt: {
      model: '',
      type: 'text'
    },
    cancel: true,
    persistent: true
  }).onOk(async data => {
    if (!data.trim()) return
    try {
      const res = await rolesApi.crear({ nombre: data.trim() })
      roles.value.push(res.data)
      $q.notify({ type: 'positive', message: 'Rol creado correctamente.' })
    } catch (e: any) {
      console.error(e)
      $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al crear rol.' })
    }
  })
}

function confirmarEliminarRol() {
  if (!selectedRol.value) return
  const id = selectedRol.value.id_rol
  $q.dialog({
    title: 'Eliminar Rol',
    message: `¿Está seguro de eliminar el rol "${selectedRol.value.nombre}"?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await rolesApi.eliminar(id)
      roles.value = roles.value.filter(r => r.id_rol !== id)
      selectedRol.value = null
      permisosSeleccionados.value = []
      $q.notify({ type: 'positive', message: 'Rol eliminado correctamente.' })
    } catch (e: any) {
      console.error(e)
      $q.notify({ type: 'negative', message: e.response?.data?.message || 'Error al eliminar rol.' })
    }
  })
}

function getRolColor(nombre: string) {
  const n = nombre.toLowerCase()
  if (n === 'admin') return 'primary'
  if (n === 'tesorero') return 'positive'
  if (n === 'secretario') return 'info'
  return 'grey-7'
}
</script>

<style scoped>
.main-card {
  border-radius: 20px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
}
body.body--light .main-card {
  background: white;
}
body.body--dark .main-card {
  background: #1e1e24;
  border: 1px solid rgba(255,255,255,0.05);
}

.permiso-item {
  border-radius: 12px;
}
body.body--light .permiso-item {
  background: #f5f5f5;
}
body.body--dark .permiso-item {
  background: rgba(255,255,255,0.05);
}
</style>
