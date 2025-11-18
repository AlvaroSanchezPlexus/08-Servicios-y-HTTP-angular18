# 📚 MÓDULO 5: SERVICIOS Y HTTP

## Clase 16: Servicios con inject()

### ✅ Temario

- ¿Qué son los servicios y por qué usarlos?
- Creación de servicios con `inject()`
- Patrón Singleton vs múltiples instancias
- Servicios como fuente de verdad centralizada
- Comunicación entre componentes via servicios

### 📚 Teoría

**¿Qué son los servicios?**
Los servicios en Angular son clases que contienen lógica de negocio reutilizable, datos compartidos y funcionalidades que pueden ser usadas por múltiples componentes.

**Ventajas de usar servicios:**

- ✅ Centralizan lógica y datos
- ✅ Evitan duplicación de código
- ✅ Facilitan testing
- ✅ Mejoran la mantenibilidad
- ✅ Permiten comunicación entre componentes no relacionados

**`inject()` vs constructor:**
En Angular 18, `inject()` es la forma moderna de inyectar dependencias, más flexible y compatible con funciones.

### 🛠️ Práctica Guiada

**Paso 1: Crear un servicio básico**

```typescript
// services/usuarios.service.ts
import { Injectable, signal } from "@angular/core";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  activo: boolean;
}

@Injectable({
  providedIn: "root", // Singleton a nivel de aplicación
})
export class UsuariosService {
  // Estado reactivo del servicio
  private _usuarios = signal<Usuario[]>([
    { id: 1, nombre: "Ana García", email: "ana@example.com", activo: true },
    { id: 2, nombre: "Luis Martínez", email: "luis@example.com", activo: false },
    { id: 3, nombre: "María López", email: "maria@example.com", activo: true },
  ]);

  // Exponer como readonly
  usuarios = this._usuarios.asReadonly();

  // Métodos para manipular el estado
  agregarUsuario(usuario: Omit<Usuario, "id">) {
    this._usuarios.update((usuarios) => [
      ...usuarios,
      {
        ...usuario,
        id: Math.max(...usuarios.map((u) => u.id)) + 1,
      },
    ]);
  }

  eliminarUsuario(id: number) {
    this._usuarios.update((usuarios) => usuarios.filter((u) => u.id !== id));
  }

  toggleActivo(id: number) {
    this._usuarios.update((usuarios) => usuarios.map((u) => (u.id === id ? { ...u, activo: !u.activo } : u)));
  }
}
```

**Paso 2: Usar el servicio en un componente con `inject()`**

```typescript
// components/lista-usuarios.component.ts
import { Component, inject } from "@angular/core";
import { UsuariosService } from "../services/usuarios.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-lista-usuarios",
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="lista-usuarios">
      <h2>Gestión de Usuarios</h2>

      <!-- Formulario para agregar usuario -->
      <div class="form-agregar">
        <input [(ngModel)]="nuevoUsuario.nombre" placeholder="Nombre" />
        <input [(ngModel)]="nuevoUsuario.email" placeholder="Email" type="email" />
        <button (click)="agregarUsuario()">Agregar</button>
      </div>

      <!-- Lista de usuarios -->
      <div class="usuarios">
        @for (usuario of usuariosService.usuarios(); track usuario.id) {
        <div class="usuario-card" [class.inactivo]="!usuario.activo">
          <h3>{{ usuario.nombre }}</h3>
          <p>{{ usuario.email }}</p>
          <div class="acciones">
            <button (click)="toggleActivo(usuario.id)">
              {{ usuario.activo ? "Desactivar" : "Activar" }}
            </button>
            <button (click)="eliminarUsuario(usuario.id)" class="eliminar">Eliminar</button>
          </div>
        </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .lista-usuarios {
        padding: 1rem;
      }
      .form-agregar {
        margin-bottom: 2rem;
        display: flex;
        gap: 0.5rem;
      }
      .usuarios {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .usuario-card {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
      }
      .usuario-card.inactivo {
        opacity: 0.6;
        background: #f5f5f5;
      }
      .acciones {
        margin-top: 0.5rem;
        display: flex;
        gap: 0.5rem;
      }
      .eliminar {
        background: #dc3545;
        color: white;
      }
    `,
  ],
})
export class ListaUsuariosComponent {
  // Inyectar servicio usando inject()
  usuariosService = inject(UsuariosService);

  nuevoUsuario = {
    nombre: "",
    email: "",
  };

  agregarUsuario() {
    if (this.nuevoUsuario.nombre && this.nuevoUsuario.email) {
      this.usuariosService.agregarUsuario({
        ...this.nuevoUsuario,
        activo: true,
      });
      this.nuevoUsuario = { nombre: "", email: "" };
    }
  }

