import { defineRouter } from '#q-app/wrappers'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from 'src/stores/auth.store'

const routes = [
  {
    path: '/login',
    component: () => import('src/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('src/pages/auth/LoginPage.vue'),
        meta: { publica: true },
      },
      {
        path: 'cambiar-password',
        name: 'cambiar-password',
        component: () => import('src/pages/auth/ChangePasswordPage.vue')
      }
    ],
  },
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      { path: '',          redirect: '/dashboard' },
      { path: 'dashboard', name: 'dashboard',     component: () => import('src/pages/dashboard/DashboardPage.vue') },
      { path: 'personas',  name: 'personas',      component: () => import('src/pages/personas/PersonasPage.vue') },
      { path: 'personas/:id', name: 'persona-detalle', component: () => import('src/pages/personas/PersonaDetallePage.vue') },
       { path: 'usuarios', name: 'usuarios', component: () => import('src/pages/usuarios/UsuariosPage.vue'),
        meta: { roles: ['admin'] }
      },
      { path: 'roles', name: 'roles', component: () => import('src/pages/roles/RolesPermisosPage.vue'),
        meta: { roles: ['admin'] }
      },
       { path: 'festividades', name: 'festividades', component: () => import('src/pages/festividades/FestividadesPage.vue'),
         meta: { roles: ['admin'] }
       },
       { path: 'festividades/:id', name: 'festividad-detalle', component: () => import('src/pages/festividades/FestividadDetallePage.vue'),
         meta: { roles: ['admin'] }
       },
       { path: 'bloques', name: 'bloques', component: () => import('src/pages/bloques/BloquesPage.vue'),
         meta: { roles: ['admin'] }
       },
      { path: 'inscripciones', name: 'inscripciones', component: () => import('src/pages/inscripciones/InscripcionesPage.vue'),
        meta: { roles: ['admin', 'secretario', 'tesorero'] }
      },
      { path: 'pagos',    name: 'pagos',    component: () => import('src/pages/pagos/PagosPage.vue'),
        meta: { roles: ['admin', 'tesorero'] }
      },
      { path: 'reportes', name: 'reportes', component: () => import('src/pages/reportes/ReportesPage.vue'),
        meta: { roles: ['admin', 'tesorero'] }
      },
    ],
  },
]

export default defineRouter(function () {
  const Router = createRouter({
    history: createWebHistory(),
    routes,
  })

  // Guard global
  Router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (to.meta.publica) return true

    if (!auth.estaAutenticado) return { name: 'login' }

    // Cargar usuario si no está en memoria
    if (!auth.usuario) await auth.cargarUsuario()

    // Obligar a cambiar password si el flag está activo
    if ((auth.usuario as any)?.debe_cambiar_password && to.name !== 'cambiar-password') {
      return { name: 'cambiar-password' }
    }
    
    // Evitar entrar a cambiar-password si ya la cambió
    if (!(auth.usuario as any)?.debe_cambiar_password && to.name === 'cambiar-password') {
      return { name: 'dashboard' }
    }

    // Verificar rol si la ruta lo requiere
    const roles = to.meta.roles as string[] | undefined
    if (roles && !roles.includes(auth.rol ?? '')) {
      return { name: 'dashboard' }
    }

    return true
  })

  return Router
})
