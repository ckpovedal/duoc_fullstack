import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule]
})
export class PrincipalPage implements OnInit {

  constructor(private router: Router) {
    addIcons({ heartOutline });
  }

  ngOnInit() {
  }

  salir(){
    this.router.navigate(['/inicio']);
  }

  irDonativos() {
    this.router.navigate(['/donativos']);
  }
}