  eliminarUsuario(id: number) {
    this.usuariosService.eliminarUsuario(id);
  }

  toggleActivo(id: number) {
    this.usuariosService.toggleActivo(id);
  }
}
```

**Paso 3: Servicio con estado complejo y computed**

```typescript
// services/carrito.service.ts
import { Injectable, signal, computed, inject } from "@angular/core";

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string;
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
}

@Injectable({
  providedIn: "root",
})
export class CarritoService {
  private _items = signal<ItemCarrito[]>([]);

  // Exponer estado
  items = this._items.asReadonly();

  // Computed values
  totalItems = computed(() => this._items().reduce((sum, item) => sum + item.cantidad, 0));

  subtotal = computed(() => this._items().reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0));

  iva = computed(() => this.subtotal() * 0.21);

  total = computed(() => this.subtotal() + this.iva());

  // Métodos
  agregarProducto(producto: Producto) {
    this._items.update((items) => {
      const existingItem = items.find((item) => item.producto.id === producto.id);

      if (existingItem) {
        return items.map((item) => (item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item));
      } else {
        return [...items, { producto, cantidad: 1 }];
      }
    });
  }

  eliminarProducto(productoId: number) {
    this._items.update((items) => items.filter((item) => item.producto.id !== productoId));
  }

  actualizarCantidad(productoId: number, cantidad: number) {
    if (cantidad <= 0) {
      this.eliminarProducto(productoId);
      return;
    }

    this._items.update((items) => items.map((item) => (item.producto.id === productoId ? { ...item, cantidad } : item)));
  }

  limpiarCarrito() {
    this._items.set([]);
  }
}
```

**Paso 4: Múltiples componentes usando el mismo servicio**

```typescript
// components/header.component.ts
import { Component, inject } from '@angular/core';
import { CarritoService } from '../services/carrito.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <h1>Mi Tienda</h1>
      <div class="carrito-info">
        <span>🛒 {{ carritoService.totalItems() }} items</span>
        <span>Total: ${{ carritoService.total().toFixed(2) }}</span>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: #f8f9fa;
      border-bottom: 1px solid #dee2e6;
    }
    .carrito-info {
      display: flex;
      gap: 1rem;
      font-weight: bold;
    }
  `]
})
export class HeaderComponent {
  carritoService = inject(CarritoService);
}
```

