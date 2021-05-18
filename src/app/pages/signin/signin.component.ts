import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  error: any;

  constructor(private authService: AuthService,
              private router: Router,
              private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  onSignIn(f: NgForm){
    const email = f.value.email;
    const password = f.value.password;
    this.authService.signIn(email, password).then((res) => {
      this.toastr.success('Login success');
      this.router.navigateByUrl('/');
    }).catch((err) => {
      this.error = err;
      this.toastr.error('Login failed !')
    });
  }

}
