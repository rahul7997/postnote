import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users = [];
  isLoading = false;

  constructor(private db: AngularFireDatabase,
              private router: Router,
              private toastr: ToastrService) { 
                this.isLoading = true;
                this.db.object(`/users`).valueChanges().subscribe((res) => {
                  if(res){
                    this.users = Object.values(res);
                  } else {
                    this.toastr.error("No users found");
                  }
                  this.isLoading = false;
                }, (err) => {
                  this.isLoading = false;
                  this.toastr.error("No user found");
                });
              }

  ngOnInit(): void {
  }

}