```typescript
// components/catalogo.component.ts
import { Component, inject, signal } from '@angular/core';
import { CarritoService, Producto } from '../services/carrito.service';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  template: `
    <div class="catalogo">
      <h2>Catálogo de Productos</h2>
      <div class="productos-grid">
        @for (producto of productos(); track producto.id) {
          <div class="producto-card">
            <h3>{{ producto.nombre }}</h3>
            <p class="categoria">{{ producto.categoria }}</p>
            <p class="precio">${{ producto.precio }}</p>
            <button (click)="agregarAlCarrito(producto)">
              Agregar al Carrito
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .catalogo {
      padding: 2rem;
    }
    .productos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    .producto-card {
      border: 1px solid #ddd;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .precio {
      font-size: 1.25rem;
      font-weight: bold;
      color: #2ecc71;
    }
    .categoria {
      color: #7f8c8d;
      font-size: 0.875rem;
    }
  `]
})
export class CatalogoComponent {
  carritoService = inject(CarritoService);

  productos = signal<Producto[]>([
    { id: 1, nombre: 'Laptop Gaming', precio: 1299, categoria: 'Tecnología' },
    { id: 2, nombre: 'Mouse Inalámbrico', precio: 49, categoria: 'Tecnología' },
    { id: 3, nombre: 'Teclado Mecánico', precio: 89, categoria: 'Tecnología' },
    { id: 4, nombre: 'Monitor 24"', precio: 199, categoria: 'Tecnología' }
  ]);

  agregarAlCarrito(producto: Producto) {
    this.carritoService.agregarProducto(producto);
  }
}
```

**Paso 5: Servicio con efectos secundarios**

```typescript
// services/theme.service.ts
import { Injectable, signal, effect } from "@angular/core";

export interface ThemeConfig {
  mode: "light" | "dark";
  primaryColor: string;
  fontSize: number;
}

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private _theme = signal<ThemeConfig>({
    mode: "light",
    primaryColor: "#007bff",
    fontSize: 16,
  });

  theme = this._theme.asReadonly();

  constructor() {
    // Cargar tema guardado al inicializar
    const saved = localStorage.getItem("app-theme");
    if (saved) {
      this._theme.set(JSON.parse(saved));
    }

    // Effect: guardar en localStorage y aplicar al documento
    effect(() => {
      const theme = this._theme();

      // Guardar en localStorage
      localStorage.setItem("app-theme", JSON.stringify(theme));

      // Aplicar al documento
      this.aplicarTema(theme);
    });
  }

  setMode(mode: "light" | "dark") {
    this._theme.update((theme) => ({ ...theme, mode }));
  }

  setPrimaryColor(color: string) {
    this._theme.update((theme) => ({ ...theme, primaryColor: color }));
  }

  setFontSize(size: number) {
    this._theme.update((theme) => ({ ...theme, fontSize: size }));
  }

  private aplicarTema(theme: ThemeConfig) {
    const root = document.documentElement;

    // Aplicar variables CSS
    root.style.setProperty("--primary-color", theme.primaryColor);
    root.style.setProperty("--font-size", `${theme.fontSize}px`);

    // Aplicar modo claro/oscuro
    if (theme.mode === "dark") {
      root.classList.add("dark-mode");
    } else {
      root.classList.remove("dark-mode");
    }
  }
}
```

### 🧪 Ejercicios

1. **Servicio de notificaciones**: Crea un servicio que:

   - Mantenga un array de notificaciones
   - Permita agregar, eliminar y marcar como leídas
   - Use computed para contar notificaciones no leídas
   - Sea usado por múltiples componentes

2. **Servicio de autenticación**: Crea un servicio que:

   - Maneje estado de login/logout
   - Guarde token en localStorage
   - Provea información del usuario actual
   - Use effects para persistir cambios

3. **Servicio de configuración**: Crea un servicio que:

   - Maneje configuraciones de la app
   - Persista en localStorage automáticamente
   - Permita resetear a valores por defecto
   - Notifique cambios a componentes suscritos

4. **Servicio de tareas compartidas**: Crea un servicio de tareas que:
   - Sea usado por múltiples componentes
   - Permita filtrar por categoría y estado
   - Calcule estadísticas con computed
   - Sincronice con localStorage

---

## Clase 17: HTTP Client y Consumo de APIs

### ✅ Temario

- Configuración de HttpClient
- Peticiones GET, POST, PUT, DELETE
- Tipado de respuestas HTTP
- Manejo de estados de carga y error
- Patrones reactivos con Signals

### 📚 Teoría

**HttpClient de Angular:**

- Servicio integrado para hacer peticiones HTTP
- Soporte para observables y promises
- Interceptores para modificar peticiones/respuestas
- Tipado fuerte de datos

**Configuración necesaria:**

```typescript
import { provideHttpClient } from "@angular/common/http";

// En app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient()],
};
```

### 🛠️ Práctica Guiada

**Paso 1: Servicio básico con HttpClient**

```typescript
// services/posts.service.ts
import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap } from "rxjs";

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

@Injectable({
  providedIn: "root",
})
export class PostsService {
  private http = inject(HttpClient);
  private apiUrl = "https://jsonplaceholder.typicode.com";

  // Estado reactivo
  private _posts = signal<Post[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  // Exponer estado
  posts = this._posts.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();

  // Cargar todos los posts
  cargarPosts(): Observable<Post[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Post[]>(`${this.apiUrl}/posts`).pipe(
      tap({
        next: (posts) => {
          this._posts.set(posts);
          this._loading.set(false);
        },
        error: (error) => {
          this._error.set("Error al cargar posts");
          this._loading.set(false);
          console.error("Error:", error);
        },
      })
    );
  }

  // Obtener post por ID
  obtenerPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`);
  }

  // Crear nuevo post
  crearPost(post: Omit<Post, "id">): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, post);
  }

  // Actualizar post
  actualizarPost(id: number, post: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/posts/${id}`, post);
  }

  // Eliminar post
  eliminarPost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${id}`);
  }
}
```

**Paso 2: Componente que consume el servicio HTTP**

```typescript
// components/lista-posts.component.ts
import { Component, inject, OnInit, signal } from "@angular/core";
import { PostsService, Post } from "../services/posts.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-lista-posts",
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="posts-container">
      <h2>Posts desde API</h2>

      <!-- Formulario para crear post -->
      <div class="form-crear">
        <h3>Crear Nuevo Post</h3>
        <input [(ngModel)]="nuevoPost.title" placeholder="Título" />
        <textarea [(ngModel)]="nuevoPost.body" placeholder="Contenido"></textarea>
        <button (click)="crearPost()" [disabled]="postsService.loading()">
          {{ postsService.loading() ? "Creando..." : "Crear Post" }}
        </button>
      </div>

      <!-- Estados de carga y error -->
      @if (postsService.loading()) {
      <div class="loading">Cargando posts...</div>
      } @if (postsService.error()) {
      <div class="error">
        {{ postsService.error() }}
        <button (click)="recargar()">Reintentar</button>
      </div>
      }

      <!-- Lista de posts -->
      <div class="posts-grid">
        @for (post of postsService.posts(); track post.id) {
        <div class="post-card">
          <h3>{{ post.title }}</h3>
          <p>{{ post.body }}</p>
          <div class="post-actions">
            <button (click)="editarPost(post)">Editar</button>
            <button (click)="eliminarPost(post.id)" class="delete">Eliminar</button>
          </div>
        </div>
        } @empty { @if (!postsService.loading()) {
        <p>No hay posts disponibles</p>
        } }
      </div>
    </div>
  `,
  styles: [
    `
      .posts-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      .form-crear {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 2rem;
      }
      .form-crear input,
      .form-crear textarea {
        display: block;
        width: 100%;
        margin-bottom: 1rem;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      .form-crear textarea {
        min-height: 100px;
        resize: vertical;
      }
      .loading {
        text-align: center;
        padding: 2rem;
        font-size: 1.2rem;
      }
      .error {
        background: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
        display: flex;
        justify-content: between;
        align-items: center;
      }
      .posts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }
      .post-card {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
        background: white;
      }
      .post-card h3 {
        margin-top: 0;
        color: #333;
      }
      .post-actions {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
      }
      .delete {
        background: #dc3545;
        color: white;
      }
    `,
  ],
})
export class ListaPostsComponent implements OnInit {
  postsService = inject(PostsService);

  nuevoPost = {
    title: "",
    body: "",
    userId: 1,
  };

  ngOnInit() {
    this.cargarPosts();
  }

  cargarPosts() {
    this.postsService.cargarPosts().subscribe();
  }

  crearPost() {
    if (this.nuevoPost.title && this.nuevoPost.body) {
      this.postsService.crearPost(this.nuevoPost).subscribe({
        next: () => {
          this.nuevoPost = { title: "", body: "", userId: 1 };
          this.cargarPosts(); // Recargar lista
        },
        error: (error) => {
          console.error("Error creando post:", error);
        },
      });
    }
  }

  editarPost(post: Post) {
    const nuevoTitulo = prompt("Nuevo título:", post.title);
    if (nuevoTitulo) {
      this.postsService
        .actualizarPost(post.id, {
          title: nuevoTitulo,
        })
        .subscribe({
          next: () => this.cargarPosts(),
          error: (error) => console.error("Error editando:", error),
        });
    }
  }

  eliminarPost(id: number) {
    if (confirm("¿Estás seguro de eliminar este post?")) {
      this.postsService.eliminarPost(id).subscribe({
        next: () => this.cargarPosts(),
        error: (error) => console.error("Error eliminando:", error),
      });
    }
  }

  recargar() {
    this.cargarPosts();
  }
}
```

