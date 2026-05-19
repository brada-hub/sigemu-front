<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ═══ NAVBAR ═══ -->
    <q-header elevated :class="isDark ? 'navbar--dark' : 'navbar--light'">
      <q-toolbar>
        <q-btn flat dense round icon="menu" :color="isDark ? 'grey-4' : 'white'" @click="toggleSidebar" />

        <!-- Logo text -->
        <q-toolbar-title
          class="text-weight-bolder"
          :style="{ letterSpacing:'1.5px', fontSize:'1.15rem', color: isDark ? '#fff' : '#fff' }"
        >
          SIGEMU
        </q-toolbar-title>
        <q-space />

        <div class="gt-xs q-mr-md" :style="{ fontSize:'0.78rem', color: isDark ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.75)' }">
          Morenada UNITEPC
        </div>

        <!-- PWA INSTALL -->
        <q-btn 
          flat dense round 
          icon="download_for_offline" 
          :color="puedeInstalar ? (isDark ? 'positive' : 'white') : (isDark ? 'grey-8' : 'grey-4')" 
          class="q-mr-sm" 
          @click="instalarApp"
          :disable="!puedeInstalar"
        >
          <q-tooltip>{{ puedeInstalar ? 'Instalar Aplicación SIGEMU' : 'PWA: Error de detección (Revisa consola)' }}</q-tooltip>
        </q-btn>

        <!-- DARK / LIGHT TOGGLE -->
        <q-btn flat dense round :icon="isDark ? 'light_mode' : 'dark_mode'" :color="isDark ? 'amber' : 'white'" class="q-mr-sm" @click="toggleTheme">
          <q-tooltip>{{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}</q-tooltip>
        </q-btn>

        <q-avatar size="32px" :style="avatarStyle">
          {{ iniciales }}
        </q-avatar>
      </q-toolbar>
    </q-header>

    <!-- ═══ SIDEBAR ═══ -->
    <q-drawer v-model="sidebarVisible" show-if-above :breakpoint="768" :width="260">
      <div class="column full-height" :style="isDark ? sidebarDarkBg : sidebarLightBg">

        <!-- Logo -->
        <div :style="isDark ? logoDarkStyle : logoLightStyle">
          <q-img src="~assets/sigemu.png" style="width: 60px" class="q-mb-xs" />
          <div :style="{ fontSize:'0.6rem', fontWeight:'700', letterSpacing:'1.5px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.7)' }">
            SISTEMA DE GESTIÓN
          </div>
        </div>

        <!-- Navigation -->
        <q-scroll-area class="col">
          <q-list class="q-px-sm q-pt-md">
            <div class="section-lbl" :class="isDark ? 'lbl--dark' : 'lbl--light'">PRINCIPAL</div>
            <SideNavItem to="/dashboard"     icon="dashboard"          label="Dashboard" :dark="isDark" />
            <SideNavItem to="/personas"      icon="people"             label="Personas"  :dark="isDark" />

            <template v-if="auth.esAdmin">
              <div class="section-lbl q-mt-md" :class="isDark ? 'lbl--dark' : 'lbl--light'">ADMINISTRACIÓN</div>
              <SideNavItem to="/festividades"  icon="celebration"       label="Festividades"    :dark="isDark" />
              <SideNavItem to="/bloques"       icon="account_tree"      label="Bloques"         :dark="isDark" />
              <SideNavItem to="/usuarios"      icon="manage_accounts"   label="Usuarios"        :dark="isDark" />
              <SideNavItem to="/roles"         icon="admin_panel_settings" label="Roles y Permisos" :dark="isDark" />
            </template>

            <template v-if="auth.puedeInscribir || auth.puedeVerPagos">
              <div class="section-lbl q-mt-md" :class="isDark ? 'lbl--dark' : 'lbl--light'">OPERACIONES</div>
              <SideNavItem to="/inscripciones" icon="how_to_reg"   label="Inscripciones" :dark="isDark" v-if="auth.puedeInscribir || auth.esTesorero" />
              <SideNavItem to="/pagos"         icon="payments"     label="Pagos"          :dark="isDark" v-if="auth.puedeVerPagos" />
              <SideNavItem to="/reportes"      icon="assessment"   label="Reportes"       :dark="isDark" v-if="auth.puedeVerPagos" />
            </template>
          </q-list>
        </q-scroll-area>

        <!-- User Section -->
        <div :style="isDark ? userDarkStyle : userLightStyle">
          <div class="row items-center no-wrap q-mb-md">
            <q-avatar size="52px" style="background:linear-gradient(135deg,#4f2789,#00c2cb); color:#fff; font-weight:700; font-size:1.1rem; box-shadow:0 4px 15px rgba(0,0,0,0.3)" class="q-mr-md">
              {{ iniciales }}
            </q-avatar>
            <div class="col overflow-hidden">
              <div class="text-weight-bold ellipsis" style="font-size:0.95rem; color:#fff">
                {{ nombreCompleto }}
              </div>
              <div class="ellipsis" style="font-size:0.78rem; color:#4dd0e1">
                {{ (auth.usuario as any)?.rol?.nombre || auth.rol }}
              </div>
            </div>
          </div>
          <q-btn
            unelevated no-caps
            class="full-width"
            icon="logout"
            label="Cerrar Sesión"
            style="color:#1a1430; background:#fff; border-radius:10px; padding:10px 0; font-weight:700; font-size:0.85rem; box-shadow:0 2px 8px rgba(0,0,0,0.2)"
            @click="cerrarSesion"
          />
        </div>
      </div>
    </q-drawer>

    <!-- ═══ MAIN ═══ -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth.store'
import { useTheme } from 'src/composables/useTheme'
import SideNavItem from 'src/components/common/NavItem.vue'

const router = useRouter()
const auth = useAuthStore()
const sidebarVisible = ref(true)
const { isDark, loadTheme, toggleTheme } = useTheme()

const deferredPrompt = ref<any>(null)
const puedeInstalar = ref(false)

onMounted(() => {
  loadTheme()
  
  // Lógica para capturar el evento de instalación de PWA
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    puedeInstalar.value = true
  })

  window.addEventListener('appinstalled', () => {
    puedeInstalar.value = false
    deferredPrompt.value = null
  })
})

