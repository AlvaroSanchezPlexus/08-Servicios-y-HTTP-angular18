import { Component, inject, OnInit } from '@angular/core';
import { NoticiasService } from '../../services/noticias.service';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [],
  templateUrl: './noticias.component.html',
  styleUrl: './noticias.component.scss'
})
export class NoticiasComponent implements OnInit {
  newsService = inject(NoticiasService);

  ngOnInit() {
    this.cargarMas(); // Carga inicial
  }

  cargarMas() {
    this.newsService.cargarNoticias().subscribe();
  }
}