**Paso 3: Servicio con búsqueda y filtros**

```typescript
// services/usuarios-api.service.ts
import { Injectable, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, tap } from "rxjs";

export interface Usuario {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
  };
}

interface Geo {
  lat: string;
  lng: string;
}

interface Address {
  street: string;
  suite: string;
  city: string;
  zipcode: string;
  geo: Geo;
}

export interface UsuarioCompleto extends Usuario {
  address: Address;
}

@Injectable({
  providedIn: "root",
})
export class UsuariosApiService {
  private http = inject(HttpClient);
  private apiUrl = "https://jsonplaceholder.typicode.com";

  private _usuarios = signal<Usuario[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _busqueda = signal("");

  usuarios = this._usuarios.asReadonly();
  loading = this._loading.asReadonly();
  error = this._error.asReadonly();
  busqueda = this._busqueda.asReadonly();

  // Computed: usuarios filtrados
  usuariosFiltrados = computed(() => {
    const busqueda = this._busqueda().toLowerCase();
    const usuarios = this._usuarios();

    if (!busqueda) return usuarios;

    return usuarios.filter((usuario) => usuario.name.toLowerCase().includes(busqueda) || usuario.email.toLowerCase().includes(busqueda) || usuario.company.name.toLowerCase().includes(busqueda));
  });

  cargarUsuarios(): Observable<Usuario[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Usuario[]>(`${this.apiUrl}/users`).pipe(
      tap({
        next: (usuarios) => {
          this._usuarios.set(usuarios);
          this._loading.set(false);
        },
        error: (error) => {
          this._error.set("Error al cargar usuarios");
          this._loading.set(false);
        },
      })
    );
  }

  obtenerUsuario(id: number): Observable<UsuarioCompleto> {
    return this.http.get<UsuarioCompleto>(`${this.apiUrl}/users/${id}`);
  }

  setBusqueda(termino: string) {
    this._busqueda.set(termino);
  }

  // Ejemplo de transformación de datos
  obtenerEstadisticas() {
    return this._usuarios().reduce(
      (stats, usuario) => {
        const dominio = usuario.email.split("@")[1];
        stats.dominios[dominio] = (stats.dominios[dominio] || 0) + 1;
        stats.total++;
        return stats;
      },
      { total: 0, dominios: {} as Record<string, number> }
    );
  }
}
```

