import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  email: any;
  user: null;

  constructor(private router: Router,
              private authService: AuthService,
              private toastr: ToastrService,
              private userService: UserService) { 
                this.authService.getUser().subscribe((res) => {
                  this.email = res?.email;
                });

                this.userService.getUser().subscribe((res: any) => {
                  this.user = res;
                });
              }

  ngOnInit(): void {
  }

  async signOut(){
    try{
      await this.authService.signOut();
      this.toastr.info('You are logged out of the application');
      this.router.navigateByUrl('/signin');
      this.email = null;
    } catch{
      this.toastr.error('Problem in signout');
    }
  }

}
