import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  user = new Subject<any>();

  constructor(private authService: AuthService,
              private db: AngularFireDatabase) { 
    this.authService.getUser().subscribe((res) => {
      if(res){
        this.db.object(`/users/${res.uid}`).valueChanges().subscribe((res) => {
          this.user.next(res);
        }, (err) => {
        });
      }
    }, (err) => {
    });
  }

  getUser(){
    return this.user;
  }

}