**Paso 4: Componente con búsqueda en tiempo real**

```typescript
// components/busqueda-usuarios.component.ts
import { Component, inject, OnInit, signal } from "@angular/core";
import { UsuariosApiService } from "../services/usuarios-api.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-busqueda-usuarios",
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="usuarios-container">
      <h2>Búsqueda de Usuarios</h2>

      <!-- Barra de búsqueda -->
      <div class="busqueda">
        <input [(ngModel)]="terminoBusqueda" (input)="onBuscar()" placeholder="Buscar por nombre, email o compañía..." class="busqueda-input" />
        <span class="resultados"> {{ usuariosService.usuariosFiltrados().length }} resultados </span>
      </div>

      <!-- Estados -->
      @if (usuariosService.loading()) {
      <div class="estado">Cargando usuarios...</div>
      } @if (usuariosService.error()) {
      <div class="error">
        {{ usuariosService.error() }}
        <button (click)="recargar()">Reintentar</button>
      </div>
      }

      <!-- Lista de usuarios -->
      <div class="usuarios-grid">
        @for (usuario of usuariosService.usuariosFiltrados(); track usuario.id) {
        <div class="usuario-card">
          <h3>{{ usuario.name }}</h3>
          <p class="email">📧 {{ usuario.email }}</p>
          <p class="telefono">📞 {{ usuario.phone }}</p>
          <p class="compania">🏢 {{ usuario.company.name }}</p>
          <p class="website">🌐 {{ usuario.website }}</p>
        </div>
        } @empty { @if (!usuariosService.loading()) {
        <div class="vacio">
          @if (usuariosService.busqueda()) {
          <p>No se encontraron usuarios para "{{ usuariosService.busqueda() }}"</p>
          } @else {
          <p>No hay usuarios disponibles</p>
          }
        </div>
        } }
      </div>
    </div>
  `,
  styles: [
    `
      .usuarios-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }
      .busqueda {
        margin-bottom: 2rem;
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .busqueda-input {
        flex: 1;
        padding: 0.75rem;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        font-size: 1rem;
      }
      .resultados {
        color: #6c757d;
        font-weight: bold;
      }
      .usuarios-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }
      .usuario-card {
        border: 1px solid #e9ecef;
        padding: 1.5rem;
        border-radius: 12px;
        background: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .usuario-card h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }
      .usuario-card p {
        margin: 0.5rem 0;
        font-size: 0.9rem;
      }
      .email {
        color: #007bff;
      }
      .telefono {
        color: #28a745;
      }
      .compania {
        color: #6f42c1;
      }
      .website {
        color: #fd7e14;
      }
      .estado,
      .error,
      .vacio {
        text-align: center;
        padding: 2rem;
        border-radius: 8px;
        margin: 2rem 0;
      }
      .estado {
        background: #fff3cd;
        color: #856404;
      }
      .error {
        background: #f8d7da;
        color: #721c24;
      }
      .vacio {
        background: #e9ecef;
        color: #6c757d;
      }
    `,
  ],
})
export class BusquedaUsuariosComponent implements OnInit {
  usuariosService = inject(UsuariosApiService);
  terminoBusqueda = signal("");

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuariosService.cargarUsuarios().subscribe();
  }

  onBuscar() {
    this.usuariosService.setBusqueda(this.terminoBusqueda());
  }

  recargar() {
    this.cargarUsuarios();
  }
}
```

**Paso 5: Servicio con manejo avanzado de estado**

```typescript
// services/productos.service.ts
import { Injectable, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, tap, catchError, of } from "rxjs";