async function instalarApp() {
  if (!deferredPrompt.value) return
  
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    puedeInstalar.value = false
    deferredPrompt.value = null
  }
}

function toggleSidebar() { sidebarVisible.value = !sidebarVisible.value }

const iniciales = computed(() => {
  const username = (auth.usuario as Record<string, unknown>)?.username as string ?? 'U'
  return username.slice(0, 2).toUpperCase()
})

const nombreCompleto = computed(() => {
  const u = auth.usuario as Record<string, any>
  if (u?.persona?.nombres) return `${u.persona.nombres} ${u.persona.primer_apellido || ''}`.trim()
  return u?.username || 'Usuario'
})

async function cerrarSesion() {
  await auth.logout()
  router.push({ name: 'login' })
}

/* ═══ THEME STYLES ═══ */

// Avatar
const avatarStyle = computed(() => ({
  background: isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
  color: '#fff', fontWeight: '700', fontSize: '0.75rem',
  backdropFilter: 'blur(8px)'
}))

// Sidebar backgrounds
const sidebarDarkBg = { background: 'linear-gradient(180deg, #1e1040 0%, #151035 50%, #0a1520 100%)', minHeight: '100%' }
const sidebarLightBg = { background: 'linear-gradient(180deg, #4f2789 0%, #303f9f 50%, #00c2cb 100%)', minHeight: '100%' }

// Logo
const logoDarkStyle = { padding: '20px 16px 14px', textAlign: 'center' as const, background: 'linear-gradient(180deg, rgba(79,39,137,0.3), transparent)', borderBottom: '1px solid rgba(255,255,255,0.05)' }
const logoLightStyle = { padding: '20px 16px 14px', textAlign: 'center' as const, borderBottom: '1px solid rgba(255,255,255,0.1)' }

// User section
const userDarkStyle = { padding: '14px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }
const userLightStyle = { padding: '14px', background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.1)' }

// Logout btn
const logoutDarkStyle = { color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }
const logoutLightStyle = { color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px' }
</script>

<style scoped>
/* ── DARK NAVBAR: institutional gradient pero sombrío ── */
.navbar--dark {
  background: linear-gradient(135deg, #2a1448 0%, #1a2258 60%, #00686e 100%) !important;
  border: none !important;
}

/* ── LIGHT NAVBAR: institutional gradient vibrante ── */
.navbar--light {
  background: linear-gradient(135deg, #4f2789 0%, #303f9f 60%, #00c2cb 100%) !important;
  border: none !important;
}

/* Section labels */
.section-lbl {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  padding: 0 12px;
  margin-bottom: 4px;
}
.lbl--dark { color: rgba(255,255,255,0.25); }
.lbl--light { color: rgba(255,255,255,0.45); }
</style>
