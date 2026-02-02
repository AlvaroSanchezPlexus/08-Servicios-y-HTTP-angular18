import { Component, inject } from '@angular/core';
import { GaleriaService } from '../../services/galeria.service';

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [],
  templateUrl: './galeria.component.html',
  styleUrl: './galeria.component.scss'
})
export class GaleriaComponent {
fileService = inject(GaleriaService);

  onFileSelected(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    
    if (fileList && fileList.length > 0) {
      const fileName = fileList[0].name;
      this.fileService.subirArchivo(fileName);
    }
  }
}