export interface Producto {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

interface EstadoProductos {
  datos: Producto[];
  cargando: boolean;
  error: string | null;
  pagina: number;
  tieneMas: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ProductosService {
  private http = inject(HttpClient);
  private apiUrl = "https://fakestoreapi.com";

  // Estado inicial
  private _estado = signal<EstadoProductos>({
    datos: [],
    cargando: false,
    error: null,
    pagina: 1,
    tieneMas: true,
  });

  // Selectores
  productos = computed(() => this._estado().datos);
  cargando = computed(() => this._estado().cargando);
  error = computed(() => this._estado().error);
  tieneMas = computed(() => this._estado().tieneMas);

  // Acciones
  cargarProductos(): Observable<Producto[]> {
    this._actualizarEstado({ cargando: true, error: null });

    return this.http.get<Producto[]>(`${this.apiUrl}/products`).pipe(
      tap((productos) => {
        this._actualizarEstado({
          datos: productos,
          cargando: false,
          tieneMas: false, // API no tiene paginación
        });
      }),
      catchError((error) => {
        this._actualizarEstado({
          error: "Error al cargar productos",
          cargando: false,
        });
        return of([]);
      })
    );
  }

  cargarProductosPorCategoria(categoria: string): Observable<Producto[]> {
    this._actualizarEstado({ cargando: true, error: null });

    return this.http.get<Producto[]>(`${this.apiUrl}/products/category/${categoria}`).pipe(
      tap((productos) => {
        this._actualizarEstado({
          datos: productos,
          cargando: false,
        });
      }),
      catchError((error) => {
        this._actualizarEstado({
          error: `Error al cargar productos de ${categoria}`,
          cargando: false,
        });
        return of([]);
      })
    );
  }

  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.apiUrl}/products/${id}`);
  }

  obtenerCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/products/categories`);
  }

  private _actualizarEstado(actualizacion: Partial<EstadoProductos>) {
    this._estado.update((estado) => ({ ...estado, ...actualizacion }));
  }
}
```

### 🧪 Ejercicios

1. **Servicio de clima**: Crea un servicio que:

   - Consuma una API de clima (OpenWeatherMap)
   - Cachee resultados por ciudad
   - Maneje estados de carga y error
   - Permita buscar por ciudad y coordenadas

2. **Servicio de noticias**: Crea un servicio que:

   - Consuma una API de noticias (NewsAPI)
   - Implemente paginación infinita
   - Permita filtrar por categoría y país
   - Cachee resultados en memoria

3. **Servicio de traducción**: Crea un servicio que:

   - Use una API de traducción (libretranslate)
   - Mantenga historial de traducciones
   - Permita detectar idioma automáticamente
   - Maneje límites de uso

4. **Servicio de archivos**: Crea un servicio que:
   - Suba archivos a Cloudinary o similar
   - Muestre progreso de upload
   - Mantenga galería de archivos subidos
   - Permita eliminar archivos

---

## Clase 18: Interceptors y Manejo de Errores

### ✅ Temario

- Creación de interceptors HTTP
- Manejo centralizado de errores
- Headers automáticos (Auth, Content-Type)
- Loading global
- Cache de peticiones

### 📚 Teoría

**Interceptors HTTP:**

- Middleware que intercepta peticiones y respuestas
- Útiles para: autenticación, logging, manejo de errores, caching
- Se ejecutan en el orden de registro

**Configuración:**

```typescript
import { provideHttpClient, withInterceptors } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))],
};
```

### 🛠️ Práctica Guiada

**Paso 1: Interceptor de autenticación**

```typescript
// interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clonar request y agregar headers de auth
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
```

**Paso 2: Interceptor de manejo de errores**

```typescript
// interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { Router } from "@angular/router";
import { NotificacionService } from "../services/notificacion.service";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificacionService = inject(NotificacionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let mensajeError = "Ha ocurrido un error inesperado";

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        mensajeError = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 400:
            mensajeError = "Solicitud incorrecta";
            break;
          case 401:
            mensajeError = "No autorizado";
            router.navigate(["/login"]);
            break;
          case 403:
            mensajeError = "Acceso denegado";
            break;
          case 404:
            mensajeError = "Recurso no encontrado";
            break;
          case 500:
            mensajeError = "Error interno del servidor";
            break;
          default:
            mensajeError = `Error ${error.status}: ${error.message}`;
        }
      }

      // Mostrar notificación
      notificacionService.mostrarError(mensajeError);

      // Relanzar error
      return throwError(() => error);
    })
  );
};
```

**Paso 3: Interceptor de loading global**

```typescript
// interceptors/loading.interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { finalize } from "rxjs";
import { LoadingService } from "../services/loading.service";

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Ignorar ciertas peticiones
  if (req.url.includes("/assets/") || req.method === "GET") {
    return next(req);
  }

  loadingService.mostrar();

  return next(req).pipe(
    finalize(() => {
      loadingService.ocultar();
    })
  );
};
```

**Paso 4: Servicio de loading**

```typescript
// services/loading.service.ts
import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LoadingService {
  private _cargando = signal(false);
  private _contador = 0;

  cargando = this._cargando.asReadonly();

  mostrar() {
    this._contador++;
    this._cargando.set(true);
  }

  ocultar() {
    this._contador--;
    if (this._contador <= 0) {
      this._contador = 0;
      this._cargando.set(false);
    }
  }

  reset() {
    this._contador = 0;
    this._cargando.set(false);
  }
}
```

**Paso 5: Interceptor de headers**

```typescript
// interceptors/headers.interceptor.ts
import { HttpInterceptorFn } from "@angular/common/http";

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  // Agregar headers comunes a todas las peticiones
  const modifiedReq = req.clone({
    headers: req.headers.set("Content-Type", "application/json").set("Accept", "application/json").set("X-Application-Name", "MiAppAngular"),
  });

  return next(modifiedReq);
};
```

**Paso 6: Configuración de interceptors**

```typescript
// app.config.ts
import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient, withInterceptors } from "@angular/common/http";

