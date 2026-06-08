import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule]
})
export class PrincipalPage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
  }

  salir(){
    this.router.navigate(['/inicio']);
  }
}
