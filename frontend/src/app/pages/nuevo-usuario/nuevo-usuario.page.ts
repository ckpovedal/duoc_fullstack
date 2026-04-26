import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.page.html',
  styleUrls: ['./nuevo-usuario.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class NuevoUsuarioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