import { routes } from "./app.routes";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { errorInterceptor } from "./interceptors/error.interceptor";
import { loadingInterceptor } from "./interceptors/loading.interceptor";
import { headersInterceptor } from "./interceptors/headers.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        headersInterceptor, // Primero: headers comunes
        authInterceptor, // Segundo: autenticación
        loadingInterceptor, // Tercero: loading
        errorInterceptor, // Último: manejo de errores
      ])
    ),
  ],
};
```

**Paso 7: Servicio de notificaciones**

```typescript
// services/notificacion.service.ts
import { Injectable, signal } from "@angular/core";

export interface Notificacion {
  id: number;
  tipo: "success" | "error" | "warning" | "info";
  mensaje: string;
  duracion?: number;
}

@Injectable({
  providedIn: "root",
})
export class NotificacionService {
  private _notificaciones = signal<Notificacion[]>([]);
  private siguienteId = 1;

  notificaciones = this._notificaciones.asReadonly();

  mostrar(mensaje: string, tipo: Notificacion["tipo"] = "info", duracion = 5000) {
    const notificacion: Notificacion = {
      id: this.siguienteId++,
      tipo,
      mensaje,
      duracion,
    };

    this._notificaciones.update((notifs) => [...notifs, notificacion]);

    // Auto-eliminar si tiene duración
    if (duracion > 0) {
      setTimeout(() => {
        this.eliminar(notificacion.id);
      }, duracion);
    }

    return notificacion.id;
  }

  mostrarSuccess(mensaje: string, duracion = 3000) {
    return this.mostrar(mensaje, "success", duracion);
  }

  mostrarError(mensaje: string, duracion = 0) {
    return this.mostrar(mensaje, "error", duracion);
  }

  mostrarWarning(mensaje: string, duracion = 5000) {
    return this.mostrar(mensaje, "warning", duracion);
  }

  mostrarInfo(mensaje: string, duracion = 3000) {
    return this.mostrar(mensaje, "info", duracion);
  }

  eliminar(id: number) {
    this._notificaciones.update((notifs) => notifs.filter((notif) => notif.id !== id));
  }

  limpiar() {
    this._notificaciones.set([]);
  }
}
```

**Paso 8: Componente de notificaciones global**

```typescript
// components/notificaciones-global.component.ts
import { Component, inject } from "@angular/core";
import { NotificacionService } from "../services/notificacion.service";

@Component({
  selector: "app-notificaciones-global",
  standalone: true,
  template: `
    <div class="notificaciones-container">
      @for (notif of notificacionService.notificaciones(); track notif.id) {
      <div [class]="'notificacion ' + notif.tipo" (click)="notificacionService.eliminar(notif.id)">
        <span class="icono">{{ getIcono(notif.tipo) }}</span>
        <span class="mensaje">{{ notif.mensaje }}</span>
        <button class="cerrar" (click)="notificacionService.eliminar(notif.id)">×</button>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .notificaciones-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      }
      .notificacion {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        border-radius: 8px;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease-out;
      }
      .success {
        background: #28a745;
      }
      .error {
        background: #dc3545;
      }
      .warning {
        background: #ffc107;
        color: #212529;
      }
      .info {
        background: #17a2b8;
      }
      .icono {
        font-size: 1.2em;
      }
      .mensaje {
        flex: 1;
      }
      .cerrar {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.5em;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `,
  ],
})
export class NotificacionesGlobalComponent {
  notificacionService = inject(NotificacionService);

  getIcono(tipo: string): string {
    const iconos: Record<string, string> = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return iconos[tipo] || "💬";
  }
}
```

**Paso 9: Servicio de autenticación mejorado**

```typescript
// services/auth.service.ts
import { Injectable, inject, signal, computed } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap, catchError, of } from "rxjs";

