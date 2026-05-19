<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="row items-center q-mb-xl">
      <div class="col">
        <div class="text-h4 text-weight-bolder text-primary q-mb-xs">Usuarios del Sistema</div>
        <div class="text-subtitle2 text-grey-7">Gestión de accesos y roles (Admin, Tesorero, Secretario)</div>
      </div>
      <div class="col-auto">
        <q-btn 
          color="primary" 
          icon="add" 
          label="Nuevo Usuario" 
          unelevated 
          rounded 
          @click="abrirDialogoNuevo"
        />
      </div>
    </div>

    <q-card flat class="main-card">
      <q-table
        :rows="store.usuarios"
        :columns="columnas"
        row-key="id_user"
        flat
        :loading="store.cargando"
      >
        <template v-slot:body-cell-rol="props">
          <q-td :props="props">
            <q-badge :color="getRolColor(props.value)" outline>
              {{ props.value }}
            </q-badge>
          </q-td>
        </template>

        <template v-slot:body-cell-activo="props">
          <q-td :props="props">
            <q-chip 
              :color="props.value ? 'green-1' : 'red-1'" 
              :text-color="props.value ? 'green-7' : 'red-7'"
              size="sm"
              dense
            >
              {{ props.value ? 'Activo' : 'Inactivo' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-sm">
            <q-btn flat round color="primary" icon="edit" size="sm" @click="editar(props.row)" />
            <q-btn 
              v-if="props.row.activo"
              flat round 
              color="negative" 
              icon="person_off" 
              size="sm" 
              @click="confirmarDesactivar(props.row)" 
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialogo para Crear/Editar -->
    <q-dialog v-model="dialogo" persistent>
      <q-card style="width: 450px; border-radius: 20px" class="q-pa-md">
        <q-card-section class="row items-center">
          <div class="text-h6 text-weight-bold text-primary">
            {{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="guardar" class="q-gutter-md">
            <!-- Selección de Persona (Solo para nuevos) -->
            <q-select
              v-if="!editando"
              v-model="form.id_persona"
              :options="personasFiltradas"
              label="Seleccionar Persona"
              outlined dense
              use-input
              emit-value
              map-options
              option-value="id_persona"
              :option-label="(p) => `${p.nombres} ${p.primer_apellido} (${p.ci})`"
              @filter="filtrarPersonas"
              @update:model-value="autoCompletarDatos"
              :rules="[v => !!v || 'Campo requerido']"
            >
              <template v-slot:no-option>
                <q-item><q-item-section class="text-grey">No se encontraron resultados</q-item-section></q-item>
              </template>
            </q-select>

            <q-input 
              v-model="form.username" 
              label="Nombre de Usuario (Login)" 
              outlined dense
              :rules="[v => !!v || 'Campo requerido']"
            />

            <q-input 
              v-model="form.password" 
              label="Contraseña" 
              outlined dense
              :type="verPass ? 'text' : 'password'"
              :hint="editando ? 'Dejar en blanco para no cambiar' : ''"
              :rules="editando ? [] : [v => !!v || 'Campo requerido', v => v.length >= 6 || 'Mínimo 6 caracteres']"
            >
              <template v-slot:append>
                <q-icon 
                  :name="verPass ? 'visibility_off' : 'visibility'" 
                  class="cursor-pointer" 
                  @click="verPass = !verPass" 
                />
              </template>
            </q-input>

            <q-select
              v-model="form.id_rol"
              :options="store.roles"
              label="Rol"
              outlined dense
              emit-value
              map-options
              option-value="id_rol"
              option-label="nombre"
              :rules="[v => !!v || 'Campo requerido']"
            />

            <q-toggle 
              v-if="editando"
              v-model="form.activo" 
              label="Usuario Activo" 
              color="primary"
            />

            <div class="row justify-end q-mt-lg">
              <q-btn flat label="Cancelar" v-close-popup class="q-mr-sm" />
              <q-btn 
                type="submit" 
                color="primary" 
                :label="editando ? 'Actualizar' : 'Registrar'" 
                unelevated 
                rounded
                :loading="store.cargando"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUsuariosStore } from 'src/stores/usuarios.store'
import { personasApi } from 'src/api/personas.api'
import { useQuasar } from 'quasar'

const store = useUsuariosStore()
const $q = useQuasar()

const dialogo = ref(false)
const editando = ref(false)
const verPass = ref(false)
const idEditando = ref<number | null>(null)

const form = reactive({
  id_persona: null,
  username: '',
  password: '',
  id_rol: null,
  activo: true
})

const personas = ref<any[]>([])
const personasFiltradas = ref<any[]>([])

const columnas: any[] = [
  { name: 'username', label: 'Usuario', field: 'username', align: 'left', sortable: true },
  { name: 'persona', label: 'Fraterno', field: (row: any) => `${row.persona.nombres} ${row.persona.primer_apellido}`, align: 'left' },
  { name: 'rol', label: 'Rol', field: (row: any) => row.rol.nombre, align: 'center' },
  { name: 'activo', label: 'Estado', field: 'activo', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'center' }
]

onMounted(async () => {
  await Promise.all([
    store.cargar(),
    store.cargarRoles()
  ])
  // Cargar personas para el select
  const { data } = await personasApi.listar({})
  personas.value = Array.isArray(data) ? data : (data.data || [])
})

function abrirDialogoNuevo() {
  editando.value = false
  idEditando.value = null
  Object.assign(form, {
    id_persona: null,
    username: '',
    password: '',
    id_rol: null,
    activo: true
  })
  dialogo.value = true
}

function editar(usuario: any) {
  editando.value = true
  idEditando.value = usuario.id_user
  Object.assign(form, {
    username: usuario.username,
    password: '',
    id_rol: usuario.id_rol,
    activo: usuario.activo === 1 || usuario.activo === true
  })
  dialogo.value = true
}

async function guardar() {
  if (editando.value && idEditando.value) {
    await store.actualizar(idEditando.value, form)
  } else {
    await store.registrar(form)
  }
  dialogo.value = false
}

function confirmarDesactivar(usuario: any) {
  $q.dialog({
    title: 'Confirmar',
    message: `¿Estás seguro de desactivar al usuario ${usuario.username}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await store.eliminar(usuario.id_user)
  })
}

function autoCompletarDatos(idPersona: any) {
  if (!idPersona) return
  const p = personas.value.find(p => p.id_persona === idPersona)
  if (p && p.ci) {
    form.username = p.ci
    form.password = p.ci
  }
}

function filtrarPersonas(val: string, update: any) {
  if (val === '') {
    update(() => {
      personasFiltradas.value = personas.value.slice(0, 50)
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    personasFiltradas.value = personas.value.filter(
      v => v.nombres.toLowerCase().includes(needle) || 
           v.primer_apellido.toLowerCase().includes(needle) ||
           v.ci.includes(needle)
    )
  })
}

function getRolColor(rol: string) {
  const r = rol.toLowerCase()
  if (r === 'admin') return 'primary'
  if (r === 'tesorero') return 'positive'
  if (r === 'secretario') return 'info'
  return 'grey'
}
</script>

<style scoped>
.main-card {
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
}
.border-bottom-light { border-bottom: 1px solid rgba(0,0,0,0.03); }
</style>
