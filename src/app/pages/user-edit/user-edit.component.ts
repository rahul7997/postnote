import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';
import { NgForm } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { imageConfig } from 'src/utils/config';
import { v4 as uuidv4 } from 'uuid';
import { readAndCompressImage } from 'browser-image-resizer';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit {
  error: any;
  uploadPercent: any;
  user = {
    picture: "./assets/user_image1.png",
    country: '',
    username: '',
    bio: ''
  }
  
  constructor(private authService: AuthService, 
    private db: AngularFireDatabase,
    private storage: AngularFireStorage,
    private toastr: ToastrService,
    private router: Router) { 
    }
    
  ngOnInit(): void {
    this.authService.getUser().subscribe((res) => {
      if(res){
        this.db.object(`/users/${res.uid}/`).valueChanges().subscribe((dbuser: any) => {
          this.user = dbuser;
        });
      }
    });
  }

  updateSettings(f: NgForm){
    this.authService.getUser().subscribe((res) => {
      this.db.object(`users/${res.uid}`)
        .update({
          country: this.user.country,
          bio: this.user.bio,
          picture: this.user.picture
        });
        
        this.router.navigateByUrl('home');
        this.toastr.success("User details updated");
    }, (err) => {
      this.toastr.error("Some error occured");
    });
  }

  async uploadFile(event){
    const file = event.target.files[0];
    let resizedImage = await readAndCompressImage(file, imageConfig);
    let filepath = uuidv4();
    const fileref = this.storage.ref(filepath);
    const task = this.storage.upload(filepath, resizedImage);

    task.percentageChanges().subscribe((res) => {
      this.uploadPercent = res;
    });

    task.snapshotChanges()
      .pipe(finalize(() => {
        fileref.getDownloadURL().subscribe((res) => {
          this.user.picture = res;
        })
      })).subscribe();

  }

}
