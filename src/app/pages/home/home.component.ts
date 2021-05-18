import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isLoading = false;
  posts = [];

  constructor(private router: Router,
              private toastr: ToastrService,
              private db: AngularFireDatabase,
              ) { 
                this.isLoading = true;
                this.db.object(`/posts`).valueChanges().subscribe((res) => {
                  if(res){
                    this.posts = Object.values(res).sort((a,b)=>b.date-a.date);
                  } else {
                    this.toastr.error("No posts found");
                  }
                  this.isLoading = false;
                }, (err) => {
                  this.isLoading = false;
                  this.toastr.error("No posts found");
                });
              }

  ngOnInit(): void {
  }

}