interface Usuario {
  id: number;
  email: string;
  nombre: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  cargando: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly TOKEN_KEY = "auth_token";

  private _estado = signal<AuthState>({
    usuario: null,
    token: localStorage.getItem(this.TOKEN_KEY),
    cargando: false,
  });

  // Selectores
  usuario = computed(() => this._estado().usuario);
  token = computed(() => this._estado().token);
  cargando = computed(() => this._estado().cargando);
  estaAutenticado = computed(() => !!this._estado().token);

  constructor() {
    // Verificar token al inicializar
    const token = this.token();
    if (token) {
      this.verificarToken().subscribe();
    }
  }

  login(credenciales: LoginRequest): Observable<boolean> {
    this._estado.update((estado) => ({ ...estado, cargando: true }));

    // Simular login (en una app real, esto sería una API)
    return of(true).pipe(
      tap(() => {
        const token = "jwt-simulado-" + Date.now();
        const usuario: Usuario = {
          id: 1,
          email: credenciales.email,
          nombre: "Usuario Demo",
        };

        localStorage.setItem(this.TOKEN_KEY, token);
        this._estado.set({
          usuario,
          token,
          cargando: false,
        });

        this.router.navigate(["/dashboard"]);
      }),
      catchError((error) => {
        this._estado.update((estado) => ({ ...estado, cargando: false }));
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._estado.set({
      usuario: null,
      token: null,
      cargando: false,
    });
    this.router.navigate(["/login"]);
  }

  verificarToken(): Observable<boolean> {
    // En una app real, verificaría el token con el backend
    const token = this.token();
    if (!token) return of(false);

    return of(true).pipe(
      tap(() => {
        // Simular usuario desde token
        const usuario: Usuario = {
          id: 1,
          email: "usuario@example.com",
          nombre: "Usuario Demo",
        };
        this._estado.update((estado) => ({ ...estado, usuario }));
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  getToken(): string | null {
    return this.token();
  }
}
```

**Paso 10: Uso en componentes**

```typescript
// components/layout.component.ts
import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { LoadingService } from "../services/loading.service";

@Component({
  selector: "app-layout",
  standalone: true,
  template: `
    <div class="layout">
      <header class="header">
        <h1>Mi Aplicación</h1>
        <nav class="nav">
          @if (authService.estaAutenticado()) {
          <span>Hola, {{ authService.usuario()?.nombre }}</span>
          <button (click)="logout()">Cerrar Sesión</button>
          } @else {
          <button (click)="irALogin()">Iniciar Sesión</button>
          }
        </nav>
      </header>

      @if (loadingService.cargando()) {
      <div class="loading-overlay">
        <div class="spinner"></div>
        <p>Cargando...</p>
      </div>
      }

      <main class="main">
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [
    `
      .layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        background: #343a40;
        color: white;
      }
      .nav {
        display: flex;
        gap: 1rem;
        align-items: center;
      }
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        z-index: 1000;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      .main {
        flex: 1;
        padding: 2rem;
      }
    `,
  ],
})
export class LayoutComponent {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  router = inject(Router);

  logout() {
    this.authService.logout();
  }

  irALogin() {
    this.router.navigate(["/login"]);
  }
}
```

### 🧪 Ejercicios

1. **Interceptor de cache**: Crea un interceptor que:

   - Cachee peticiones GET por 5 minutos
   - Use localStorage para persistencia
   - Permita invalidar cache manualmente
   - Respete headers de no-cache

2. **Interceptor de retry**: Crea un interceptor que:

   - Reintente peticiones fallidas (máximo 3 intentos)
   - Espere tiempo exponencial entre intentos
   - No reintente en errores 4xx (excepto 429)
   - Registre intentos en console

3. **Interceptor de analytics**: Crea un interceptor que:

   - Envíe métricas de rendimiento a un servicio
   - Mida tiempo de respuesta de peticiones
   - Registre errores para análisis
   - Respete opciones de privacidad

4. **Sistema completo de errores**: Crea un sistema que:
   - Clasifique errores por tipo y severidad
   - Muestre errores amigables al usuario
   - Envíe errores críticos a un servicio de logging
   - Permita al usuario reportar errores

**Buenas prácticas de este módulo:**

- Usa `inject()` para la inyección de dependencias
- Centraliza la lógica de negocio en servicios
- Usa signals para estado reactivo en servicios
- Implementa interceptors para concerns transversales
- Maneja errores de forma consistente
- Proporciona feedback visual al usuario (loading, errores)
